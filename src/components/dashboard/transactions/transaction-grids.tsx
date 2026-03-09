"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/utils/supabase/client";

type TransactionsGridData = {
    active_pipeline_value: number;
    active_transactions: number;
    completed_transactions: number;
    prev_active_pipeline_value: number;
    prev_active_transactions: number;
    prev_completed_transactions: number;
};

export function TransactionGrids({
    companyId,
    isMyCases = false,
}: {
    companyId?: string;
    isMyCases?: boolean;
}) {
    const supabase = createClient();

    const [transactionsGridData, setTransactionsGridData] =
        useState<TransactionsGridData>({
            active_pipeline_value: 0,
            active_transactions: 0,
            completed_transactions: 0,
            prev_active_pipeline_value: 0,
            prev_active_transactions: 0,
            prev_completed_transactions: 0,
        });

    const [loading, setLoading] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<
        | "no_filter"
        | "last_24_hours"
        | "last_7_days"
        | "last_30_days"
        | "year_to_date"
    >("no_filter");

    const getDifference = (latest: number, prev: number) => {
        const difference = latest - prev;
        const isUp = difference > 0;
        const percentage =
            prev === 0
                ? latest > 0
                    ? "100"
                    : "0"
                : Math.abs((difference / prev) * 100).toFixed(2);

        const noChange = difference === 0;
        const periodLabels: Record<typeof selectedPeriod, string> = {
            no_filter: "last month",
            last_24_hours: "yesterday",
            last_7_days: "last week",
            last_30_days: "last month",
            year_to_date: "last year",
        };

        return (
            <div className="flex gap-2 items-center justify-center">
                {!noChange && (
                    <div
                        className={`py-[2px] px-2 text-xs rounded-full flex gap-1 ${isUp
                                ? "bg-[#ECFDF3] text-[#027A48]"
                                : "bg-[#FEF3F2] text-[#B42318]"
                            }`}
                    >
                        {isUp ? (
                            <ArrowUpIcon className="w-3 h-3" />
                        ) : (
                            <ArrowDownIcon className="w-3 h-3" />
                        )}
                        {percentage}%
                    </div>
                )}
                <p className="text-xs text-[#87858E]">
                    {noChange ? "no change" : isUp ? "more" : "less"} than{" "}
                    {periodLabels[selectedPeriod]}
                </p>
            </div>
        );
    };

    const getTotalPortfolioValue = useCallback(async () => {
        if (!companyId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .rpc("get_transactions_grid_data", {
                    period: selectedPeriod,
                    company_id: companyId,
                    ...(isMyCases ? { case_manager_param: null } : {}),
                })
                .maybeSingle();

            if (error) throw new Error(error.message);
            if (data) setTransactionsGridData(data as TransactionsGridData);
        } catch (err) {
            console.error("Error fetching transactions grid data:", err);
        } finally {
            setLoading(false);
        }
    }, [supabase, selectedPeriod, companyId, isMyCases]);

    useEffect(() => {
        getTotalPortfolioValue();
    }, [getTotalPortfolioValue]);

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

    return (
        <div className="space-y-4">
            <div className="flex justify-end items-center">
                <Select
                    value={selectedPeriod}
                    onValueChange={(val) =>
                        setSelectedPeriod(val as typeof selectedPeriod)
                    }
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

            <div className="grid grid-cols-3 gap-10">
                <Link href={"/dashboard/transactions/active"}>
                    <Card className="rounded-lg border-[#EEEEEE] flex text-center items-center justify-center">
                        <CardContent className="p-4">
                            <h3 className="text-3xl text-[#4E1A8F]">
                                {transactionsGridData.active_transactions}
                            </h3>
                            <h6 className="text-sm text-[#26045D]">Active transactions</h6>
                            {getDifference(
                                transactionsGridData.active_transactions,
                                transactionsGridData.prev_active_transactions
                            )}
                        </CardContent>
                    </Card>
                </Link>

                <Card className="rounded-lg border-[#EEEEEE] flex text-center items-center justify-center">
                    <CardContent className="p-4">
                        <h3 className="text-3xl text-[#4E1A8F]">
                            {transactionsGridData.completed_transactions}
                        </h3>
                        <h6 className="text-sm text-[#26045D]">Completed transactions</h6>
                        {getDifference(
                            transactionsGridData.completed_transactions,
                            transactionsGridData.prev_completed_transactions
                        )}
                    </CardContent>
                </Card>

                <Card className="rounded-lg border-[#EEEEEE] flex text-center items-center justify-center">
                    <CardContent className="p-4">
                        <h3 className="text-3xl text-[#4E1A8F]">
                            £
                            {transactionsGridData.active_pipeline_value.toLocaleString(
                                "en-GB",
                                { maximumFractionDigits: 2 }
                            )}
                        </h3>
                        <h6 className="text-sm text-[#26045D]">Active pipeline value</h6>
                        {getDifference(
                            transactionsGridData.active_pipeline_value,
                            transactionsGridData.prev_active_pipeline_value
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
