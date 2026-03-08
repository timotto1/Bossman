"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeftIcon,
    DocumentDuplicateIcon,
    HomeModernIcon,
    BuildingLibraryIcon,
    CreditCardIcon,
    CalendarIcon,
    PlusIcon,
    DocumentTextIcon,
    ArrowDownTrayIcon,
    XMarkIcon,
    InboxIcon,
    ArrowRightOnRectangleIcon,
    PencilSquareIcon,
    CalculatorIcon,
    ClipboardDocumentListIcon,
    SparklesIcon,
    ChatBubbleLeftRightIcon,
    PaperClipIcon,
    HandThumbUpIcon,
    HandThumbDownIcon,
    ChatBubbleOvalLeftIcon,
    MapPinIcon,
    TrashIcon,
    ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { createClient } from "@/utils/supabase/client";

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

function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

// ── Activity helpers ──────────────────────────────────────────────────────────

type ActivityEvent = {
    id: string;
    event_action: string;
    section: string;
    sub_section: string | null;
    event_timestamp: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: Record<string, any> | null;
};

/** Generates a timestamp relative to now — used only for dummy data */
function _ago(days: number, h = 10, m = 0): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
}

/**
 * DUMMY DATA — replace with real API call when resident_activity table is instrumented.
 * See docs/resident-activity.md for the full integration guide.
 */
const DUMMY_ACTIVITY: ActivityEvent[] = [
    // ── Today ─────────────────────────────────────────────────
    {
        id: "act-1",
        event_action: "login",
        section: "auth",
        sub_section: null,
        event_timestamp: _ago(0, 9, 14),
        metadata: { device: "Mobile", browser: "Safari" },
    },
    // ── Yesterday ─────────────────────────────────────────────
    {
        id: "act-2",
        event_action: "message",
        section: "ai_assistant",
        sub_section: null,
        event_timestamp: _ago(1, 16, 45),
        metadata: { topic: "Staircasing eligibility", message_count: 8 },
    },
    {
        id: "act-3",
        event_action: "update",
        section: "profile",
        sub_section: "financial",
        event_timestamp: _ago(1, 14, 22),
        metadata: { fields: ["annual_household_income", "cash_savings"] },
    },
    // ── 3 days ago ────────────────────────────────────────────
    {
        id: "act-4",
        event_action: "login",
        section: "auth",
        sub_section: null,
        event_timestamp: _ago(3, 11, 28),
        metadata: { device: "Desktop", browser: "Chrome" },
    },
    {
        id: "act-5",
        event_action: "complete",
        section: "staircasing_calculator",
        sub_section: null,
        event_timestamp: _ago(3, 11, 35),
        metadata: { current_share: 25, target_share: 50, affordable_share: 40 },
    },
    {
        id: "act-6",
        event_action: "view",
        section: "staircasing_application",
        sub_section: "overview",
        event_timestamp: _ago(3, 11, 38),
        metadata: { page: "overview" },
    },
    // ── 7 days ago ────────────────────────────────────────────
    {
        id: "act-7",
        event_action: "login",
        section: "auth",
        sub_section: null,
        event_timestamp: _ago(7, 9, 5),
        metadata: { device: "Mobile", browser: "Chrome" },
    },
    {
        id: "act-8",
        event_action: "message",
        section: "ai_assistant",
        sub_section: null,
        event_timestamp: _ago(7, 9, 18),
        metadata: { topic: "Mortgage options for staircasing", message_count: 12 },
    },
    {
        id: "act-9",
        event_action: "update",
        section: "profile",
        sub_section: "personal",
        event_timestamp: _ago(7, 10, 3),
        metadata: { fields: ["phone_number"] },
    },
    // ── 14 days ago ───────────────────────────────────────────
    {
        id: "act-10",
        event_action: "login",
        section: "auth",
        sub_section: null,
        event_timestamp: _ago(14, 15, 43),
        metadata: { device: "Desktop", browser: "Firefox" },
    },
    {
        id: "act-11",
        event_action: "complete",
        section: "staircasing_calculator",
        sub_section: null,
        event_timestamp: _ago(14, 15, 51),
        metadata: { current_share: 25, target_share: 50, affordable_share: 30 },
    },
    // ── 21 days ago ───────────────────────────────────────────
    {
        id: "act-12",
        event_action: "login",
        section: "auth",
        sub_section: null,
        event_timestamp: _ago(21, 8, 30),
        metadata: { device: "Mobile", browser: "Safari" },
    },
    {
        id: "act-13",
        event_action: "message",
        section: "ai_assistant",
        sub_section: null,
        event_timestamp: _ago(21, 8, 45),
        metadata: { topic: "Understanding shared ownership costs", message_count: 5 },
    },
];

type EventDisplay = {
    Icon: React.ComponentType<{ className?: string }>;
    label: string;
    description: string;
    iconBg: string;
    iconColor: string;
};

