import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { EnquirySchema } from "./schema";
import { Checkbox } from "@/components/ui/checkbox";

export const enquiryColumns: ColumnDef<EnquirySchema>[] = [
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
    header: "Name",
    cell: ({ row }) => (
      <p className="font-medium text-[#26045D]">{row.original.name}</p>
    ),
  },
  {
    accessorKey: "development_name",
    header: "Dev. Name",
  },
  {
    accessorKey: "unit_id",
    header: "Unit",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "household_income",
    header: "Household Income",
    cell: ({ row }) => (
      <>
        £
        {row.original.household_income?.toLocaleString("en-GB", {
          maximumFractionDigits: 2,
        })}
      </>
    ),
  },
  {
    accessorKey: "deposit",
    header: "Deposit",
    cell: ({ row }) => (
      <>
        £
        {row.original.deposit?.toLocaleString("en-GB", {
          maximumFractionDigits: 2,
        })}
      </>
    ),
  },
  {
    accessorKey: "eligibility_status",
    header: "Eligibility",
    cell: () => (
      <div className="rounded-full px-2 py-1 bg-[#ECFDF3] text-center">
        <p className="font-medium text-[#027A48]">Eligible</p>
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Date of enquiry",
    cell: ({ row }) => (
      <>
        {new Date(row.original.created_at)
          .toLocaleDateString("en-GB")
          .replaceAll("/", "-")}
      </>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex justify-center items-center">
        <Link
          href={`/dashboard/enquiries/${row.original.id}`}
          className="text-[#AE78F1] hover:underline flex items-center font-semibold"
        >
          View
        </Link>
      </div>
    ),
  },
];
