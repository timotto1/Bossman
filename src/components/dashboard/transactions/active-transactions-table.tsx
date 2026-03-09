"use client";

import { useCallback, useEffect, useState } from "react";

import {
  DataTable,
  FilterConfig,
  FilterState,
} from "@/components/table/data-table";
import { activeTransactionsColumn } from "@/components/table/lead/columns";
import {
  CaseManagerSchema,
  TransactionsSchema,
} from "@/components/table/lead/schema";
import { TRANSACTION_STATUSES } from "@/components/table/lead/transaction-status-dropdown";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/context/user-context";
import useDebounce from "@/hooks/use-debounce";
import { createClient } from "@/utils/supabase/client";

export function ActiveTransactionsTable({
  isMyCases = false,
  viewAllLink,
}: {
  isMyCases?: boolean;
  viewAllLink?: string;
}) {
  const supabase = createClient();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [transactionsData, setTransactionsData] = useState<
    TransactionsSchema[]
  >([]);
  const [caseManagers, setCaseManagers] = useState<CaseManagerSchema[]>([]);

  const FILTER_CONFIG: FilterConfig[] = [
    {
      key: "status",
      label: "Application status",
      type: "multi-select",
      options: TRANSACTION_STATUSES,
    },
    {
      key: "transactionValue",
      label: "Transaction value",
      type: "number",
    },
    {
      key: "share",
      label: "Share to purchase",
      type: "number",
    },
    {
      key: "transactionDate",
      label: "Transaction date",
      type: "date",
    },
    {
      key: "documentsUploaded",
      label: "Documents uploaded",
      type: "boolean",
      options: [
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
      ],
    },
    {
      key: "mosGenerated",
      label: "MoS generated",
      type: "boolean",
      options: [
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
      ],
    },
    {
      key: "ricsValuation",
      label: "RICS valuation",
      type: "boolean",
      options: [
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
      ],
    },
  ];

  const [filtersPlatformTransactions, setFiltersPlatformTransactions] =
    useState<FilterState>({
      status: { condition: "", value: [] },
      transactionValue: { condition: "", value: "" },
      share: { condition: "", value: "" },
      transactionDate: { condition: "", value: "" },
      documentsUploaded: { condition: "", value: "" },
      mosGenerated: { condition: "", value: "" },
      ricsValuation: { condition: "", value: "" },
    });

  const debounceFiltersPlatformTransactions = useDebounce(
    filtersPlatformTransactions,
    500,
  );

  const buildFilterPayload = (
    companyID: string,
    filters: FilterState,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Record<string, any> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: Record<string, any> = { company_id: companyID };

    if (
      "condition" in filters.status &&
      filters.status.condition &&
      Array.isArray(filters.status.value) &&
      filters.status.value.length > 0
    ) {
      payload.status_condition = filters.status.condition;
      payload.status_value = filters.status.value;
    }

    if (
      "condition" in filters.transactionValue &&
      filters.transactionValue.condition &&
      filters.transactionValue.value !== ""
    ) {
      payload.transaction_value_condition = filters.transactionValue.condition;
      payload.transaction_value = Number(filters.transactionValue.value);
    }

    if (
      "condition" in filters.share &&
      filters.share.condition &&
      filters.share.value !== ""
    ) {
      payload.share_condition = filters.share.condition;
      payload.share_value = Number(filters.share.value);
    }

    if (
      "condition" in filters.transactionDate &&
      filters.transactionDate.condition &&
      filters.transactionDate.value !== ""
    ) {
      payload.transaction_date_condition = filters.transactionDate.condition;
      payload.transaction_date_value = filters.transactionDate.value;
    }

    if ("value" in filters.documentsUploaded) {
      payload.documents_uploaded_filter = filters.documentsUploaded.value;
    }

    if ("value" in filters.mosGenerated) {
      payload.mos_generated_filter = filters.mosGenerated.value;
    }

    if ("value" in filters.ricsValuation) {
      payload.rics_valuation_filter = filters.ricsValuation.value;
    }

    return payload;
  };

  const getTransactionCaseManagers = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc(`platform_tenant_users`, {
        company_param: user?.companyID,
      });

      if (error) throw new Error(error.message);

      setCaseManagers(data);
    } catch (error) {
      console.error(error);
    }
  }, [supabase, user?.companyID]);

  const getTransactionsData = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters = debounceFiltersPlatformTransactions;

      const payload = buildFilterPayload(user!.companyID!, filters);

      const { data: overviewTransactions, error: overviewTransactionsError } =
        await supabase.rpc(`platform_transactions`, {
          ...payload,
          ...(isMyCases ? { case_manager_filter: user?.id } : {}),
        });

      if (overviewTransactionsError)
        throw new Error(overviewTransactionsError.message);

      setTransactionsData(overviewTransactions);
    } catch (err) {
      console.error((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, debounceFiltersPlatformTransactions, user, isMyCases]);

  const updateFiltersPlatformTransactions = (
    key: string,
    field: string,
    value: string | string[],
  ) => {
    setFiltersPlatformTransactions((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const initializeData = useCallback(async () => {
    try {
      await getTransactionCaseManagers();
      await getTransactionsData();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [getTransactionCaseManagers, getTransactionsData]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const renderDataTable = (archived: boolean) => (
    <DataTable
      isLoading={isLoading}
      showTotal={false}
      showSearchFilter={true}
      // showFilter={true}
      showColumnToggle={true}
      columns={activeTransactionsColumn}
      data={transactionsData
        .map((transaction) => ({
          ...transaction,
          case_managers_list: caseManagers,
        }))
        .filter((transaction) => transaction.archived === archived)}
      filters={filtersPlatformTransactions}
      updateFilters={updateFiltersPlatformTransactions}
      filterConfig={FILTER_CONFIG}
      searchPlaceholder="Search"
      title={
        <div className="flex gap-2 px-2 items-center">
          <h2 className="text-lg font-medium text-[#26045D]">
            Active transactions
          </h2>
          <div className="bg-[#F4F0FE] py-[2px] px-2 text-xs text-[#AE78F1] max-w-fit rounded-full">
            {
              transactionsData.filter(
                (transaction) => transaction.archived === archived,
              ).length
            }
            &nbsp;active transactions
          </div>
        </div>
      }
      viewAllLink={viewAllLink}
    />
  );

  return (
    <Card className="rounded-lg border-[#EEEEEE] bg-white">
      <CardContent className="p-4 relative">
        {renderDataTable(false)}
      </CardContent>
    </Card>
  );
}
