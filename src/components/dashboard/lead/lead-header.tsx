"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ResidentPersonalInformation } from "@/types/types";

export function LeadHeader(residentData: ResidentPersonalInformation) {
  const router = useRouter();

  return (
    <div className="flex flex-row items-center gap-2 py-2 px-8">
      <Button
        size="icon"
        variant="ghost"
        className="hover:bg-transparent p-2 rounded-full"
        onClick={() => router.back()}
      >
        <ArrowLeftIcon className="w-5 h-5" />
      </Button>

      <h1 className="text-xl font-medium leading-8 text-center text-[#26045D]">
        {residentData?.first_name
          ? `${residentData.first_name} ${residentData.last_name}`
          : "N/A"}
        {residentData?.address ? (
          <>
            {` - `}
            {residentData.address}
          </>
        ) : (
          ""
        )}
      </h1>

      <div className="flex items-center gap-3">
        <div
          className={`w-3 h-3 rounded-full ${residentData?.status?.toLowerCase() === "active" ? "bg-[#00C875]" : "bg-gray-400"}`}
        />
        <p className="text-sm font-medium leading-5 text-center text-[#26045D]">
          {residentData?.status
            ? residentData.status.charAt(0).toUpperCase() +
              residentData.status.slice(1)
            : "N/A"}
        </p>
      </div>
    </div>
  );
}
