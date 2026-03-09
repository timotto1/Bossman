"use client";

import { useState } from "react";
import {
  AdjustmentsVerticalIcon,
  FolderArrowDownIcon,
  MagnifyingGlassIcon,
  ViewColumnsIcon,
} from "@heroicons/react/24/solid";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UnitSearchFilter() {
  const [searchFilter, setSearchFilter] = useState("");

  return (
    <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:items-center lg:space-x-6 pb-3 w-full">
      <div className="relative flex-1">
        <div className="absolute right-3 flex h-11 w-8 items-center">
          <MagnifyingGlassIcon className="w-5 h-5" color="#26045D" />
        </div>
        <Input
          placeholder="Search for specific unit"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="h-11 w-full pr-8 text-xs font-normal leading-4 text-left border-[#26045D] focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      <Button
        type="button"
        className="bg-[#F0F0FE] hover:bg-[#F0F0FE] rounded-full max-w-[184px] w-full text-sm font-medium leading-5 text-left text-[#26045D]"
      >
        <AdjustmentsVerticalIcon className="h-6 w-6" />
        Filter
      </Button>
      <Button
        type="button"
        className="bg-[#F0F0FE] hover:bg-[#F0F0FE] rounded-full max-w-[184px] w-full text-sm font-medium leading-5 text-left text-[#26045D]"
      >
        <ViewColumnsIcon className="h-6 w-6" />
        Columns
      </Button>
      <Button
        type="button"
        className="bg-[#F0F0FE] hover:bg-[#F0F0FE] rounded-full max-w-[184px] w-full text-sm font-medium leading-5 text-left text-[#26045D]"
      >
        <FolderArrowDownIcon className="h-6 w-6" />
        Export
      </Button>
    </div>
  );
}
