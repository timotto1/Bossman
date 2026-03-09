/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Company = { id: string; name: string };
type Resident = { id: string; name: string; email?: string };
type Activity = {
    id: string;
    date: string;
    time: string;
    event_action: string;
    section: string | null;
    sub_section: string | null;
    metadata: any;
};

export default function ResidentActivityPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [residents, setResidents] = useState<Resident[]>([]);
    const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<string | undefined>();
    const [selectedResident, setSelectedResident] = useState<string | undefined>();
    const [activityData, setActivityData] = useState<Activity[]>([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [generatingLink, setGeneratingLink] = useState(false);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    // 🏢 Load companies
    useEffect(() => {
        fetch("/api/internal/olympus")
            .then((res) => res.json())
            .then((json) => setCompanies(json.data || []))
            .catch((err) => console.error("Error loading companies:", err));
    }, []);

    // 👥 Load residents for selected company
    useEffect(() => {
        if (!selectedCompany) return;
        fetch(`/api/internal/olympus?resource=residents&companyId=${selectedCompany}`)
            .then((res) => res.json())
            .then((json) => {
                setResidents(json.data || []);
                setFilteredResidents(json.data || []);
            })
            .catch((err) => console.error("Error loading residents:", err));
    }, [selectedCompany]);

    // 📊 Load activity when resident or dates change
    useEffect(() => {
        if (!selectedResident) return;
        setLoading(true);

        const params = new URLSearchParams();
        params.append("resource", "resident_activity");
        params.append("residentId", selectedResident);
        if (startDate) params.append("start", startDate);
        if (endDate) params.append("end", endDate);

        fetch(`/api/internal/olympus?${params.toString()}`)
            .then((res) => res.json())
            .then((json) => setActivityData(json.data || []))
            .catch((err) => console.error("Error loading activity:", err))
            .finally(() => setLoading(false));
    }, [selectedResident, startDate, endDate]);

    // 🔑 Generate resident dashboard link (UAT)
    async function handleViewResidentDashboard() {
        if (!selectedResident) {
            alert("Please select a resident first.");
            return;
        }

        try {
            setGeneratingLink(true);
            setGeneratedLink(null);

            // Fetch the resident details to get their email
            const res = await fetch(
                `/api/internal/olympus?resource=residents&companyId=${selectedCompany}`
            );
            const json = await res.json();
            const resident = json.data.find((r: Resident) => r.id === selectedResident);

            if (!resident?.email) {
                alert("Resident email not found.");
                return;
            }

            // ✅ Always use UAT redirect
            const redirectTo = "https://resident.stairpay.com/auth/callback";

            const magicRes = await fetch("/api/internal/magiclink", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: resident.email, redirectTo }),
            });

            const magicJson = await magicRes.json();

            if (magicJson.magicLink) {
                setGeneratedLink(magicJson.magicLink);
            } else if (magicJson.hashed_token) {
                const uatLink = `https://uat-resident.stairpay.com/auth/confirm?type=magiclink&token_hash=${magicJson.hashed_token}`;
                setGeneratedLink(uatLink);
            } else {
                console.error("Magic link generation failed:", magicJson);
                alert("Failed to generate magic link.");
            }
        } catch (err) {
            console.error("Error generating magic link:", err);
            alert("Error generating magic link.");
        } finally {
            setGeneratingLink(false);
        }
    }

    return (
        <div className="p-6 space-y-8">
            <h1 className="text-2xl font-semibold text-[#26045D]">
                Resident Activity
            </h1>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Company Dropdown */}
                <div>
                    <label className="block text-sm font-medium mb-2">Select Company</label>
                    <Select onValueChange={setSelectedCompany}>
                        <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Choose a company" />
                        </SelectTrigger>
                        <SelectContent>
                            {companies.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Resident Searchable Dropdown */}
                <div className="w-[300px] relative">
                    <label className="block text-sm font-medium mb-2">Search Resident</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Type resident name..."
                            className="w-full border rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-[#26045D]"
                            value={searchTerm}
                            onChange={(e) => {
                                const term = e.target.value.toLowerCase();
                                setSearchTerm(e.target.value);
                                setFilteredResidents(
                                    residents.filter(
                                        (r) =>
                                            r.name.toLowerCase().includes(term) ||
                                            (r.email?.toLowerCase().includes(term) ?? false)
                                    )
                                );
                                setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                            disabled={!selectedCompany}
                        />
                        {showDropdown && selectedCompany && (
                            <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow max-h-48 overflow-y-auto">
                                {filteredResidents.length > 0 ? (
                                    filteredResidents.map((r) => (
                                        <button
                                            key={r.id}
                                            className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                                            onClick={() => {
                                                setSelectedResident(r.id);
                                                setSearchTerm(r.name);
                                                setShowDropdown(false);
                                            }}
                                        >
                                            <p>{r.name}</p>
                                            {r.email && (
                                                <span className="block text-xs text-gray-500">{r.email}</span>
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <p className="p-2 text-sm text-gray-500">No matching residents</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Date Filters + View Button */}
            <div className="flex flex-wrap items-end gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border rounded-md px-2 py-1 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border rounded-md px-2 py-1 text-sm"
                    />
                </div>

                <Button
                    onClick={handleViewResidentDashboard}
                    disabled={generatingLink || !selectedResident}
                    className="bg-[#26045D] text-white hover:bg-[#3a0685] mt-6"
                >
                    {generatingLink ? "Generating..." : "Generate Magic Link"}
                </Button>
            </div>

            {/* 🧩 Display Generated Magic Link */}
            {generatedLink && (
                <div className="mt-4 p-4 bg-gray-50 border rounded-md max-w-xl">
                    <p className="text-sm text-gray-700 mb-2">Magic Link generated:</p>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={generatedLink}
                            readOnly
                            className="w-full px-2 py-1 border rounded text-sm text-gray-800 bg-white"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                navigator.clipboard.writeText(generatedLink);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 1500);
                            }}
                        >
                            {copied ? "Copied!" : "Copy"}
                        </Button>
                    </div>
                </div>
            )}

            {/* Activity List */}
            <Card className="border-[#EEEEEE] rounded-lg">
                <CardContent className="p-4">
                    <h2 className="text-lg font-medium mb-4">Resident Activity</h2>

                    {loading ? (
                        <p className="text-gray-500">Loading...</p>
                    ) : activityData.length > 0 ? (
                        <ul className="divide-y">
                            {activityData.map((a) => (
                                <li key={a.id} className="py-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900">{a.event_action}</p>
                                            <p className="text-sm text-gray-500">
                                                {a.section} {a.sub_section && `→ ${a.sub_section}`}
                                            </p>
                                        </div>
                                        <div className="text-right text-sm text-gray-500">
                                            <p>{a.date}</p>
                                            <p>{a.time}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">
                            No recorded activity for this resident.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
