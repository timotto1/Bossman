import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getAuthorName(supabase: any, user: any): Promise<string> {
    const meta = user.user_metadata ?? {};
    if (meta.first_name) return `${meta.first_name} ${meta.last_name ?? ""}`.trim();
    if (meta.full_name) return String(meta.full_name);
    if (user.email) {
        const { data } = await supabase
            .from("case_managers")
            .select("first_name, last_name")
            .eq("email", user.email)
            .maybeSingle();
        if (data) return `${data.first_name} ${data.last_name}`.trim();
    }
    return user.email ?? "Unknown user";
}

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
        // CASE 6: Resident Notes
        // ----------------------------------------------------------------
        if (resource === "resident_notes") {
            const residentId = searchParams.get("residentId");
            if (!residentId) {
                return NextResponse.json({ error: "Missing residentId" }, { status: 400 });
            }

            const { data: { user: currentUser } } = await supabase.auth.getUser();
            const currentUserId = currentUser?.id ?? null;

            const { data: notes, error: notesError } = await supabase
                .from("resident_notes")
                .select("*")
                .eq("resident_id", residentId)
                .is("parent_id", null)
                .order("is_pinned", { ascending: false })
                .order("created_at", { ascending: false });

            if (notesError) throw notesError;
            if (!notes?.length) return NextResponse.json({ data: [] });

            const noteIds = notes.map((n: { id: string }) => n.id);

            const { data: replies } = await supabase
                .from("resident_notes")
                .select("*")
                .in("parent_id", noteIds)
                .order("created_at", { ascending: true });

            const replyIds = (replies ?? []).map((r: { id: string }) => r.id);

            const { data: reactions } = await supabase
                .from("resident_note_reactions")
                .select("note_id, author_id, reaction")
                .in("note_id", [...noteIds, ...replyIds]);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const computeReactions = (noteId: string) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const nr = (reactions ?? []).filter((r: any) => r.note_id === noteId);
                return {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    up: nr.filter((r: any) => r.reaction === "up").length,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    down: nr.filter((r: any) => r.reaction === "down").length,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    user_reaction: nr.find((r: any) => r.author_id === currentUserId)?.reaction ?? null,
                };
            };

            const getAttachmentUrl = async (path: string | null) => {
                if (!path) return null;
                const { data } = await supabase.storage.from("files").createSignedUrl(path, 60 * 60);
                return data?.signedUrl ?? null;
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const formatted = await Promise.all(notes.map(async (note: any) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const noteReplies = (replies ?? []).filter((r: any) => r.parent_id === note.id);
                return {
                    ...note,
                    attachment_url: await getAttachmentUrl(note.attachment_path),
                    reactions: computeReactions(note.id),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    replies: await Promise.all(noteReplies.map(async (reply: any) => ({
                        ...reply,
                        attachment_url: await getAttachmentUrl(reply.attachment_path),
                        reactions: computeReactions(reply.id),
                        replies: [],
                    }))),
                };
            }));

            return NextResponse.json({ data: formatted });
        }

        // ----------------------------------------------------------------
        // CASE 7: Companies
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

// ── DELETE ───────────────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
    try {
        const { hasBossmanAccess, user } = await getUserCompany();
        if (!hasBossmanAccess) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { resource, noteId } = await req.json();
        const supabase = await createClient();

        if (resource === "resident_note") {
            if (!noteId) return NextResponse.json({ error: "Missing noteId" }, { status: 400 });
            const { data: note } = await supabase
                .from("resident_notes")
                .select("author_id")
                .eq("id", noteId)
                .single();
            if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
            if (note.author_id !== user.id) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
            const { error } = await supabase.from("resident_notes").delete().eq("id", noteId);
            if (error) throw error;
            return NextResponse.json({ ok: true });
        }

        return NextResponse.json({ error: "Unknown resource" }, { status: 400 });
    } catch (err) {
        const message = (err as Error).message || "Unexpected error";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}

// ── POST ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const { hasBossmanAccess, user } = await getUserCompany();
        if (!hasBossmanAccess) {
            return NextResponse.json(
                { error: "Forbidden: You do not have Bossman access" },
                { status: 403 }
            );
        }

        const payload = await req.json();
        const { resource } = payload;
        const supabase = await createClient();

        // ── Notes ────────────────────────────────────────────────────────────

        if (resource === "resident_note") {
            const { residentId, body: noteBody, parentId, attachmentPath, attachmentName } = payload;
            if (!residentId || !noteBody) {
                return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
            }
            const authorName = await getAuthorName(supabase, user);
            const { data, error } = await supabase
                .from("resident_notes")
                .insert({
                    resident_id: Number(residentId),
                    parent_id: parentId ?? null,
                    author_id: user.id,
                    author_name: authorName,
                    body: noteBody,
                    attachment_path: attachmentPath ?? null,
                    attachment_name: attachmentName ?? null,
                    is_pinned: false,
                })
                .select()
                .single();
            if (error) throw error;
            return NextResponse.json({ data });
        }

        if (resource === "resident_note_reaction") {
            const { noteId, reaction } = payload;
            if (!noteId || !reaction) {
                return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
            }
            const { data: existing } = await supabase
                .from("resident_note_reactions")
                .select("id, reaction")
                .eq("note_id", noteId)
                .eq("author_id", user.id)
                .maybeSingle();

            if (existing) {
                if (existing.reaction === reaction) {
                    await supabase.from("resident_note_reactions").delete().eq("id", existing.id);
                    return NextResponse.json({ action: "removed" });
                } else {
                    await supabase.from("resident_note_reactions").update({ reaction }).eq("id", existing.id);
                    return NextResponse.json({ action: "changed" });
                }
            } else {
                await supabase.from("resident_note_reactions").insert({ note_id: noteId, author_id: user.id, reaction });
                return NextResponse.json({ action: "added" });
            }
        }

        if (resource === "resident_note_pin") {
            const { noteId } = payload;
            if (!noteId) return NextResponse.json({ error: "Missing noteId" }, { status: 400 });
            const { data: note } = await supabase
                .from("resident_notes")
                .select("is_pinned")
                .eq("id", noteId)
                .single();
            const newPinned = !note?.is_pinned;
            const { error } = await supabase
                .from("resident_notes")
                .update({ is_pinned: newPinned })
                .eq("id", noteId);
            if (error) throw error;
            return NextResponse.json({ is_pinned: newPinned });
        }

        // ── Documents ────────────────────────────────────────────────────────

        const body = payload;

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
