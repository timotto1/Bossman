"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useParams } from "next/navigation";

import UpdateUnitListingStatusButton from "./update-unit-listing-status-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUnitListing } from "@/context/unit-listing-context";
import { getListingStatus } from "@/lib/utils";

export default function UnitListingHeader() {
  const params = useParams();

  const { isLoading, data } = useUnitListing();

  const renderAddress = () => {
    return [data?.address_1, data?.address_2, data?.address_3, data?.postcode]
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="py-8 px-5 pb-0 flex flex-row items-center gap-5">
      <Link
        href={`/dashboard/listing/${params.id}`}
        className="bg-transparent hover:bg-transparent p-2 rounded-full"
      >
        <ArrowLeftIcon className="w-5 h-5" color="#26045D" />
      </Link>
      {isLoading ? (
        <Skeleton className="h-6 w-[100px]" />
      ) : (
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-6 text-[#26045D]">
            <h1 className="font-medium text-[24px] text-[#26045D]">
              {renderAddress()}
            </h1>
            <div className="flex items-center gap-2 bg-[#E5DAFB] text-[#7114E2] px-3 py-1 rounded-full">
              {getListingStatus(
                data!.rightmove_status!,
                "text-medium text-base",
              )}
            </div>
          </div>
          <UpdateUnitListingStatusButton />
        </div>
      )}
    </div>
  );
}
