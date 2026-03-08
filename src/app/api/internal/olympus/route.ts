import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

/**
 * Securely get the current user and their company ID + access rights.
 */
async function getUserCompany() {
    const supabase = await createClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    // Extract company info
    const company_id =
        (user.user_metadata?.company as number | string | undefined) ??
        (user.app_metadata?.company as number | string | undefined);

    if (!company_id) {
        throw new Error("User has no company in metadata");
    }

    // New: Bossman access flag
    const hasBossmanAccess =
        user.user_metadata?.bossman_access === "Yes" ||
        user.user_metadata?.bossman_access === "true";

    return {
        user,
        company_id: Number(company_id),
        hasBossmanAccess,
    };
}

/**
 * Unified Olympus API
 */
export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(req.url);
        const resource = searchParams.get("resource");
        const selectedCompanyId = searchParams.get("companyId");
        const userId = searchParams.get("userId");
        const start = searchParams.get("start");
        const end = searchParams.get("end");

        // Authenticated user info
        const { company_id: userCompanyId, hasBossmanAccess } =
            await getUserCompany();

        // ✅ Require explicit Bossman access in metadata
        if (!hasBossmanAccess) {
            return NextResponse.json(
                { error: "Forbidden: You do not have Bossman access" },
                { status: 403 }
            );
        }

        // Bossman users are considered admins
        const isAdmin = true;

        // ----------------------------------------------------------------
        // CASE 1: Case Managers
        // ----------------------------------------------------------------
        if (resource === "case_managers") {
            let query = supabase
                .from("case_managers")
                .select("id, first_name, last_name, case_manager_name, company_id")
                .order("first_name", { ascending: true });

            if (isAdmin && selectedCompanyId) {
                query = query.eq("company_id", selectedCompanyId);
            } else if (!isAdmin) {
                query = query.eq("company_id", userCompanyId);
            }

            const { data, error } = await query;
            if (error) throw error;

            return NextResponse.json({ data });
        }

        // ----------------------------------------------------------------
        // CASE 2: Platform Activity
        // ----------------------------------------------------------------
        if (resource === "platform_activity") {
            if (!userId) {
                return NextResponse.json(
                    { error: "Missing userId parameter" },
                    { status: 400 }
                );
            }

            const { data: targetUser, error: targetError } = await supabase
                .from("case_managers")
                .select("company_id")
                .eq("id", userId)
                .single();

            if (targetError) throw targetError;

            if (!isAdmin && targetUser.company_id !== userCompanyId) {
                return NextResponse.json(
                    { error: "Forbidden: cannot view this user's activity" },
                    { status: 403 }
                );
            }

            let query = supabase
                .from("platform_activity")
                .select(
                    "id, user_id, event_action, section, sub_section, metadata, event_timestamp"
                )
                .eq("user_id", userId)
                .order("event_timestamp", { ascending: false });

            if (start) query = query.gte("event_timestamp", start);
            if (end) query = query.lte("event_timestamp", end);

            const { data, error } = await query;
            if (error) throw error;

            return NextResponse.json({ data });
        }

        // ----------------------------------------------------------------
        // CASE 2b: Single resident detail
        // ----------------------------------------------------------------
        if (resource === "resident_detail") {
            const residentId = searchParams.get("residentId");
            if (!residentId) {
                return NextResponse.json(
                    { error: "Missing residentId parameter" },
                    { status: 400 }
                );
            }

            const { data, error } = await (supabase as any)
                .from("resident")
                .select(`
                    id, first_name, last_name, email, address,
                    annual_household_income, cash_savings, debt,
                    monthly_income, monthly_rent, service_charge,
                    monthly_mortgage_payment, total_monthly_costs,
                    current_share, maximum_share, purchase_price,
                    mortgage_amount, mortgage_expiry_date, mortgage_rate,
                    mortgage_term, current_lender,
                    move_in_date, signed_up_date, status,
                    postcode, city, company_id, company_development_unit_id,
                    unit:company_development_unit_id(
                        id, internal_id, address_1, postcode, city, unit_type,
                        purchase_price, percentage_sold, monthly_rent, service_charge
                    )
                `)
                .eq("id", residentId)
                .single();

            if (error) throw error;
            return NextResponse.json({ data });
        }

        // ----------------------------------------------------------------
        // CASE 3: Residents for a Company
        // ----------------------------------------------------------------
        if (resource === "residents") {
            let query = (supabase as any)
                .from("resident")
                .select(`
                    id, first_name, last_name, email, address,
                    annual_household_income, cash_savings,
                    current_share, maximum_share,
                    signed_up_date, updated_at, company_id,
                    company:company_id(id, name)
                `)
                .order("last_name", { ascending: true });

            if (selectedCompanyId) {
                query = query.eq("company_id", selectedCompanyId);
            } else if (!isAdmin) {
                query = query.eq("company_id", userCompanyId);
            }

            const { data, error } = await query;
            if (error) throw error;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const formatted = (data || []).map((r: any) => ({
                id: r.id,
                name: `${r.first_name} ${r.last_name}`,
                email: r.email ?? null,
                address: r.address ?? null,
                company_id: r.company_id,
                housing_association: r.company?.name ?? null,
                salary: r.annual_household_income ?? null,
                savings: r.cash_savings ?? null,
                current_share: r.current_share ?? null,
                maximum_share: r.maximum_share ?? null,
                signed_up_date: r.signed_up_date ?? null,
                updated_at: r.updated_at ?? null,
            }));

            return NextResponse.json({ data: formatted });
        }

        // ----------------------------------------------------------------
        // CASE 4: Resident Activity
        // ----------------------------------------------------------------
        if (resource === "resident_activity") {
            const residentId = searchParams.get("residentId");

            if (!residentId) {
                return NextResponse.json(
                    { error: "Missing residentId parameter" },
                    { status: 400 }
                );
            }

            const { data: resident, error: resError } = await supabase
                .from("resident")
                .select("company_id")
                .eq("id", residentId)
                .single();

            if (resError) throw resError;

            if (!isAdmin && resident.company_id !== userCompanyId) {
                return NextResponse.json(
                    { error: "Forbidden: cannot view this resident" },
                    { status: 403 }
                );
            }

            let query = supabase
                .from("resident_activity")
                .select(
                    "id, resident_id, event_action, section, sub_section, event_timestamp, metadata"
                )
                .eq("resident_id", residentId)
                .order("event_timestamp", { ascending: false });

            if (start) query = query.gte("event_timestamp", start);
            if (end) query = query.lte("event_timestamp", end);

            const { data, error } = await query;
            if (error) throw error;

            const formatted = data.map((r) => ({
                id: r.id,
                date: new Date(r.event_timestamp).toISOString().split("T")[0],
                time: new Date(r.event_timestamp).toLocaleTimeString(),
                event_action: r.event_action,
                section: r.section,
                sub_section: r.sub_section,
                metadata: r.metadata,
            }));

            return NextResponse.json({ data: formatted });
        }

        // ----------------------------------------------------------------
        // ✅ CASE 5: Transactions for a Company (with resident documents)
        // ----------------------------------------------------------------
        if (resource === "transactions") {
            const companyId = searchParams.get("companyId");
            const status = searchParams.get("status");

            if (!companyId) {
                return NextResponse.json(
                    { error: "Missing companyId parameter" },
                    { status: 400 }
                );
            }

            let query = supabase
                .from("client_transaction")
                .select(
                    `
          id,
          company_id,
          resident_id,
          created_at,
          rics_valuation,
          transaction_deposit,
          share_to_purchase,
          finance_method,
          status
        `
                )
                .eq("company_id", companyId)
                .order("created_at", { ascending: false });

            if (status && status !== "all") {
                query = query.eq("status", status);
            }

            const { data: txs, error: txError } = await query;
            if (txError) throw txError;
            if (!txs?.length) return NextResponse.json({ data: [] });

            const residentIds = txs.map((t) => t.resident_id).filter(Boolean);

            const { data: docs, error: docError } = await supabase
                .from("resident_documents")
                .select(
                    "resident_id, filename, supabase_path, document_type, document_size"
                )
                .in("resident_id", residentIds);

            if (docError) throw docError;

            const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
            const merged = txs.map((tx) => ({
                ...tx,
                documents:
                    docs
                        ?.filter((d) => d.resident_id === tx.resident_id)
                        ?.map((d) => ({
                            name: d.filename,
                            type: d.document_type,
                            size: d.document_size,
                            url: `${storageUrl}/storage/v1/object/public/${d.supabase_path}`,
                        })) || [],
            }));

            return NextResponse.json({ data: merged });
        }

        // ----------------------------------------------------------------
        // CASE 6: Companies
        // ----------------------------------------------------------------
        let companyQuery = supabase
            .from("company")
            .select("id, name")
            .order("name", { ascending: true });

        if (!isAdmin) {
            companyQuery = companyQuery.eq("id", userCompanyId);
        }

        const { data, error } = await companyQuery;
        if (error) throw error;

        return NextResponse.json({ data });
    } catch (err) {
        console.error("❌ Olympus API Error:", err);
        const message = (err as Error).message || "Unexpected error";
        const status =
            message === "Unauthorized"
                ? 401
                : message.includes("Forbidden")
                    ? 403
                    : 400;

        return NextResponse.json({ error: message }, { status });
    }
}

// ── POST ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const { hasBossmanAccess } = await getUserCompany();
        if (!hasBossmanAccess) {
            return NextResponse.json(
                { error: "Forbidden: You do not have Bossman access" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { resource } = body;

        if (resource === "resident_documents") {
            const { residentId, filename, supabasePath, documentType, documentSize } = body;

            if (!residentId || !filename || !supabasePath || !documentType) {
                return NextResponse.json(
                    { error: "Missing required fields" },
                    { status: 400 }
                );
            }

            const supabase = await createClient();
            const { error } = await supabase.from("resident_documents").insert({
                resident_id: Number(residentId),
                filename,
                supabase_path: supabasePath,
                document_type: documentType,
                document_size: documentSize ?? null,
            });

            if (error) throw error;
            return NextResponse.json({ ok: true });
        }

        return NextResponse.json({ error: "Unknown resource" }, { status: 400 });
    } catch (err) {
        console.error("❌ Olympus POST Error:", err);
        const message = (err as Error).message || "Unexpected error";
        const status = message === "Unauthorized" ? 401 : message.includes("Forbidden") ? 403 : 400;
        return NextResponse.json({ error: message }, { status });
    }
}
