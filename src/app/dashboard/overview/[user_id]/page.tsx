/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";

type Activity = {
    id: string;
    event_timestamp: string;
    event_action: string;
    section: string;
    sub_section?: string;
    metadata?: string | Record<string, any>;
};

export default function UserActivityPage() {
    const router = useRouter();
    const { user_id } = useParams();
    const [activity, setActivity] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    // 🧩 Safe metadata renderer — handles object or string
    function renderMetadata(raw: string | Record<string, any> | undefined) {
        if (!raw) return "";
        try {
            const meta =
                typeof raw === "string" ? JSON.parse(raw) : (raw as Record<string, any>);
            if (meta && typeof meta === "object") {
                if ("href" in meta) return `Path: ${meta.href}`;
                return Object.entries(meta)
                    .map(([k, v]) => `${k}: ${String(v)}`)
                    .join(", ");
            }
            return String(meta);
        } catch {
            return typeof raw === "string" ? raw : JSON.stringify(raw);
        }
    }

    // 🔄 Load user activity
    useEffect(() => {
        const loadActivity = async () => {
            if (!user_id) return;
            try {
                setLoading(true);
                setError(null);

                // Build query with optional dates
                const query = new URLSearchParams({
                    resource: "platform_activity",
                    userId: user_id as string,
                });

                if (startDate) query.append("start", startDate);
                if (endDate) query.append("end", endDate);

                const res = await fetch(`/api/internal/olympus?${query.toString()}`);
                if (!res.ok) throw new Error("Failed to load activity");

                const json = await res.json();
                setActivity(json.data || []);
            } catch (err) {
                console.error("Error loading activity:", err);
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        loadActivity();
    }, [user_id, startDate, endDate]);

    return (
        <div className="p-6 space-y-6">
            {/* Navigation */}
            <button
                onClick={() => router.back()}
                className="text-sm text-[#26045D] hover:underline"
            >
                ← Back to users
            </button>

            <h1 className="text-2xl font-semibold text-[#26045D]">User Activity</h1>

            {/* Date Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        Start Date
                    </label>
                    <input
                        type="date"
                        className="border border-gray-300 rounded-md px-3 py-2 w-full"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        End Date
                    </label>
                    <input
                        type="date"
                        className="border border-gray-300 rounded-md px-3 py-2 w-full"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
            </div>

            <Card className="border-[#EEEEEE] rounded-lg">
                <CardContent className="p-4">
                    {loading && <p className="text-gray-500">Loading activity...</p>}

                    {!loading && error && (
                        <p className="text-red-500 text-sm">
                            Error loading activity: {error}
                        </p>
                    )}

                    {!loading && !error && activity.length === 0 && (
                        <p className="text-gray-500 text-sm">
                            No recorded activity for this user.
                        </p>
                    )}

                    {!loading && !error && activity.length > 0 && (
                        <ul className="divide-y">
                            {activity.map((a) => (
                                <li key={a.id} className="py-3">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {a.event_action}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {a.section}
                                                {a.sub_section ? ` • ${a.sub_section}` : ""}
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(a.event_timestamp).toLocaleString()}
                                        </span>
                                    </div>

                                    {a.metadata && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {renderMetadata(a.metadata)}
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
