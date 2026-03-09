import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import {
  AllListingsSchema,
  DraftListingsSchema,
  LiveListingsSchema,
  UnlistedListingsSchema,
} from "./schema";
import { Progress } from "@/components/ui/progress";
import { getListingStatusMapping } from "@/lib/utils";

export const allListingsColumns: ColumnDef<AllListingsSchema>[] = [
  {
    accessorKey: "id",
    header: "Listing ID",
    enableSorting: false,
  },
  {
    accessorKey: "development_name",
    header: "Dev. Name",
    enableSorting: false,
  },
  {
    accessorKey: "postcode",
    header: "Postcode",
    enableSorting: false,
  },
  {
    accessorKey: "city",
    header: "City",
    enableSorting: false,
  },
  {
    accessorKey: "units_for_sale",
    header: "Units for sale",
    enableSorting: false,
  },
  {
    accessorKey: "type",
    header: "Type",
    enableSorting: false,
    cell: ({ row }) => {
      const type = row.original.type.split("_").join(" ");

      return <>{`${type.charAt(0).toUpperCase()}${type.slice(1)}`}</>;
    },
  },
  {
    header: "Sold",
    cell: ({ row }) => (
      <div className="flex flex-col items-center gap-1 text-xs font-light leading-4 text-center text-[#26045D]">
        {row.original.units_sold}/{row.original.total_units}
        <Progress
          value={
            (row.original.units_sold / row.original.total_units || 0) * 100
          }
          className="h-[5px]"
          indicatorColor="bg-[#7747FF]"
        />
      </div>
    ),
  },
  {
    accessorKey: "total_development_value",
    header: "Dev. value",
    cell: ({ row }) => (
      <>
        £
        {row.original.total_development_value?.toLocaleString("en-GB", {
          maximumFractionDigits: 2,
        })}
      </>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Date created",
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
          href={`/dashboard/listing/${row.original.id}`}
          className="text-[#AE78F1] hover:underline flex items-center font-semibold"
        >
          View
        </Link>
      </div>
    ),
  },
];

export const draftListingColumns: ColumnDef<DraftListingsSchema>[] = [
  {
    accessorKey: "id",
    header: "Listing ID",
    enableSorting: false,
  },
  {
    accessorKey: "development_name",
    header: "Dev. Name",
    enableSorting: false,
  },
  {
    accessorKey: "address_1",
    header: "Address 1",
    enableSorting: false,
  },
  {
    accessorKey: "postcode",
    header: "Postcode",
    enableSorting: false,
  },
  {
    accessorKey: "city",
    header: "City",
    enableSorting: false,
  },
  {
    accessorKey: "type",
    header: "Type",
    enableSorting: false,
    cell: ({ row }) => {
      const type = row.original.type.split("_").join(" ");

      return <>{`${type.charAt(0).toUpperCase()}${type.slice(1)}`}</>;
    },
  },
  {
    accessorKey: "completion_percentage",
    header: "Completion",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-col items-center gap-3 text-xs font-light leading-4 text-left text-[#26045D]">
        {row.original.completion_percentage || 0}%
        <Progress
          value={row.original.completion_percentage || 0}
          className="h-[5px] bg-transparent"
          indicatorColor="bg-[#7747FF]"
        />
      </div>
    ),
  },
  {
    accessorKey: "total_development_value",
    header: "Prop. value",
    cell: ({ row }) => (
      <>
        £
        {row.original.total_development_value?.toLocaleString("en-GB", {
          maximumFractionDigits: 2,
        })}
      </>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Date created",
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
          href={`/dashboard/listing/${row.original.id}`}
          className="text-[#AE78F1] hover:underline flex items-center font-semibold"
        >
          View
        </Link>
      </div>
    ),
  },
];

export const unlistedListingColumns: ColumnDef<UnlistedListingsSchema>[] = [
  {
    accessorKey: "id",
    header: "Listing ID",
    enableSorting: false,
  },
  {
    accessorKey: "development_name",
    header: "Dev. Name",
    enableSorting: false,
  },
  {
    accessorKey: "address_1",
    header: "Address 1",
    enableSorting: false,
  },
  {
    accessorKey: "postcode",
    header: "Postcode",
    enableSorting: false,
  },
  {
    accessorKey: "city",
    header: "City",
    enableSorting: false,
  },
  {
    accessorKey: "type",
    header: "Type",
    enableSorting: false,
    cell: ({ row }) => {
      const type = row.original.type.split("_").join(" ");

      return <>{`${type.charAt(0).toUpperCase()}${type.slice(1)}`}</>;
    },
  },
  {
    accessorKey: "completion_percentage",
    header: "Completion",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-col items-center gap-3 text-xs font-light leading-4 text-left text-[#26045D]">
        {row.original.completion_percentage || 0}%
        <Progress
          value={row.original.completion_percentage || 0}
          className="h-[5px] bg-transparent"
          indicatorColor="bg-[#7747FF]"
        />
      </div>
    ),
  },
  {
    accessorKey: "total_development_value",
    header: "Prop. value",
    cell: ({ row }) => (
      <>
        £
        {row.original.total_development_value?.toLocaleString("en-GB", {
          maximumFractionDigits: 2,
        })}
      </>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Date created",
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
          href={`/dashboard/listing/${row.original.id}`}
          className="text-[#AE78F1] hover:underline flex items-center font-semibold"
        >
          View
        </Link>
      </div>
    ),
  },
];

export const liveListingColumns: ColumnDef<LiveListingsSchema>[] = [
  {
    accessorKey: "id",
    header: "Listing ID",
    enableSorting: false,
  },
  {
    accessorKey: "development_name",
    header: "Dev. Name",
    enableSorting: false,
  },
  {
    accessorKey: "address_1",
    header: "Address 1",
    enableSorting: false,
  },
  {
    accessorKey: "postcode",
    header: "Postcode",
    enableSorting: false,
  },
  {
    accessorKey: "city",
    header: "City",
    enableSorting: false,
  },
  {
    accessorKey: "type",
    header: "Type",
    enableSorting: false,
    cell: ({ row }) => {
      const type = row.original.type.split("_").join(" ");

      return <>{`${type.charAt(0).toUpperCase()}${type.slice(1)}`}</>;
    },
  },
  {
    accessorKey: "total_enquiries",
    header: "Total Enquiries",
    cell: () => <div className="text-center">0</div>,
  },
  {
    accessorKey: "New_enquiries",
    header: "New Enquiries",
    cell: () => <div className="text-center">0</div>,
  },
  {
    accessorKey: "rightmove_status",
    header: "Status",
    cell: ({ row }) => (
      <div className="bg-[#ECFDF3] rounded-full text-[#027A48] px-2 py-1">
        {getListingStatusMapping(row.original.rightmove_status).label}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex justify-center items-center">
        <Link
          href={`/dashboard/listing/${row.original.id}`}
          className="text-[#AE78F1] hover:underline flex items-center font-semibold"
        >
          View
        </Link>
      </div>
    ),
  },
];
