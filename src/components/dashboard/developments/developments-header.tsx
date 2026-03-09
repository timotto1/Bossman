"use client";

import { DocumentPlusIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

import { PermissionGuard } from "@/guards/permission-guard";

export default function DevelopmentsHeader() {
  return (
    <div className="py-4 px-8 flex justify-between items-center border-b gap-4">
      <h1 className="text-xl font-medium leading-8 text-[#26045D]">
        Developments
      </h1>
      <PermissionGuard permissions={["generate_hpi_statements"]}>
        <Link
          href="/valuation/all"
          className="flex items-center gap-2 text-white px-6 text-sm rounded-[10px] h-8 bg-[#26045D]"
        >
          <DocumentPlusIcon className="w-5 h-5 text-white" />
          Generate HPI Statements
        </Link>
      </PermissionGuard>
    </div>
  );
}
