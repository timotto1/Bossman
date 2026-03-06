"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { OlympusTable, OlympusColumnDef } from "@/components/ui/olympus-table";
import { UI } from "@/lib/ui";

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Column definitions (outside component for stable reference) ──────────────

const COLUMNS: OlympusColumnDef<Resident>[] = [
    {
        key: "name",
        label: "Name",
        sortable: true,
        filterable: true,
        filterType: "text",
        render: (val) => (
            <span className="font-medium text-[#26045D] dark:text-purple-300 whitespace-nowrap">
                {String(val ?? "—")}
            </span>
        ),
    },
    {
        key: "address",
        label: "Address",
        filterable: true,
        filterType: "text",
        cellClassName: "max-w-[130px] truncate text-gray-500 dark:text-gray-400",
        render: (val) => (val ?? "—") as string,
    },
    {
        key: "email",
        label: "Email",
        filterable: true,
        filterType: "text",
        cellClassName: "max-w-[130px] truncate text-gray-500 dark:text-gray-400",
        render: (val) => (val ?? "—") as string,
    },
    {
        key: "housing_association",
        label: "Housing",
        filterable: true,
        filterType: "select",
        // filterOptions populated dynamically — see page component
        render: (val) => {
            if (!val) return <span className="text-gray-400">—</span>;
            const name = String(val);
            const color = getHAColor(name);
            return (
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium max-w-[110px] truncate ${color}`}>
                    {name}
                </span>
            );
        },
    },
    {
        key: "salary",
        label: "Salary",
        sortable: true,
        filterable: true,
        filterType: "number",
        render: (val) => formatCurrency(val as number | null),
    },
    {
        key: "savings",
        label: "Savings",
        sortable: true,
        filterable: true,
        filterType: "number",
        render: (val) => formatCurrency(val as number | null),
    },
    {
        key: "current_share",
        label: "Current %",
        sortable: true,
        filterable: true,
        filterType: "number",
        render: (val) => formatShare(val as number | null),
    },
    {
        key: "maximum_share",
        label: "Max %",
        sortable: true,
        filterable: true,
        filterType: "number",
        render: (val) => {
            const share = val as number | null;
            if (share === null || share === undefined)
                return <span className="text-gray-400 dark:text-gray-600">—</span>;
            const s = getShareBadgeStyle(share);
            return (
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
                    {share}%
                </span>
            );
        },
    },
    {
        key: "signed_up_date",
        label: "Signed",
        sortable: true,
        filterable: true,
        filterType: "date",
        render: (val) => (
            <span className="text-gray-500 dark:text-gray-400">{formatDate(val as string | null)}</span>
        ),
    },
    {
        key: "updated_at",
        label: "Last updated",
        sortable: true,
        filterable: true,
        filterType: "date",
        render: (val) => (
            <span className="text-gray-500 dark:text-gray-400">{formatDate(val as string | null)}</span>
        ),
    },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResidentsPage() {
    const [residents, setResidents] = useState<Resident[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<string>("all");
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

    // Build dynamic filterOptions for the housing_association column
    const columns = useMemo<OlympusColumnDef<Resident>[]>(() => {
        const haNames = Array.from(
            new Set(residents.map((r) => r.housing_association).filter(Boolean) as string[])
        ).sort();
        return COLUMNS.map((col) =>
            col.key === "housing_association"
                ? { ...col, filterOptions: haNames.map((n) => ({ value: n, label: n })) }
                : col
        );
    }, [residents]);

    // HA company dropdown for extraToolbar slot
    const haDropdown = (
        <div className="relative">
            <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="appearance-none text-sm border border-gray-200 dark:border-white/10 rounded-lg pl-3 pr-8 py-2 bg-white dark:bg-white/10 text-gray-700 dark:text-gray-200 outline-none cursor-pointer"
            >
                <option value="all">All Housing Associations</option>
                {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
            <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 dark:text-gray-400 pointer-events-none" />
        </div>
    );

    return (
        <div className={UI.page}>
            {/* Page heading */}
            <div className="flex items-center gap-3 px-6 pt-5 pb-1">
                <h1 className={UI.sectionHeading}>All residents</h1>
                <span className={UI.countBadge}>{residents.length.toLocaleString()} sign ups</span>
            </div>

            <OlympusTable<Resident>
                columns={columns}
                data={residents}
                loading={loading}
                rowKey={(r) => r.id}
                searchKeys={["name", "email"]}
                searchPlaceholder="Search by name or email…"
                extraToolbar={haDropdown}
                onRowClick={(r) => router.push(`/dashboard/residents/${r.id}`)}
                pageSize={15}
            />
        </div>
    );
}
