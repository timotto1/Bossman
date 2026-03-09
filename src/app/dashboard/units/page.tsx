"use client";

import { useEffect, useState, useMemo } from "react";
import {
    MagnifyingGlassIcon,
    XMarkIcon,
    BuildingOffice2Icon,
    HomeIcon,
    CheckBadgeIcon,
    FunnelIcon,
    ChevronDownIcon,
    ArrowTopRightOnSquareIcon,
    Squares2X2Icon,
} from "@heroicons/react/24/outline";
import {
    BarChart,
    Bar,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { UI } from "@/lib/ui";

// ─── Types ────────────────────────────────────────────────────────────────────

type Resident = { id: number; name: string; email: string | null };

type Unit = {
    key: string;           // "cdu-{id}" | "uau-{residentId}"
    db_id: number | null;  // company_development_units.id, null for UAU
    kind: "CDU" | "UAU";
    internal_id: string | null;
    plot_number: string | null;
    address: string | null;
    city: string | null;
    county: string | null;
    postcode: string | null;
    region: string | null;
    unit_type: string | null;
    lease_type: string | null;
    status: string;
    purchase_date: string | null;
    purchase_price: number | null;
    percentage_sold: number | null;
    monthly_rent: number | null;
    service_charge: number | null;
    specified_rent: number | null;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
    development_id: number | null;
    development_name: string | null;
    housing_provider: string | null;
    is_shared_ownership: boolean;
    valuation_amount: number | null;
    valuation_date: string | null;
    resident: Resident | null;
};

type Development = {
    id: number;
    name: string;
    address: string | null;
    postcode: string | null;
    city: string | null;
    is_shared_ownership: boolean;
    is_help_to_buy: boolean;
    housing_provider: string | null;
    management_company: string | null;
    completion_date: string | null;
    created_at: string;
    total_units: number;
    occupied_units: number;
};

type Meta = { cdu_count: number; uau_count: number };
type Tab = "units" | "developments";

// ─── Constants ────────────────────────────────────────────────────────────────

const UNIT_STATUS: Record<string, { label: string; badge: string; dot: string }> = {
    occupied: {
        label: "Occupied",
        dot: "bg-green-500",
        badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    },
    vacant: {
        label: "Vacant",
        dot: "bg-amber-400",
        badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    },
    reserved: {
        label: "Reserved",
        dot: "bg-blue-500",
        badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    },
};

const RANGES: { label: string; days: number | null }[] = [
    { label: "30d", days: 30 },
    { label: "90d", days: 90 },
    { label: "1y",  days: 365 },
    { label: "All", days: null },
];

const CHART_PURPLE = "#7B3FE4";
const CHART_BLUE   = "#3B82F6";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(n: number | null): string {
    if (n == null) return "—";
    return `£${n.toLocaleString("en-GB")}`;
}

function fmtDate(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function fmtPct(n: number | null): string {
    if (n == null) return "—";
    return `${n}%`;
}

function initials(name: string | null): string {
    if (!name) return "?";
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function getMonthBuckets(items: { created_at?: string; updated_at?: string }[], field: "created_at" | "updated_at", months: number) {
    const now = new Date();
    const buckets: { label: string; count: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        buckets.push({ label: d.toLocaleDateString("en-GB", { month: "short" }), count: 0 });
    }
    for (const item of items) {
        const val = item[field];
        if (!val) continue;
        const d = new Date(val);
        const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
        if (monthsAgo >= 0 && monthsAgo < months) {
            buckets[months - 1 - monthsAgo].count++;
        }
    }
    return buckets;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const cfg = UNIT_STATUS[status] ?? { label: status, badge: "bg-gray-100 text-gray-600", dot: "bg-gray-400" };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function TypeTag({ type }: { type: "CDU" | "UAU" }) {
    return (
        <span className={[
            "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide",
            type === "CDU"
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                : "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
        ].join(" ")}>
            {type}
        </span>
    );
}

function MiniBarCard({
    title, value, sub, data, color, range, onRangeChange,
}: {
    title: string; value: string; sub?: string;
    data: { label: string; count: number }[];
    color: string; range: number | null;
    onRangeChange: (d: number | null) => void;
}) {
    const max = Math.max(...data.map((d) => d.count), 1);
    return (
        <div className={`${UI.card} flex flex-col gap-3`}>
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
                    {sub && <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{sub}</p>}
                </div>
                <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-white/10 rounded-md p-0.5 flex-shrink-0">
                    {RANGES.map((r) => (
                        <button key={r.label} onClick={() => onRangeChange(r.days)}
                            className={["px-2 py-0.5 rounded text-[10px] font-medium transition-colors",
                                range === r.days
                                    ? "bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200",
                            ].join(" ")}>
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>
            <ResponsiveContainer width="100%" height={52}>
                <BarChart data={data} barCategoryGap="30%">
                    <Tooltip cursor={false} content={({ active, payload, label }) =>
                        active && payload?.length ? (
                            <div className="bg-white dark:bg-[#1A0F35] border border-gray-100 dark:border-white/10 rounded-lg px-3 py-2 text-xs shadow-lg">
                                <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                                <p className="text-gray-500">{payload[0].value} units</p>
                            </div>
                        ) : null}
                    />
                    <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                        {data.map((entry, i) => (
                            <Cell key={i} fill={color} fillOpacity={entry.count === max && max > 0 ? 1 : 0.35} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

function CountCard({ title, value, sub, icon: Icon, color }: {
    title: string; value: string; sub: string; icon: React.ElementType; color: string;
}) {
    return (
        <div className={`${UI.card} flex items-start gap-4`}>
            <div className="rounded-lg p-2.5 flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
                <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{sub}</p>
            </div>
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

function FilterDropdown({ label, options, value, onChange }: {
    label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <button onClick={() => setOpen((o) => !o)}
                className={["flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                    value !== "all"
                        ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300"
                        : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20",
                ].join(" ")}>
                {value !== "all" && <FunnelIcon className="w-3 h-3" />}
                {value === "all" ? label : value}
                <ChevronDownIcon className="w-3 h-3" />
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute top-full mt-1 left-0 bg-white dark:bg-[#1A0F35] border border-gray-100 dark:border-white/10 rounded-lg shadow-lg z-20 min-w-[140px] py-1 max-h-56 overflow-y-auto">
                        <button onClick={() => { onChange("all"); setOpen(false); }}
                            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-white/5 ${value === "all" ? "font-semibold text-purple-600" : "text-gray-700 dark:text-gray-300"}`}>
                            All
                        </button>
                        {options.map((o) => (
                            <button key={o} onClick={() => { onChange(o); setOpen(false); }}
                                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-white/5 capitalize ${value === o ? "font-semibold text-purple-600" : "text-gray-700 dark:text-gray-300"}`}>
                                {o}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Developments Table ───────────────────────────────────────────────────────

function DevelopmentsView({ search }: { search: string }) {
    const [devs, setDevs] = useState<Development[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Development | null>(null);

    useEffect(() => {
        setLoading(true);
        fetch("/api/internal/olympus?resource=developments")
            .then((r) => r.json())
            .then((j) => setDevs(j.data ?? []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return devs;
        return devs.filter((d) =>
            d.name?.toLowerCase().includes(q) ||
            d.city?.toLowerCase().includes(q) ||
            d.postcode?.toLowerCase().includes(q) ||
            d.housing_provider?.toLowerCase().includes(q)
        );
    }, [devs, search]);

    return (
        <>
            <div className={`${UI.content} pt-0`}>
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <p className="text-sm text-gray-400">Loading developments…</p>
                    </div>
                ) : visible.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-2">
                        <Squares2X2Icon className="w-8 h-8 text-gray-300 dark:text-gray-700" />
                        <p className="text-sm text-gray-400">No developments found</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr>
                                {["Development", "Location", "Provider", "Units", "Occupancy", "Type", "Completion", "Added"].map((h) => (
                                    <th key={h} className={UI.tableHeader}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map((dev) => {
                                const occupancy = dev.total_units > 0
                                    ? Math.round((dev.occupied_units / dev.total_units) * 100)
                                    : null;
                                return (
                                    <tr key={dev.id} className={UI.tableRow} onClick={() => setSelected(dev)}>
                                        <td className={UI.tableCell}>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{dev.name}</p>
                                            {dev.management_company && (
                                                <p className="text-xs text-gray-400">{dev.management_company}</p>
                                            )}
                                        </td>
                                        <td className={UI.tableCell}>
                                            <p>{[dev.city, dev.postcode].filter(Boolean).join(" · ") || "—"}</p>
                                        </td>
                                        <td className={UI.tableCell}>{dev.housing_provider ?? "—"}</td>
                                        <td className={UI.tableCell}>
                                            <span className={UI.countBadge}>{dev.total_units}</span>
                                        </td>
                                        <td className={UI.tableCell}>
                                            {occupancy !== null ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-[#7B3FE4] rounded-full"
                                                            style={{ width: `${occupancy}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-600 dark:text-gray-400">{occupancy}%</span>
                                                </div>
                                            ) : <span className="text-gray-400">—</span>}
                                        </td>
                                        <td className={UI.tableCell}>
                                            <div className="flex gap-1 flex-wrap">
                                                {dev.is_shared_ownership && (
                                                    <span className="text-[11px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-0.5 rounded font-medium">SO</span>
                                                )}
                                                {dev.is_help_to_buy && (
                                                    <span className="text-[11px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded font-medium">H2B</span>
                                                )}
                                                {!dev.is_shared_ownership && !dev.is_help_to_buy && (
                                                    <span className="text-gray-400 text-sm">—</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className={UI.tableCell}>{fmtDate(dev.completion_date)}</td>
                                        <td className={UI.tableCell}>{fmtDate(dev.created_at)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Backdrop */}
            {selected && (
                <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={() => setSelected(null)} />
            )}

            {/* Slide-over */}
            <div className={["fixed top-0 right-0 h-screen w-[420px] bg-white dark:bg-[#160B30] shadow-2xl z-50",
                "flex flex-col transition-transform duration-300 ease-in-out",
                selected ? "translate-x-0" : "translate-x-full"].join(" ")}>
                {selected && (
                    <>
                        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 dark:border-white/10 flex-shrink-0">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">{selected.name}</h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {[selected.city, selected.postcode].filter(Boolean).join(" · ")}
                                </p>
                            </div>
                            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mt-1">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Total Units", value: String(selected.total_units) },
                                    { label: "Occupied", value: String(selected.occupied_units) },
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-gray-50 dark:bg-white/5 rounded-lg p-3 text-center">
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-100 dark:border-white/10" />
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <BuildingOffice2Icon className="w-4 h-4 text-[#7B3FE4]" />
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Details</p>
                                </div>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    <DetailRow label="Housing Provider" value={selected.housing_provider ?? "—"} />
                                    <DetailRow label="Management Company" value={selected.management_company ?? "—"} />
                                    <DetailRow label="Address" value={selected.address ?? "—"} />
                                    <DetailRow label="City" value={selected.city ?? "—"} />
                                    <DetailRow label="Postcode" value={selected.postcode ?? "—"} />
                                    <DetailRow label="Completion Date" value={fmtDate(selected.completion_date)} />
                                    <DetailRow label="Shared Ownership" value={selected.is_shared_ownership ? "Yes" : "No"} />
                                    <DetailRow label="Help to Buy" value={selected.is_help_to_buy ? "Yes" : "No"} />
                                    <DetailRow label="Added" value={fmtDate(selected.created_at)} />
                                </div>
                            </section>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UnitsPage() {
    const [units, setUnits] = useState<Unit[]>([]);
    const [meta, setMeta] = useState<Meta>({ cdu_count: 0, uau_count: 0 });
    const [loading, setLoading] = useState(true);

    const [tab, setTab] = useState<Tab>("units");
    const [search, setSearch] = useState("");

    // Unit filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [leaseFilter, setLeaseFilter] = useState("all");
    const [devFilter, setDevFilter] = useState("all");
    const [unitKindFilter, setUnitKindFilter] = useState("all");
    const [verifiedFilter, setVerifiedFilter] = useState("all");

    // Card ranges
    const [addedRange, setAddedRange] = useState<number | null>(null);
    const [updatedRange, setUpdatedRange] = useState<number | null>(null);

    // Slide-over
    const [selected, setSelected] = useState<Unit | null>(null);

    // ── Fetch units ────────────────────────────────────────────────────────────

    useEffect(() => {
        setLoading(true);
        fetch("/api/internal/olympus?resource=units")
            .then((r) => r.json())
            .then((j) => {
                setUnits(j.data ?? []);
                setMeta(j.meta ?? { cdu_count: 0, uau_count: 0 });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // ── Derived filter options ─────────────────────────────────────────────────

    const unitTypes = useMemo(
        () => [...new Set(units.map((u) => u.unit_type).filter(Boolean))] as string[],
        [units]
    );
    const leaseTypes = useMemo(
        () => [...new Set(units.map((u) => u.lease_type).filter(Boolean))] as string[],
        [units]
    );
    const developments = useMemo(
        () => [...new Set(units.map((u) => u.development_name).filter(Boolean))] as string[],
        [units]
    );

    // ── Filtered unit rows ─────────────────────────────────────────────────────

    const visible = useMemo(() => {
        let rows = units;
        const q = search.trim().toLowerCase();
        if (q) {
            rows = rows.filter(
                (u) =>
                    u.address?.toLowerCase().includes(q) ||
                    u.postcode?.toLowerCase().includes(q) ||
                    u.development_name?.toLowerCase().includes(q) ||
                    u.housing_provider?.toLowerCase().includes(q) ||
                    u.internal_id?.toLowerCase().includes(q) ||
                    u.resident?.name?.toLowerCase().includes(q) ||
                    u.city?.toLowerCase().includes(q)
            );
        }
        if (statusFilter !== "all")   rows = rows.filter((u) => u.status === statusFilter);
        if (typeFilter !== "all")     rows = rows.filter((u) => u.unit_type === typeFilter);
        if (leaseFilter !== "all")    rows = rows.filter((u) => u.lease_type === leaseFilter);
        if (devFilter !== "all")      rows = rows.filter((u) => u.development_name === devFilter);
        if (unitKindFilter !== "all") rows = rows.filter((u) => u.kind === unitKindFilter);
        if (verifiedFilter !== "all")
            rows = rows.filter((u) => u.is_verified === (verifiedFilter === "verified"));
        return rows;
    }, [units, search, statusFilter, typeFilter, leaseFilter, devFilter, unitKindFilter, verifiedFilter]);

    // ── Chart data ─────────────────────────────────────────────────────────────

    const addedMonths = addedRange === null ? 12 : addedRange <= 30 ? 1 : addedRange <= 90 ? 3 : 12;
    const updatedMonths = updatedRange === null ? 12 : updatedRange <= 30 ? 1 : updatedRange <= 90 ? 3 : 12;

    const addedBuckets = useMemo(() => getMonthBuckets(units, "created_at", addedMonths), [units, addedMonths]);
    const updatedBuckets = useMemo(() => {
        const changed = units.filter((u) => u.updated_at !== u.created_at);
        return getMonthBuckets(changed, "updated_at", updatedMonths);
    }, [units, updatedMonths]);

    const activeFilterCount = [statusFilter, typeFilter, leaseFilter, devFilter, unitKindFilter, verifiedFilter]
        .filter((v) => v !== "all").length;

    const clearFilters = () => {
        setStatusFilter("all"); setTypeFilter("all"); setLeaseFilter("all");
        setDevFilter("all"); setUnitKindFilter("all"); setVerifiedFilter("all");
    };

    return (
        <>
            <div className={UI.page}>
                {/* Toolbar */}
                <div className={UI.toolbar}>
                    <div>
                        <h1 className="text-base font-semibold text-gray-900 dark:text-white">Units</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Property inventory across all developments
                        </p>
                    </div>
                    <div className="flex-1" />
                    {/* Tab switcher */}
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/10 rounded-lg p-0.5">
                        {([["units", "Units"], ["developments", "Developments"]] as [Tab, string][]).map(([t, label]) => (
                            <button key={t} onClick={() => setTab(t)}
                                className={["px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                                    tab === t
                                        ? "bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm"
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
                                ].join(" ")}>
                                {label}
                            </button>
                        ))}
                    </div>
                    <div className={`${UI.searchInput} w-72`}>
                        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={tab === "units" ? "Address, postcode, resident…" : "Development, provider…"}
                            className="bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none flex-1 min-w-0"
                        />
                        {search && (
                            <button onClick={() => setSearch("")}>
                                <XMarkIcon className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Stat cards — always visible */}
                <div className="px-6 pt-5 pb-4 grid grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
                    <MiniBarCard
                        title="Units Added"
                        value={String(units.length)}
                        sub="total in system"
                        data={addedBuckets}
                        color={CHART_PURPLE}
                        range={addedRange}
                        onRangeChange={setAddedRange}
                    />
                    <MiniBarCard
                        title="Units Updated"
                        value={String(units.filter((u) => u.updated_at !== u.created_at).length)}
                        sub="since creation"
                        data={updatedBuckets}
                        color={CHART_BLUE}
                        range={updatedRange}
                        onRangeChange={setUpdatedRange}
                    />
                    <CountCard
                        title="CDU Units"
                        value={String(meta.cdu_count)}
                        sub="Residents on company units"
                        icon={BuildingOffice2Icon}
                        color="#7B3FE4"
                    />
                    <CountCard
                        title="UAU Units"
                        value={String(meta.uau_count)}
                        sub="Residents on self-selected units"
                        icon={HomeIcon}
                        color="#F59E0B"
                    />
                </div>

                {tab === "units" ? (
                    <>
                        {/* Filter bar */}
                        <div className="flex items-center gap-2 px-6 pb-4 flex-wrap flex-shrink-0">
                            <FilterDropdown label="Status"      options={["occupied", "vacant", "reserved"]} value={statusFilter}   onChange={setStatusFilter} />
                            <FilterDropdown label="Unit type"   options={unitTypes}                           value={typeFilter}     onChange={setTypeFilter} />
                            <FilterDropdown label="Lease type"  options={leaseTypes}                          value={leaseFilter}    onChange={setLeaseFilter} />
                            <FilterDropdown label="Development" options={developments}                        value={devFilter}      onChange={setDevFilter} />
                            <FilterDropdown label="CDU / UAU"   options={["CDU", "UAU"]}                     value={unitKindFilter} onChange={setUnitKindFilter} />
                            <FilterDropdown label="Verification" options={["verified", "unverified"]}         value={verifiedFilter} onChange={setVerifiedFilter} />
                            {activeFilterCount > 0 && (
                                <button onClick={clearFilters}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                                    <XMarkIcon className="w-3.5 h-3.5" />
                                    Clear {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
                                </button>
                            )}
                            <div className="flex-1" />
                            <span className={UI.countBadge}>{visible.length} unit{visible.length !== 1 ? "s" : ""}</span>
                        </div>

                        {/* Units table */}
                        <div className={`${UI.content} pt-0`}>
                            {loading ? (
                                <div className="flex items-center justify-center h-40">
                                    <p className="text-sm text-gray-400">Loading units…</p>
                                </div>
                            ) : visible.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 gap-2">
                                    <BuildingOffice2Icon className="w-8 h-8 text-gray-300 dark:text-gray-700" />
                                    <p className="text-sm text-gray-400">No units found</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            {["Unit", "Development", "Type", "Status", "CDU / UAU", "Resident", "Purchase Price", "Valuation", "Monthly Rent", "Share Sold", "Verified", "Added"].map((h) => (
                                                <th key={h} className={UI.tableHeader}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visible.map((unit) => (
                                            <tr key={unit.key} className={UI.tableRow} onClick={() => setSelected(unit)}>
                                                <td className={UI.tableCell}>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {unit.address ?? unit.internal_id ?? `Unit ${unit.db_id ?? unit.key}`}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {[unit.city, unit.postcode].filter(Boolean).join(" · ")}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className={UI.tableCell}>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">{unit.development_name ?? "—"}</p>
                                                    {unit.housing_provider && <p className="text-xs text-gray-400">{unit.housing_provider}</p>}
                                                </td>
                                                <td className={UI.tableCell}>
                                                    <p className="capitalize">{unit.unit_type ?? "—"}</p>
                                                    {unit.lease_type && <p className="text-xs text-gray-400 capitalize">{unit.lease_type}</p>}
                                                </td>
                                                <td className={UI.tableCell}><StatusBadge status={unit.status} /></td>
                                                <td className={UI.tableCell}><TypeTag type={unit.kind} /></td>
                                                <td className={UI.tableCell}>
                                                    {unit.resident ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#7B3FE4] to-[#26045D] flex items-center justify-center text-white text-[9px] font-semibold flex-shrink-0">
                                                                {initials(unit.resident.name)}
                                                            </div>
                                                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                                                                {unit.resident.name}
                                                            </span>
                                                        </div>
                                                    ) : <span className="text-gray-400 text-sm">—</span>}
                                                </td>
                                                <td className={UI.tableCell}>{fmtCurrency(unit.purchase_price)}</td>
                                                <td className={UI.tableCell}>{fmtCurrency(unit.valuation_amount)}</td>
                                                <td className={UI.tableCell}>{fmtCurrency(unit.monthly_rent)}</td>
                                                <td className={UI.tableCell}>{fmtPct(unit.percentage_sold)}</td>
                                                <td className={UI.tableCell}>
                                                    {unit.is_verified
                                                        ? <CheckBadgeIcon className="w-4 h-4 text-green-500" />
                                                        : <span className="text-gray-300 dark:text-gray-700 text-sm">—</span>}
                                                </td>
                                                <td className={UI.tableCell}>{fmtDate(unit.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                ) : (
                    <DevelopmentsView search={search} />
                )}
            </div>

            {/* Unit slide-over backdrop */}
            {selected && tab === "units" && (
                <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={() => setSelected(null)} />
            )}

            {/* Unit slide-over panel */}
            <div className={["fixed top-0 right-0 h-screen w-[440px] bg-white dark:bg-[#160B30] shadow-2xl z-50",
                "flex flex-col transition-transform duration-300 ease-in-out",
                selected && tab === "units" ? "translate-x-0" : "translate-x-full"].join(" ")}>
                {selected && tab === "units" && (
                    <>
                        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 dark:border-white/10 flex-shrink-0">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <TypeTag type={selected.kind} />
                                    <StatusBadge status={selected.status} />
                                    {selected.is_verified && <CheckBadgeIcon className="w-4 h-4 text-green-500" />}
                                </div>
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                    {selected.address ?? selected.internal_id ?? `Unit ${selected.db_id}`}
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {[selected.city, selected.postcode].filter(Boolean).join(" · ")}
                                </p>
                            </div>
                            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-1">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <BuildingOffice2Icon className="w-4 h-4 text-[#7B3FE4]" />
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Development</p>
                                </div>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    <DetailRow label="Development" value={selected.development_name ?? "—"} />
                                    <DetailRow label="Housing Provider" value={selected.housing_provider ?? "—"} />
                                    <DetailRow label="Unit Type" value={selected.unit_type ?? "—"} />
                                    <DetailRow label="Lease Type" value={selected.lease_type ?? "—"} />
                                    <DetailRow label="Internal ID" value={selected.internal_id ?? "—"} />
                                    <DetailRow label="Plot Number" value={selected.plot_number ?? "—"} />
                                    <DetailRow label="Region" value={selected.region ?? "—"} />
                                    <DetailRow label="Shared Ownership" value={selected.is_shared_ownership ? "Yes" : "No"} />
                                </div>
                            </section>
                            <div className="border-t border-gray-100 dark:border-white/10" />
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <HomeIcon className="w-4 h-4 text-[#7B3FE4]" />
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Financials</p>
                                </div>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    <DetailRow label="Purchase Price"    value={fmtCurrency(selected.purchase_price)} />
                                    <DetailRow label="Purchase Date"     value={fmtDate(selected.purchase_date)} />
                                    <DetailRow label="Share Sold"        value={fmtPct(selected.percentage_sold)} />
                                    <DetailRow label="Monthly Rent"      value={fmtCurrency(selected.monthly_rent)} />
                                    <DetailRow label="Service Charge"    value={fmtCurrency(selected.service_charge)} />
                                    <DetailRow label="Specified Rent"    value={fmtCurrency(selected.specified_rent)} />
                                    <DetailRow label="Current Valuation" value={fmtCurrency(selected.valuation_amount)} />
                                    <DetailRow label="Valuation Date"    value={fmtDate(selected.valuation_date)} />
                                </div>
                            </section>
                            {selected.resident && (
                                <>
                                    <div className="border-t border-gray-100 dark:border-white/10" />
                                    <section>
                                        <div className="flex items-center gap-2 mb-3">
                                            <CheckBadgeIcon className="w-4 h-4 text-[#7B3FE4]" />
                                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                                Resident ({selected.kind})
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#7B3FE4] to-[#26045D] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                                {initials(selected.resident.name)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.resident.name}</p>
                                                <p className="text-xs text-gray-400 truncate">{selected.resident.email ?? ""}</p>
                                            </div>
                                        </div>
                                    </section>
                                </>
                            )}
                            <div className="border-t border-gray-100 dark:border-white/10" />
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                <DetailRow label="Added"        value={fmtDate(selected.created_at)} />
                                <DetailRow label="Last Updated" value={fmtDate(selected.updated_at)} />
                            </div>
                        </div>

                        {selected.resident && (
                            <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 flex-shrink-0">
                                <a href={`/dashboard/residents/${selected.resident.id}`}
                                    className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-[#7B3FE4] text-[#7B3FE4] text-sm font-medium hover:bg-[#7B3FE4] hover:text-white transition-colors">
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
