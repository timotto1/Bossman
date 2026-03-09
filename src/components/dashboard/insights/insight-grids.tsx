"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";

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

type InsightsGridData = {
    average_salary: number;
    prev_average_salary: number;
    average_savings: number;
    prev_average_savings: number;
    resident_count: number;
    prev_resident_count: number;
};

type InsightGridsProps = {
    companyId?: string; // ✅ allow dynamic company selection
};

export function InsightGrids({ companyId }: InsightGridsProps) {
    const supabase = createClient();

    const [gridData, setGridData] = useState<InsightsGridData>({
        average_salary: 0,
        prev_average_salary: 0,
        average_savings: 0,
        prev_average_savings: 0,
        resident_count: 0,
        prev_resident_count: 0,
    });

    const [loading, setLoading] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<
        "no_filter" | "last_24_hours" | "last_7_days" | "last_30_days" | "year_to_date"
    >("no_filter");

    const [totalNumberSOResidents, setTotalNumberSOResidents] = useState(0);

    const getDifference = (latest: number, prev: number) => {
        const difference = latest - prev;
        let percentage = "0";
        const isUp = difference > 0;

        if (prev === 0) {
            percentage = latest > 0 ? "100" : "0";
        } else {
            percentage = Math.abs((difference / prev) * 100).toFixed(2);
        }

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
                        className={`py-[2px] px-2 text-xs max-w-fit rounded-full flex gap-1 ${isUp ? "bg-[#ECFDF3] text-[#027A48]" : "bg-[#FEF3F2] text-[#B42318]"
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

    const fetchInsights = useCallback(async () => {
        if (!companyId) return; // ✅ do nothing until companyId is provided

        setLoading(true);
        try {
            // Fetch metrics
            const { data, error } = await supabase
                .rpc("get_insights_grid_data", {
                    period: selectedPeriod,
                    company_id: companyId, // ✅ use selected company instead of user context
                })
                .maybeSingle();

            if (error) throw new Error(error.message);
            if (data) setGridData(data as InsightsGridData);

            // Fetch total residents for company
            const { data: companyData, error: companyError } = await supabase
                .from("company")
                .select("total_number_soresidents")
                .eq("id", companyId)
                .single();

            if (companyError) throw new Error(companyError.message);

            setTotalNumberSOResidents(companyData?.total_number_soresidents || 0);
        } catch (err) {
            console.error("Error fetching insights grid data:", err);
        } finally {
            setLoading(false);
        }
    }, [supabase, selectedPeriod, companyId]);

    useEffect(() => {
        fetchInsights();
    }, [fetchInsights]);

    // ---------------------- UI ----------------------
    if (!companyId) {
        return <p className="text-gray-500 text-sm">Select a company to view data.</p>;
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

    return (
        <div className="space-y-4">
            {/* Period Selector */}
            <div className="flex justify-end items-center">
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

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-10">
                {/* Resident Count */}
                <Card className="rounded-lg border-[#EEEEEE] flex text-center items-center justify-center">
                    <CardContent className="p-4">
                        <h3 className="text-3xl text-[#4E1A8F]">
                            {gridData.resident_count}
                            <sub className="text-lg text-[#87858E]">
                                /{totalNumberSOResidents}
                            </sub>
                        </h3>
                        <h6 className="text-sm text-[#26045D]">Total signups</h6>
                    </CardContent>
                </Card>

                {/* Average Salary */}
                <Card className="rounded-lg border-[#EEEEEE] flex text-center items-center justify-center">
                    <CardContent className="p-4">
                        <h3 className="text-3xl text-[#4E1A8F]">
                            £{gridData.average_salary.toLocaleString("en-GB")}
                        </h3>
                        <h6 className="text-sm text-[#26045D]">Average resident salary</h6>
                        {getDifference(gridData.average_salary, gridData.prev_average_salary)}
                    </CardContent>
                </Card>

                {/* Average Savings */}
                <Card className="rounded-lg border-[#EEEEEE] flex text-center items-center justify-center">
                    <CardContent className="p-4">
                        <h3 className="text-3xl text-[#4E1A8F]">
                            £{gridData.average_savings.toLocaleString("en-GB")}
                        </h3>
                        <h6 className="text-sm text-[#26045D]">Average resident savings</h6>
                        {getDifference(gridData.average_savings, gridData.prev_average_savings)}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
