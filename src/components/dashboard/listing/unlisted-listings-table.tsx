"use client";

import { useCallback, useEffect, useState } from "react";

import { unlistedListingColumns } from "./table-columns";
import { DataTable } from "@/components/table/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/context/user-context";
import { createClient } from "@/utils/supabase/client";

export default function UnlistedListingsTable() {
  const supabase = createClient();

  const { user } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [unlistedListings, setUnlistedListings] = useState([]);

  const getUnlistedListingsData = useCallback(
    async (companyID: string) => {
      const { data, error } = await supabase.rpc(`platform_unlisted_listings`, {
        company_id: companyID,
      });

      if (error) throw new Error(error.message);

      setUnlistedListings(data);
    },
    [supabase],
  );

  const loadListingsData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([getUnlistedListingsData(user!.companyID)]);
    } catch (error) {
      console.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [getUnlistedListingsData, user]);

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
          columns={unlistedListingColumns}
          data={unlistedListings}
          isLoading={isLoading}
          searchPlaceholder={`Search for specific development name`}
          title={
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium text-[#26045D]">
                Unlisted listings
              </h2>
              <div className="bg-[#F4F0FE] py-[2px] px-2 text-xs text-[#AE78F1] max-w-fit rounded-full">
                {unlistedListings.length} unlisted listing
                {unlistedListings.length > 1 ? "s " : " "}
              </div>
            </div>
          }
        />
      </CardContent>
    </Card>
  );
}
