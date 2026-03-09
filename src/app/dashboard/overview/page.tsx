"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie,
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    ReferenceLine,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { ChevronRightIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline";
import { UI } from "@/lib/ui";

// ─── Types ────────────────────────────────────────────────────────────────────

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

function fmtCurrency(n: number | null): string {
    if (n === null || n === undefined) return "—";
    return `£${Number(n).toLocaleString()}`;
}

function fmtDate(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtAxisMonth(iso: string): string {
    const d = new Date(iso + "-01T12:00:00");
    return d.toLocaleDateString("en-GB", { month: "short" });
}

function fmtAxisDate(isoDate: string): string {
    const d = new Date(isoDate + "T12:00:00");
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function getMonthKey(iso: string): string {
    return iso.slice(0, 7); // "2026-03"
}

function getMonthlyBuckets(residents: Resident[], months = 6): { key: string; value: number }[] {
    return Array.from({ length: months }, (_, i) => {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - (months - 1 - i));
        const key = d.toISOString().slice(0, 7);
        const value = residents.filter((r) => r.signed_up_date && getMonthKey(r.signed_up_date) === key).length;
        return { key, value };
    });
}

function getDailyBuckets(residents: Resident[], days = 30): { key: string; value: number }[] {
    return Array.from({ length: days }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1 - i));
        const key = d.toISOString().split("T")[0];
        const value = residents.filter((r) => r.signed_up_date?.startsWith(key)).length;
        return { key, value };
    });
}

const SHARE_BUCKETS = [
    { key: "<25%", min: 0, max: 25, color: "#EF4444" },
    { key: "25–50%", min: 25, max: 50, color: "#F59E0B" },
    { key: "50–75%", min: 50, max: 75, color: "#3B82F6" },
    { key: "75–100%", min: 75, max: 100, color: "#7B3FE4" },
    { key: "Full", min: 100, max: Infinity, color: "#10B981" },
];

function getShareBuckets(residents: Resident[]): { key: string; value: number; color: string }[] {
    return SHARE_BUCKETS.map((b) => ({
        key: b.key,
        value: residents.filter((r) => r.current_share !== null && r.current_share >= b.min && r.current_share < b.max).length,
        color: b.color,
    }));
}

