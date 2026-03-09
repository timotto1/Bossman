import { NextRequest, NextResponse } from "next/server";

import { validateVerificationToken } from "@/services/user";
import { createClient } from "@/utils/supabase/server";
import { validateRequiredFields } from "@/validators/requiredFieldsValidator";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const token = request.nextUrl.searchParams.get("token")!;

  const requiredFieldsValidation = validateRequiredFields([
    { name: "token", value: token },
  ]);

  if (requiredFieldsValidation) {
    return NextResponse.json(
      { error: requiredFieldsValidation },
      { status: 400 },
    );
  }

  try {
    const { data: verificationTokenData, error: verificationTokenError } =
      await validateVerificationToken(supabase, token);

    if (verificationTokenError) {
      return NextResponse.json(
        { error: `${verificationTokenError.message}.` },
        { status: 500 },
      );
    }

    if (!verificationTokenData) {
      return NextResponse.json(
        { error: "Token is invalid, expired, or already used." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Token is valid",
    });
  } catch (error) {
    return NextResponse.json({ error: `${error}` }, { status: 500 });
  }
}
