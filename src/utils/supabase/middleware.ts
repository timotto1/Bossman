import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map(({ name, value }) => ({
            name,
            value,
          }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: assuranceLevel } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (assuranceLevel?.currentLevel === "aal1") {
      await supabase.auth.refreshSession();

      const nextLevel = (
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      ).data?.nextLevel;

      if (nextLevel === "aal2") {
        // User has MFA but hasn't verified
        if (!request.nextUrl.pathname.startsWith("/mfa/verify")) {
          return NextResponse.redirect(new URL("/mfa/verify", request.url));
        }
      } else {
        // User hasn’t setup MFA yet
        if (!request.nextUrl.pathname.startsWith("/mfa/enroll")) {
          return NextResponse.redirect(new URL("/mfa/enroll", request.url));
        }
      }
    } else if (assuranceLevel?.currentLevel === "aal2") {
      // Restrict access to allowed routes
      if (
        !request.nextUrl.pathname.startsWith("/api") &&
        !request.nextUrl.pathname.startsWith("/dashboard") &&
        !request.nextUrl.pathname.startsWith("/valuation") &&
        !request.nextUrl.pathname.startsWith("/listing") &&
        !request.nextUrl.pathname.startsWith("/listing/create") &&
        !request.nextUrl.pathname.startsWith("/listing/request")
      ) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return response;
}
