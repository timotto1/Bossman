"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/context/user-context";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils";
import { createClient } from "@/utils/supabase/client";

export function ListingAnalytics() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const { user } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  // const [unitsTotal, setUnitsTotal] = useState(0);
  // const [unitsOccupied, setUnitsOccupied] = useState(0);
  const [salesPipeline, setSalesPipeline] = useState(0);
  const [draftListings, setDraftListings] = useState(0);
  const [liveListings, setLiveListings] = useState(0);
  const [unlistedUnits, setUnlistedUnits] = useState(0);

  const [changeData, setChangeData] = useState({
    occupancy_rate_pct_change: 0,
    draft_listings_pct_change: 0,
    live_listings_pct_change: 0,
    unlisted_listings_pct_change: 0,
    sales_pipeline_pct_change: 0,
  });

  const getPlatformUnitsAnalyticsChange = useCallback(async () => {
    const { data: analyticsData, error: analyticsError } = await supabase.rpc(
      `platform_listings_analytics_change`,
      {
        company_id: user?.companyID,
      },
    );

    if (analyticsError) throw new Error(analyticsError.message);

    setChangeData(analyticsData);
  }, [supabase, user]);

  const getPlatformUnitsAnalytics = useCallback(async () => {
    setIsLoading(true);
    const { data: analyticsData, error: analyticsError } = await supabase.rpc(
      `platform_listing_analytics`,
      {
        company_id: user?.companyID,
      },
    );

    if (analyticsError) throw new Error(analyticsError.message);

    const {
      // total_occupied_units,
      total_sales_pipeline,
      // total_units_count,
      total_draft_listings,
      total_live_listings,
      total_unlisted_listings,
    } = analyticsData[0];

    // setUnitsOccupied(total_occupied_units);
    // setUnitsTotal(total_units_count);
    setSalesPipeline(total_sales_pipeline);
    setDraftListings(total_draft_listings);
    setLiveListings(total_live_listings);
    setUnlistedUnits(total_unlisted_listings);
  }, [supabase, user]);

  const initializeData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        getPlatformUnitsAnalytics(),
        getPlatformUnitsAnalyticsChange(),
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [getPlatformUnitsAnalytics, getPlatformUnitsAnalyticsChange]);

  const renderChange = (change: number) => (
    <div className="flex gap-2 items-center justify-center">
      {change && (
        <div
          className={`py-[2px] px-2 text-xs max-w-fit rounded-full flex gap-1 ${
            change > 0
              ? "bg-[#ECFDF3] text-[#027A48]"
              : "bg-[#FEF3F2] text-[#B42318]"
          }`}
        >
          {change > 0 ? (
            <ArrowUpIcon className="w-3 h-3" />
          ) : (
            <ArrowDownIcon className="w-3 h-3" />
          )}
          {change}%
        </div>
      )}
      <p className="text-xs text-[#87858E]">
        {!change ? "no change" : change > 0 ? "more" : "less"} than last month
      </p>
    </div>
  );

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {isLoading ? (
        [...Array(5)].map((_, index) => (
          <Card key={index} className="rounded-lg">
            <CardContent className="px-4 py-6">
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-8 w-1/4" />
            </CardContent>
          </Card>
        ))
      ) : (
        <>
          <Link href="/dashboard/listing?filter=draft">
            <Card
              className={cn(
                "rounded-[12px] cursor-pointer",
                !searchParams.get("filter") && "border-[#7114E2] border",
              )}
            >
              <CardContent className="px-4 py-6">
                <div className="flex flex-col gap-1 md:text-center">
                  <p className="text-[32px] font-medium leading-8 text-[#4E1A8F]">
                    {draftListings}
                  </p>
                  <h3 className="text-[14px] font-normal leading-5 text-[#26045D]">
                    Draft listings
                  </h3>
                  {renderChange(changeData?.draft_listings_pct_change)}
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/listing?filter=live">
            <Card
              className={cn(
                "rounded-[12px] cursor-pointer",
                searchParams.get("filter") === "live" &&
                  "border-[#7114E2] border",
              )}
            >
              <CardContent className="px-4 py-6">
                <div className="flex flex-col gap-1 md:text-center">
                  <p className="text-[32px] font-medium leading-8 text-[#4E1A8F]">
                    {liveListings}
                  </p>
                  <h3 className="text-[14px] font-normal leading-5 text-[#26045D]">
                    Live listings
                  </h3>
                  {renderChange(changeData?.live_listings_pct_change)}
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/listing?filter=unlisted">
            <Card
              className={cn(
                "rounded-[12px] cursor-pointer",
                searchParams.get("filter") === "unlisted" &&
                  "border-[#7114E2] border",
              )}
            >
              <CardContent className="px-4 py-6">
                <div className="flex flex-col gap-1 md:text-center">
                  <p className="text-[32px] font-medium leading-8 text-[#4E1A8F]">
                    {unlistedUnits}
                  </p>
                  <h3 className="text-[14px] font-normal leading-5 text-[#26045D]">
                    Unlisted units
                  </h3>
                  {renderChange(changeData?.unlisted_listings_pct_change)}
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/listing?filter=sales_pipeline">
            <Card
              className={cn(
                "rounded-[12px] cursor-pointer",
                searchParams.get("filter") === "sales_pipeline" &&
                  "border-[#7114E2] border",
              )}
            >
              <CardContent className="px-4 py-6">
                <div className="flex flex-col items-center justify-center gap-1">
                  <p className="text-[32px] font-medium leading-8 text-[#4E1A8F]">
                    £{formatCurrency(salesPipeline)}
                  </p>
                  <h3 className="text-[14px] font-normal leading-5 text-[#26045D]">
                    Sales pipeline
                  </h3>
                  {renderChange(changeData?.sales_pipeline_pct_change)}
                </div>
              </CardContent>
            </Card>
          </Link>
        </>
      )}
    </div>
  );
}
