"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeftIcon,
    DocumentDuplicateIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    HomeModernIcon,
    BuildingLibraryIcon,
    CreditCardIcon,
} from "@heroicons/react/24/outline";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// ── Types ────────────────────────────────────────────────────────────────────

type Unit = {
    id: number;
    internal_id: string;
    address_1: string | null;
    postcode: string | null;
    city: string | null;
    unit_type: string | null;
    purchase_price: number | null;
    percentage_sold: number | null;
    monthly_rent: number | null;
    service_charge: number | null;
};

type ResidentDetail = {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    address: string | null;
    annual_household_income: number | null;
    cash_savings: number | null;
    debt: number | null;
    monthly_income: number | null;
    monthly_rent: number | null;
    service_charge: number | null;
    monthly_mortgage_payment: number | null;
    total_monthly_costs: number | null;
    current_share: number | null;
    maximum_share: number | null;
    purchase_price: number | null;
    mortgage_amount: number | null;
    mortgage_expiry_date: string | null;
    mortgage_rate: number | null;
    mortgage_term: number | null;
    current_lender: string | null;
    move_in_date: string | null;
    signed_up_date: string | null;
    status: string | null;
    postcode: string | null;
    city: string | null;
    unit: Unit | null;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(val: number | null | undefined) {
    if (val === null || val === undefined || val === 0) return "—";
    return `£${Number(val).toLocaleString()}`;
}

function fmtAlways(val: number | null | undefined) {
    if (val === null || val === undefined) return "—";
    return `£${Number(val).toLocaleString()}`;
}

function fmtDate(val: string | null | undefined) {
    if (!val) return "—";
    return new Date(val).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
    });
}

// ── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{children}</div>
        </div>
    );
}

function SectionToggle({
    label,
    open,
    onToggle,
}: {
    label: string;
    open: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            onClick={onToggle}
            className="flex items-center gap-2 w-full text-left"
        >
            {open ? (
                <ChevronDownIcon className="w-4 h-4 text-[#26045D] dark:text-purple-400 flex-shrink-0" />
            ) : (
                <ChevronUpIcon className="w-4 h-4 text-[#26045D] dark:text-purple-400 flex-shrink-0" />
            )}
            <h3 className="text-base font-bold text-[#26045D] dark:text-purple-300">{label}</h3>
        </button>
    );
}

