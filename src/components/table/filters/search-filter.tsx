import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

import { Input } from "@/components/ui/input";

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchFilter({
  value,
  onChange,
  placeholder,
}: SearchFilterProps) {
  return (
    <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:items-center lg:space-x-6">
      <div className="relative flex-1">
        <div className="absolute left-3 flex h-11 w-8 items-center">
          <MagnifyingGlassIcon className="w-5 h-5" color="#87858E" />
        </div>
        <Input
          placeholder={placeholder || "Search"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-28 pl-10 text-sm font-normal leading-4 text-left border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-sm placeholder:text-[#87858E]"
        />
      </div>
    </div>
  );
}
