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
    ChevronRightIcon,
} from "@heroicons/react/24/outline";
import {
    BarChart,
    Bar,
    Cell,
    ComposedChart,
    Line,
    PieChart,
    Pie,
    XAxis,
    YAxis,
    ReferenceLine,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
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

type ChartFilter =
    | { type: "signup_date"; date: string; label: string }
    | { type: "signin_date"; date: string; label: string }
    | { type: "status"; value: string; label: string }
    | { type: "role"; value: string; label: string }
    | null;

type DateRange = 7 | 30 | 90 | "all";

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

function fmtAxisDate(isoDate: string): string {
    const d = new Date(isoDate + "T12:00:00");
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function computeAllDays(users: PlatformUser[]): number {
    if (!users.length) return 30;
    const ts = users.map((u) => new Date(u.created_at).getTime()).filter((t) => !isNaN(t));
    if (!ts.length) return 30;
    return Math.max(1, Math.min(Math.ceil((Date.now() - Math.min(...ts)) / 86400000) + 1, 365));
}

function getDailyBuckets(
    users: PlatformUser[],
    field: "created_at" | "last_sign_in_at",
    days: number
): { key: string; value: number }[] {
    return Array.from({ length: days }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1 - i));
        const key = d.toISOString().split("T")[0];
        const value = users.filter((u) => {
            const v = field === "created_at" ? u.created_at : u.last_sign_in_at;
            return v?.startsWith(key);
        }).length;
        return { key, value };
    });
}

function getSigninBuckets(
    users: PlatformUser[],
    days: number
): { key: string; signins: number; rate: number }[] {
    const total = users.length || 1;
    return Array.from({ length: days }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1 - i));
        const key = d.toISOString().split("T")[0];
        const signins = users.filter((u) => u.last_sign_in_at?.startsWith(key)).length;
        return { key, signins, rate: Math.round((signins / total) * 100) };
    });
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

// ─── Shared chart primitives ──────────────────────────────────────────────────

const CARD_CN =
    "rounded-2xl border border-gray-100 dark:border-white/[0.08] bg-white dark:bg-[#1A0F35] px-5 pt-4 pb-2 " +
    "transition-all duration-200 " +
    "hover:border-gray-200 dark:hover:border-white/[0.14] " +
    "hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]";

function RangeButton({
    label,
    active,
    onClick,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                active
                    ? "bg-[#7B3FE4] text-white"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
        >
            {label}
        </button>
    );
}

