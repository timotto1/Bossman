"use client";

// import { ReceiptRefundIcon, TrashIcon } from "@heroicons/react/20/solid";
import { RankingInfo, rankItem } from "@tanstack/match-sorter-utils";
import {
  ColumnDef,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

// import { LeadDateFilter } from "./filters/date-filter";
import { Skeleton } from "@/components/ui/skeleton";
// import { Button } from "@/components/ui/button";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

declare module "@tanstack/table-core" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

interface DataTableProps<TData, TValue> {
  showSearchFilter: boolean;
  // showDateFilter: boolean;
  // showActionButtons: boolean;
  showTotal: boolean;
  columns: ColumnDef<TData, TValue>[];
  data: TData[] | null; // Update to allow `null` when data is loading
  isLoading: boolean; // New prop to track loading state
}

/*eslint-disable @typescript-eslint/no-explicit-any*/
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({
    itemRank,
  });
  return itemRank.passed;
};

export function LeadsTable<TData, TValue>({
  // showActionButtons,
  // showDateFilter,
  showTotal,
  columns,
  data,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data: data || [], // Use an empty array when data is null
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
      {showTotal && !isLoading && (
        <h3 className="text-sm font-medium leading-5 text-[#26045D]">
          Total Rows: {table.getRowCount()}
        </h3>
      )}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          // ShadCN Skeleton Loader
          <table className="mb-4 w-full text-sm">
            <TableHeader>
              <TableRow>
                {columns.map((col, index) => (
                  <TableHead key={index}>
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(10)].map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((col, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </table>
        ) : (
          <table className="mb-4 w-full text-sm">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-none">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-center sticky top-0 z-10 bg-[#F0F0FE] first:rounded-tl-lg first:rounded-bl-lg last:rounded-tr-lg last:rounded-br-lg text-sm font-medium leading-5 text-[#26045D]"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
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
                  className="bg-white text-[#26045D] text-center text-xs font-normal leading-4"
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </table>
        )}
      </div>
    </div>
  );
}
