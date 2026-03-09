"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

import PublishListingButton from "./publish-listing-button";
import UpdateDevelopmentListingButton from "./update-development-listing-status-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDevelopmentListing } from "@/context/development-listing-context";
import { getListingStatus, getListingStatusMapping } from "@/lib/utils";

export default function ListingItemHeader() {
  const { isLoading, data, completion } = useDevelopmentListing();

  return (
    <div className="py-8 px-5 pb-0 flex flex-row items-center gap-5">
      <Link
        className="bg-transparent hover:bg-transparent"
        href="/dashboard/listing"
      >
        <ArrowLeftIcon className="w-5 h-5" color="#26045D" />
      </Link>
      {isLoading ? (
        <Skeleton className="h-6 w-[100px]" />
      ) : (
        <div className="w-full flex  items-center justify-between">
          <div className="flex items-center gap-6 text-[#26045D]">
            <h1 className="font-medium text-[24px] text-[#26045D]">
              {data?.development_name}
            </h1>
            <div className="flex items-center gap-2 bg-[#E5DAFB] text-[#7114E2] px-3 py-1 rounded-full">
              {getListingStatus(
                data!.rightmove_status!,
                "text-medium text-base",
              )}
              {getListingStatusMapping(data!.rightmove_status!).label ===
                "Draft" && `(${completion?.percentage}%)`}
            </div>
          </div>
          {!data?.rightmove_status && <PublishListingButton />}
          {data?.rightmove_status && <UpdateDevelopmentListingButton />}
        </div>
      )}
    </div>
  );
}
