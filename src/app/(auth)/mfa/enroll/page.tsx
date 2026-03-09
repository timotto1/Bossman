import { Metadata } from "next";

import { EnrollMFAView } from "@/components/views/enroll-mfa";

export const metadata: Metadata = {
  title: "MFA Enrollment",
};

export default function MFAVerifyPage() {
  return <EnrollMFAView />;
}
