"use client";

// import { EyeIcon } from "@heroicons/react/24/solid";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";

// import Link from "next/link";
import { UnitSchema } from "./schema";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export const unitColumns: ColumnDef<UnitSchema>[] = [
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
    accessorKey: "address_1",
    header: "Address 1",
  },
  {
    accessorKey: "postcode",
    header: "Postcode",
  },
  {
    accessorKey: "development_name",
    header: "Development Name",
  },
  {
    accessorKey: "unit_type",
    header: "Unit type",
    cell: ({ row }) => {
      if (!row.original.unit_type) {
        return null;
      }

      return (
        <>
          {(
            row.original.unit_type?.charAt(0).toUpperCase() +
            row.original.unit_type?.slice(1)
          )
            .split("_")
            .join(" ")}
        </>
      );
    },
  },
  {
    accessorKey: "monthly_rent",
    header: "Rent",
    cell: ({ row }) => (
      <>
        £
        {(row.original.monthly_rent || 0)?.toLocaleString("en-GB", {
          maximumFractionDigits: 2,
        })}
      </>
    ),
  },
  {
    accessorKey: "valuation_amount",
    header: "HPI Valuation",
    cell: ({ row }) => (
      <>
        {!isNaN(row.original.valuation_amount)
          ? `£${(row.original.valuation_amount || 0)?.toLocaleString("en-GB", {
              maximumFractionDigits: 2,
            })}`
          : ``}
      </>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const statusColors: { [key: string]: string } = {
        occupied: "bg-[#0FB872]",
        empty: "bg-[#4E91F6]",
        listed: "bg-[#F5AB47]",
        for_rent: "bg-[#4E91F6]",
      };
      return (
        <div className="flex items-center gap-2 justify-center">
          <div
            className={`w-2.5 h-2.5 rounded-full ${statusColors[row.original.status] || ""}`}
          />
          <span>
            {row.original.status.charAt(0).toUpperCase() +
              row.original.status.slice(1)}
          </span>
        </div>
      );
    },
  },
  {
    id: "first_name",
    accessorKey: "first_name",
    header: "Occupant",
    cell: ({ row }) => {
      if (!row.original.first_name && !row.original.last_name) {
        return ``;
      }

      return (
        <Link
          href={`/dashboard/lead/${row.original?.resident_id}`}
          className="text-[#26045D] underline"
        >
          {`${row.original.first_name} ${row.original.last_name}`}
        </Link>
      );
    },
  },
  {
    id: "hpi_change_pct",
    accessorKey: "hpi_change_pct",
    header: "HPI change",
    cell: ({ row }) => (
      <div
        className={cn(
          "flex items-center justify-center min-w-[48px] rounded-[16px] p-1",
          row.original.hpi_change_pct < 0 ? "bg-[#FEF3F2]" : "bg-[#E8FAF0]",
        )}
      >
        {row.original.hpi_change_pct < 0 ? (
          <ArrowDown size={12} color="#F04438" />
        ) : (
          <ArrowUp size={12} color="#14A44D" />
        )}
        <p
          className={cn(
            "text-[12px] font-medium",
            row.original.hpi_change_pct < 0
              ? "text-[#B42318]"
              : "text-[#15803d]",
          )}
        >
          {Math.abs(row.original.hpi_change_pct)}%
        </p>
      </div>
    ),
  },
  // {
  //   id: "actions",
  //   header: "Actions",
  //   cell: ({ row }) => (
  //     <div className="flex gap-2 justify-center">
  //       <Link
  //         href={`/dashboard/properties/unit/${row.original.unit_id}`}
  //         className="text-[#26045D]"
  //       >
  //         <EyeIcon className="w-5 h-5" />
  //       </Link>
  //     </div>
  //   ),
  // },
];