const TABS = ["Overview", "Documents", "Activity", "Notes"] as const;
type Tab = (typeof TABS)[number];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ResidentDetailPage() {
    const params = useParams();
    const residentId = params.id as string;

    const [resident, setResident] = useState<ResidentDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [aboutOpen, setAboutOpen] = useState(true);
    const [commsOpen, setCommsOpen] = useState(true);
    const [activityOpen, setActivityOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>("Overview");

    useEffect(() => {
        fetch(
            `/api/internal/olympus?resource=resident_detail&residentId=${residentId}`
        )
            .then((r) => r.json())
            .then((j) => setResident(j.data ?? null))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [residentId]);

    function copyEmail() {
        if (resident?.email) {
            navigator.clipboard.writeText(resident.email);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen text-gray-400 dark:text-gray-600 text-sm bg-gray-50 dark:bg-[#0E0823]">
                Loading…
            </div>
        );
    }

    if (!resident) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-3 bg-gray-50 dark:bg-[#0E0823]">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Resident not found.</p>
                <Link
                    href="/dashboard/residents"
                    className="text-purple-600 dark:text-purple-400 text-sm hover:underline"
                >
                    ← Back to residents
                </Link>
            </div>
        );
    }

    const name = `${resident.first_name} ${resident.last_name}`;
    const unit = resident.unit;

    // Resolve display values — prefer resident-level, fall back to unit-level
    const purchasePrice = unit?.purchase_price ?? resident.purchase_price;
    const address1 = unit?.address_1 ?? resident.address;
    const postcode = unit?.postcode ?? resident.postcode;
    const unitType = unit?.unit_type
        ? unit.unit_type.charAt(0).toUpperCase() + unit.unit_type.slice(1)
        : "—";

    // Monthly finances — derive from annual if monthly not set
    const monthlyIncome =
        resident.monthly_income && resident.monthly_income > 0
            ? resident.monthly_income
            : resident.annual_household_income
            ? Math.round(resident.annual_household_income / 12)
            : null;

    const monthlyRent =
        resident.monthly_rent && resident.monthly_rent > 0
            ? resident.monthly_rent
            : unit?.monthly_rent ?? null;

    const monthlyServiceCharge =
        resident.service_charge && resident.service_charge > 0
            ? resident.service_charge
            : unit?.service_charge ?? null;

    const monthlyMortgage =
        resident.monthly_mortgage_payment && resident.monthly_mortgage_payment > 0
            ? resident.monthly_mortgage_payment
            : null;

    const computedCosts =
        (monthlyRent ?? 0) +
        (monthlyServiceCharge ?? 0) +
        (monthlyMortgage ?? 0);

    const totalCosts =
        resident.total_monthly_costs && resident.total_monthly_costs > 0
            ? resident.total_monthly_costs
            : computedCosts > 0
            ? computedCosts
            : null;

    const costPct =
        monthlyIncome && monthlyIncome > 0 && totalCosts
            ? Math.round((totalCosts / monthlyIncome) * 100)
            : null;

    // Donut chart
    const remaining =
        monthlyIncome && totalCosts ? Math.max(0, monthlyIncome - totalCosts) : 0;
    const chartData =
        monthlyIncome && monthlyIncome > 0 && totalCosts
            ? [
                  { name: "Costs", value: totalCosts },
                  { name: "Available", value: remaining },
              ]
            : [{ name: "No data", value: 1 }];
    const hasChartData = monthlyIncome && monthlyIncome > 0 && totalCosts;

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0E0823]">
            {/* ── Left panel ─────────────────────────────────────────── */}
            <div className="w-[340px] flex-shrink-0 bg-white dark:bg-[#160B30] border-r border-gray-100 dark:border-white/10 overflow-y-auto">
                {/* Resident header */}
                <div className="px-6 pt-5 pb-4 border-b border-gray-100 dark:border-white/10">
                    <Link
                        href="/dashboard/residents"
                        className="inline-flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 mb-3 transition-colors"
                    >
                        <ArrowLeftIcon className="w-3.5 h-3.5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-[#26045D] dark:text-purple-300 mb-1.5">{name}</h1>
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm text-purple-600 dark:text-purple-400 truncate">
                            {resident.email ?? "—"}
                        </span>
                        <button
                            onClick={copyEmail}
                            title={copied ? "Copied!" : "Copy email"}
                            className="text-purple-300 dark:text-purple-600 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex-shrink-0"
                        >
                            <DocumentDuplicateIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* About */}
                <div className="px-6 py-5 border-b border-gray-100 dark:border-white/10 space-y-4">
                    <SectionToggle
                        label={`About ${resident.first_name}`}
                        open={aboutOpen}
                        onToggle={() => setAboutOpen((v) => !v)}
                    />
                    {aboutOpen && (
                        <div className="space-y-4 pt-1">
                            <Field label="Email">{resident.email ?? "—"}</Field>
                            <Field label="Phone number">—</Field>
                            <Field label="Category">
                                {resident.status === "active"
                                    ? "Active"
                                    : resident.status ?? "—"}
                            </Field>
                            <Field label="Transaction status">—</Field>
                            <Field label="Sign up date">
                                {fmtDate(resident.signed_up_date)}
                            </Field>
                            <Field label="Case manager">—</Field>
                        </div>
                    )}
                </div>

                {/* Communications — placeholder */}
                <div className="px-6 py-5 border-b border-gray-100 dark:border-white/10 space-y-4">
                    <SectionToggle
                        label="Communications"
                        open={commsOpen}
                        onToggle={() => setCommsOpen((v) => !v)}
                    />
                    {commsOpen && (
                        <p className="text-sm text-gray-300 dark:text-gray-600 pt-1">Coming soon</p>
                    )}
                </div>

                {/* Stairpay activity — placeholder */}
                <div className="px-6 py-5 space-y-4">
                    <SectionToggle
                        label="Stairpay activity"
                        open={activityOpen}
                        onToggle={() => setActivityOpen((v) => !v)}
                    />
                    {activityOpen && (
                        <p className="text-sm text-gray-300 dark:text-gray-600 pt-1">Coming soon</p>
                    )}
                </div>
            </div>

            {/* ── Right panel ────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Stats row */}
                <div className="bg-white dark:bg-[#160B30] border-b border-gray-100 dark:border-white/10 flex divide-x divide-gray-100 dark:divide-white/10 flex-shrink-0">
                    <div className="flex-1 px-8 py-5">
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Current ownership</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1.5">
                            {resident.current_share != null
                                ? `${resident.current_share}%`
                                : "—"}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-600">— same as move in</p>
                    </div>
                    <div className="flex-1 px-8 py-5">
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Value of 100%</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1.5">
                            {fmtAlways(purchasePrice)}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-600">— since move in</p>
                    </div>
                    <div className="flex-1 px-8 py-5">
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Current salary</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1.5">
                            {fmtAlways(resident.annual_household_income)}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-600">— since move in</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white dark:bg-[#160B30] border-b border-gray-100 dark:border-white/10 px-6 flex-shrink-0">
                    <div className="flex">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={[
                                    "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                                    activeTab === tab
                                        ? "border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400"
                                        : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300",
                                ].join(" ")}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === "Overview" ? (
                        <div className="grid grid-cols-2 gap-4">
                            {/* ── Left column ── */}
                            <div className="space-y-4">
                                {/* Monthly finances */}
                                <div className="bg-white dark:bg-[#1A0F35] rounded-xl border border-gray-100 dark:border-white/10 p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CreditCardIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                            Monthly finances
                                        </h3>
                                    </div>

                                    {/* Donut chart */}
                                    <div className="h-44 flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={chartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={52}
                                                    outerRadius={72}
                                                    dataKey="value"
                                                    startAngle={90}
                                                    endAngle={-270}
                                                    strokeWidth={0}
                                                >
                                                    {hasChartData ? (
                                                        <>
                                                            <Cell fill="#6D28D9" />
                                                            <Cell fill="#EDE9FE" />
                                                        </>
                                                    ) : (
                                                        <Cell fill="#E5E7EB" />
                                                    )}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Finance rows */}
                                    <div className="space-y-3 mt-2">
                                        {[
                                            {
                                                label: "Monthly income",
                                                value: fmtAlways(monthlyIncome),
                                            },
                                            {
                                                label: "Monthly rent",
                                                value: fmtAlways(monthlyRent),
                                            },
                                            {
                                                label: "Monthly service charge",
                                                value: fmtAlways(monthlyServiceCharge),
                                            },
                                            {
                                                label: "Monthly mortgage",
                                                value: fmtAlways(monthlyMortgage),
                                            },
                                        ].map(({ label, value }) => (
                                            <div
                                                key={label}
                                                className="flex items-center justify-between"
                                            >
                                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                                    {label}
                                                </p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {value}
                                                </p>
                                            </div>
                                        ))}
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/10">
                                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                                Total monthly costs
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {fmtAlways(totalCosts)}
                                                </p>
                                                {costPct !== null && (
                                                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/40 px-1.5 py-0.5 rounded">
                                                        {costPct}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial information */}
                                <div className="bg-white dark:bg-[#1A0F35] rounded-xl border border-gray-100 dark:border-white/10 p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                                                £
                                            </span>
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                Financial information
                                            </h3>
                                        </div>
                                        <button className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors">
                                            Edit
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            {
                                                label: "Salary",
                                                value: fmtAlways(
                                                    resident.annual_household_income
                                                ),
                                            },
                                            {
                                                label: "Savings",
                                                value: fmtAlways(resident.cash_savings),
                                            },
                                            {
                                                label: "Debt",
                                                value: fmt(resident.debt),
                                            },
                                            { label: "Next raise", value: "—" },
                                            { label: "Bonuses", value: "—" },
                                            { label: "Partner salary", value: "—" },
                                        ].map(({ label, value }) => (
                                            <div key={label}>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                                                    {label}
                                                </p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* ── Right column ── */}
                            <div className="space-y-4">
                                {/* Unit details */}
                                <div className="bg-white dark:bg-[#1A0F35] rounded-xl border border-gray-100 dark:border-white/10 p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <HomeModernIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                Unit details
                                            </h3>
                                        </div>
                                        <button className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors">
                                            Edit
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            {
                                                label: "Postcode",
                                                value: postcode ?? "—",
                                            },
                                            {
                                                label: "Purchase price",
                                                value: fmtAlways(purchasePrice),
                                            },
                                            {
                                                label: "First line of address",
                                                value: address1 ?? "—",
                                            },
                                            {
                                                label: "Move in date",
                                                value: fmtDate(resident.move_in_date),
                                            },
                                            { label: "Unit type", value: unitType },
                                            {
                                                label: "Retained equity",
                                                value:
                                                    resident.current_share != null
                                                        ? `${resident.current_share}%`
                                                        : "—",
                                            },
                                        ].map(({ label, value }) => (
                                            <div key={label}>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                                                    {label}
                                                </p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    {unit && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
                                            <button className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 transition-colors w-full justify-between">
                                                <span>View unit</span>
                                                <span className="text-gray-400 dark:text-gray-600">→</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Mortgage information */}
                                <div className="bg-white dark:bg-[#1A0F35] rounded-xl border border-gray-100 dark:border-white/10 p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <BuildingLibraryIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                Mortgage information
                                            </h3>
                                        </div>
                                        <button className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors">
                                            Edit
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            {
                                                label: "Mortgage amount",
                                                value: fmt(resident.mortgage_amount),
                                            },
                                            {
                                                label: "Fixed term expiry date",
                                                value: fmtDate(
                                                    resident.mortgage_expiry_date
                                                ),
                                            },
                                            {
                                                label: "Current mortgage rate",
                                                value:
                                                    resident.mortgage_rate != null
                                                        ? `${resident.mortgage_rate}%`
                                                        : "—",
                                            },
                                            {
                                                label: "Mortgage term",
                                                value:
                                                    resident.mortgage_term != null
                                                        ? `${resident.mortgage_term} years`
                                                        : "—",
                                            },
                                            {
                                                label: "Monthly mortgage cost",
                                                value: fmt(
                                                    resident.monthly_mortgage_payment
                                                ),
                                            },
                                            {
                                                label: "Current lender",
                                                value:
                                                    resident.current_lender ?? "—",
                                            },
                                        ].map(({ label, value }) => (
                                            <div key={label}>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                                                    {label}
                                                </p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-40 text-gray-300 dark:text-gray-700 text-sm">
                            Coming soon
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
