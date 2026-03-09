"use client";

import { useCallback, useEffect, useState } from "react";

import { allListingsColumns } from "./table-columns";
import { DataTable } from "@/components/table/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/context/user-context";
import { createClient } from "@/utils/supabase/client";

export default function AllListingsTable() {
  const supabase = createClient();

  const { user } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [allListings, setAllListings] = useState([]);
  const [unitsOccupied, setUnitsOccupied] = useState(0);

  const getPlatformUnitsAnalytics = useCallback(async () => {
    const { data: analyticsData, error: analyticsError } = await supabase.rpc(
      `platform_listing_analytics`,
      {
        company_id: user?.companyID,
      },
    );

    if (analyticsError) throw new Error(analyticsError.message);

    setUnitsOccupied(analyticsData?.[0]?.total_occupied_units);
  }, [supabase, user]);

  const getAllListingsData = useCallback(
    async (provider: number) => {
      const { data, error } = await supabase.rpc(`platform_all_listings`, {
        provider,
      });

      if (error) throw new Error(error.message);

      setAllListings(data);
    },
    [supabase],
  );

  const loadListingsData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        getAllListingsData(user!.providerID),
        getPlatformUnitsAnalytics(),
      ]);
    } catch (error) {
      console.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [getAllListingsData, getPlatformUnitsAnalytics, user]);

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
          columns={allListingsColumns}
          data={allListings}
          isLoading={isLoading}
          searchPlaceholder={`Search for specific development name`}
          title={
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium text-[#26045D]">
                Units occupied
              </h2>
              <div className="bg-[#F4F0FE] py-[2px] px-2 text-xs text-[#AE78F1] max-w-fit rounded-full">
                {unitsOccupied} unit
                {unitsOccupied > 1 ? "s " : " "}occupied
              </div>
            </div>
          }
        />
      </CardContent>
    </Card>
  );
}
