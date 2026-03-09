import { NextRequest, NextResponse } from "next/server";

import { createVerificationToken, findUserByEmail } from "@/services/user";
import { MessageEvent } from "@/types/klaviyo";
import { sendEvent, upsertContact } from "@/utils/klaviyo";
import { createClient } from "@/utils/supabase/server";
import { validateRequiredFields } from "@/validators/requiredFieldsValidator";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const body = await request.json();

  const { email } = body;

  const requiredFieldsValidation = validateRequiredFields([
    { name: "email", value: email },
  ]);

  if (requiredFieldsValidation) {
    return NextResponse.json(
      { error: requiredFieldsValidation },
      { status: 400 },
    );
  }

  try {
    const { data: user } = await findUserByEmail(supabase, email);

    if (user?.id) {
      const { data: verificationToken, error: verificationTokenError } =
        await createVerificationToken(supabase, user?.id);

      if (verificationTokenError) {
        return NextResponse.json(
          { error: `${verificationTokenError.message}.` },
          { status: 500 },
        );
      }
      await upsertContact(email, {
        resetPasswordToken: verificationToken,
      });

      await sendEvent(email, MessageEvent.USER_FORGOT_PASSWORD, null);
    }

    return NextResponse.json({
      message:
        "A password reset link has been sent to your email address. Please check your inbox.",
    });
  } catch (error) {
    return NextResponse.json({ error: `${error}` }, { status: 500 });
  }
}
