/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs";

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Supabase URL or Key missing — check your environment variables.");
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const redirectTo = "https://uat-resident.stairpay.com/auth/callback";

        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
            type: "magiclink",
            email,
            options: { redirectTo },
        });

        if (error) throw error;

        // ✅ Fix TypeScript type issue
        const hashedToken =
            (data as any)?.hashed_token || data?.properties?.hashed_token;

        if (!hashedToken) {
            throw new Error("No hashed token returned from Supabase.");
        }

        const magicLink = `https://uat-resident.stairpay.com/auth/confirm?type=magiclink&token_hash=${hashedToken}`;

        return NextResponse.json({ magicLink });
    } catch (err) {
        console.error("❌ Magic Link API Error:", err);
        return NextResponse.json(
            { error: (err as Error).message },
            { status: 500 }
        );
    }
}
