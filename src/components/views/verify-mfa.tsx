"use client";

import { VerifyMFAForm } from "../form/verify-mfa-form";

export function VerifyMFAView() {
  return (
    <div className="bg-transparent mb-20 flex flex-col items-center pt-10 px-4">
      <div className="max-w-xl p-4 bg-transparent">
        <h1 className="text-2xl font-bold text-center text-[#26045D]">
          Verify Your Account
        </h1>
        <p className="text-sm text-start text-gray-600 mb-6">
          Enter the 6-digit code from your authenticator app to verify your
          identity.
        </p>
        <VerifyMFAForm />
      </div>
    </div>
  );
}
