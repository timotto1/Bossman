import { Metadata } from "next";

import { ResetPasswordPageView } from "@/components/views/reset-password";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <ResetPasswordPageView token={token} />;
}
