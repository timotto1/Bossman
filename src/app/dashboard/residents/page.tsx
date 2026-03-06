"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    ArrowsPointingOutIcon,
    ChevronDownIcon,
} from "@heroicons/react/24/outline";

type Resident = {
    id: string;
    name: string;
    email: string | null;
    address: string | null;
    housing_association: string | null;
    company_id: number;
    salary: number | null;
    savings: number | null;
    current_share: number | null;
    maximum_share: number | null;
    signed_up_date: string | null;
    updated_at: string | null;
};

type Company = { id: string; name: string };

const PAGE_SIZE = 15;

const HA_COLORS = [
    "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300",
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
];

function getHAColor(name: string) {
    const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return HA_COLORS[hash % HA_COLORS.length];
}

function getShareBadgeStyle(share: number | null) {
    if (share === null || share === undefined)
        return { bg: "bg-gray-100 dark:bg-white/10", text: "text-gray-400 dark:text-gray-500", dot: "bg-gray-300 dark:bg-gray-600" };
    if (share >= 100)
        return { bg: "bg-green-50 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", dot: "bg-green-500" };
    if (share >= 50)
        return { bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500" };
    if (share > 20)
        return { bg: "bg-gray-100 dark:bg-white/10", text: "text-gray-600 dark:text-gray-300", dot: "bg-gray-400 dark:bg-gray-500" };
    return { bg: "bg-red-50 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400", dot: "bg-red-500" };
}

function formatCurrency(val: number | null) {
    if (val === null || val === undefined) return "—";
    return `£${Number(val).toLocaleString()}`;
}

function formatDate(val: string | null) {
    if (!val) return "—";
    return new Date(val).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
    });
}

function formatShare(val: number | null) {
    if (val === null || val === undefined) return "—";
    return `${val}%`;
}

export default function ResidentsPage() {
    const [residents, setResidents] = useState<Resident[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<string>("all");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch("/api/internal/olympus")
            .then((r) => r.json())
            .then((j) => setCompanies(j.data || []))
            .catch(console.error);
    }, []);

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams({ resource: "residents" });
        if (selectedCompany !== "all") params.set("companyId", selectedCompany);
        fetch(`/api/internal/olympus?${params}`)
            .then((r) => r.json())
            .then((j) => setResidents(j.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedCompany]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return residents;
        return residents.filter(
            (r) =>
                r.name.toLowerCase().includes(q) ||
                (r.email?.toLowerCase().includes(q) ?? false)
        );
    }, [residents, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => setPage(1), [search, selectedCompany]);

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-[#0E0823]">
            {/* Top filter bar */}
            <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 dark:border-white/10 bg-white dark:bg-[#160B30]">
                <div className="flex items-center gap-2 flex-1 max-w-sm bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2">
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 outline-none w-full"
                    />
                </div>
                <div className="relative">
                    <select
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                        className="appearance-none text-sm border border-gray-200 dark:border-white/10 rounded-lg pl-3 pr-8 py-2 bg-white dark:bg-white/10 text-gray-700 dark:text-gray-200 outline-none cursor-pointer"
                    >
                        <option value="all">All Housing Associations</option>
                        {companies.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 dark:text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 overflow-auto px-6 py-5">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            All residents
                        </h1>
                        <span className="text-sm font-medium text-[#7B3FE4] bg-[#F4F0FE] dark:bg-purple-900/40 dark:text-purple-300 px-2.5 py-0.5 rounded-full">
                            {filtered.length.toLocaleString()} sign ups
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 dark:text-gray-600">
                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md transition-colors">
                            <MagnifyingGlassIcon className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md transition-colors">
                            <FunnelIcon className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md transition-colors">
                            <ArrowDownTrayIcon className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md transition-colors">
                            <ArrowsPointingOutIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-white/10">
                                <th className="w-10 pb-3 text-left">
                                    <input type="checkbox" className="rounded border-gray-300 dark:border-white/20" />
                                </th>
                                {["Name","Address","Email","Housing","Salary","Savings","Current %","Max %","Signed","Last updated"].map((col) => (
                                    <th key={col} className="pb-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 whitespace-nowrap pr-6">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={11} className="py-16 text-center text-gray-400 dark:text-gray-600">
                                        Loading residents…
                                    </td>
                                </tr>
                            ) : paged.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="py-16 text-center text-gray-400 dark:text-gray-600">
                                        No residents found
                                    </td>
                                </tr>
                            ) : (
                                paged.map((r) => {
                                    const maxStyle = getShareBadgeStyle(r.maximum_share);
                                    const haColor = r.housing_association
                                        ? getHAColor(r.housing_association)
                                        : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400";
                                    return (
                                        <tr
                                            key={r.id}
                                            className="hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer"
                                            onClick={() => router.push(`/dashboard/residents/${r.id}`)}
                                        >
                                            <td className="py-3 pr-2">
                                                <input type="checkbox" className="rounded border-gray-300 dark:border-white/20" onClick={(e) => e.stopPropagation()} />
                                            </td>
                                            <td className="py-3 pr-6 font-medium text-[#26045D] dark:text-purple-300 whitespace-nowrap">
                                                {r.name}
                                            </td>
                                            <td className="py-3 pr-6 text-gray-500 dark:text-gray-400 whitespace-nowrap max-w-[130px] truncate">
                                                {r.address ?? "—"}
                                            </td>
                                            <td className="py-3 pr-6 text-gray-500 dark:text-gray-400 whitespace-nowrap max-w-[130px] truncate">
                                                {r.email ?? "—"}
                                            </td>
                                            <td className="py-3 pr-6">
                                                {r.housing_association ? (
                                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium max-w-[110px] truncate ${haColor}`}>
                                                        {r.housing_association}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="py-3 pr-6 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                                {formatCurrency(r.salary)}
                                            </td>
                                            <td className="py-3 pr-6 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                                {formatCurrency(r.savings)}
                                            </td>
                                            <td className="py-3 pr-6 text-gray-700 dark:text-gray-300">
                                                {formatShare(r.current_share)}
                                            </td>
                                            <td className="py-3 pr-6">
                                                {r.maximum_share !== null ? (
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${maxStyle.bg} ${maxStyle.text}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${maxStyle.dot}`} />
                                                        {r.maximum_share}%
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-600">—</span>
                                                )}
                                            </td>
                                            <td className="py-3 pr-6 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                {formatDate(r.signed_up_date)}
                                            </td>
                                            <td className="py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                {formatDate(r.updated_at)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-[#160B30]">
                <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                    ← Previous
                </button>
                <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 6) }, (_, i) => i + 1).map((n) => (
                        <button
                            key={n}
                            onClick={() => setPage(n)}
                            className={`w-8 h-8 text-sm rounded-lg font-medium transition-colors ${
                                page === n
                                    ? "bg-[#26045D] dark:bg-purple-600 text-white"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
                            }`}
                        >
                            {n}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                    Next →
                </button>
            </div>
        </div>
    );
}
