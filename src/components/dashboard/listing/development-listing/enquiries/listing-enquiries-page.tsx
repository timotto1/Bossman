"use client";

import PublishListingButton from "../publish-listing-button";
import ListingEnquiriesAnalytics from "./listing-enquiries-analytics";
import EnquiriesTable from "@/components/dashboard/enquiries/enquiries-table";
import { useDevelopmentListing } from "@/context/development-listing-context";

export default function ListingEnquiriesPage() {
  const { data } = useDevelopmentListing();

  const isLive = !data?.rightmove_status ? false : true;

  return (
    <div className="px-5 py-4 space-y-6">
      <ListingEnquiriesAnalytics />
      {isLive ? (
        <EnquiriesTable />
      ) : (
        <div className="min-h-[300px] flex flex-col items-center justify-center gap-2">
          <h1 className="font-bold text-[#26045D] text-[14px]">
            Listing is not live yet.
          </h1>
          <p className="font-medium text-[#26045D] text-[14px]">
            Come back here after you’ve publish the listing.
          </p>
          <PublishListingButton />
        </div>
      )}
    </div>
  );
}
