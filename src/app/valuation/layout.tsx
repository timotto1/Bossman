import { Suspense } from "react";

import { ValuationHeader } from "@/components/valuation/valuation-header";
import { UserProvider } from "@/context/user-context";

export default function ValuationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserProvider>
      <div className={`flex flex-col min-h-screen bg-[#FFFEFA]`}>
        <ValuationHeader />
        <Suspense>{children}</Suspense>
      </div>
    </UserProvider>
  );
}
