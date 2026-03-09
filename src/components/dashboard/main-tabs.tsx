"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function MainTabs({
  tabs, // Array of main tabs
  defaultTab, // Default main tab value
  renderContent, // Function to render tab-specific content
}: {
  tabs: Array<{ value: string; label: string; href: string }>;
  defaultTab: string;
  renderContent: (tab: string) => JSX.Element;
}) {
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get("t") ?? defaultTab;

  return (
    <Tabs value={currentTab} defaultValue={currentTab}>
      <div className="flex items-center border-b pb-4">
        <TabsList className="bg-transparent w-full sm:w-auto px-5">
          {tabs.map((tab) => (
            <Link key={tab.value} href={tab.href}>
              <TabsTrigger
                value={tab.value}
                className="text-[12px] leading-5 text-center text-[#D6D5D7] data-[state=active]:text-[#AE78F1] data-[state=active]:bg-[#F4F0FE] data-[state=active]:shadow-none data-[state=active]:rounded-full"
              >
                {tab.label}
              </TabsTrigger>
            </Link>
          ))}
        </TabsList>
      </div>
      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className="py-6 space-y-10"
        >
          {renderContent(tab.value)}
        </TabsContent>
      ))}
    </Tabs>
  );
}
