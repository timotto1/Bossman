"use client";

import { RankingInfo, rankItem } from "@tanstack/match-sorter-utils";
import {
  ColumnDef,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
}

declare module "@tanstack/table-core" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

/*eslint-disable @typescript-eslint/no-explicit-any*/
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

interface CampaignsData {
  campaign: number;
  channel: string;
  sendDate: string;
  clientName: string;
  email: number;
  clientStatus: string;
  engagementRate: number;
  statusColor: string;
}

const campaigns: CampaignsData[] = [
  {
    campaign: 1,
    channel: "John",
    sendDate: "2024-12-01",
    clientName: "jwestmore@gmail.com",
    email: 1,
    clientStatus: "Mortgage expiry",
    engagementRate: 75,
    statusColor: "#FF4774",
  },
  {
    campaign: 2,
    channel: "John",
    sendDate: "2024-12-01",
    clientName: "jwestmore@gmail.com",
    email: 1,
    clientStatus: "Ready to transact",
    engagementRate: 75,
    statusColor: "#36C68C",
  },
  {
    campaign: 3,
    channel: "John",
    sendDate: "2024-12-01",
    clientName: "jwestmore@gmail.com",
    email: 1,
    clientStatus: "Financial difficulty",
    engagementRate: 75,
    statusColor: "#FF4774",
  },
  {
    campaign: 4,
    channel: "John",
    sendDate: "2024-12-01",
    clientName: "jwestmore@gmail.com",
    email: 1,
    clientStatus: "Accessibility needs",
    engagementRate: 75,
    statusColor: "#8C47FF",
  },
];

export function CampaignsTable<TData, TValue>({
  columns,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data: campaigns,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex-1 overflow-x-auto">
        <table className="mb-4 w-full text-sm">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-center sticky top-0 z-10 bg-[#F0F0FE] text-sm font-medium leading-5 text-[#26045D]"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="bg-white text-[#26045D] text-center text-xs font-normal leading-4"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </table>
      </div>
    </div>
  );
}
