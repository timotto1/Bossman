"use client";

import { useCallback, useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDevelopmentListing } from "@/context/development-listing-context";

export default function ListingEnquiriesAnalytics() {
  const { data } = useDevelopmentListing();

  const [isLoading, setIsLoading] = useState(true);

  const isLive = !data?.rightmove_status ? false : true;

  const renderSkeleton = () => {
    return [...Array(6)].map((_, index) => (
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
              <h3 className="text-[14px] font-normal leading-5 text-[#757575]">
                Total times in search results
              </h3>
              <p className="text-[24px] font-medium leading-8 text-[#4E1A8F]">
                {!isLive ? "-" : "3,156"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px]">
          <CardContent className="px-4 py-6">
            <div className="flex flex-col items-center justify-between gap-2">
              <h3 className="text-[14px] font-normal leading-5 text-[#757575]">
                Times in a search results first page
              </h3>
              <p className="text-[24px] font-medium leading-8 text-[#4E1A8F]">
                {!isLive ? "-" : 540}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px]">
          <CardContent className="px-4 py-6">
            <div className="flex flex-col items-center justify-between gap-2">
              <h3 className="text-[14px] font-normal leading-5 text-[#757575]">
                Total views
              </h3>
              <p className="text-[24px] font-medium leading-8 text-[#4E1A8F]">
                {!isLive ? "-" : 230}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px]">
          <CardContent className="px-4 py-6">
            <div className="flex flex-col items-center justify-between gap-2">
              <h3 className="text-[14px] font-normal leading-5 text-[#757575]">
                Unique views
              </h3>
              <p className="text-[24px] font-medium leading-8 text-[#4E1A8F]">
                {!isLive ? "-" : 223}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px]">
          <CardContent className="px-4 py-6">
            <div className="flex flex-col items-center justify-between gap-2">
              <h3 className="text-[14px] font-normal leading-5 text-[#757575]">
                Total enquiries mode
              </h3>
              <p className="text-[24px] font-medium leading-8 text-[#4E1A8F]">
                {!isLive ? "-" : 4}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px]">
          <CardContent className="px-4 py-6">
            <div className="flex flex-col items-center justify-between gap-2">
              <h3 className="text-[14px] font-normal leading-5 text-[#757575]">
                Unique enquiries
              </h3>
              <p className="text-[24px] font-medium leading-8 text-[#4E1A8F]">
                {!isLive ? "-" : 3}
              </p>
            </div>
          </CardContent>
        </Card>
      </>
    );
  };

  const getEnquiriesAnalytics = useCallback(async () => {
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getEnquiriesAnalytics();
  }, [getEnquiriesAnalytics]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {isLoading ? renderSkeleton() : renderCards()}
    </div>
  );
}
