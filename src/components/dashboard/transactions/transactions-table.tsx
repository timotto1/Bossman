"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Company = { id: string; name: string };
type Transaction = {
    id: number;
    created_at: string;
    rics_valuation: string | null;
    transaction_deposit: string | null;
    share_to_purchase: string | null;
    finance_method: string | null;
    status: string;
    documents?: { name: string; url: string }[];
};

const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    submitted: "bg-purple-100 text-purple-700",
    approved: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
};

export default function TransactionsTable() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<string>();
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [loading, setLoading] = useState(false);

    // ✅ Fetch companies
    useEffect(() => {
        fetch("/api/internal/olympus")
            .then((res) => res.json())
            .then((json) => setCompanies(json.data || []))
            .catch((err) => console.error("Error loading companies:", err));
    }, []);

    // ✅ Fetch transactions when filters change
    useEffect(() => {
        if (!selectedCompany) return;
        setLoading(true);

        const url =
            selectedStatus === "all"
                ? `/api/internal/olympus?resource=transactions&companyId=${selectedCompany}`
                : `/api/internal/olympus?resource=transactions&companyId=${selectedCompany}&status=${selectedStatus}`;

        fetch(url)
            .then((res) => res.json())
            .then((json) => setTransactions(json.data || []))
            .catch((err) => console.error("Error loading transactions:", err))
            .finally(() => setLoading(false));
    }, [selectedCompany, selectedStatus]);

    return (
        <div className="space-y-8">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-6">
                {/* Company */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Select Company
                    </label>
                    <Select onValueChange={setSelectedCompany}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Choose a company" />
                        </SelectTrigger>
                        <SelectContent>
                            {companies.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Filter by Status
                    </label>
                    <Select
                        value={selectedStatus}
                        onValueChange={(v) => setSelectedStatus(v)}
                    >
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="submitted">Submitted</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Transaction List */}
            {!selectedCompany ? (
                <p className="text-gray-500 mt-4">
                    Please select a company to view transactions.
                </p>
            ) : loading ? (
                <p className="text-gray-500 mt-4">Loading transactions...</p>
            ) : transactions.length === 0 ? (
                <p className="text-gray-500 text-sm">
                    No transactions found for this company.
                </p>
            ) : (
                <div className="space-y-4">
                    {transactions.map((tx) => (
                        <Card
                            key={tx.id}
                            className="border-[#EEEEEE] rounded-lg hover:shadow-md transition-shadow"
                        >
                            <CardContent className="p-5 space-y-3">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                                    <div>
                                        <p className="font-medium text-[#26045D]">
                                            Transaction #{tx.id}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(tx.created_at).toLocaleDateString()}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span
                                                className={`text-xs px-2 py-[2px] rounded-full ${statusColors[tx.status] || "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {tx.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-semibold text-[#26045D]">
                                            RICS: £
                                            {Number(tx.rics_valuation || 0).toLocaleString("en-GB")}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Deposit: £
                                            {Number(tx.transaction_deposit || 0).toLocaleString(
                                                "en-GB"
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Share: {tx.share_to_purchase || 0}%
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {tx.finance_method || "-"}
                                        </p>
                                    </div>
                                </div>

                                {/* Attached Documents */}
                                {tx.documents && tx.documents.length > 0 && (
                                    <div className="pt-3 border-t">
                                        <h4 className="text-sm font-medium text-[#26045D] mb-2">
                                            Attached Documents
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {tx.documents.map((doc, i) => (
                                                <Link
                                                    key={i}
                                                    href={doc.url}
                                                    target="_blank"
                                                    className="text-xs px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                                                >
                                                    {doc.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