function getEventDisplay(event: ActivityEvent): EventDisplay {
    const { event_action, section, metadata } = event;

    if (event_action === "login") {
        const parts = [metadata?.browser, metadata?.device].filter(Boolean).join(" · ");
        return {
            Icon: ArrowRightOnRectangleIcon,
            label: "Logged in",
            description: parts,
            iconBg: "bg-green-50 dark:bg-green-900/30",
            iconColor: "text-green-600 dark:text-green-400",
        };
    }

    if (section === "ai_assistant") {
        const desc = metadata?.topic
            ? `${metadata.topic}${metadata?.message_count ? ` · ${metadata.message_count} messages` : ""}`
            : "";
        return {
            Icon: SparklesIcon,
            label: "AI conversation",
            description: desc,
            iconBg: "bg-violet-50 dark:bg-violet-900/30",
            iconColor: "text-violet-600 dark:text-violet-400",
        };
    }

    if (section === "staircasing_calculator") {
        const desc = metadata?.affordable_share
            ? `Affordable up to ${metadata.affordable_share}% · Target ${metadata.target_share}%`
            : "";
        return {
            Icon: CalculatorIcon,
            label: "Completed staircasing calculator",
            description: desc,
            iconBg: "bg-purple-50 dark:bg-purple-900/30",
            iconColor: "text-purple-600 dark:text-purple-400",
        };
    }

    if (section === "staircasing_application") {
        return {
            Icon: ClipboardDocumentListIcon,
            label: "Viewed staircasing application",
            description: "",
            iconBg: "bg-amber-50 dark:bg-amber-900/30",
            iconColor: "text-amber-600 dark:text-amber-400",
        };
    }

    if (event_action === "update") {
        const FIELD_LABELS: Record<string, string> = {
            annual_household_income: "income",
            cash_savings: "savings",
            phone_number: "phone number",
            first_name: "name",
            last_name: "name",
            email: "email address",
        };
        const fields: string[] = metadata?.fields ?? [];
        const readable = [...new Set(fields.map((f) => FIELD_LABELS[f] ?? f))].join(", ");
        return {
            Icon: PencilSquareIcon,
            label: section === "financial" ? "Updated financial information" : "Updated profile",
            description: readable ? `Changed: ${readable}` : "",
            iconBg: "bg-blue-50 dark:bg-blue-900/30",
            iconColor: "text-blue-600 dark:text-blue-400",
        };
    }

    // Fallback
    return {
        Icon: ChatBubbleLeftRightIcon,
        label: event_action,
        description: section,
        iconBg: "bg-gray-100 dark:bg-white/[0.06]",
        iconColor: "text-gray-500 dark:text-gray-400",
    };
}

function groupActivity(events: ActivityEvent[]): { label: string; events: ActivityEvent[] }[] {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const groups = new Map<string, ActivityEvent[]>();

    for (const event of events) {
        const d = new Date(event.event_timestamp); d.setHours(0, 0, 0, 0);
        let label: string;
        if (d.getTime() === today.getTime()) label = "Today";
        else if (d.getTime() === yesterday.getTime()) label = "Yesterday";
        else label = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
        if (!groups.has(label)) groups.set(label, []);
        groups.get(label)!.push(event);
    }

    return Array.from(groups.entries()).map(([label, events]) => ({ label, events }));
}

// ── Document helpers ─────────────────────────────────────────────────────────

type ResidentDoc = {
    id: string;
    filename: string;
    document_type: string | null;
    document_size: number | null;
    created_at: string;
    supabase_path: string;
    signed_url?: string;
};

const DOCUMENT_TYPES = [
    { value: "lease", label: "Lease agreement" },
    { value: "staircasing", label: "Staircasing application" },
    { value: "proof_of_id", label: "Proof of identity" },
    { value: "proof_of_address", label: "Proof of address" },
    { value: "mortgage", label: "Mortgage documents" },
    { value: "survey", label: "Survey / RICS valuation" },
    { value: "other", label: "Other" },
] as const;

const DOC_TYPE_LABEL: Record<string, string> = Object.fromEntries(
    DOCUMENT_TYPES.map((t) => [t.value, t.label])
);

const DOC_TYPE_COLOR: Record<string, string> = {
    lease: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    staircasing: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    proof_of_id: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    proof_of_address: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    mortgage: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    survey: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    other: "bg-gray-100 text-gray-600 dark:bg-white/[0.06] dark:text-gray-400",
};

function formatSize(bytes: number | null): string {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Notes helpers ─────────────────────────────────────────────────────────────

type NoteReactions = {
    up: number;
    down: number;
    user_reaction: "up" | "down" | null;
};

type ResidentNote = {
    id: string;
    parent_id: string | null;
    author_id: string;
    author_name: string;
    body: string;
    attachment_path: string | null;
    attachment_name: string | null;
    attachment_url: string | null;
    is_pinned: boolean;
    created_at: string;
    reactions: NoteReactions;
    replies: ResidentNote[];
};

function getNoteInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase();
}

const NOTE_GRADIENTS = [
    "from-[#7B3FE4] to-[#26045D]",
    "from-blue-500 to-blue-800",
    "from-emerald-500 to-emerald-800",
    "from-amber-500 to-amber-700",
    "from-rose-500 to-rose-700",
    "from-teal-500 to-teal-700",
];

function getNoteGradient(name: string): string {
    let hash = 0;
    for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) % NOTE_GRADIENTS.length;
    return NOTE_GRADIENTS[Math.abs(hash)];
}

function fmtRelativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return fmtDate(iso);
}

function updateNoteReaction(note: ResidentNote, reaction: "up" | "down"): ResidentNote {
    const { user_reaction, up, down } = note.reactions;
    if (user_reaction === reaction) {
        return {
            ...note,
            reactions: {
                user_reaction: null,
                up: reaction === "up" ? Math.max(0, up - 1) : up,
                down: reaction === "down" ? Math.max(0, down - 1) : down,
            },
        };
    }
    return {
        ...note,
        reactions: {
            user_reaction: reaction,
            up: reaction === "up" ? up + 1 : user_reaction === "up" ? Math.max(0, up - 1) : up,
            down: reaction === "down" ? down + 1 : user_reaction === "down" ? Math.max(0, down - 1) : down,
        },
    };
}

type NoteCardActions = {
    onReaction: (noteId: string, r: "up" | "down") => void;
    onPin: (noteId: string, pinned: boolean) => void;
    onDelete: (noteId: string, parentId: string | null) => void;
    onReplyStart: (noteId: string) => void;
    onReplyBodyChange: (body: string) => void;
    onReplySubmit: () => void;
    onReplyCancel: () => void;
    onToggleReplies: (noteId: string) => void;
};

