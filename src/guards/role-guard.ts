import { NextRequest, NextResponse } from "next/server";

import { createClient } from "../utils/supabase/server";

const unauthorizedPages: Record<string, string[]> = {
  user: ["/valuation"],
};

const getRoleName = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: roleData, error: roleErr } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("user_id", user?.id)
      .maybeSingle();
    if (roleErr) throw roleErr;

    const { data: roleDetail, error: permsErr } = await supabase
      .from("roles")
      .select(`name`)
      .eq("id", roleData?.role_id)
      .maybeSingle();
    if (permsErr) throw permsErr;

    return roleDetail?.name;
  }

  return null;
};

export const checkRoleGuard = async (
  request: NextRequest,
  response: NextResponse,
) => {
  const role = await getRoleName();
  if (role) {
    const isBlocked = unauthorizedPages[role]?.some((route) =>
      request.nextUrl.pathname.startsWith(route),
    );
    if (isBlocked) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return response;
};
