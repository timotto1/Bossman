"use client";

import { ChevronDownIcon } from "@heroicons/react/24/outline";

import { SignoutButton } from "./signout-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useUser } from "@/context/user-context";

export function ProfileHeader() {
  const { user } = useUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="text-left flex items-center gap-10 focus:outline-none focus:ring-0 focus:border-0">
        <div className="flex items-center gap-4">
          <div className="uppercase rounded-full text-white text-2xl h-12 w-12 flex items-center justify-center bg-[#26045D]">
            {user?.initials}
          </div>
          <div className="relative">
            <h4 className="text-xl text-[#26045D]">{user?.companyName}</h4>
            <h6 className="text-[#87858E]">{user?.name}</h6>
          </div>
        </div>
        <ChevronDownIcon className="w-6 h-6 text-[#87858E]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <SignoutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
