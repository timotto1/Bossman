"use client";

import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/solid";

import CreateListingModal from "./create-listing/create-listing-modal";
import { Button } from "@/components/ui/button";

export default function ListingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="py-4 px-8 flex justify-between items-center border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-medium leading-8 text-[#26045D]">
            Active Listings
          </h1>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 text-white px-6 text-sm rounded-[10px] h-8 bg-[#26045D]"
        >
          <PlusIcon className="w-5 h-5 text-white" />
          New listing
        </Button>
      </div>
      <CreateListingModal
        open={open}
        handleOpenChange={(open) => setOpen(open)}
      />
    </>
  );
}
