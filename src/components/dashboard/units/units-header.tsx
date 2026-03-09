"use client";

import { DocumentPlusIcon, TableCellsIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

import { PermissionGuard } from "@/guards/permission-guard";

export default function UnitsHeader() {
  return (
    <div className="py-4 px-8 flex justify-between items-center border-b gap-4">
      <h1 className="text-xl font-medium leading-8 text-[#26045D]">Units</h1>
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/tables"
          className="flex items-center gap-2 px-6 text-sm rounded-[10px] h-8 bg-transparent border border-[#D6D5D7] text-[#B9B7BD]"
        >
          <TableCellsIcon className="w-5 h-5 text-[#B9B7BD]" />
          Create my own table
        </Link>
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
    </div>
  );
}
