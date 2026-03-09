"use client";

import { useCallback, useEffect, useState } from "react";

import {
  DataTable,
  FilterConfig,
  FilterState,
} from "@/components/table/data-table";
import { insightsColumn } from "@/components/table/lead/columns";
import { InsightsSchema } from "@/components/table/lead/schema";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/context/user-context";
import useDebounce from "@/hooks/use-debounce";
import { createClient } from "@/utils/supabase/client";

export function InsightsTable() {
  const supabase = createClient();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [insightsData, setInsightsData] = useState<InsightsSchema[]>([]);

  const FILTER_CONFIG: FilterConfig[] = [
    { key: "salary", label: "Salary", type: "number" as const },
    { key: "savings", label: "Current savings", type: "number" as const },
    { key: "moveInDate", label: "Move in date", type: "date" as const },
  ];

  const [filtersPlatformInsights, setFiltersPlatformInsights] =
    useState<FilterState>({
      salary: { condition: "", value: "" },
      savings: { condition: "", value: "" },
      moveInDate: { condition: "", value: "" },
    });

  const debounceFiltersPlatformInsights = useDebounce(
    filtersPlatformInsights,
    500,
  );

  const buildFilterPayload = (
    companyID: string,
    filters: FilterState,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Record<string, any> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: Record<string, any> = { company_id: companyID };

    if (filters.salary.condition && filters.salary.value) {
      payload.salary_condition = filters.salary.condition;
      payload.salary_value = filters.salary.value;
    }

    if (filters.savings.condition && filters.savings.value) {
      payload.savings_condition = filters.savings.condition;
      payload.savings_value = filters.savings.value;
    }

    if (filters.moveInDate.condition && filters.moveInDate.value) {
      payload.movein_condition = filters.moveInDate.condition;
      payload.movein_value = filters.moveInDate.value;
    }

    return payload;
  };

  const getInsightsData = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters = debounceFiltersPlatformInsights;

      const payload = buildFilterPayload(user!.companyID!, filters);

      const { data: overviewInsights, error: overviewInsightsError } =
        await supabase.rpc(`platform_residents`, payload);

      if (overviewInsightsError) throw new Error(overviewInsightsError.message);

      setInsightsData(
        overviewInsights.filter(
          (v: InsightsSchema, i: number, a: InsightsSchema[]) =>
            a.findIndex((t) => t.user_id === v.user_id) === i,
        ),
      );
    } catch (err) {
      console.error((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, debounceFiltersPlatformInsights, user]);

  const updateFiltersPlatformInsights = (
    key: string,
    field: string,
    value: string | string[],
  ) => {
    setFiltersPlatformInsights((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const initializeData = useCallback(async () => {
    try {
      await getInsightsData();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [getInsightsData]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  return (
    <Card className="rounded-lg border-[#EEEEEE] bg-white">
      <CardContent className="p-4 relative">
        <DataTable
          isLoading={isLoading}
          showTotal={false}
          showSearchFilter={true}
          showFilter={true}
          showColumnToggle={true}
          columns={insightsColumn}
          data={insightsData}
          filters={filtersPlatformInsights}
          updateFilters={updateFiltersPlatformInsights}
          filterConfig={FILTER_CONFIG}
          searchPlaceholder="Search"
          title={
            <div className="flex gap-2 px-2 items-center">
              <h2 className="text-lg font-medium text-[#26045D]">
                All residents
              </h2>
              <div className="bg-[#F4F0FE] py-[2px] px-2 text-xs text-[#AE78F1] max-w-fit rounded-full">
                {insightsData.length}&nbsp;sign ups
              </div>
            </div>
          }
        />
      </CardContent>
    </Card>
  );
}
