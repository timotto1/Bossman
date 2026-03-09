"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
    PlusIcon,
    XMarkIcon,
    ClipboardDocumentIcon,
    CheckIcon,
    ArrowDownTrayIcon,
    ShieldCheckIcon,
    EnvelopeIcon,
    BuildingOffice2Icon,
    ExclamationCircleIcon,
    UsersIcon,
    ClockIcon,
    UserCircleIcon,
} from "@heroicons/react/24/outline";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { OlympusTable, OlympusColumnDef } from "@/components/ui/olympus-table";
import { UI } from "@/lib/ui";

// ─── Types ────────────────────────────────────────────────────────────────────

type PlatformUser = {
    id: string;
    email: string | null;
    name: string | null;
    company_id: number | null;
    housing_association: string | null;
    roles: string[];
    last_sign_in_at: string | null;
    created_at: string;
    confirmed: boolean;
    status: string;
};

type Company = { id: string; name: string };
type Role = { id: string; name: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtRelative(iso: string | null): string {
    if (!iso) return "Never";
    const ms = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtDate(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const HA_COLORS = [
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
    "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300",
];

function getHAColor(name: string) {
    const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return HA_COLORS[hash % HA_COLORS.length];
}

const ROLE_COLORS: Record<string, string> = {
    admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    user: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    bossman: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

function getRoleColor(role: string) {
    return ROLE_COLORS[role.toLowerCase()] ?? "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300";
}

const CHART_PALETTE = ["#7B3FE4", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

// ─── Column definitions ───────────────────────────────────────────────────────

const COLUMNS: OlympusColumnDef<PlatformUser>[] = [
    {
        key: "email",
        label: "User",
        sortable: true,
        filterable: true,
        filterType: "text",
        render: (val, row) => (
            <div className="flex flex-col min-w-0">
                <span className="font-medium text-[#26045D] dark:text-purple-300 truncate max-w-[200px]">
                    {row.name ?? String(val ?? "—")}
                </span>
                {row.name && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[200px]">
                        {String(val ?? "")}
                    </span>
                )}
            </div>
        ),
    },
    {
        key: "housing_association",
        label: "Housing Assoc.",
        filterable: true,
        filterType: "select",
        render: (val) => {
            if (!val) return <span className="text-gray-400 dark:text-gray-600">—</span>;
            const name = String(val);
            return (
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium max-w-[130px] truncate ${getHAColor(name)}`}>
                    {name}
                </span>
            );
        },
    },
    {
        key: "roles",
        label: "Roles",
        render: (val) => {
            const roles = val as string[];
            if (!roles?.length) return <span className="text-gray-400 dark:text-gray-600 text-sm">—</span>;
            return (
                <div className="flex flex-wrap gap-1">
                    {roles.map((r) => (
                        <span key={r} className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(r)}`}>
                            {r}
                        </span>
                    ))}
                </div>
            );
        },
    },
    {
        key: "last_sign_in_at",
        label: "Last Sign In",
        sortable: true,
        render: (val) => (
            <span className="text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                {fmtRelative(val as string | null)}
            </span>
        ),
    },
    {
        key: "status",
        label: "Status",
        filterable: true,
        filterType: "select",
        filterOptions: [
            { value: "Confirmed", label: "Confirmed" },
            { value: "Pending", label: "Pending" },
        ],
        render: (val, row) => (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                row.confirmed
                    ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            }`}>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${row.confirmed ? "bg-green-500" : "bg-amber-500"}`} />
                {String(val)}
            </span>
        ),
    },
    {
        key: "created_at",
        label: "Joined",
        sortable: true,
        render: (val) => (
            <span className="text-gray-500 dark:text-gray-400 text-sm">{fmtDate(val as string | null)}</span>
        ),
    },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-gray-100 dark:border-white/[0.08] bg-white dark:bg-[#1A0F35] p-5
            transition-all duration-200
            hover:border-gray-200 dark:hover:border-white/[0.14]
            hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">{label}</p>
            {children}
        </div>
    );
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────

