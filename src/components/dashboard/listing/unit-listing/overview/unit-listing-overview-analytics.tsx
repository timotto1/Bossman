"use client";

import UnitListingFullMarketValue from "./unit-listing-full-market-value";
import UnitListingMonthlyRent from "./unit-listing-monthly-rent";
import UnitListingServiceCharge from "./unit-listing-service-charge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUnitListing } from "@/context/unit-listing-context";

export default function UnitListingOverviewAnalytics() {
  const { data, isLoading } = useUnitListing();

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
        <UnitListingFullMarketValue />

        <UnitListingMonthlyRent />

        <UnitListingServiceCharge />

        <Card className="rounded-[12px]">
          <CardContent className="px-4 py-6">
            <div className="flex items-center justify-between flex-col gap-2">
              <p className="text-[32px] font-medium leading-8 text-[#4E1A8F]">
                {new Date(data!.created_at!).toLocaleDateString("en-GB", {
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {isLoading ? renderSkeleton() : renderCards()}
    </div>
  );
}
