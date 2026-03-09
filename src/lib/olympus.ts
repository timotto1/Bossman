import { createClient } from "@/utils/supabase/server";

/**
 * Helper: get authenticated user and their company_id
 */
async function olympus_get_user_company() {
    const supabase = await createClient();

    // ✅ Securely fetch user from Supabase Auth server
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) throw new Error("Unauthorized");

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();

    if (profileError || !profile) throw new Error("Profile not found");
    return { user, company_id: profile.company_id };
}

/**
 * Company fetch — company 2 can see all, others see own
 */
export async function olympus_companies() {
    const supabase = await createClient();
    const { company_id } = await olympus_get_user_company();

    const query = supabase.from("company").select("id, name").order("name");
    if (company_id !== 2) query.eq("id", company_id);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

/**
 * Case manager fetch — company 2 can see all, others only own
 */
export async function olympus_case_managers(selectedCompanyId?: string) {
    const supabase = await createClient();
    const { company_id: userCompanyId } = await olympus_get_user_company();

    let query = supabase
        .from("case_managers")
        .select("first_name, last_name, case_manager_name, company_id")
        .order("first_name", { ascending: true });

    if (userCompanyId === 2 && selectedCompanyId) {
        query = query.eq("company_id", selectedCompanyId);
    } else if (userCompanyId !== 2) {
        query = query.eq("company_id", userCompanyId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}
