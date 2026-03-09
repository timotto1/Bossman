"use client";

import { useCallback, useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/utils/supabase/client";

type InsightsGraphData = {
    status: string;
    average_salary: number;
    average_unit_valuation: number;
    resident_count: number;
};

const statusLabels: Record<string, string> = {
    ready_to_transact: "Ready to Transact",
    mortgage_expiry: "Mortgage Expiry",
    education_phase: "Education Phase",
};

const statusColors: Record<string, string> = {
    ready_to_transact: "#7747FF",
    mortgage_expiry: "#C2AEF9",
    education_phase: "#A486F7",
};

type InsightGraphsProps = {
    type: "average_salary" | "average_unit_valuation" | "resident_count";
    companyId?: string; // ✅ new prop
};

export function InsightGraphs({ type, companyId }: InsightGraphsProps) {
    const supabase = createClient();

    const [graphData, setGraphData] = useState<InsightsGraphData[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<
        "last_24_hours" | "last_7_days" | "last_30_days" | "year_to_date" | "no_filter"
    >("no_filter");

    // ✅ Fetch data dynamically based on companyId
    const fetchInsights = useCallback(async () => {
        if (!companyId) return; // wait until a company is selected
        setLoading(true);

        try {
            const { data, error } = await supabase.rpc("get_insights_graph_data", {
                period: selectedPeriod,
                company_id: companyId, // ✅ use prop
            });

            if (error) throw new Error(error.message);
            setGraphData(data || []);
        } catch (err) {
            console.error("Error fetching insights graph data:", err);
        } finally {
            setLoading(false);
        }
    }, [supabase, selectedPeriod, companyId]);

    // ✅ Refetch when companyId or period changes
    useEffect(() => {
        fetchInsights();
    }, [fetchInsights]);

    // ----------------------- UI -----------------------
    if (!companyId) {
        return <p className="text-sm text-gray-500">Select a company to view chart.</p>;
    }

    if (loading)
        return (
            <div className="space-y-4">
                <Skeleton className="h-10" />
                <div className="grid grid-cols-3 gap-10">
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                </div>
            </div>
        );

    // ----------------------- Chart config -----------------------
    let chartOptions: Highcharts.Options;

    if (type === "resident_count") {
        // 🟣 Pie chart
        chartOptions = {
            chart: { type: "pie" },
            title: { text: "", style: { color: "#26045D", fontWeight: "500" } },
            series: [
                {
                    name: "Residents",
                    type: "pie",
                    data: graphData.map((item) => ({
                        name: statusLabels[item.status] || item.status,
                        y: item.resident_count,
                        color: statusColors[item.status] || "#6898F4",
                    })),
                    dataLabels: { enabled: false },
                },
            ],
            credits: { enabled: false },
        };
    } else {
        // 🟦 Column chart (salary or valuation)
        const field = type;
        const titleText =
            type === "average_salary" ? "Avg. Salary" : "Avg. House Price";

        chartOptions = {
            chart: { type: "column" },
            title: { text: "", style: { color: "#26045D", fontWeight: "500" } },
            xAxis: {
                categories: graphData.map(
                    (item) => statusLabels[item.status] || item.status
                ),
                labels: { style: { color: "#26045D" } },
                lineColor: "#26045D",
            },
            yAxis: {
                min: 0,
                title: { text: titleText, style: { color: "#26045D" } },
                labels: { style: { color: "#26045D" } },
            },
            series: [
                {
                    name: titleText,
                    type: "column",
                    data: graphData.map((item) => ({
                        y: item[field],
                        color: statusColors[item.status] || "#6898F4",
                    })),
                },
            ],
            legend: { enabled: false },
            credits: { enabled: false },
        };
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center">
                <h2 className="text-lg flex-1 font-medium text-[#26045D]">
                    {type === "average_salary"
                        ? "Avg. Salary"
                        : type === "average_unit_valuation"
                            ? "Avg. House Price"
                            : "Resident Sign-ups"}
                </h2>

                {/* Period selector */}
                <Select
                    value={selectedPeriod}
                    onValueChange={(val) => setSelectedPeriod(val as typeof selectedPeriod)}
                >
                    <SelectTrigger className="bg-none border-none w-fit text-xs">
                        <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="no_filter">No Filter</SelectItem>
                        <SelectItem value="last_24_hours">Last 24 Hours</SelectItem>
                        <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                        <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                        <SelectItem value="year_to_date">Year to Date</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
    );
}
