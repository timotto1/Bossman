import { Dispatch, SetStateAction } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

import { Input } from "@/components/ui/input";

interface SearchFilterProps {
  searchFilter: string;
  setSearchFilter: Dispatch<SetStateAction<string>>;
}

export function SearchFilter({
  searchFilter,
  setSearchFilter,
}: SearchFilterProps) {
  return (
    <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:items-center lg:space-x-6 pb-3">
      <div className="relative flex-1 max-w-[350px]">
        <div className="absolute right-3 flex h-11 w-8 items-center">
          <MagnifyingGlassIcon className="w-5 h-5" color="#26045D" />
        </div>
        <Input
          placeholder="Resident Search"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="h-11 w-full pr-8 text-xs font-normal leading-4 text-left border-[#26045D] focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
    </div>
  );
}
