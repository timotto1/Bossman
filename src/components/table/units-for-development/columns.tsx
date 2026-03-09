"use client";

import { EyeIcon } from "@heroicons/react/24/solid";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { UnitSchema } from "../units/schema";
import { Checkbox } from "@/components/ui/checkbox";

export const unitForDevelopmentColumns: ColumnDef<UnitSchema>[] = [
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
    accessorKey: "internal_id",
    header: "Unit ID",
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
    accessorKey: "monthly_rent",
    header: "Rent",
    cell: ({ row }) => (
      <>
        £
        {row.original.monthly_rent?.toLocaleString("en-GB", {
          maximumFractionDigits: 2,
        })}
      </>
    ),
  },
  {
    header: "Occupant",
    cell: ({ row }) => {
      if (!row.original.first_name && !row.original.last_name) {
        return ``;
      }

      return <>{`${row.original.first_name} ${row.original.last_name}`}</>;
    },
  },

  {
    accessorKey: "postcode",
    header: "Postcode",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2 justify-center">
        <Link
          href={`/dashboard/properties/unit/${row.original.unit_id}`}
          className="text-[#26045D]"
        >
          <EyeIcon className="w-5 h-5" />
        </Link>
      </div>
    ),
  },
];
