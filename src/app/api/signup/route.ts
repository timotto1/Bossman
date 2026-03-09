/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, firstName, lastName, phone, company, role } = body;

        if (!email || !firstName || !lastName || !phone || !company || !role) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_PLATFORM_URL}/api/internal/auth/signup`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.PLATFORM_SECRET_KEY}`,
                },
                body: JSON.stringify({
                    email,
                    firstName,
                    lastName,
                    phone,
                    company,
                    role,
                }),
            }
        );

        // ✅ Read the response once as text
        const rawText = await res.text();
        let data: any;

        try {
            data = rawText ? JSON.parse(rawText) : {};
        } catch {
            console.warn("⚠️ Non-JSON response from StairPay:", rawText);
            data = { raw: rawText };
        }

        if (!res.ok) {
            return NextResponse.json(
                { message: "StairPay signup failed", error: data },
                { status: res.status }
            );
        }

        return NextResponse.json({
            message: "User created successfully",
            data,
        });
    } catch (err: any) {
        console.error("Signup route error:", err);
        return NextResponse.json(
            { message: "Server error", error: err.message },
            { status: 500 }
        );
    }
}