function InviteModal({
    companies,
    roles,
    onClose,
    onDone,
}: {
    companies: Company[];
    roles: Role[];
    onClose: () => void;
    onDone: () => void;
}) {
    const [email, setEmail] = useState("");
    const [companyId, setCompanyId] = useState("");
    const [roleId, setRoleId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [magicLink, setMagicLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    async function handleGenerate() {
        if (!email || !companyId) {
            setError("Email and housing association are required.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/internal/olympus", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resource: "platform_invite_user",
                    email: email.trim(),
                    company_id: Number(companyId),
                    role_id: roleId || undefined,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? "Failed to create user");
            setMagicLink(json.magic_link);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    }

    function copyLink() {
        if (!magicLink) return;
        navigator.clipboard.writeText(magicLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    function downloadLink() {
        if (!magicLink) return;
        const blob = new Blob([`Invite link for ${email}:\n\n${magicLink}`], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invite-${email.replace(/[^a-z0-9]/gi, "-")}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div
                className="relative bg-white dark:bg-[#160B30] rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-white/10 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 pb-0">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Invite User</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Create a new platform user and generate a magic sign-in link.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex-shrink-0"
                    >
                        <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <div className="p-6">
                    {!magicLink ? (
                        <div className="space-y-4">
                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                    Email Address
                                </label>
                                <div className="flex items-center gap-2.5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-white/5 focus-within:ring-2 focus-within:ring-purple-500/30 focus-within:border-purple-500 transition-all">
                                    <EnvelopeIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                                        placeholder="user@example.com"
                                        className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Housing Association */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                    Housing Association
                                </label>
                                <div className="flex items-center gap-2.5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-white/5 focus-within:ring-2 focus-within:ring-purple-500/30 focus-within:border-purple-500 transition-all">
                                    <BuildingOffice2Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <select
                                        value={companyId}
                                        onChange={(e) => setCompanyId(e.target.value)}
                                        className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white outline-none cursor-pointer appearance-none"
                                    >
                                        <option value="">Select housing association…</option>
                                        {companies.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                    Role / Permissions
                                </label>
                                <div className="flex items-center gap-2.5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-white/5 focus-within:ring-2 focus-within:ring-purple-500/30 focus-within:border-purple-500 transition-all">
                                    <ShieldCheckIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <select
                                        value={roleId}
                                        onChange={(e) => setRoleId(e.target.value)}
                                        className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white outline-none cursor-pointer appearance-none"
                                    >
                                        <option value="">No role (optional)</option>
                                        {roles.map((r) => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                                    <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Generate button */}
                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="w-full mt-2 py-3 rounded-xl bg-[#7B3FE4] hover:bg-[#6A35C7] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                            >
                                {loading ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <ShieldCheckIcon className="w-4 h-4" />
                                )}
                                {loading ? "Generating…" : "Generate Magic Link"}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Success banner */}
                            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                                    <CheckIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-green-800 dark:text-green-300">User created successfully</p>
                                    <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">{email}</p>
                                </div>
                            </div>

                            {/* Magic link */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                    Magic Link
                                </label>
                                <div className="p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl">
                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-mono break-all line-clamp-4 leading-relaxed">
                                        {magicLink}
                                    </p>
                                </div>
                                <p className="text-xs text-gray-400 dark:text-gray-600 mt-1.5">
                                    Share this link with the user. It expires after first use.
                                </p>
                            </div>

                            {/* Copy + Download */}
                            <div className="flex gap-3">
                                <button
                                    onClick={copyLink}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    {copied
                                        ? <CheckIcon className="w-4 h-4 text-green-500" />
                                        : <ClipboardDocumentIcon className="w-4 h-4" />
                                    }
                                    {copied ? "Copied!" : "Copy Link"}
                                </button>
                                <button
                                    onClick={downloadLink}
                                    className="flex-1 py-2.5 rounded-xl bg-[#7B3FE4] hover:bg-[#6A35C7] text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    <ArrowDownTrayIcon className="w-4 h-4" />
                                    Download
                                </button>
                            </div>

                            <button
                                onClick={onDone}
                                className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 text-sm transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UsersPage() {
    const [users, setUsers] = useState<PlatformUser[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const fetchUsers = useCallback(() => {
        setLoading(true);
        fetch("/api/internal/olympus?resource=platform_users")
            .then((r) => r.json())
            .then((j) => setUsers(j.data ?? []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        // Fetch companies and roles once
        fetch("/api/internal/olympus")
            .then((r) => r.json())
            .then((j) => setCompanies(j.data ?? []))
            .catch(console.error);
        fetch("/api/internal/olympus?resource=roles")
            .then((r) => r.json())
            .then((j) => setRoles(j.data ?? []))
            .catch(console.error);
        // Fetch users
        fetchUsers();
    }, [fetchUsers]);

    // ── Stats ────────────────────────────────────────────────────────────────

    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    const totalUsers = users.length;
    const activeThisMonth = users.filter(
        (u) => u.last_sign_in_at && now - new Date(u.last_sign_in_at).getTime() < thirtyDaysMs
    ).length;
    const pendingInvites = users.filter((u) => !u.confirmed).length;
    const activePercent = totalUsers > 0 ? Math.round((activeThisMonth / totalUsers) * 100) : 0;

    const roleCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        users.forEach((u) => {
            if (u.roles.length === 0) {
                counts["No role"] = (counts["No role"] ?? 0) + 1;
            } else {
                u.roles.forEach((r) => {
                    counts[r] = (counts[r] ?? 0) + 1;
                });
            }
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([name, value]) => ({ name, value }));
    }, [users]);

    // ── Dynamic column filter options ────────────────────────────────────────

    const columns = useMemo<OlympusColumnDef<PlatformUser>[]>(() => {
        const haNames = Array.from(
            new Set(users.map((u) => u.housing_association).filter(Boolean) as string[])
        ).sort();
        return COLUMNS.map((col) =>
            col.key === "housing_association"
                ? { ...col, filterOptions: haNames.map((n) => ({ value: n, label: n })) }
                : col
        );
    }, [users]);

    // ── Handlers ─────────────────────────────────────────────────────────────

    function handleModalDone() {
        setShowModal(false);
        fetchUsers();
    }

    return (
        <div className={UI.page}>
            {/* Page header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <h1 className={UI.sectionHeading}>Platform Users</h1>
                    <span className={UI.countBadge}>{totalUsers.toLocaleString()} users</span>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7B3FE4] hover:bg-[#6A35C7] text-white text-sm font-semibold transition-colors shadow-sm"
                >
                    <PlusIcon className="w-4 h-4" />
                    Add User
                </button>
            </div>

            {/* Stats */}
            <div className="px-6 pb-5 grid grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
                {/* Total Users */}
                <StatCard label="Total Users">
                    <div className="flex items-end gap-3 mt-1">
                        <div className="w-9 h-9 rounded-xl bg-[#F4F0FE] dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                            <UsersIcon className="w-5 h-5 text-[#7B3FE4] dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{totalUsers}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">platform accounts</p>
                        </div>
                    </div>
                </StatCard>

                {/* Active This Month */}
                <StatCard label="Active This Month">
                    <div className="mt-1">
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{activeThisMonth}</p>
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                                activePercent >= 50
                                    ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                            }`}>
                                {activePercent}%
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <ClockIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                            <p className="text-xs text-gray-400 dark:text-gray-600">signed in last 30 days</p>
                        </div>
                    </div>
                </StatCard>

                {/* Pending Invites */}
                <StatCard label="Pending Invites">
                    <div className="flex items-end gap-3 mt-1">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            pendingInvites > 0
                                ? "bg-amber-50 dark:bg-amber-900/20"
                                : "bg-gray-50 dark:bg-white/5"
                        }`}>
                            <UserCircleIcon className={`w-5 h-5 ${
                                pendingInvites > 0
                                    ? "text-amber-500 dark:text-amber-400"
                                    : "text-gray-400 dark:text-gray-600"
                            }`} />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{pendingInvites}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">awaiting confirmation</p>
                        </div>
                    </div>
                </StatCard>

                {/* Role Distribution */}
                <StatCard label="Role Distribution">
                    {loading || roleCounts.length === 0 ? (
                        <p className="text-sm text-gray-400 dark:text-gray-600 mt-3">
                            {loading ? "Loading…" : "No data"}
                        </p>
                    ) : (
                        <div className="flex items-center gap-3 mt-1">
                            <div className="relative flex-shrink-0" style={{ width: 68, height: 68 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={roleCounts}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={20}
                                            outerRadius={32}
                                            dataKey="value"
                                            strokeWidth={0}
                                        >
                                            {roleCounts.map((_, i) => (
                                                <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-col gap-1 min-w-0 flex-1">
                                {roleCounts.slice(0, 3).map((item, i) => (
                                    <div key={item.name} className="flex items-center gap-1.5 min-w-0">
                                        <span
                                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                            style={{ background: CHART_PALETTE[i % CHART_PALETTE.length] }}
                                        />
                                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.name}</span>
                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-auto pl-1">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </StatCard>
            </div>

            {/* Users table */}
            <OlympusTable<PlatformUser>
                columns={columns}
                data={users}
                loading={loading}
                rowKey={(u) => u.id}
                searchKeys={["email", "name", "housing_association"]}
                searchPlaceholder="Search by name or email…"
                pageSize={15}
            />

            {/* Invite modal */}
            {showModal && (
                <InviteModal
                    companies={companies}
                    roles={roles}
                    onClose={() => setShowModal(false)}
                    onDone={handleModalDone}
                />
            )}
        </div>
    );
}
