import { Suspense } from "react";
import { redirect } from "next/navigation";

import { DesktopNav } from "@/components/desktop-nav";
import { MobileNav } from "@/components/mobile-nav";
import { SessionTimeoutModal } from "@/components/session-timeout-modal";
import { SessionTimerProvider } from "@/components/session-timer-provider";
import { UserProvider } from "@/context/user-context";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return redirect("/login");
  }

  return (
    <SessionTimerProvider>
      <UserProvider>
        <main className="flex min-h-screen w-full bg-gray-50">
          {/* Mobile-only top bar */}
          <header className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center gap-4 bg-[#160533] px-4 sm:hidden">
            <MobileNav />
          </header>

          <DesktopNav />

          <section className="flex flex-1 flex-col sm:ml-[220px] pt-14 sm:pt-0 min-h-screen bg-gray-50 dark:bg-[#0E0823]">
            <Suspense>{children}</Suspense>
          </section>
        </main>
      </UserProvider>
      <SessionTimeoutModal />
    </SessionTimerProvider>
  );
}
