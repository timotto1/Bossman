export const runtime = "nodejs"; // ensure Node.js runtime (not edge)

import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

import { validateRequiredFields } from "@/validators/requiredFieldsValidator";

/**
 * Dynamically resolve the Platform API URL based on environment.
 */
function getPlatformBaseUrl(): string {
    return `${process.env.NEXT_PUBLIC_PLATFORM_URL}`
}

const proEnvOut = process.env;

export async function POST(request: NextRequest) {
    try {
        const proEnvIn = process.env;
        // 1️⃣ Authorization header
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.split(" ")[1];
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        // 2️⃣ Verify JWT
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("❌ Missing JWT_SECRET in environment variables");
            return NextResponse.json(
                { error: "Server misconfiguration: missing JWT secret" },
                { status: 500 }
            );
        }

        let payload: { role: string; app: string };
        try {
            payload = jwt.verify(token, secret) as { role: string; app: string };
        } catch (err) {
            console.error("❌ Invalid or expired JWT:", err);
            return NextResponse.json({ error: "Invalid token" }, { status: 403 });
        }

        if (payload.role !== "signup-service") {
            return NextResponse.json({ error: "Unauthorized role" }, { status: 403 });
        }

        // 3️⃣ Parse request body
        const body = await request.json();
        const { email, firstName, lastName, phone, role, company } = body;

        // 4️⃣ Validate required fields
        const requiredFieldsValidation = validateRequiredFields([
            { name: "email", value: email },
            { name: "firstName", value: firstName },
            { name: "lastName", value: lastName },
            { name: "phone", value: phone },
            { name: "company", value: company },
            { name: "role", value: role },
        ]);

        if (requiredFieldsValidation) {
            return NextResponse.json(
                { error: requiredFieldsValidation },
                { status: 400 }
            );
        }

        // 5️⃣ Determine Platform API base URL
        const baseUrl = getPlatformBaseUrl();
        console.log(`🌍 Using Platform base URL: ${baseUrl}`);

        // 6️⃣ Forward signup request to the correct Platform environment
        const platformRes = await fetch(`${baseUrl}/api/internal/auth/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.PLATFORM_SECRET_KEY}`,
            },
            body: JSON.stringify({ email, firstName, lastName, phone, role, company }),
        });

        if (!platformRes.ok) {
            const errorText = await platformRes.text();
            console.error(
                `❌ Platform signup failed (${platformRes.status}):`,
                errorText
            );
            return NextResponse.json(
                { error: "Platform signup failed", details: errorText },
                { status: platformRes.status }
            );
        }

        const platformResData = await platformRes.json();

        // ✅ Return combined success
        return NextResponse.json({
            ...platformResData
        });
    } catch (error) {
        console.error("❌ Unexpected signup error:", error);
        return NextResponse.json(
            { error: "Server error", details: `${error}` },
            { status: 500 }
        );
    }
}