function NoteCard({
    note,
    isReply = false,
    currentUserId,
    replyingTo,
    replyBody,
    submittingReply,
    expandedReplies,
    actions,
}: {
    note: ResidentNote;
    isReply?: boolean;
    currentUserId: string | null;
    replyingTo: string | null;
    replyBody: string;
    submittingReply: boolean;
    expandedReplies: string[];
    actions: NoteCardActions;
}) {
    const initials = getNoteInitials(note.author_name);
    const gradient = getNoteGradient(note.author_name);
    const isAuthor = !!currentUserId && currentUserId === note.author_id;
    const isActiveReply = replyingTo === note.id;
    const repliesExpanded = expandedReplies.includes(note.id);

    return (
        <div
            className={[
                "rounded-2xl border bg-white dark:bg-[#1A0F35] overflow-hidden transition-all duration-200",
                "hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]",
                note.is_pinned
                    ? "border-amber-200 dark:border-amber-500/30"
                    : "border-gray-100 dark:border-white/[0.08]",
            ].join(" ")}
        >
            {/* Pinned banner */}
            {note.is_pinned && (
                <div className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-500/20">
                    <MapPinIcon className="w-3 h-3 text-amber-500 rotate-45" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Pinned
                    </span>
                </div>
            )}

            <div className="p-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${gradient}`}
                        >
                            <span className="text-xs font-semibold text-white leading-none">{initials}</span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                                {note.author_name}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-600 leading-tight mt-0.5">
                                {fmtRelativeTime(note.created_at)}
                            </p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                        {!isReply && (
                            <button
                                onClick={() => actions.onPin(note.id, note.is_pinned)}
                                title={note.is_pinned ? "Unpin" : "Pin"}
                                className={[
                                    "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                                    note.is_pinned
                                        ? "text-amber-500 bg-amber-50 dark:bg-amber-900/20"
                                        : "text-gray-300 dark:text-gray-700 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20",
                                ].join(" ")}
                            >
                                <MapPinIcon className="w-3.5 h-3.5 rotate-45" />
                            </button>
                        )}
                        {isAuthor && (
                            <button
                                onClick={() => actions.onDelete(note.id, note.parent_id)}
                                title="Delete"
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 dark:text-gray-700 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Note body */}
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {note.body}
                </p>

                {/* Attachment */}
                {note.attachment_url && note.attachment_name && (
                    <a
                        href={note.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={note.attachment_name}
                        className="inline-flex items-center gap-1.5 mt-3 text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                        <PaperClipIcon className="w-3.5 h-3.5" />
                        {note.attachment_name}
                    </a>
                )}

                {/* Action bar */}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
                    {/* Thumbs up */}
                    <button
                        onClick={() => actions.onReaction(note.id, "up")}
                        className={[
                            "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors",
                            note.reactions.user_reaction === "up"
                                ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                : "text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/[0.06]",
                        ].join(" ")}
                    >
                        <HandThumbUpIcon className="w-3.5 h-3.5" />
                        {note.reactions.up > 0 && <span className="tabular-nums">{note.reactions.up}</span>}
                    </button>

                    {/* Thumbs down */}
                    <button
                        onClick={() => actions.onReaction(note.id, "down")}
                        className={[
                            "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors",
                            note.reactions.user_reaction === "down"
                                ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                : "text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/[0.06]",
                        ].join(" ")}
                    >
                        <HandThumbDownIcon className="w-3.5 h-3.5" />
                        {note.reactions.down > 0 && <span className="tabular-nums">{note.reactions.down}</span>}
                    </button>

                    <div className="flex-1" />

                    {/* Replies toggle */}
                    {!isReply && note.replies.length > 0 && (
                        <button
                            onClick={() => actions.onToggleReplies(note.id)}
                            className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                        >
                            <ChatBubbleOvalLeftIcon className="w-3.5 h-3.5" />
                            {note.replies.length} {note.replies.length === 1 ? "reply" : "replies"}
                        </button>
                    )}

                    {/* Reply button */}
                    {!isReply && (
                        <button
                            onClick={() =>
                                isActiveReply ? actions.onReplyCancel() : actions.onReplyStart(note.id)
                            }
                            className={[
                                "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors",
                                isActiveReply
                                    ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20"
                                    : "text-gray-400 dark:text-gray-600 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20",
                            ].join(" ")}
                        >
                            <ArrowUturnLeftIcon className="w-3.5 h-3.5" />
                            Reply
                        </button>
                    )}
                </div>
            </div>

            {/* Inline reply composer */}
            {isActiveReply && !isReply && (
                <div className="border-t border-gray-100 dark:border-white/[0.06] p-4 bg-gray-50/50 dark:bg-white/[0.02]">
                    <textarea
                        value={replyBody}
                        onChange={(e) => actions.onReplyBodyChange(e.target.value)}
                        placeholder="Write a reply…"
                        rows={2}
                        autoFocus
                        className="w-full text-sm text-gray-900 dark:text-gray-100 bg-transparent resize-none outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    />
                    <div className="flex items-center justify-end gap-2 mt-2">
                        <button
                            onClick={actions.onReplyCancel}
                            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors px-2 py-1"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={actions.onReplySubmit}
                            disabled={!replyBody.trim() || submittingReply}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[#7B3FE4] hover:bg-[#6D28D9] text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {submittingReply ? "Posting…" : "Post reply"}
                        </button>
                    </div>
                </div>
            )}

            {/* Expanded replies */}
            {!isReply && repliesExpanded && note.replies.length > 0 && (
                <div className="border-t border-gray-100 dark:border-white/[0.06] divide-y divide-gray-100 dark:divide-white/[0.06] bg-gray-50/30 dark:bg-white/[0.01]">
                    {note.replies.map((reply) => (
                        <div key={reply.id} className="px-4 py-3 pl-14">
                            {/* Reply header */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${getNoteGradient(reply.author_name)}`}
                                    >
                                        <span className="text-[10px] font-semibold text-white leading-none">
                                            {getNoteInitials(reply.author_name)}
                                        </span>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                                        {reply.author_name}
                                    </span>
                                    <span className="text-xs text-gray-400 dark:text-gray-600">
                                        {fmtRelativeTime(reply.created_at)}
                                    </span>
                                </div>
                                {!!currentUserId && currentUserId === reply.author_id && (
                                    <button
                                        onClick={() => actions.onDelete(reply.id, reply.parent_id)}
                                        title="Delete"
                                        className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 dark:text-gray-700 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <TrashIcon className="w-3 h-3" />
                                    </button>
                                )}
                            </div>

                            {/* Reply body */}
                            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                                {reply.body}
                            </p>

                            {/* Reply attachment */}
                            {reply.attachment_url && reply.attachment_name && (
                                <a
                                    href={reply.attachment_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download={reply.attachment_name}
                                    className="inline-flex items-center gap-1.5 mt-2 text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 px-2 py-1 rounded-lg transition-colors"
                                >
                                    <PaperClipIcon className="w-3 h-3" />
                                    {reply.attachment_name}
                                </a>
                            )}

                            {/* Reply reactions */}
                            <div className="flex items-center gap-1 mt-2">
                                <button
                                    onClick={() => actions.onReaction(reply.id, "up")}
                                    className={[
                                        "inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-lg transition-colors",
                                        reply.reactions.user_reaction === "up"
                                            ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                            : "text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/[0.06]",
                                    ].join(" ")}
                                >
                                    <HandThumbUpIcon className="w-3 h-3" />
                                    {reply.reactions.up > 0 && <span>{reply.reactions.up}</span>}
                                </button>
                                <button
                                    onClick={() => actions.onReaction(reply.id, "down")}
                                    className={[
                                        "inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-lg transition-colors",
                                        reply.reactions.user_reaction === "down"
                                            ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                            : "text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/[0.06]",
                                    ].join(" ")}
                                >
                                    <HandThumbDownIcon className="w-3 h-3" />
                                    {reply.reactions.down > 0 && <span>{reply.reactions.down}</span>}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ firstName, lastName }: { firstName: string; lastName: string }) {
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    return (
        <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7B3FE4, #26045D)" }}
        >
            <span className="text-lg font-semibold text-white">{initials}</span>
        </div>
    );
}

function StatCell({
    dot,
    label,
    value,
    sub,
}: {
    dot: string;
    label: string;
    value: string;
    sub: string;
}) {
    return (
        <div className="flex-1 px-8 py-5 group transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03] cursor-default">
            <div className="flex items-center gap-1.5 mb-1">
                <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: dot }}
                />
                <p className="text-xs text-gray-500 dark:text-gray-500">{label}</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1.5">{value}</p>
            <p className="text-xs text-gray-400 dark:text-gray-600">{sub}</p>
        </div>
    );
}

function InfoCard({
    icon,
    title,
    action,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    action?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-gray-100 dark:border-white/[0.08] bg-white dark:bg-[#1A0F35] p-5 transition-all duration-200 hover:border-gray-200 dark:hover:border-white/[0.14] hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="bg-gray-50 dark:bg-white/[0.06] rounded-lg p-1.5">
                        {icon}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}

function FieldPair({ label, value }: { label: string; value: string | React.ReactNode }) {
    return (
        <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</div>
        </div>
    );
}

function FieldGrid({ fields }: { fields: { label: string; value: string | React.ReactNode }[] }) {
    return (
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {fields.map(({ label, value }) => (
                <FieldPair key={label} label={label} value={value} />
            ))}
        </div>
    );
}

function FinanceRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</p>
        </div>
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
    const [activeTab, setActiveTab] = useState<Tab>("Overview");

    // Notes tab state
    const [notes, setNotes] = useState<ResidentNote[]>([]);
    const [notesLoading, setNotesLoading] = useState(false);
    const [notesFetched, setNotesFetched] = useState(false);
    const [noteBody, setNoteBody] = useState("");
    const [noteFile, setNoteFile] = useState<File | null>(null);
    const [submittingNote, setSubmittingNote] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyBody, setReplyBody] = useState("");
    const [submittingReply, setSubmittingReply] = useState(false);
    const [expandedReplies, setExpandedReplies] = useState<string[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [noteSubmitError, setNoteSubmitError] = useState<string | null>(null);

    // Activity tab state
    const [activity, setActivity] = useState<ActivityEvent[]>([]);
    const [activityLoading, setActivityLoading] = useState(false);
    const [activityFetched, setActivityFetched] = useState(false);

    // Documents tab state
    const [docs, setDocs] = useState<ResidentDoc[]>([]);
    const [docsLoading, setDocsLoading] = useState(false);
    const [docsError, setDocsError] = useState(false);
    const [docsFetched, setDocsFetched] = useState(false);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [uploadDocType, setUploadDocType] = useState("");
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

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

    async function fetchDocs() {
        setDocsLoading(true);
        setDocsError(false);
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("resident_documents")
                .select("id, filename, document_type, document_size, created_at, supabase_path")
                .eq("resident_id", residentId)
                .order("created_at", { ascending: false });

            if (error) throw error;

            const withUrls = await Promise.all(
                (data || []).map(async (doc) => {
                    const { data: urlData } = await supabase.storage
                        .from("files")
                        .createSignedUrl(doc.supabase_path, 60 * 60);
                    return { ...doc, signed_url: urlData?.signedUrl };
                })
            );

            setDocs(withUrls);
            setDocsFetched(true);
        } catch {
            setDocsError(true);
        } finally {
            setDocsLoading(false);
        }
    }

    async function handleUpload() {
        if (!uploadFile || !uploadDocType) return;
        setUploading(true);
        setUploadError(null);
        try {
            const supabase = createClient();
            const ext = uploadFile.name.split(".").pop();
            const path = `residents/${residentId}/${crypto.randomUUID()}.${ext}`;

            const { error: storageError } = await supabase.storage
                .from("files")
                .upload(path, uploadFile);
            if (storageError) throw new Error(storageError.message);

            const res = await fetch("/api/internal/olympus", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resource: "resident_documents",
                    residentId,
                    filename: uploadFile.name,
                    supabasePath: path,
                    documentType: uploadDocType,
                    documentSize: uploadFile.size,
                }),
            });
            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error ?? "Failed to save document");
            }

            setUploadOpen(false);
            setUploadFile(null);
            setUploadDocType("");
            setDocsFetched(false);
            fetchDocs();
        } catch (err) {
            setUploadError((err as Error).message);
        } finally {
            setUploading(false);
        }
    }

    // Lazy-fetch documents when the tab is first opened
    useEffect(() => {
        if (activeTab === "Documents" && !docsFetched && !docsLoading) {
            fetchDocs();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    // Fetch the current user's ID once for delete/author checks
    useEffect(() => {
        createClient().auth.getUser().then(({ data }) => {
            setCurrentUserId(data.user?.id ?? null);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function fetchNotes() {
        setNotesLoading(true);
        try {
            const res = await fetch(
                `/api/internal/olympus?resource=resident_notes&residentId=${residentId}`
            );
            const json = await res.json();
            setNotes(json.data ?? []);
            setNotesFetched(true);
        } finally {
            setNotesLoading(false);
        }
    }

    async function submitNote(body: string, parentId?: string | null, file?: File | null) {
        let attachmentPath: string | null = null;
        let attachmentName: string | null = null;
        if (file) {
            const supabase = createClient();
            const ext = file.name.split(".").pop();
            const path = `residents/${residentId}/notes/${crypto.randomUUID()}.${ext}`;
            const { error } = await supabase.storage.from("files").upload(path, file);
            if (error) throw new Error(error.message);
            attachmentPath = path;
            attachmentName = file.name;
        }
        const res = await fetch("/api/internal/olympus", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                resource: "resident_note",
                residentId,
                body,
                parentId: parentId ?? null,
                attachmentPath,
                attachmentName,
            }),
        });
        if (!res.ok) {
            const json = await res.json();
            throw new Error(json.error ?? "Failed to post note");
        }
    }

    async function handleSubmitNote() {
        if (!noteBody.trim()) return;
        setSubmittingNote(true);
        setNoteSubmitError(null);
        try {
            await submitNote(noteBody.trim(), null, noteFile);
            setNoteBody("");
            setNoteFile(null);
            setNotesFetched(false);
            await fetchNotes();
        } catch (err) {
            setNoteSubmitError((err as Error).message);
        } finally {
            setSubmittingNote(false);
        }
    }

    async function handleSubmitReply() {
        if (!replyBody.trim() || !replyingTo) return;
        setSubmittingReply(true);
        setNoteSubmitError(null);
        try {
            await submitNote(replyBody.trim(), replyingTo);
            setReplyBody("");
            setReplyingTo(null);
            setExpandedReplies((prev) =>
                prev.includes(replyingTo) ? prev : [...prev, replyingTo]
            );
            setNotesFetched(false);
            await fetchNotes();
        } catch (err) {
            setNoteSubmitError((err as Error).message);
        } finally {
            setSubmittingReply(false);
        }
    }

    function toggleReaction(noteId: string, reaction: "up" | "down") {
        // Optimistic update
        setNotes((prev) =>
            prev.map((note) => {
                if (note.id === noteId) return updateNoteReaction(note, reaction);
                const updatedReplies = note.replies.map((r) =>
                    r.id === noteId ? updateNoteReaction(r, reaction) : r
                );
                return { ...note, replies: updatedReplies };
            })
        );
        fetch("/api/internal/olympus", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resource: "resident_note_reaction", noteId, reaction }),
        });
    }

    function togglePin(noteId: string, currentPinned: boolean) {
        setNotes((prev) =>
            prev
                .map((n) => (n.id === noteId ? { ...n, is_pinned: !currentPinned } : n))
                .sort((a, b) => {
                    if (a.is_pinned && !b.is_pinned) return -1;
                    if (!a.is_pinned && b.is_pinned) return 1;
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                })
        );
        fetch("/api/internal/olympus", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resource: "resident_note_pin", noteId }),
        });
    }

    async function deleteNote(noteId: string, parentId: string | null) {
        const res = await fetch("/api/internal/olympus", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resource: "resident_note", noteId }),
        });
        if (!res.ok) return;
        if (parentId) {
            setNotes((prev) =>
                prev.map((n) =>
                    n.id === parentId
                        ? { ...n, replies: n.replies.filter((r) => r.id !== noteId) }
                        : n
                )
            );
        } else {
            setNotes((prev) => prev.filter((n) => n.id !== noteId));
        }
    }

    // Lazy-fetch notes when the tab is first opened
    useEffect(() => {
        if (activeTab === "Notes" && !notesFetched && !notesLoading) {
            fetchNotes();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    async function fetchActivity() {
        setActivityLoading(true);
        try {
            // ── DUMMY DATA ────────────────────────────────────────────────────────
            // Replace the line below with the real API call once resident_activity
            // is instrumented. See docs/resident-activity.md for the full guide.
            //
            // const res = await fetch(
            //   `/api/internal/olympus?resource=resident_activity&residentId=${residentId}`
            // );
            // const json = await res.json();
            // const events: ActivityEvent[] = (json.data ?? []).map((e: any) => ({
            //   id: String(e.id),
            //   event_action: e.event_action,
            //   section: e.section,
            //   sub_section: e.sub_section,
            //   event_timestamp: e.date + "T" + e.time,
            //   metadata: e.metadata,
            // }));
            // setActivity(events);
            // ─────────────────────────────────────────────────────────────────────
            await new Promise((r) => setTimeout(r, 300)); // simulate network
            setActivity(DUMMY_ACTIVITY);
            setActivityFetched(true);
        } finally {
            setActivityLoading(false);
        }
    }

    // Lazy-fetch activity when the tab is first opened
    useEffect(() => {
        if (activeTab === "Activity" && !activityFetched && !activityLoading) {
            fetchActivity();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

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

    const isActive = resident.status === "active";

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0E0823]">
            {/* ── Left panel ─────────────────────────────────────────── */}
            <div className="w-[340px] flex-shrink-0 bg-white dark:bg-[#160B30] border-r border-gray-100 dark:border-white/10 overflow-y-auto">
                {/* Resident header */}
                <div className="px-6 pt-5 pb-5 border-b border-gray-100 dark:border-white/10">
                    <Link
                        href="/dashboard/residents"
                        className="inline-flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 mb-4 transition-colors"
                    >
                        <ArrowLeftIcon className="w-3.5 h-3.5" />
                    </Link>
                    <div className="flex items-center gap-3 mb-3">
                        <Avatar firstName={resident.first_name} lastName={resident.last_name} />
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold text-[#26045D] dark:text-purple-200 leading-tight">
                                {name}
                            </h1>
                            <span
                                className={[
                                    "inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                    isActive
                                        ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-gray-100 text-gray-500 dark:bg-white/[0.06] dark:text-gray-400",
                                ].join(" ")}
                            >
                                {isActive ? "Active" : (resident.status ?? "Unknown")}
                            </span>
                        </div>
                    </div>
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

                {/* Profile section */}
                <div className="px-6 py-5 border-b border-gray-100 dark:border-white/10">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-4">
                        Profile
                    </p>
                    <div className="space-y-4">
                        <FieldPair label="Email" value={resident.email ?? "—"} />
                        <FieldPair label="Phone number" value="—" />
                        <FieldPair
                            label="Category"
                            value={resident.status === "active" ? "Active" : resident.status ?? "—"}
                        />
                        <FieldPair label="Transaction status" value="—" />
                        <FieldPair label="Sign up date" value={fmtDate(resident.signed_up_date)} />
                        <FieldPair label="Case manager" value="—" />
                    </div>
                </div>

                {/* Upcoming activity */}
                <div className="px-6 py-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-4">
                        Upcoming activity
                    </p>
                    <div className="flex items-center gap-2 text-gray-400 dark:text-gray-600">
                        <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                        <p className="text-sm">No upcoming activity</p>
                    </div>
                </div>
            </div>

            {/* ── Right panel ────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Stats row */}
                <div className="bg-white dark:bg-[#160B30] border-b border-gray-100 dark:border-white/10 flex divide-x divide-gray-100 dark:divide-white/10 flex-shrink-0">
                    <StatCell
                        dot="#7B3FE4"
                        label="Current ownership"
                        value={
                            resident.current_share != null
                                ? `${resident.current_share}%`
                                : "—"
                        }
                        sub="— same as move in"
                    />
                    <StatCell
                        dot="#3B82F6"
                        label="Value of 100%"
                        value={fmtAlways(purchasePrice)}
                        sub="— since move in"
                    />
                    <StatCell
                        dot="#10B981"
                        label="Current salary"
                        value={fmtAlways(resident.annual_household_income)}
                        sub="— since move in"
                    />
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
                                <InfoCard
                                    icon={
                                        <CreditCardIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                    }
                                    title="Monthly finances"
                                >
                                    {/* Donut chart with center label */}
                                    <div className="relative h-44">
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
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            {hasChartData ? (
                                                <span className="text-xl font-bold text-gray-900 dark:text-white">
                                                    {costPct}%
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Finance rows */}
                                    <div className="space-y-3 mt-2">
                                        <FinanceRow
                                            label="Monthly income"
                                            value={fmtAlways(monthlyIncome)}
                                        />
                                        <FinanceRow
                                            label="Monthly rent"
                                            value={fmtAlways(monthlyRent)}
                                        />
                                        <FinanceRow
                                            label="Monthly service charge"
                                            value={fmtAlways(monthlyServiceCharge)}
                                        />
                                        <FinanceRow
                                            label="Monthly mortgage"
                                            value={fmtAlways(monthlyMortgage)}
                                        />
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
                                </InfoCard>

                                {/* Financial information */}
                                <InfoCard
                                    icon={
                                        <span className="text-sm text-gray-400 dark:text-gray-500 font-medium leading-none">
                                            £
                                        </span>
                                    }
                                    title="Financial information"
                                    action={
                                        <button className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors">
                                            Edit
                                        </button>
                                    }
                                >
                                    <FieldGrid
                                        fields={[
                                            {
                                                label: "Salary",
                                                value: fmtAlways(resident.annual_household_income),
                                            },
                                            {
                                                label: "Savings",
                                                value: fmtAlways(resident.cash_savings),
                                            },
                                            { label: "Debt", value: fmt(resident.debt) },
                                            { label: "Next raise", value: "—" },
                                            { label: "Bonuses", value: "—" },
                                            { label: "Partner salary", value: "—" },
                                        ]}
                                    />
                                </InfoCard>
                            </div>

                            {/* ── Right column ── */}
                            <div className="space-y-4">
                                {/* Unit details */}
                                <InfoCard
                                    icon={
                                        <HomeModernIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                    }
                                    title="Unit details"
                                    action={
                                        <button className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors">
                                            Edit
                                        </button>
                                    }
                                >
                                    <FieldGrid
                                        fields={[
                                            { label: "Postcode", value: postcode ?? "—" },
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
                                        ]}
                                    />
                                    {unit && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
                                            <button className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 transition-colors w-full justify-between">
                                                <span>View unit</span>
                                                <span className="text-gray-400 dark:text-gray-600">→</span>
                                            </button>
                                        </div>
                                    )}
                                </InfoCard>

                                {/* Mortgage information */}
                                <InfoCard
                                    icon={
                                        <BuildingLibraryIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                    }
                                    title="Mortgage information"
                                    action={
                                        <button className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors">
                                            Edit
                                        </button>
                                    }
                                >
                                    <FieldGrid
                                        fields={[
                                            {
                                                label: "Mortgage amount",
                                                value: fmt(resident.mortgage_amount),
                                            },
                                            {
                                                label: "Fixed term expiry date",
                                                value: fmtDate(resident.mortgage_expiry_date),
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
                                                value: fmt(resident.monthly_mortgage_payment),
                                            },
                                            {
                                                label: "Current lender",
                                                value: resident.current_lender ?? "—",
                                            },
                                        ]}
                                    />
                                </InfoCard>
                            </div>
                        </div>
                    ) : activeTab === "Documents" ? (
                        <div className="relative">
                            {/* Tab header */}
                            <div className="flex items-center justify-between mb-5">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {docsLoading
                                        ? "Loading…"
                                        : `${docs.length} ${docs.length === 1 ? "document" : "documents"}`}
                                </p>
                                <button
                                    onClick={() => {
                                        setUploadError(null);
                                        setUploadFile(null);
                                        setUploadDocType("");
                                        setUploadOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1.5 text-sm font-medium bg-[#7B3FE4] hover:bg-[#6D28D9] text-white px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                    Upload document
                                </button>
                            </div>

                            {/* Loading */}
                            {docsLoading && (
                                <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600 text-sm">
                                    Loading documents…
                                </div>
                            )}

                            {/* Error */}
                            {!docsLoading && docsError && (
                                <div className="flex flex-col items-center justify-center h-48 gap-2">
                                    <p className="text-sm text-red-500">Failed to load documents.</p>
                                    <button
                                        onClick={() => { setDocsFetched(false); fetchDocs(); }}
                                        className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}

                            {/* Empty state */}
                            {!docsLoading && !docsError && docs.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
                                        <InboxIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No documents yet</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
                                            Upload a lease, ID, or staircasing documents to get started.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setUploadError(null);
                                            setUploadFile(null);
                                            setUploadDocType("");
                                            setUploadOpen(true);
                                        }}
                                        className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                        Upload document
                                    </button>
                                </div>
                            )}

                            {/* Document list */}
                            {!docsLoading && !docsError && docs.length > 0 && (
                                <div className="rounded-2xl border border-gray-100 dark:border-white/[0.08] bg-white dark:bg-[#1A0F35] overflow-hidden">
                                    {docs.map((doc, i) => {
                                        const typeLabel = doc.document_type
                                            ? (DOC_TYPE_LABEL[doc.document_type] ?? doc.document_type)
                                            : "Unknown";
                                        const typeColor = doc.document_type
                                            ? (DOC_TYPE_COLOR[doc.document_type] ?? DOC_TYPE_COLOR.other)
                                            : DOC_TYPE_COLOR.other;
                                        return (
                                            <div
                                                key={doc.id}
                                                className={[
                                                    "flex items-center gap-3 px-5 py-3.5 group transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03]",
                                                    i > 0 ? "border-t border-gray-100 dark:border-white/[0.06]" : "",
                                                ].join(" ")}
                                            >
                                                {/* Icon */}
                                                <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                                                    <DocumentTextIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                                </div>

                                                {/* Name + meta */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                        {doc.filename}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${typeColor}`}>
                                                            {typeLabel}
                                                        </span>
                                                        <span className="text-xs text-gray-400 dark:text-gray-600">
                                                            {formatSize(doc.document_size)}
                                                        </span>
                                                        <span className="text-xs text-gray-400 dark:text-gray-600">·</span>
                                                        <span className="text-xs text-gray-400 dark:text-gray-600">
                                                            {fmtDate(doc.created_at)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Download */}
                                                {doc.signed_url && (
                                                    <a
                                                        href={doc.signed_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        download={doc.filename}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Download"
                                                    >
                                                        <ArrowDownTrayIcon className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Upload modal */}
                            {uploadOpen && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                    {/* Backdrop */}
                                    <div
                                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                                        onClick={() => !uploading && setUploadOpen(false)}
                                    />

                                    {/* Card */}
                                    <div className="relative w-full max-w-md bg-white dark:bg-[#1A0F35] rounded-2xl border border-gray-100 dark:border-white/[0.08] shadow-2xl p-6">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-5">
                                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                                Upload document
                                            </h2>
                                            <button
                                                onClick={() => !uploading && setUploadOpen(false)}
                                                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Document type */}
                                        <div className="mb-4">
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
                                                Document type <span className="text-red-400">*</span>
                                            </label>
                                            <select
                                                value={uploadDocType}
                                                onChange={(e) => setUploadDocType(e.target.value)}
                                                disabled={uploading}
                                                className="w-full text-sm rounded-lg border border-gray-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 disabled:opacity-50"
                                            >
                                                <option value="" disabled>Select type…</option>
                                                {DOCUMENT_TYPES.map((t) => (
                                                    <option key={t.value} value={t.value}>
                                                        {t.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* File picker */}
                                        <div className="mb-5">
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
                                                File <span className="text-red-400">*</span>
                                            </label>
                                            <label
                                                className={[
                                                    "flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed px-4 py-6 cursor-pointer transition-colors",
                                                    dragOver
                                                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                                                        : uploadFile
                                                        ? "border-green-400 bg-green-50 dark:bg-green-900/10"
                                                        : "border-gray-200 dark:border-white/[0.1] hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-white/[0.03]",
                                                    uploading ? "pointer-events-none opacity-50" : "",
                                                ].join(" ")}
                                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                                onDragLeave={() => setDragOver(false)}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    setDragOver(false);
                                                    const f = e.dataTransfer.files[0];
                                                    if (f) setUploadFile(f);
                                                }}
                                            >
                                                <input
                                                    type="file"
                                                    className="sr-only"
                                                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                                    onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                                                    disabled={uploading}
                                                />
                                                {uploadFile ? (
                                                    <>
                                                        <DocumentTextIcon className="w-7 h-7 text-green-500" />
                                                        <div className="text-center">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[280px]">
                                                                {uploadFile.name}
                                                            </p>
                                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                                {formatSize(uploadFile.size)} · Click to change
                                                            </p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
                                                            <PlusIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                <span className="font-medium text-purple-600 dark:text-purple-400">
                                                                    Click to select
                                                                </span>{" "}
                                                                or drag and drop
                                                            </p>
                                                            <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
                                                                PDF, DOC, DOCX, PNG, JPG — up to 20 MB
                                                            </p>
                                                        </div>
                                                    </>
                                                )}
                                            </label>
                                        </div>

                                        {/* Error */}
                                        {uploadError && (
                                            <p className="text-xs text-red-500 mb-4 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                                                {uploadError}
                                            </p>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setUploadOpen(false)}
                                                disabled={uploading}
                                                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleUpload}
                                                disabled={!uploadFile || !uploadDocType || uploading}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-[#7B3FE4] hover:bg-[#6D28D9] text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                {uploading ? (
                                                    <>
                                                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                                                        </svg>
                                                        Uploading…
                                                    </>
                                                ) : (
                                                    "Upload document"
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : activeTab === "Activity" ? (
                        <div>
                            {activityLoading && (
                                <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600 text-sm">
                                    Loading activity…
                                </div>
                            )}

                            {!activityLoading && activity.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
                                        <CalendarIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No activity yet</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
                                            Activity will appear here once the resident uses the app.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {!activityLoading && activity.length > 0 && (
                                <div className="space-y-6">
                                    {groupActivity(activity).map(({ label, events }) => (
                                        <div key={label}>
                                            {/* Date group header */}
                                            <div className="flex items-center gap-3 mb-3">
                                                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 flex-shrink-0">
                                                    {label}
                                                </p>
                                                <div className="flex-1 h-px bg-gray-100 dark:bg-white/[0.06]" />
                                            </div>

                                            {/* Event rows */}
                                            <div className="rounded-2xl border border-gray-100 dark:border-white/[0.08] bg-white dark:bg-[#1A0F35] overflow-hidden">
                                                {events.map((event, i) => {
                                                    const display = getEventDisplay(event);
                                                    const { Icon } = display;
                                                    return (
                                                        <div
                                                            key={event.id}
                                                            className={[
                                                                "flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]",
                                                                i > 0 ? "border-t border-gray-100 dark:border-white/[0.06]" : "",
                                                            ].join(" ")}
                                                        >
                                                            {/* Icon */}
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${display.iconBg}`}>
                                                                <Icon className={`w-4 h-4 ${display.iconColor}`} />
                                                            </div>

                                                            {/* Label + description */}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    {display.label}
                                                                </p>
                                                                {display.description && (
                                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                                        {display.description}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            {/* Time */}
                                                            <span className="text-xs text-gray-400 dark:text-gray-600 flex-shrink-0 mt-0.5 tabular-nums">
                                                                {fmtTime(event.event_timestamp)}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : activeTab === "Notes" ? (
                        <div className="space-y-4">
                            {/* Composer */}
                            <div className="rounded-2xl border border-gray-100 dark:border-white/[0.08] bg-white dark:bg-[#1A0F35] p-4">
                                <textarea
                                    value={noteBody}
                                    onChange={(e) => setNoteBody(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmitNote();
                                    }}
                                    placeholder="Add a note… (⌘↵ to post)"
                                    rows={3}
                                    className="w-full text-sm text-gray-900 dark:text-gray-100 bg-transparent resize-none outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                />
                                {noteFile && (
                                    <div className="mt-1.5 mb-1">
                                        <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-white/[0.08] text-gray-600 dark:text-gray-400 px-2 py-1 rounded-lg">
                                            <PaperClipIcon className="w-3 h-3 flex-shrink-0" />
                                            <span className="truncate max-w-[200px]">{noteFile.name}</span>
                                            <button
                                                onClick={() => setNoteFile(null)}
                                                className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                                            >
                                                <XMarkIcon className="w-3 h-3" />
                                            </button>
                                        </span>
                                    </div>
                                )}
                                {noteSubmitError && (
                                    <p className="mt-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                                        {noteSubmitError}
                                    </p>
                                )}
                                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100 dark:border-white/[0.06]">
                                    <label
                                        className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                        title="Attach file"
                                    >
                                        <input
                                            type="file"
                                            className="sr-only"
                                            onChange={(e) => setNoteFile(e.target.files?.[0] ?? null)}
                                        />
                                        <PaperClipIcon className="w-4 h-4" />
                                    </label>
                                    <button
                                        onClick={handleSubmitNote}
                                        disabled={!noteBody.trim() || submittingNote}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#7B3FE4] hover:bg-[#6D28D9] text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {submittingNote ? "Posting…" : "Post note"}
                                    </button>
                                </div>
                            </div>

                            {/* Loading */}
                            {notesLoading && (
                                <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-600 text-sm">
                                    Loading notes…
                                </div>
                            )}

                            {/* Empty state */}
                            {!notesLoading && notes.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
                                        <ChatBubbleOvalLeftIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No notes yet</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
                                            Be the first to add a note to this resident&apos;s profile.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Notes list */}
                            {!notesLoading && notes.length > 0 && (
                                <div className="space-y-3">
                                    {notes.map((note) => {
                                        const noteActions: NoteCardActions = {
                                            onReaction: toggleReaction,
                                            onPin: togglePin,
                                            onDelete: deleteNote,
                                            onReplyStart: (id) => { setReplyingTo(id); setReplyBody(""); },
                                            onReplyBodyChange: setReplyBody,
                                            onReplySubmit: handleSubmitReply,
                                            onReplyCancel: () => { setReplyingTo(null); setReplyBody(""); },
                                            onToggleReplies: (id) =>
                                                setExpandedReplies((prev) =>
                                                    prev.includes(id)
                                                        ? prev.filter((x) => x !== id)
                                                        : [...prev, id]
                                                ),
                                        };
                                        return (
                                            <NoteCard
                                                key={note.id}
                                                note={note}
                                                currentUserId={currentUserId}
                                                replyingTo={replyingTo}
                                                replyBody={replyBody}
                                                submittingReply={submittingReply}
                                                expandedReplies={expandedReplies}
                                                actions={noteActions}
                                            />
                                        );
                                    })}
                                </div>
                            )}
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