function LegendBullet({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[3px] flex-shrink-0" style={{ background: color }} />
            <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
        </div>
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

// ─── Custom tooltips ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SignupsTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-gray-900 dark:bg-[#0E0823] border border-white/10 rounded-xl px-3 py-2 shadow-xl pointer-events-none">
            <p className="text-[10px] text-gray-400 mb-0.5">{fmtAxisDate(label)}</p>
            <p className="text-sm font-semibold text-white">{payload[0].value} signups</p>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SigninTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    const signins = payload.find((p: { dataKey: string }) => p.dataKey === "signins")?.value ?? 0;
    const rate = payload.find((p: { dataKey: string }) => p.dataKey === "rate")?.value ?? 0;
    return (
        <div className="bg-gray-900 dark:bg-[#0E0823] border border-white/10 rounded-xl px-3 py-2 shadow-xl pointer-events-none">
            <p className="text-[10px] text-gray-400 mb-1">{fmtAxisDate(label)}</p>
            <p className="text-sm font-semibold text-white">{signins} active</p>
            <p className="text-xs text-gray-400 mt-0.5">{rate}% sign-in rate</p>
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
            <p className="text-xs text-gray-400 mb-0.5">{name}</p>
            <p className="text-sm font-semibold text-white">{value} <span className="text-gray-400 text-xs font-normal">({pct}%)</span></p>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HBarTooltip({ active, payload, total }: any) {
    if (!active || !payload?.length) return null;
    const { key, value } = payload[0].payload;
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div className="bg-gray-900 dark:bg-[#0E0823] border border-white/10 rounded-xl px-3 py-2 shadow-xl pointer-events-none">
            <p className="text-xs text-gray-400 mb-0.5">{key}</p>
            <p className="text-sm font-semibold text-white">{value} <span className="text-gray-400 text-xs font-normal">({pct}%)</span></p>
        </div>
    );
}

// ─── Card: New Signups (bar chart) ────────────────────────────────────────────

function SignupsCard({
    users,
    filter,
    onFilter,
}: {
    users: PlatformUser[];
    filter: ChartFilter;
    onFilter: (f: ChartFilter) => void;
}) {
    const [range, setRange] = useState<DateRange>(30);

    const days = range === "all" ? computeAllDays(users) : range;
    const data = useMemo(() => getDailyBuckets(users, "created_at", days), [users, days]);

    const maxValue = Math.max(...data.map((d) => d.value), 1);
    const first = data[0]?.key ?? "";
    const last = data[data.length - 1]?.key ?? "";
    const totalInRange = data.reduce((sum, d) => sum + d.value, 0);
    const activeDate = filter?.type === "signup_date" ? filter.date : null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleBarClick(entry: any) {
        const date = entry?.activeLabel ?? entry?.key;
        if (!date) return;
        if (activeDate === date) { onFilter(null); return; }
        onFilter({ type: "signup_date", date, label: `Signed up ${fmtAxisDate(date)}` });
    }

    return (
        <div className={CARD_CN}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">New Signups</span>
                <div className="flex items-center gap-0.5">
                    {(([7, 30, 90, "all"] as const)).map((r) => (
                        <RangeButton key={String(r)} label={r === "all" ? "All" : `${r}d`} active={range === r} onClick={() => setRange(r)} />
                    ))}
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2">
                <LegendBullet color="#7B3FE4" label={`${totalInRange} signups`} />
                <LegendBullet color="#D1D5DB" label={range === "all" ? "all time" : `last ${range}d`} />
            </div>
            <div className="h-[90px] w-full cursor-pointer" onClick={handleBarClick as React.MouseEventHandler}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        barCategoryGap="30%"
                        margin={{ top: 14, right: 2, left: 2, bottom: 0 }}
                        onClick={handleBarClick}
                    >
                        <XAxis
                            dataKey="key"
                            axisLine={false}
                            tickLine={false}
                            interval={0}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            tick={((props: any) => <ChartDateTick {...props} first={first} last={last} />) as any}
                        />
                        <ReferenceLine
                            y={maxValue}
                            stroke="#D1D5DB"
                            strokeDasharray="4 3"
                            strokeWidth={1}
                            label={<MaxLabel value={maxValue} />}
                        />
                        <Tooltip content={<SignupsTooltip />} cursor={{ fill: "rgba(123,63,228,0.06)" }} />
                        <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                            {data.map((d, i) => (
                                <Cell
                                    key={i}
                                    fill="#7B3FE4"
                                    fillOpacity={activeDate === null || activeDate === d.key ? 0.88 : 0.2}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ─── Card: Sign In Activity (line chart) ─────────────────────────────────────

function SignInCard({
    users,
    filter,
    onFilter,
}: {
    users: PlatformUser[];
    filter: ChartFilter;
    onFilter: (f: ChartFilter) => void;
}) {
    const [range, setRange] = useState<DateRange>(30);

    const days = range === "all" ? computeAllDays(users) : range;
    const data = useMemo(() => getSigninBuckets(users, days), [users, days]);

    const maxSignins = Math.max(...data.map((d) => d.signins), 1);
    const first = data[0]?.key ?? "";
    const last = data[data.length - 1]?.key ?? "";
    const totalActive = data.reduce((sum, d) => sum + d.signins, 0);
    const avgRate = users.length > 0 ? Math.round((totalActive / days / users.length) * 100) : 0;
    const activeDate = filter?.type === "signin_date" ? filter.date : null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleClick(state: any) {
        const date = state?.activeLabel;
        if (!date) return;
        if (activeDate === date) { onFilter(null); return; }
        onFilter({ type: "signin_date", date, label: `Signed in ${fmtAxisDate(date)}` });
    }

    return (
        <div className={CARD_CN}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Sign In Activity</span>
                <div className="flex items-center gap-0.5">
                    {(([7, 30, 90, "all"] as const)).map((r) => (
                        <RangeButton key={String(r)} label={r === "all" ? "All" : `${r}d`} active={range === r} onClick={() => setRange(r)} />
                    ))}
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2">
                <LegendBullet color="#7B3FE4" label={`${totalActive} sign-ins`} />
                <LegendBullet color="#9CA3AF" label={`${avgRate}% avg rate`} />
            </div>
            <div className="h-[90px] w-full cursor-pointer">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={data}
                        margin={{ top: 14, right: 2, left: 2, bottom: 0 }}
                        onClick={handleClick}
                    >
                        <XAxis
                            dataKey="key"
                            axisLine={false}
                            tickLine={false}
                            interval={0}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            tick={((props: any) => <ChartDateTick {...props} first={first} last={last} />) as any}
                        />
                        <YAxis yAxisId="left" domain={[0, maxSignins + 1]} hide />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} hide />
                        {activeDate && (
                            <ReferenceLine
                                yAxisId="left"
                                x={activeDate}
                                stroke="#7B3FE4"
                                strokeDasharray="3 2"
                                strokeWidth={1.5}
                            />
                        )}
                        <Tooltip content={<SigninTooltip />} cursor={{ stroke: "rgba(123,63,228,0.15)", strokeWidth: 1 }} />
                        <Line
                            yAxisId="left"
                            dataKey="signins"
                            stroke="#7B3FE4"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 3, fill: "#7B3FE4", strokeWidth: 0 }}
                            isAnimationActive
                            animationDuration={400}
                        />
                        <Line
                            yAxisId="right"
                            dataKey="rate"
                            stroke="#9CA3AF"
                            strokeWidth={1.5}
                            strokeDasharray="3 2"
                            dot={false}
                            activeDot={{ r: 2, fill: "#9CA3AF", strokeWidth: 0 }}
                            isAnimationActive
                            animationDuration={400}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ─── Card: Account Status (donut) ─────────────────────────────────────────────

function StatusCard({
    confirmed,
    pending,
    filter,
    onFilter,
}: {
    confirmed: number;
    pending: number;
    filter: ChartFilter;
    onFilter: (f: ChartFilter) => void;
}) {
    const total = confirmed + pending;
    const data = useMemo(() => [
        { name: "Confirmed", value: confirmed, color: "#10B981" },
        { name: "Pending", value: pending, color: "#F59E0B" },
    ], [confirmed, pending]);

    const activeStatus = filter?.type === "status" ? filter.value : null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleClick(entry: any) {
        const name: string = entry?.name ?? entry?.payload?.name;
        if (!name) return;
        if (activeStatus === name) { onFilter(null); return; }
        onFilter({ type: "status", value: name, label: `Status: ${name}` });
    }

    return (
        <div className={CARD_CN}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Account Status</span>
                <ChevronRightIcon className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2">
                <LegendBullet color="#10B981" label={`${confirmed} confirmed`} />
                <LegendBullet color="#F59E0B" label={`${pending} pending`} />
            </div>
            <div className="relative h-[90px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={26}
                            outerRadius={40}
                            dataKey="value"
                            strokeWidth={0}
                            paddingAngle={data.every((d) => d.value > 0) ? 2 : 0}
                            onClick={handleClick}
                            style={{ cursor: "pointer" }}
                            isAnimationActive
                            animationDuration={400}
                        >
                            {data.map((d, i) => (
                                <Cell
                                    key={i}
                                    fill={d.color}
                                    fillOpacity={activeStatus === null || activeStatus === d.name ? 0.9 : 0.2}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<DonutTooltip total={total} />} />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">{total}</p>
                    <p className="text-[9px] text-gray-400 dark:text-gray-600 mt-0.5">total</p>
                </div>
            </div>
        </div>
    );
}

// ─── Card: Role Breakdown (donut ≤5 roles, horizontal bar >5) ────────────────

type RoleDatum = { key: string; value: number; color: string };

function RoleCard({
    roleBuckets,
    filter,
    onFilter,
}: {
    roleBuckets: RoleDatum[];
    filter: ChartFilter;
    onFilter: (f: ChartFilter) => void;
}) {
    const total = roleBuckets.reduce((s, d) => s + d.value, 0);
    const useHBar = roleBuckets.length > 5;
    const activeRole = filter?.type === "role" ? filter.value : null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleDonutClick(entry: any) {
        const name: string = entry?.name ?? entry?.payload?.name;
        if (!name) return;
        if (activeRole === name) { onFilter(null); return; }
        onFilter({ type: "role", value: name, label: `Role: ${name}` });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleBarClick(entry: any) {
        const key: string = entry?.activePayload?.[0]?.payload?.key ?? entry?.key;
        if (!key) return;
        if (activeRole === key) { onFilter(null); return; }
        onFilter({ type: "role", value: key, label: `Role: ${key}` });
    }

    const donutData = roleBuckets.map((r) => ({ ...r, name: r.key }));

    return (
        <div className={CARD_CN}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Role Breakdown</span>
                <ChevronRightIcon className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                {roleBuckets.slice(0, 3).map((r, i) => (
                    <LegendBullet key={r.key} color={CHART_PALETTE[i % CHART_PALETTE.length]} label={`${r.value} ${r.key}`} />
                ))}
            </div>
            <div className="relative h-[90px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {useHBar ? (
                        <BarChart
                            layout="vertical"
                            data={roleBuckets}
                            margin={{ top: 2, right: 6, left: 4, bottom: 2 }}
                            onClick={handleBarClick}
                        >
                            <XAxis type="number" hide />
                            <YAxis
                                type="category"
                                dataKey="key"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#9CA3AF", fontSize: 10 }}
                                width={52}
                            />
                            <Tooltip content={<HBarTooltip total={total} />} cursor={{ fill: "rgba(123,63,228,0.06)" }} />
                            <Bar dataKey="value" radius={[0, 3, 3, 0]} style={{ cursor: "pointer" }}>
                                {roleBuckets.map((d, i) => (
                                    <Cell
                                        key={i}
                                        fill={CHART_PALETTE[i % CHART_PALETTE.length]}
                                        fillOpacity={activeRole === null || activeRole === d.key ? 0.88 : 0.2}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    ) : (
                        <PieChart>
                            <Pie
                                data={donutData}
                                cx="50%"
                                cy="50%"
                                innerRadius={26}
                                outerRadius={40}
                                dataKey="value"
                                strokeWidth={0}
                                paddingAngle={donutData.every((d) => d.value > 0) ? 2 : 0}
                                onClick={handleDonutClick}
                                style={{ cursor: "pointer" }}
                                isAnimationActive
                                animationDuration={400}
                            >
                                {donutData.map((d, i) => (
                                    <Cell
                                        key={i}
                                        fill={CHART_PALETTE[i % CHART_PALETTE.length]}
                                        fillOpacity={activeRole === null || activeRole === d.name ? 0.9 : 0.2}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<DonutTooltip total={total} />} />
                        </PieChart>
                    )}
                </ResponsiveContainer>
                {/* Center label for donut */}
                {!useHBar && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">{total}</p>
                        <p className="text-[9px] text-gray-400 dark:text-gray-600 mt-0.5">users</p>
                    </div>
                )}
            </div>
        </div>
    );
}

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

                            {error && (
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                                    <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

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
                            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                                    <CheckIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-green-800 dark:text-green-300">User created successfully</p>
                                    <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">{email}</p>
                                </div>
                            </div>

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
    const [chartFilter, setChartFilter] = useState<ChartFilter>(null);

    const fetchUsers = useCallback(() => {
        setLoading(true);
        fetch("/api/internal/olympus?resource=platform_users")
            .then((r) => r.json())
            .then((j) => setUsers(j.data ?? []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetch("/api/internal/olympus")
            .then((r) => r.json())
            .then((j) => setCompanies(j.data ?? []))
            .catch(console.error);
        fetch("/api/internal/olympus?resource=roles")
            .then((r) => r.json())
            .then((j) => setRoles(j.data ?? []))
            .catch(console.error);
        fetchUsers();
    }, [fetchUsers]);

    // ── Derived stats ────────────────────────────────────────────────────────

    const totalUsers = users.length;
    const pendingInvites = users.filter((u) => !u.confirmed).length;
    const confirmedCount = totalUsers - pendingInvites;

    const roleBuckets = useMemo<RoleDatum[]>(() => {
        const counts: Record<string, number> = {};
        users.forEach((u) => {
            if (u.roles.length === 0) {
                counts["No role"] = (counts["No role"] ?? 0) + 1;
            } else {
                u.roles.forEach((r) => { counts[r] = (counts[r] ?? 0) + 1; });
            }
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([key, value], i) => ({ key, value, color: CHART_PALETTE[i % CHART_PALETTE.length] }));
    }, [users]);

    // ── Chart filter → table data ────────────────────────────────────────────

    const filteredUsers = useMemo<PlatformUser[]>(() => {
        if (!chartFilter) return users;
        switch (chartFilter.type) {
            case "signup_date":
                return users.filter((u) => u.created_at.startsWith(chartFilter.date));
            case "signin_date":
                return users.filter((u) => u.last_sign_in_at?.startsWith(chartFilter.date));
            case "status":
                return users.filter((u) => u.status === chartFilter.value);
            case "role":
                if (chartFilter.value === "No role") return users.filter((u) => u.roles.length === 0);
                return users.filter((u) => u.roles.includes(chartFilter.value));
            default:
                return users;
        }
    }, [users, chartFilter]);

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

            {/* Metric cards */}
            <div className="px-6 pb-4 grid grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
                <SignupsCard users={users} filter={chartFilter} onFilter={setChartFilter} />
                <SignInCard users={users} filter={chartFilter} onFilter={setChartFilter} />
                <StatusCard confirmed={confirmedCount} pending={pendingInvites} filter={chartFilter} onFilter={setChartFilter} />
                <RoleCard roleBuckets={roleBuckets} filter={chartFilter} onFilter={setChartFilter} />
            </div>

            {/* Active chart filter chip */}
            {chartFilter && (
                <div className="px-6 pb-2 flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400 dark:text-gray-500">Filtered by:</span>
                    <span className={UI.filterChip}>
                        {chartFilter.label}
                    </span>
                    <button
                        onClick={() => setChartFilter(null)}
                        className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                    >
                        Clear
                    </button>
                    <span className="text-xs text-gray-400 dark:text-gray-600 ml-1">
                        {filteredUsers.length} of {totalUsers} users
                    </span>
                </div>
            )}

            {/* Users table */}
            <OlympusTable<PlatformUser>
                columns={columns}
                data={filteredUsers}
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
