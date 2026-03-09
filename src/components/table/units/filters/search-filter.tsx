"use client";

import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

import { Input } from "@/components/ui/input";

export function UnitSearchFilter() {
  const [searchFilter, setSearchFilter] = useState("");

  return (
    <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:items-center lg:space-x-6 pb-3">
      <div className="relative flex-1 max-w-[300px]">
        <div className="absolute right-3 flex h-11 w-8 items-center">
          <MagnifyingGlassIcon className="w-5 h-5 text-[#26045D]" />
        </div>
        <Input
          placeholder="Search for specific unit"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="h-11 w-full pr-8 text-xs font-normal leading-4 text-left border-[#26045D] focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      {/* <Button className="bg-[#F0F0FE] text-[#26045D] rounded-full">
        <AdjustmentsVerticalIcon className="w-5 h-5" />
        Filter
      </Button>
      <Button className="bg-[#F0F0FE] text-[#26045D] rounded-full">
        <ViewColumnsIcon className="w-5 h-5" />
        Columns
      </Button>
      <Button className="bg-[#F0F0FE] text-[#26045D] rounded-full">
        <FolderArrowDownIcon className="w-5 h-5" />
        Export
      </Button> */}
    </div>
  );
}
