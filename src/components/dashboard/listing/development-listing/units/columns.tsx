import { ColumnDef } from "@tanstack/react-table";

import ListingUnitsActions from "./listing-units-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { getListingStatus } from "@/lib/utils";
import { UnitListing } from "@/types/types";

export const unitListingColumns: ColumnDef<UnitListing>[] = [
  {
    id: "select",
    cell: ({ row, table }) => (
      <Checkbox
        className="data-[state=checked]:bg-[#26045D] border-[#26045D]"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => {
          if (value) {
            // Clear all selections except this row
            table.getSelectedRowModel().rows.forEach((r) => {
              if (r.id !== row.id && r.getIsSelected()) {
                r.toggleSelected(false);
              }
            });
            row.toggleSelected(true);
          } else {
            row.toggleSelected(false);
          }
        }}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "Unit ID",
    enableSorting: false,
  },
  {
    accessorKey: "unit_type",
    header: "Unit type",
    cell: ({ row }) => (
      <>
        {row.original?.unit_type?.charAt(0).toUpperCase() +
          row.original?.unit_type?.slice(1).split("_").join(" ")}
      </>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "rightmove_status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 bg-[#E5DAFB] text-[#7114E2] px-3 py-1 rounded-full w-fit">
        {getListingStatus(row.original.rightmove_status)}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "address_1",
    header: "Address Line 1",
    enableSorting: false,
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
    enableSorting: false,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <ListingUnitsActions id={row.original.id} />,
  },
];
