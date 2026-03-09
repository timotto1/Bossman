"use client";

import { ActiveTransactionsTable } from "./active-transactions-table";
import { TransactionGrids } from "./transaction-grids";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/context/user-context";

export function ActiveTransactionsTab() {
  const { showMyCases, setShowMyCases } = useUser();

  return (
    <Tabs
      value={showMyCases ? "my-cases" : "all-cases"}
      onValueChange={(val) => setShowMyCases(val === "my-cases")}
    >
      <TabsList className="bg-transparent">
        <TabsTrigger
          value="all-cases"
          className="cursor-pointer py-[2px] px-2 text-xs max-w-fit rounded-full bg-white border border-[#D6D5D7] text-[#D6D5D7] data-[state=active]:bg-[#F4F0FE] data-[state=active]:text-[#AE78F1] data-[state=active]:border-none mr-2"
        >
          All cases
        </TabsTrigger>
        <TabsTrigger
          value="my-cases"
          className="cursor-pointer py-[2px] px-2 text-xs max-w-fit rounded-full bg-white border border-[#D6D5D7] text-[#D6D5D7] data-[state=active]:bg-[#F4F0FE] data-[state=active]:text-[#AE78F1] data-[state=active]:border-none"
        >
          My cases
        </TabsTrigger>
      </TabsList>
      <TabsContent value="all-cases" className="space-y-4">
        <TransactionGrids />
        <ActiveTransactionsTable />
      </TabsContent>
      <TabsContent value="my-cases" className="space-y-4">
        <TransactionGrids isMyCases />
        <ActiveTransactionsTable isMyCases />
      </TabsContent>
    </Tabs>
  );
}
