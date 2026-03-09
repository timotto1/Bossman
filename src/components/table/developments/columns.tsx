"use client";

// import { EyeIcon } from "@heroicons/react/24/solid";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp } from "lucide-react";

// import Link from "next/link";
// import Link from "next/link";
import { DevelopmentSchema } from "./schema";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export const developmentColumns: ColumnDef<DevelopmentSchema>[] = [
  {
    id: "select",
    cell: ({ row }) => (
      <Checkbox
        className="data-[state=checked]:bg-[#26045D] border-[#26045D]"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Development name",
  },
  {
    accessorKey: "postcode",
    header: "Postcode",
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "total_units",
    header: "Total units",
  },
  {
    accessorKey: "units_for_sale",
    header: "Units for sale",
  },
  {
    accessorKey: "occupancy_rate",
    header: "Occupancy Rate",
    cell: ({ row }) => <>{row.original.occupancy_rate}%</>,
  },
  {
    id: "valuation_change_pct",
    accessorKey: "valuation_change_pct",
    header: "HPI change",
    cell: ({ row }) => (
      <div
        className={cn(
          "flex items-center justify-center min-w-[48px] rounded-[16px] p-1",
          row.original.valuation_change_pct < 0
            ? "bg-[#FEF3F2]"
            : "bg-[#E8FAF0]",
        )}
      >
        {row.original.valuation_change_pct < 0 ? (
          <ArrowDown size={12} color="#F04438" />
        ) : (
          <ArrowUp size={12} color="#14A44D" />
        )}
        <p
          className={cn(
            "text-[12px] font-medium",
            row.original.valuation_change_pct < 0
              ? "text-[#B42318]"
              : "text-[#15803d]",
          )}
        >
          {Math.abs(row.original.valuation_change_pct)}%
        </p>
      </div>
    ),
  },
  {
    id: "created_at",
    accessorKey: "created_at",
    header: "Date of First Sale",
    cell: ({ row }) => (
      <>
        {new Date(row.original.created_at)
          .toLocaleDateString("en-GB")
          .replaceAll("/", "-")}
      </>
    ),
  },
  // {
  //   id: "actions",
  //   header: "Actions",
  //   cell: ({ row }) => (
  //     <div className="flex justify-center items-center">
  //       <Link
  //         href={`/dashboard/properties/development/${row.original.id}`}
  //         className="text-[#26045D] hover:underline flex items-center"
  //       >
  //         <EyeIcon className="w-5 h-5" />
  //       </Link>
  //     </div>
  //   ),
  // },
];