function getHABuckets(residents: Resident[]): { key: string; value: number; color: string }[] {
    const PALETTE = ["#7B3FE4", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"];
    const counts: Record<string, number> = {};
    residents.forEach((r) => {
        const k = r.housing_association ?? "Unknown";
        counts[k] = (counts[k] ?? 0) + 1;
    });
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([key, value], i) => ({ key, value, color: PALETTE[i % PALETTE.length] }));
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

// ─── Chart sub-components ─────────────────────────────────────────────────────

const CARD_CN =
    "rounded-2xl border border-gray-100 dark:border-white/[0.08] bg-white dark:bg-[#1A0F35] px-5 pt-4 pb-2 " +
    "transition-all duration-200 " +
    "hover:border-gray-200 dark:hover:border-white/[0.14] " +
    "hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]";

function LegendBullet({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[3px] flex-shrink-0" style={{ background: color }} />
            <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartMonthTick({ x, y, payload, first, last }: any) {
    if (!payload || (payload.value !== first && payload.value !== last)) return null;
    const isFirst = payload.value === first;
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={11} fill="#9CA3AF" fontSize={10} textAnchor={isFirst ? "start" : "end"}>
                {fmtAxisMonth(payload.value)}
            </text>
        </g>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartDateTick({ x, y, payload, first, last }: any) {
    if (!payload || (payload.value !== first && payload.value !== last)) return null;
    const isFirst = payload.value === first;
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={11} fill="#9CA3AF" fontSize={10} textAnchor={isFirst ? "start" : "end"}>
                {fmtAxisDate(payload.value)}
            </text>
        </g>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MaxLabel({ viewBox, value }: any) {
    if (!viewBox || value === 0) return null;
    return (
        <text x={(viewBox.x ?? 0) + 3} y={(viewBox.y ?? 0) - 5} fill="#9CA3AF" fontSize={10}>
            {value}
        </text>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SimpleBarTooltip({ active, payload, label, labelFmt }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-gray-900 dark:bg-[#0E0823] border border-white/10 rounded-xl px-3 py-2 shadow-xl pointer-events-none">
            <p className="text-[10px] text-gray-400 mb-0.5">{labelFmt ? labelFmt(label) : label}</p>
            <p className="text-sm font-semibold text-white">{payload[0].value}</p>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DonutTooltip({ active, payload, total }: any) {
    if (!active || !payload?.length) return null;
    const { name, value } = payload[0].payload;
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div className="bg-gray-900 dark:bg-[#0E0823] border border-white/10 rounded-xl px-3 py-2 shadow-xl pointer-events-none">
            <p className="text-[10px] text-gray-400 mb-0.5">{name}</p>
            <p className="text-sm font-semibold text-white">{value} <span className="text-xs text-gray-400 font-normal">({pct}%)</span></p>
        </div>
    );
}

// ─── Mini metric bar card ─────────────────────────────────────────────────────

function MetricCard({
    title,
    bullets,
    data,
    barKey = "value",
    isMonth = false,
    barColors,
}: {
    title: string;
    bullets: { label: string; color: string }[];
    data: { key: string; value: number; color?: string }[];
    barKey?: string;
    isMonth?: boolean;
    barColors?: string[];
}) {
    const maxValue = Math.max(...data.map((d) => d.value), 1);
    const first = data[0]?.key ?? "";
    const last = data[data.length - 1]?.key ?? "";

    return (
        <div className={CARD_CN}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{title}</span>
                <ChevronRightIcon className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2">
                {bullets.map((b, i) => <LegendBullet key={i} color={b.color} label={b.label} />)}
            </div>
            <div className="h-[90px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barCategoryGap="30%" margin={{ top: 14, right: 2, left: 2, bottom: 0 }}>
                        <XAxis
                            dataKey="key"
                            axisLine={false}
                            tickLine={false}
                            interval={0}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            tick={isMonth
                                ? ((props: any) => <ChartMonthTick {...props} first={first} last={last} />) as any
                                : ((props: any) => <ChartDateTick {...props} first={first} last={last} />) as any
                            }
                        />
                        <ReferenceLine
                            y={maxValue}
                            stroke="#D1D5DB"
                            strokeDasharray="4 3"
                            strokeWidth={1}
                            label={<MaxLabel value={maxValue} />}
                        />
                        <Tooltip
                            content={<SimpleBarTooltip labelFmt={isMonth ? fmtAxisMonth : fmtAxisDate} />}
                            cursor={{ fill: "rgba(123,63,228,0.06)" }}
                        />
                        <Bar dataKey={barKey} radius={[3, 3, 0, 0]}>
                            {data.map((d, i) => (
                                <Cell
                                    key={i}
                                    fill={d.color ?? (barColors?.[i % barColors.length] ?? "#7B3FE4")}
                                    fillOpacity={0.88}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ─── Wide trend chart ─────────────────────────────────────────────────────────

function SignupTrendCard({
    monthly,
    daily,
}: {
    monthly: { key: string; value: number }[];
    daily: { key: string; value: number }[];
}) {
    const [view, setView] = useState<"monthly" | "daily">("monthly");
    const data = view === "monthly" ? monthly : daily;
    const first = data[0]?.key ?? "";
    const last = data[data.length - 1]?.key ?? "";

    return (
        <div className={CARD_CN + " col-span-2"}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Signup Trend</span>
                <div className="flex items-center gap-0.5">
                    {(["monthly", "daily"] as const).map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`text-[10px] px-2 py-0.5 rounded transition-colors capitalize ${
                                view === v
                                    ? "bg-[#7B3FE4] text-white"
                                    : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                        >
                            {v === "monthly" ? "6 months" : "30 days"}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2">
                <LegendBullet color="#7B3FE4" label={`${data.reduce((s, d) => s + d.value, 0)} signups`} />
                <LegendBullet color="#D1D5DB" label={view === "monthly" ? "last 6 months" : "last 30 days"} />
            </div>
            <div className="h-[100px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 14, right: 2, left: 2, bottom: 0 }}>
                        <XAxis
                            dataKey="key"
                            axisLine={false}
                            tickLine={false}
                            interval={0}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            tick={view === "monthly"
                                ? ((props: any) => <ChartMonthTick {...props} first={first} last={last} />) as any
                                : ((props: any) => <ChartDateTick {...props} first={first} last={last} />) as any
                            }
                        />
                        <YAxis hide />
                        <ReferenceLine
                            y={Math.max(...data.map((d) => d.value), 1)}
                            stroke="#D1D5DB"
                            strokeDasharray="4 3"
                            strokeWidth={1}
                        />
                        <Tooltip
                            content={<SimpleBarTooltip labelFmt={view === "monthly" ? fmtAxisMonth : fmtAxisDate} />}
                            cursor={{ fill: "rgba(123,63,228,0.06)" }}
                        />
                        {view === "monthly" ? (
                            <Bar dataKey="value" fill="#7B3FE4" fillOpacity={0.88} radius={[3, 3, 0, 0]} />
                        ) : (
                            <Line
                                dataKey="value"
                                stroke="#7B3FE4"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 3, fill: "#7B3FE4", strokeWidth: 0 }}
                                isAnimationActive
                                animationDuration={350}
                            />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ─── Share distribution donut ─────────────────────────────────────────────────

function ShareDistributionCard({ residents }: { residents: Resident[] }) {
    const data = useMemo(() => getShareBuckets(residents), [residents]);
    const total = residents.filter((r) => r.current_share !== null).length;
    const avgShare = total > 0
        ? Math.round(residents.reduce((s, r) => s + (r.current_share ?? 0), 0) / total)
        : 0;

    return (
        <div className={CARD_CN}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Share Distribution</span>
                <ChevronRightIcon className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                {data.slice(0, 3).map((d) => (
                    <LegendBullet key={d.key} color={d.color} label={`${d.value} ${d.key}`} />
                ))}
            </div>
            <div className="relative h-[90px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="key"
                            cx="50%"
                            cy="50%"
                            innerRadius={26}
                            outerRadius={40}
                            strokeWidth={0}
                            paddingAngle={data.every((d) => d.value > 0) ? 2 : 0}
                            isAnimationActive
                            animationDuration={400}
                        >
                            {data.map((d, i) => (
                                <Cell key={i} fill={d.color} fillOpacity={0.88} />
                            ))}
                        </Pie>
                        <Tooltip content={<DonutTooltip total={total} />} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">{avgShare}%</p>
                    <p className="text-[9px] text-gray-400 dark:text-gray-600 mt-0.5">avg share</p>
                </div>
            </div>
        </div>
    );
}

// ─── Recent residents list ────────────────────────────────────────────────────

function RecentResidentsCard({
    residents,
    onNavigate,
}: {
    residents: Resident[];
    onNavigate: (id: string) => void;
}) {
    const recent = useMemo(
        () =>
            [...residents]
                .filter((r) => r.signed_up_date)
                .sort((a, b) => (b.signed_up_date! > a.signed_up_date! ? 1 : -1))
                .slice(0, 6),
        [residents]
    );

    return (
        <div className={CARD_CN.replace("pb-2", "pb-3")}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Recent Sign-ups</span>
                <ChevronRightIcon className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
            </div>
            {recent.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-600 py-4 text-center">No data yet</p>
            ) : (
                <div className="space-y-1">
                    {recent.map((r) => (
                        <button
                            key={r.id}
                            onClick={() => onNavigate(r.id)}
                            className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7B3FE4] to-[#26045D] flex items-center justify-center flex-shrink-0">
                                    <span className="text-[10px] font-bold text-white">
                                        {r.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                                    </span>
                                </div>
                                <div className="min-w-0 text-left">
                                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{r.name}</p>
                                    {r.housing_association && (
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{r.housing_association}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                {r.current_share !== null && (
                                    <span className="text-[10px] text-gray-400 dark:text-gray-600">{r.current_share}%</span>
                                )}
                                <span className="text-[10px] text-gray-400 dark:text-gray-600">{fmtDate(r.signed_up_date)}</span>
                                <ArrowUpRightIcon className="w-3 h-3 text-gray-300 dark:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResidentDashboardPage() {
    const router = useRouter();
    const [residents, setResidents] = useState<Resident[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCompany, setSelectedCompany] = useState<string>("all");

    useEffect(() => {
        fetch("/api/internal/olympus")
            .then((r) => r.json())
            .then((j) => setCompanies(j.data ?? []))
            .catch(console.error);
    }, []);

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams({ resource: "residents" });
        if (selectedCompany !== "all") params.set("companyId", selectedCompany);
        fetch(`/api/internal/olympus?${params}`)
            .then((r) => r.json())
            .then((j) => setResidents(j.data ?? []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedCompany]);

    // ── Derived stats ────────────────────────────────────────────────────────

    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    const totalResidents = residents.length;
    const newThisMonth = residents.filter((r) => {
        if (!r.signed_up_date) return false;
        return now - new Date(r.signed_up_date).getTime() < thirtyDaysMs;
    }).length;

    const sharesWithData = residents.filter((r) => r.current_share !== null);
    const avgShare = sharesWithData.length > 0
        ? Math.round(sharesWithData.reduce((s, r) => s + (r.current_share ?? 0), 0) / sharesWithData.length)
        : 0;

    const monthlyBuckets = useMemo(() => getMonthlyBuckets(residents, 6), [residents]);
    const dailyBuckets = useMemo(() => getDailyBuckets(residents, 30), [residents]);
    const haBuckets = useMemo(() => getHABuckets(residents), [residents]);
    const shareBuckets = useMemo(() => getShareBuckets(residents), [residents]);

    const totalHA = useMemo(
        () => new Set(residents.map((r) => r.housing_association).filter(Boolean)).size,
        [residents]
    );

    return (
        <div className={UI.page}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <h1 className={UI.sectionHeading}>Dashboard</h1>
                    {!loading && (
                        <span className={UI.countBadge}>{totalResidents.toLocaleString()} residents</span>
                    )}
                </div>
                {/* HA filter */}
                <div className="relative">
                    <select
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                        className="appearance-none text-sm border border-gray-200 dark:border-white/10 rounded-xl pl-3 pr-8 py-2 bg-white dark:bg-white/10 text-gray-700 dark:text-gray-200 outline-none cursor-pointer"
                    >
                        <option value="all">All Housing Associations</option>
                        {companies.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <ChevronRightIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 w-3.5 h-3.5 text-gray-500 dark:text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-auto px-6 pb-6 space-y-4">
                {/* ── 4 stat cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        title="Total Residents"
                        bullets={[
                            { label: `${totalResidents} total`, color: "#7B3FE4" },
                            { label: "by month", color: "#D1D5DB" },
                        ]}
                        data={monthlyBuckets}
                        isMonth
                    />

                    <MetricCard
                        title="New This Month"
                        bullets={[
                            { label: `${newThisMonth} new`, color: "#10B981" },
                            { label: "last 30 days", color: "#D1D5DB" },
                        ]}
                        data={dailyBuckets}
                    />

                    <ShareDistributionCard residents={residents} />

                    <MetricCard
                        title="Housing Associations"
                        bullets={[
                            { label: `${totalHA} associations`, color: "#7B3FE4" },
                            { label: `top ${Math.min(haBuckets.length, 5)}`, color: "#D1D5DB" },
                        ]}
                        data={haBuckets}
                        isMonth={false}
                    />
                </div>

                {/* ── Second row: Signup trend (wide) + Recent residents ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <SignupTrendCard monthly={monthlyBuckets} daily={dailyBuckets} />
                    <RecentResidentsCard
                        residents={residents}
                        onNavigate={(id) => router.push(`/dashboard/residents/${id}`)}
                    />
                </div>

                {/* ── Third row: HA breakdown (wide) + Share detail ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* HA breakdown bar */}
                    <div className={CARD_CN}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">Residents by Association</span>
                            <ChevronRightIcon className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
                        </div>
                        <div className="space-y-2 pt-1 pb-1">
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-5 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
                                ))
                            ) : haBuckets.length === 0 ? (
                                <p className="text-xs text-gray-400 py-4 text-center">No data</p>
                            ) : (
                                haBuckets.map((b) => {
                                    const pct = totalResidents > 0 ? (b.value / totalResidents) * 100 : 0;
                                    return (
                                        <div key={b.key} className="flex items-center gap-3">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium w-[130px] truncate flex-shrink-0 ${getHAColor(b.key)}`}>
                                                {b.key}
                                            </span>
                                            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${pct}%`, background: b.color }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 w-7 text-right flex-shrink-0">
                                                {b.value}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Share breakdown detail */}
                    <div className={CARD_CN}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">Ownership Share Breakdown</span>
                            <ChevronRightIcon className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
                        </div>
                        <div className="space-y-2 pt-1 pb-1">
                            {shareBuckets.map((b) => {
                                const pct = totalResidents > 0 ? (b.value / totalResidents) * 100 : 0;
                                return (
                                    <div key={b.key} className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 w-14 flex-shrink-0">{b.key}</span>
                                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{ width: `${pct}%`, background: b.color }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 w-7 text-right flex-shrink-0">
                                            {b.value}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
