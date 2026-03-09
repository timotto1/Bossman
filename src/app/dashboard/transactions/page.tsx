"use client";

import { useEffect, useState, useMemo } from "react";
import {
    MagnifyingGlassIcon,
    XMarkIcon,
    DocumentTextIcon,
    ArrowTopRightOnSquareIcon,
    UserIcon,
    BanknotesIcon,
} from "@heroicons/react/24/outline";
import { UI } from "@/lib/ui";

// ─── Types ────────────────────────────────────────────────────────────────────

type Doc = { name: string; type: string | null; size: number | null; url: string };

type Transaction = {
    id: number;
    resident_id: number | null;
    resident_name: string | null;
    resident_email: string | null;
    housing_association: string | null;
    current_share: number | null;
    rics_valuation: number | null;
    transaction_deposit: number | null;
    share_to_purchase: number | null;
    finance_method: string | null;
    status: string;
    archived: boolean;
    created_at: string;
    documents: Doc[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS: Record<string, { label: string; badge: string; dot: string }> = {
    draft: {
        label: "Draft",
        dot: "bg-gray-400",
        badge: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
    },
    submitted: {
        label: "Submitted",
        dot: "bg-purple-500",
        badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    },
    approved: {
        label: "Approved",
        dot: "bg-green-500",
        badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    },
    completed: {
        label: "Completed",
        dot: "bg-blue-500",
        badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    },
    cancelled: {
        label: "Cancelled",
        dot: "bg-red-400",
        badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    },
};

const STATUS_TABS = ["all", "submitted", "approved", "draft", "completed", "cancelled"] as const;

const RANGES: { label: string; days: number | null }[] = [
    { label: "7d",  days: 7 },
    { label: "30d", days: 30 },
    { label: "90d", days: 90 },
    { label: "All", days: null },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(n: number | null): string {
    if (n == null) return "—";
    return `£${n.toLocaleString("en-GB")}`;
}

function fmtPct(n: number | null): string {
    if (n == null) return "—";
    return `${n}%`;
}

function fmtDate(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function initials(name: string | null): string {
    if (!name) return "?";
    return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

function fmtBytes(bytes: number | null): string {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS[status] ?? {
        label: status,
        badge: "bg-gray-100 text-gray-600",
        dot: "bg-gray-400",
    };
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex-1 min-w-0 px-6 py-4 border-r border-gray-100 dark:border-white/10 last:border-r-0">
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                {value}
            </p>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</p>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("submitted");
    const [range, setRange] = useState<number | null>(null);
    const [selected, setSelected] = useState<Transaction | null>(null);

    // ── Fetch ──────────────────────────────────────────────────────────────────

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams({ resource: "transactions" });
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (range !== null) {
            const from = new Date();
            from.setDate(from.getDate() - range);
            params.set("start", from.toISOString().split("T")[0]);
        }
        fetch(`/api/internal/olympus?${params}`)
            .then((r) => r.json())
            .then((j) => setTransactions(j.data ?? []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [statusFilter, range]);

    // ── Search filter ──────────────────────────────────────────────────────────

    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return transactions;
        return transactions.filter(
            (tx) =>
                tx.resident_name?.toLowerCase().includes(q) ||
                tx.housing_association?.toLowerCase().includes(q) ||
                tx.finance_method?.toLowerCase().includes(q) ||
                String(tx.id).includes(q)
        );
    }, [transactions, search]);

    // ── Stats ──────────────────────────────────────────────────────────────────

    const stats = useMemo(() => {
        const total = transactions.length;
        const active = transactions.filter((t) =>
            ["submitted", "approved"].includes(t.status)
        ).length;
        const totalRics = transactions.reduce(
            (s, t) => s + (t.rics_valuation ?? 0),
            0
        );
        const withShare = transactions.filter((t) => t.share_to_purchase != null);
        const avgShare =
            withShare.length > 0
                ? withShare.reduce((s, t) => s + (t.share_to_purchase ?? 0), 0) /
                  withShare.length
                : null;
        return { total, active, totalRics, avgShare };
    }, [transactions]);

    return (
        <>
            <div className={UI.page}>
                {/* Toolbar */}
                <div className={UI.toolbar}>
                    <div>
                        <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                            Transactions
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Staircasing transaction pipeline
                        </p>
                    </div>
                    <div className="flex-1" />
                    <div className={`${UI.searchInput} w-64`}>
                        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search resident, HA…"
                            className="bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none flex-1"
                        />
                        {search && (
                            <button onClick={() => setSearch("")}>
                                <XMarkIcon className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="flex flex-shrink-0 bg-white dark:bg-[#160B30] border-b border-gray-100 dark:border-white/10">
                    <StatCard label="Total transactions" value={String(stats.total)} />
                    <StatCard
                        label="Active (submitted / approved)"
                        value={String(stats.active)}
                    />
                    <StatCard
                        label="Total RICS value"
                        value={fmtCurrency(stats.totalRics)}
                    />
                    <StatCard
                        label="Avg share to purchase"
                        value={
                            stats.avgShare != null
                                ? `${stats.avgShare.toFixed(1)}%`
                                : "—"
                        }
                    />
                </div>

                {/* Filter Bar */}
                <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-100 dark:border-white/10 flex-shrink-0 bg-white dark:bg-[#0E0823]">
                    {/* Status tabs */}
                    <div className="flex items-center gap-1">
                        {STATUS_TABS.map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={[
                                    "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                                    statusFilter === s
                                        ? "bg-[#7B3FE4] text-white"
                                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10",
                                ].join(" ")}
                            >
                                {s === "all" ? "All" : (STATUS[s]?.label ?? s)}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1" />
                    {/* Timeframe */}
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/10 rounded-lg p-0.5">
                        {RANGES.map((r) => (
                            <button
                                key={r.label}
                                onClick={() => setRange(r.days)}
                                className={[
                                    "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                                    range === r.days
                                        ? "bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm"
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
                                ].join(" ")}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className={UI.content}>
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <p className="text-sm text-gray-400">Loading transactions…</p>
                        </div>
                    ) : visible.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-2">
                            <BanknotesIcon className="w-8 h-8 text-gray-300 dark:text-gray-700" />
                            <p className="text-sm text-gray-400">No transactions found</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr>
                                    {[
                                        "Resident",
                                        "Housing Association",
                                        "Status",
                                        "Share to Purchase",
                                        "RICS Valuation",
                                        "Deposit",
                                        "Finance Method",
                                        "Opened",
                                    ].map((h) => (
                                        <th key={h} className={UI.tableHeader}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((tx) => (
                                    <tr
                                        key={tx.id}
                                        className={UI.tableRow}
                                        onClick={() => setSelected(tx)}
                                    >
                                        <td className={UI.tableCell}>
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#7B3FE4] to-[#26045D] flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
                                                    {initials(tx.resident_name)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {tx.resident_name ?? "—"}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {tx.resident_email ?? ""}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={UI.tableCell}>
                                            {tx.housing_association ?? "—"}
                                        </td>
                                        <td className={UI.tableCell}>
                                            <StatusBadge status={tx.status} />
                                        </td>
                                        <td className={UI.tableCell}>
                                            {fmtPct(tx.share_to_purchase)}
                                        </td>
                                        <td className={UI.tableCell}>
                                            {fmtCurrency(tx.rics_valuation)}
                                        </td>
                                        <td className={UI.tableCell}>
                                            {fmtCurrency(tx.transaction_deposit)}
                                        </td>
                                        <td className={UI.tableCell}>
                                            {tx.finance_method ?? "—"}
                                        </td>
                                        <td className={UI.tableCell}>
                                            {fmtDate(tx.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Backdrop */}
            {selected && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
                    onClick={() => setSelected(null)}
                />
            )}

            {/* Slide-over panel */}
            <div
                className={[
                    "fixed top-0 right-0 h-screen w-[420px] bg-white dark:bg-[#160B30] shadow-2xl z-50",
                    "flex flex-col transition-transform duration-300 ease-in-out",
                    selected ? "translate-x-0" : "translate-x-full",
                ].join(" ")}
            >
                {selected && (
                    <>
                        {/* Panel header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/10 flex-shrink-0">
                            <div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                                    Transaction #{selected.id}
                                </p>
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                    {selected.resident_name ?? "Unknown Resident"}
                                </h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <StatusBadge status={selected.status} />
                                <button
                                    onClick={() => setSelected(null)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Panel body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                            {/* Resident info */}
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <UserIcon className="w-4 h-4 text-[#7B3FE4]" />
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                        Resident
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    <DetailRow
                                        label="Name"
                                        value={selected.resident_name ?? "—"}
                                    />
                                    <DetailRow
                                        label="Email"
                                        value={selected.resident_email ?? "—"}
                                    />
                                    <DetailRow
                                        label="Housing Association"
                                        value={selected.housing_association ?? "—"}
                                    />
                                    <DetailRow
                                        label="Current Ownership"
                                        value={fmtPct(selected.current_share)}
                                    />
                                </div>
                            </section>

                            <div className="border-t border-gray-100 dark:border-white/10" />

                            {/* Transaction financials */}
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <BanknotesIcon className="w-4 h-4 text-[#7B3FE4]" />
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                        Transaction Details
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    <DetailRow
                                        label="Share to Purchase"
                                        value={fmtPct(selected.share_to_purchase)}
                                    />
                                    <DetailRow
                                        label="Finance Method"
                                        value={selected.finance_method ?? "—"}
                                    />
                                    <DetailRow
                                        label="RICS Valuation"
                                        value={fmtCurrency(selected.rics_valuation)}
                                    />
                                    <DetailRow
                                        label="Deposit"
                                        value={fmtCurrency(selected.transaction_deposit)}
                                    />
                                    <DetailRow
                                        label="Opened"
                                        value={fmtDate(selected.created_at)}
                                    />
                                    <DetailRow
                                        label="Status"
                                        value={STATUS[selected.status]?.label ?? selected.status}
                                    />
                                </div>
                            </section>

                            {/* Documents */}
                            {selected.documents.length > 0 && (
                                <>
                                    <div className="border-t border-gray-100 dark:border-white/10" />
                                    <section>
                                        <div className="flex items-center gap-2 mb-3">
                                            <DocumentTextIcon className="w-4 h-4 text-[#7B3FE4]" />
                                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                                Documents ({selected.documents.length})
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            {selected.documents.map((doc, i) => (
                                                <a
                                                    key={i}
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
                                                >
                                                    <DocumentTextIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                            {doc.name}
                                                        </p>
                                                        {doc.size && (
                                                            <p className="text-xs text-gray-400">
                                                                {fmtBytes(doc.size)}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400 group-hover:text-[#7B3FE4] flex-shrink-0 transition-colors" />
                                                </a>
                                            ))}
                                        </div>
                                    </section>
                                </>
                            )}
                        </div>

                        {/* Panel footer */}
                        {selected.resident_id && (
                            <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 flex-shrink-0">
                                <a
                                    href={`/dashboard/residents/${selected.resident_id}`}
                                    className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-[#7B3FE4] text-[#7B3FE4] text-sm font-medium hover:bg-[#7B3FE4] hover:text-white transition-colors"
                                >
                                    View Resident Profile
                                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                </a>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
