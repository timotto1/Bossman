"use client";

import { useCallback, useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/context/user-context";
import { createClient } from "@/utils/supabase/client";

type PipelineData = {
  year: number;
  month_of_year: number;
  status: string | null;
  value: number | null;
  number: number;
};

export function ListingPipelineChart() {
  const supabase = createClient();
  const { user } = useUser();

  const [data, setData] = useState<PipelineData[]>([]);
  const [loading, setLoading] = useState(false);

  const formatStatus = (status: string) => {
    if (!status) return "";
    const withSpace = status.replace(/_/g, " ");
    return withSpace.charAt(0).toUpperCase() + withSpace.slice(1).toLowerCase();
  };

  const fetchPipeline = useCallback(async () => {
    setLoading(true);
    try {
      const { data: activeData, error: activeError } = await supabase.rpc(
        "get_active_pipeline_value_listings",
        {
          company_id_param: user?.companyID,
        },
      );
      if (activeError) throw new Error(activeError.message);
      if (activeData) setData(activeData as PipelineData[]);
    } catch (err) {
      console.error("Error fetching pipeline data:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10" />
        <Skeleton className="h-64" />
      </div>
    );
  }
  const filteredData = data.filter((d) => d.status !== null);

  const months = Array.from(
    new Set(
      filteredData
        .map((d) => `${d.year}-${String(d.month_of_year).padStart(2, "0")}`)
        .sort(),
    ),
  );

  const categories = months.map((m) => {
    const [year, month] = m.split("-");
    return `${month}/${year}`;
  });

  const statuses = Array.from(new Set(filteredData.map((d) => d.status!)));

  const colors = ["#7747FF", "#C2AEF9", "#A486F7", "#E5DDFF"];

  const series = statuses.map((status, index) => {
    return {
      name: formatStatus(status),
      type: "line" as const,
      color: colors[index % colors.length], // cycle through palette
      data: months.map((m) => {
        const [year, month] = m.split("-");
        const found = filteredData.find(
          (d) =>
            d.year === Number(year) &&
            d.month_of_year === Number(month) &&
            d.status === status,
        );
        return found?.value ?? 0;
      }),
    };
  });

  const chartOptions: Highcharts.Options = {
    chart: { type: "line" },
    title: { text: "", style: { color: "#26045D", fontWeight: "500" } },
    xAxis: {
      categories,
      labels: { style: { color: "#26045D" } },
      lineColor: "#26045D",
    },
    yAxis: {
      title: { text: "Revenue", style: { color: "#26045D" } },
      labels: { style: { color: "#26045D" } },
      gridLineColor: "#E0E0E0",
    },
    series,
    legend: { enabled: true },
    credits: { enabled: false },
  };

  return (
    <Card className="rounded-lg border-[#EEEEEE]">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="flex flex-1 gap-2 px-2 items-center">
              <h2 className="text-lg font-medium text-[#26045D]">
                Monthly pipeline
              </h2>
              <div className="bg-[#F4F0FE] py-[2px] px-2 text-xs text-[#AE78F1] max-w-fit rounded-full">
                {filteredData.reduce((sum, d) => sum + d.number, 0)}
                &nbsp;active listings
              </div>
            </div>
          </div>
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
      </CardContent>
    </Card>
  );
}
