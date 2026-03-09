"use client";

import { useEffect, useState } from "react";

import { InsightGraphs } from "@/components/dashboard/insights/insight-graphs";
import { InsightGrids } from "@/components/dashboard/insights/insight-grids";
import { InsightMonthlyPipelineChart } from "@/components/dashboard/insights/insight-monthly-pipeline-chart";
import { InsightsTable } from "@/components/dashboard/insights/insights-table";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// ✅ Replace with real API call:
async function olympus_companies() {
    const res = await fetch("/api/internal/olympus");
    const json = await res.json();
    return json.data || [];
}

export default function PerformancePage() {
    const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<string | undefined>();

    useEffect(() => {
        olympus_companies().then(setCompanies).catch(console.error);
    }, []);

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-[#26045D]">
                        Company Performance
                    </h1>
                    <p className="text-gray-600">
                        Key metrics and performance insights for the selected company.
                    </p>
                </div>

                {/* 🔽 Company Dropdown */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Select Company
                    </label>
                    <Select onValueChange={setSelectedCompany}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Choose a company" />
                        </SelectTrigger>
                        <SelectContent>
                            {companies.map((company) => (
                                <SelectItem key={company.id} value={company.id}>
                                    {company.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Render data only if company selected */}
            {!selectedCompany ? (
                <p className="text-gray-500 mt-6">
                    Please select a company to view performance metrics.
                </p>
            ) : (
                <>
                    {/* High-level Grids */}
                    <InsightGrids companyId={selectedCompany} />

                    {/* Detailed Table */}
                    <InsightsTable companyId={selectedCompany} />

                    {/* Graphs Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <Card className="rounded-lg border-[#EEEEEE]">
                            <CardContent className="p-4">
                                <InsightGraphs
                                    type="average_salary"
                                    companyId={selectedCompany}
                                />
                            </CardContent>
                        </Card>
                        <Card className="rounded-lg border-[#EEEEEE]">
                            <CardContent className="p-4">
                                <InsightGraphs
                                    type="average_unit_valuation"
                                    companyId={selectedCompany}
                                />
                            </CardContent>
                        </Card>
                        <Card className="rounded-lg border-[#EEEEEE]">
                            <CardContent className="p-4">
                                <InsightGraphs
                                    type="resident_count"
                                    companyId={selectedCompany}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Monthly Pipeline */}
                    <InsightMonthlyPipelineChart companyId={selectedCompany} />
                </>
            )}
        </div>
    );
}
