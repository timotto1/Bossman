"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/utils/supabase/client";

type ListingItemAnalytics = {
  full_market_value?: number;
  ground_rent?: number;
  monthly_rent?: number;
  service_charge?: number;
  date_listing_created?: string;
};

export default function ListingOverviewAnalytics() {
  const params = useParams();

  const [isLoading, setIsLoading] = useState(true);

  const [listingItemAnalytics, setListingItemAnalytics] =
    useState<ListingItemAnalytics | null>(null);

  const renderSkeleton = () => {
    return [...Array(4)].map((_, index) => (
      <Card key={index} className="rounded-xl">
        <CardContent className="px-4 py-6">
          <Skeleton className="h-6 w-1/2 mb-2" />
          <Skeleton className="h-8 w-1/4" />
        </CardContent>
      </Card>
    ));
  };

  const renderCards = () => {
    return (
      <>
        <Card className="rounded-[12px]">
          <CardContent className="px-4 py-6">
            <div className="flex flex-col items-center justify-between gap-2">
              <p className="text-[32px] font-medium leading-8 text-[#4E1A8F]">
                £
                {(listingItemAnalytics?.full_market_value || 0)?.toLocaleString(
                  "en-GB",
                  {
                    maximumFractionDigits: 2,
                  },
                )}
              </p>
              <h3 className="text-[14px] font-normal leading-5 text-[#26045D]">
                Full market value
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px]">
          <CardContent className="px-4 py-6">
            <div className="flex flex-col items-center justify-between gap-2">
              <p className="text-[32px] font-medium leading-8 text-[#4E1A8F]">
                £
                {(listingItemAnalytics?.monthly_rent || 0)?.toLocaleString(
                  "en-GB",
                  {
                    maximumFractionDigits: 2,
                  },
                )}
              </p>
              <h3 className="text-[14px] font-normal leading-5 text-[#26045D]">
                Monthly rent
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px]">
          <CardContent className="px-4 py-6">
            <div className="flex items-center justify-between flex-col gap-2">
              <p className="text-[32px] font-medium leading-8 text-[#4E1A8F]">
                £
                {(listingItemAnalytics?.service_charge || 0)?.toLocaleString(
                  "en-GB",
                  {
                    maximumFractionDigits: 2,
                  },
                )}
              </p>
              <h3 className="text-[14px] font-normal leading-5 text-[#26045D]">
                Service charge
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px]">
          <CardContent className="px-4 py-6">
            <div className="flex items-center justify-between flex-col gap-2">
              <p className="text-[32px] font-medium leading-8 text-[#4E1A8F]">
                {new Date(
                  listingItemAnalytics!.date_listing_created!,
                ).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <h3 className="text-[14px] font-normal leading-5 text-[#26045D]">
                Date listing created
              </h3>
            </div>
          </CardContent>
        </Card>
      </>
    );
  };

  const getListingItemAnalytics = useCallback(async () => {
    setIsLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.rpc(
        `development_listing_item_analytics`,
        {
          development_id: params?.id,
        },
      );

      if (error) throw new Error(error.message);

      setListingItemAnalytics(data?.[0]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [params?.id]);

  useEffect(() => {
    getListingItemAnalytics();
  }, [getListingItemAnalytics]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {isLoading ? renderSkeleton() : renderCards()}
    </div>
  );
}
