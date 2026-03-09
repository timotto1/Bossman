import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  addPasswordToPasswordHistory,
  checkPasswordHistory,
  markVerificationTokenAsUsed,
  updateUserPassword,
  validateVerificationToken,
} from "@/services/user";
import { createClient } from "@/utils/supabase/server";
import { validateRequiredFields } from "@/validators/requiredFieldsValidator";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must include at least one uppercase letter")
      .regex(/[a-z]/, "Password must include at least one lowercase letter")
      .regex(/[0-9]/, "Password must include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const token = request.nextUrl.searchParams.get("token")!;
  const setup = request.nextUrl.searchParams.get("setup")!;

  const body = await request.json();

  const { password, confirmPassword } = resetPasswordSchema.parse(body);

  const requiredFieldsValidation = validateRequiredFields([
    { name: "password", value: password },
    { name: "confirmPassword", value: confirmPassword },
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

    const { data: isInPasswordHistory } = await checkPasswordHistory(
      supabase,
      verificationTokenData?.user_id,
      password,
    );

    if (isInPasswordHistory) {
      return NextResponse.json(
        {
          error: `New password cannot be the same as any of the previous passwords.`,
        },
        { status: 500 },
      );
    }

    const { error: updateUserPasswordError } = await updateUserPassword(
      supabase,
      verificationTokenData?.user_id,
      password,
    );

    if (updateUserPasswordError) {
      return NextResponse.json(
        { error: `${updateUserPasswordError.message}.` },
        { status: 500 },
      );
    }

    if (!setup) {
      await markVerificationTokenAsUsed(supabase, token);
    }

    await addPasswordToPasswordHistory(
      supabase,
      verificationTokenData?.user_id,
      password,
    );

    return NextResponse.json({
      message: "Password has been changed successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: `${error}` }, { status: 500 });
  }
}
