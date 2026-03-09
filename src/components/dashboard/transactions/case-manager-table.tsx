"use client";

import { useCallback, useEffect, useState } from "react";

import {
  DataTable,
  FilterConfig,
  FilterState,
} from "@/components/table/data-table";
import { caseManagerTransactionsColumn } from "@/components/table/lead/columns";
import { CaseManagerTransactionsSchema } from "@/components/table/lead/schema";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/context/user-context";
import useDebounce from "@/hooks/use-debounce";
import { createClient } from "@/utils/supabase/client";

interface PipelineRow {
  case_manager_id: number | null;
  case_manager_name: string;
  month_of_year: number;
  pipeline_cases: number | null;
  completed_cases: number | null;
  pipeline_value: number | null;
  completed_value: number | null;
}

interface PipelineSummary {
  case_manager_name: string;
  pipeline_cases: { value: number; change: number };
  completed_cases: { value: number; change: number };
  pipeline_value: { value: number; change: number };
  completed_value: { value: number; change: number };
}

function transformPipelineData(data: PipelineRow[]): PipelineSummary[] {
  const grouped: Record<
    number,
    {
      case_manager_id: number;
      case_manager_name: string;
      months: Record<number, PipelineRow>;
    }
  > = data
    .filter((item) => item.case_manager_id !== null)
    .reduce(
      (acc, item) => {
        const id = item.case_manager_id as number;
        if (!acc[id]) {
          acc[id] = {
            case_manager_id: id,
            case_manager_name: item.case_manager_name,
            months: {},
          };
        }
        acc[id].months[item.month_of_year] = item;
        return acc;
      },
      {} as Record<
        number,
        {
          case_manager_id: number;
          case_manager_name: string;
          months: Record<number, PipelineRow>;
        }
      >,
    );

  const getPercentChange = (current: number, prev: number): number => {
    if (!prev || prev === 0) {
      if (current > 0) return 100;
      return 0;
    }
    return parseFloat((((current - prev) / prev) * 100).toFixed(2));
  };

  const result: PipelineSummary[] = Object.values(grouped).map((manager) => {
    const months = manager.months;
    const latestMonth = Math.max(...Object.keys(months).map(Number));
    const prevMonth = latestMonth - 1;

    const current = months[latestMonth] || {};
    const prev = months[prevMonth] || {};

    return {
      case_manager_name: manager.case_manager_name,
      pipeline_cases: {
        value: current.pipeline_cases ?? 0,
        change: getPercentChange(
          current.pipeline_cases ?? 0,
          prev.pipeline_cases ?? 0,
        ),
      },
      completed_cases: {
        value: current.completed_cases ?? 0,
        change: getPercentChange(
          current.completed_cases ?? 0,
          prev.completed_cases ?? 0,
        ),
      },
      pipeline_value: {
        value: current.pipeline_value ?? 0,
        change: getPercentChange(
          current.pipeline_value ?? 0,
          prev.pipeline_value ?? 0,
        ),
      },
      completed_value: {
        value: current.completed_value ?? 0,
        change: getPercentChange(
          current.completed_value ?? 0,
          prev.completed_value ?? 0,
        ),
      },
    };
  });

  return result;
}

export function CaseManagerTable() {
  const supabase = createClient();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [caseManagerTransactionsData, setCaseManagerTransactionsData] =
    useState<CaseManagerTransactionsSchema[]>([]);

  const FILTER_CONFIG: FilterConfig[] = [
    {
      key: "pipeline",
      label: "Pipeline",
      type: "number",
    },
  ];

  const [filtersCaseManagerTransactions, setFiltersCaseManagerTransactions] =
    useState<FilterState>({
      pipeline: { condition: "", value: "" },
    });

  const debounceFiltersCaseManagerTransactions = useDebounce(
    filtersCaseManagerTransactions,
    500,
  );

  const buildFilterPayload = (
    filters: FilterState,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Record<string, any> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: Record<string, any> = {};

    if (
      "condition" in filters.pipeline &&
      filters.pipeline.condition &&
      filters.pipeline.value !== ""
    ) {
      payload.pipeline_condition = filters.pipeline.condition;
      payload.pipeline_value = Number(filters.pipeline.value);
    }

    return payload;
  };

  const getTransactionsData = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters = debounceFiltersCaseManagerTransactions;

      const payload = buildFilterPayload(filters);

      const {
        data: caseManagerTransactions,
        error: caseManagerTransactionsError,
      } = await supabase.rpc(`get_case_manager_pipeline`, {
        ...payload,
        company_id_param: `${user?.companyID}`,
      });

      if (caseManagerTransactionsError)
        throw new Error(caseManagerTransactionsError.message);

      setCaseManagerTransactionsData(
        transformPipelineData(
          caseManagerTransactions,
        ) as CaseManagerTransactionsSchema[],
      );
    } catch (err) {
      console.error((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, debounceFiltersCaseManagerTransactions, user]);

  const updateFiltersCaseManagerTransactions = (
    key: string,
    field: string,
    value: string | string[],
  ) => {
    setFiltersCaseManagerTransactions((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const initializeData = useCallback(async () => {
    try {
      await getTransactionsData();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [getTransactionsData]);

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
          showFilter={false}
          showColumnToggle={true}
          columns={caseManagerTransactionsColumn}
          data={caseManagerTransactionsData}
          filters={filtersCaseManagerTransactions}
          updateFilters={updateFiltersCaseManagerTransactions}
          filterConfig={FILTER_CONFIG}
          searchPlaceholder="Search"
          title={
            <div className="flex gap-2 px-2 items-center">
              <h2 className="text-lg font-medium text-[#26045D]">
                Case managers
              </h2>
              <div className="bg-[#F4F0FE] py-[2px] px-2 text-xs text-[#AE78F1] max-w-fit rounded-full">
                {caseManagerTransactionsData.length}&nbsp;active users
              </div>
            </div>
          }
          enableViewAll={true}
        />
      </CardContent>
    </Card>
  );
}
