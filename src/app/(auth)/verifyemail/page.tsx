import { Metadata } from "next";

import { VerifyEmail } from "@/components/form/verify-email-form";

export const metadata: Metadata = {
  title: "Account Verification",
};

export default function VerifyEmailPage() {
  return <VerifyEmail />;
}
