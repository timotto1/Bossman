import { Metadata } from "next";

import { VerifyMFAView } from "@/components/views/verify-mfa";

export const metadata: Metadata = {
  title: "MFA Verification",
};

export default function MFAVerifyPage() {
  return <VerifyMFAView />;
}
