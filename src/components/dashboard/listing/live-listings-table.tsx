"use client";

import { useCallback, useEffect, useState } from "react";

import { liveListingColumns } from "./table-columns";
import { DataTable } from "@/components/table/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/context/user-context";
import { createClient } from "@/utils/supabase/client";

export default function LiveListingsTable() {
  const supabase = createClient();

  const { user } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [liveListings, setLiveListings] = useState([]);

  const getLiveListingsData = useCallback(
    async (companyID: string) => {
      const { data, error } = await supabase.rpc(`platform_live_listings`, {
        company_id: companyID,
      });

      if (error) throw new Error(error.message);

      setLiveListings(data);
    },
    [supabase],
  );

  const loadListingsData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([getLiveListingsData(user!.companyID)]);
    } catch (error) {
      console.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [getLiveListingsData, user]);

  useEffect(() => {
    loadListingsData();
  }, [loadListingsData]);

  return (
    <Card className="rounded-lg border-[#EEEEEE] bg-white">
      <CardContent className="p-4 relative">
        <DataTable
          showTotal={false}
          showSearchFilter={true}
          showFilter={false}
          showColumnToggle={true}
          showExport={true}
          columns={liveListingColumns}
          data={liveListings}
          isLoading={isLoading}
          searchPlaceholder={`Search for specific listing`}
          title={
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium text-[#26045D]">
                Live listings
              </h2>
              <div className="bg-[#F4F0FE] py-[2px] px-2 text-xs text-[#AE78F1] max-w-fit rounded-full">
                {liveListings.length} live listing
                {liveListings.length > 1 ? "s " : " "}
              </div>
            </div>
          }
        />
      </CardContent>
    </Card>
  );
}
