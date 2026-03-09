"use client";

// import { ReceiptRefundIcon, TrashIcon } from "@heroicons/react/20/solid";
import React, { ReactNode, useEffect, useMemo, useState } from "react";
import {
  ArrowDownIcon,
  ArrowsUpDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { RankingInfo, rankItem } from "@tanstack/match-sorter-utils";
import {
  ColumnDef,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Expand, Shrink } from "lucide-react";
import Link from "next/link";

import { CustomPagination as Pagination } from "../custom-pagination";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
// import { DateFilter } from "./filters/date-filter";
import { SearchFilter } from "./filters/search-filter";
import { Skeleton } from "@/components/ui/skeleton";
// import { Button } from "@/components/ui/button";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePagination } from "@/hooks/use-pagination";

type FilterValue = {
  condition: string;
  value: string | string[];
};

export type FilterConfig = {
  key: string;
  label: string;
  type: "number" | "date" | "text" | "select" | "multi-select" | "boolean";
  options?: { value: string; label: string }[]; // For select type
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FilterState = Record<any, FilterValue>;

declare module "@tanstack/table-core" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

interface DataTableProps<TData, TValue> {
  showSearchFilter?: boolean;
  searchPlaceholder?: string;
  showTotal?: boolean;
  columns: ColumnDef<TData, TValue>[];
  data: TData[] | null;
  isLoading: boolean;
  showFilter?: boolean;
  showColumnToggle?: boolean; // New prop to control column visibility toggle
  showExport?: boolean;
  exportCSVFileName?: string;
  filters?: FilterState;
  filterConfig?: FilterConfig[]; // New prop for filter configuration
  updateFilters?: (
    key: string,
    field: string,
    value: string | string[],
  ) => void;
  disabledColumns?: string[];
  itemsPerPage?: number; // Make pagination configurable
  title?: ReactNode;
  onSelectionChange?: (selected: TData[]) => void;
  showHeader?: boolean;
  enableViewAll?: boolean;
  viewAllLink?: string;
}

/*eslint-disable @typescript-eslint/no-explicit-any*/
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({
    itemRank,
  });
  return itemRank.passed;
};

const renderFilterInput = (
  config: FilterConfig,
  filters: FilterState,
  updateFilters: (key: string, field: string, value: string | string[]) => void,
) => {
  const { key, label, type, options } = config;
  const filterValue = filters[key]?.value;

  return (
    <div
      key={key}
      className={
        type === "boolean"
          ? "grid grid-cols-[2fr_1fr] gap-3 items-center"
          : "grid grid-cols-3 gap-3 items-center"
      }
    >
      <div className="text-base font-medium leading-5 text-[#26045D]">
        {label}
      </div>
      {type !== "boolean" && (
        <Select
          value={filters[key]?.condition || ""}
          onValueChange={(val) => updateFilters(key, "condition", val)}
        >
          <SelectTrigger className="text-[#26045D]">
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent className="text-[#26045D]">
            <SelectGroup>
              {type === "number" ? (
                <>
                  <SelectItem value="=">is equal to</SelectItem>
                  <SelectItem value=">">is larger than</SelectItem>
                  <SelectItem value="<">is less than</SelectItem>
                </>
              ) : type === "date" ? (
                <>
                  <SelectItem value="before">is before</SelectItem>
                  <SelectItem value="after">is after</SelectItem>
                </>
              ) : type === "select" || type === "multi-select" ? (
                <>
                  <SelectItem value="=">is</SelectItem>
                  <SelectItem value="!=">is not</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="contains">contains</SelectItem>
                  <SelectItem value="=">is equal to</SelectItem>
                  <SelectItem value="!=">is not equal to</SelectItem>
                </>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
      {(type === "select" || type === "boolean") && options ? (
        <Select
          value={String(filterValue || "")}
          onValueChange={(val) =>
            updateFilters(key, "value", val === "reset-value" ? "" : val)
          }
        >
          <SelectTrigger className="text-[#26045D]">
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent className="text-[#26045D]">
            <SelectGroup>
              <SelectItem value="reset-value">---------</SelectItem>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      ) : type === "multi-select" && options ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-[#26045D]">
              {Array.isArray(filterValue) && filterValue.length > 0
                ? `${filterValue.length} selected`
                : "Select values"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 text-[#26045D]">
            <div className="grid gap-2">
              {options.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`${key}-${option.value}`}
                    checked={
                      Array.isArray(filterValue) &&
                      filterValue.includes(option.value)
                    }
                    onCheckedChange={(checked) => {
                      const current = Array.isArray(filterValue)
                        ? [...filterValue]
                        : [];

                      const updated = checked
                        ? [...current, option.value]
                        : current.filter((val) => val !== option.value);

                      updateFilters(key, "value", updated);
                    }}
                  />
                  <label
                    htmlFor={`${key}-${option.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <Input
          type={type}
          className="text-[#26045D] p-2"
          placeholder="All"
          value={String(filterValue || "")}
          onChange={(e) => updateFilters(key, "value", e.target.value)}
        />
      )}
    </div>
  );
};

export function DataTable<TData, TValue>({
  showSearchFilter,
  searchPlaceholder,
  showTotal,
  columns,
  data,
  isLoading,
  showFilter = false,
  showColumnToggle = true,
  showExport = false,
  exportCSVFileName = "export.csv",
  filters,
  filterConfig,
  updateFilters,
  disabledColumns = [],
  title = null,
  onSelectionChange,
  showHeader = true,
  enableViewAll = false,
  viewAllLink,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [customActionToggle, setCustomActionToggle] = useState<
    Record<string, boolean>
  >({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [viewAll, setViewAll] = useState(!enableViewAll);

  const table = useReactTable({
    data: data || [], // Use an empty array when data is null
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
      columnVisibility,
      sorting,
      rowSelection,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
  });

  const sortedRowModel = table.getSortedRowModel();

  const filteredRows = useMemo(() => {
    return sortedRowModel.rows;
  }, [sortedRowModel]);

  const handleExportRows = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const rowsToExport = selectedRows.length ? selectedRows : filteredRows;

    if (!rowsToExport.length) return;

    // Get visible column headers (excluding hidden/action ones)
    const visibleColumns = table
      .getAllLeafColumns()
      .filter(
        (col) =>
          col.getIsVisible() && col.id !== "action" && col.id !== "select",
      );

    // Extract headers
    const headers = visibleColumns.map((col) => col.columnDef.header as string);

    const rows = rowsToExport.map((row) =>
      visibleColumns.map((col) => {
        const value = row.getValue(col.id);
        return typeof value === "string"
          ? `"${value.replace(/"/g, '""')}"` // escape quotes
          : (value ?? "");
      }),
    );

    // Build CSV string
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", exportCSVFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const {
    currentPage,
    totalPages,
    currentItems,
    handleClick,
    handlePrevious,
    handleNext,
  } = usePagination({
    items: filteredRows,
    itemsPerPage: 10,
  });

  useEffect(() => {
    if (disabledColumns.length) {
      setColumnVisibility(
        disabledColumns.reduce((acc: Record<string, boolean>, key: string) => {
          acc[key] = false;
          return acc;
        }, {}),
      );
    }
  }, [disabledColumns]);

  useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table
        .getSelectedRowModel()
        .rows.map((r) => r.original);
      onSelectionChange(selectedRows);
    }
  }, [rowSelection, table, onSelectionChange]);

  return (
    <div className="flex flex-col space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between pb-3 px-2">
          <div>{title}</div>
          <div className="flex items-center justify-end gap-4">
            {showColumnToggle && (
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full bg-transparent hover:bg-transparent text-[#87858E] flex items-center justify-center gap-2">
                  {/* <FunnelIcon className="h-5 w-5" /> */}
                  <span className="text-sm">Columns</span>
                  <ChevronDownIcon className="h-3 w-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <div className="space-y-2 p-2">
                    {table
                      .getAllColumns()
                      .filter((col) => col.getCanHide())
                      .map((col) => (
                        <div
                          key={col.id}
                          className="flex gap-2 items-center text-[#26045D] text-sm"
                        >
                          <Checkbox
                            className="data-[state=checked]:bg-[#26045D] border-[#26045D]"
                            checked={col.getIsVisible()}
                            onCheckedChange={(checked) =>
                              col.toggleVisibility(checked as boolean)
                            }
                          />
                          <span>{col.columnDef.header as string}</span>
                        </div>
                      ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {showSearchFilter && (
              <SearchFilter
                value={globalFilter}
                onChange={setGlobalFilter}
                placeholder={searchPlaceholder}
              />
            )}
            {showFilter && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    className="rounded-full bg-transparent hover:bg-transparent text-[#7114E2] text-sm"
                  >
                    Filters
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Filter</DialogTitle>
                  <div className="space-y-2">
                    {filters && updateFilters && filterConfig
                      ? filterConfig.map((config) =>
                          renderFilterInput(config, filters, updateFilters),
                        )
                      : null}
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {showExport && (
              <Button
                variant="ghost"
                type="button"
                className="text-[12px] text-[#7114E2]"
                onClick={handleExportRows}
              >
                Export
              </Button>
            )}
            {enableViewAll && (
              <Button
                type="button"
                className="rounded-full bg-transparent hover:bg-transparent text-[#7114E2] text-sm"
                onClick={() => setViewAll(true)}
              >
                View all
              </Button>
            )}
            {viewAllLink && (
              <Link href={viewAllLink}>
                <Button
                  type="button"
                  className="rounded-full bg-transparent hover:bg-transparent text-[#7114E2] text-sm"
                >
                  View all
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
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
                {columns.map((__, index) => (
                  <TableHead key={index}>
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(10)].map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((__, colIndex) => (
                    <TableCell key={`${rowIndex}-${colIndex}`}>
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
                  {headerGroup.headers.map((header) => {
                    const isSorted = header.column.getIsSorted();

                    return (
                      <TableHead
                        key={header.id}
                        onClick={(e) => {
                          if (header.column.getCanSort()) {
                            header.column.toggleSorting(
                              undefined,
                              e.metaKey || e.ctrlKey,
                            );
                          }
                        }}
                        className={`cursor-pointer select-none sticky top-0 z-10 bg-white text-xs font-medium leading-5 text-[#535862] border-b border-[#E9EAEB] whitespace-nowrap ${
                          header.column.getCanSort()
                            ? "hover:opacity-80"
                            : "cursor-default"
                        }`}
                      >
                        {header.column.getCanSort() ? (
                          <div className="flex gap-1 items-center">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {isSorted === false && (
                              <ArrowsUpDownIcon className="h-4" />
                            )}
                            {isSorted === "asc" && (
                              <ArrowUpIcon className="h-4" />
                            )}
                            {isSorted === "desc" && (
                              <ArrowDownIcon className="h-4" />
                            )}
                          </div>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {currentItems.map((row, rowIndex) => {
                if (!viewAll && rowIndex > 4) return null;

                return (
                  <React.Fragment key={rowIndex}>
                    <TableRow
                      className="bg-white hover:bg-white data-[state=selected]:bg-white text-[#535862] text-sm font-normal leading-4"
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell, cellIndex) => (
                        <TableCell key={`${rowIndex}-${cellIndex}`}>
                          {cell.column.columnDef.id === "action" ? (
                            <>
                              {customActionToggle[row.id] ? (
                                <Shrink
                                  className="mx-auto cursor-pointer"
                                  onClick={() =>
                                    setCustomActionToggle((prev: any) => ({
                                      ...prev,
                                      [row.id]: !prev[row.id],
                                    }))
                                  }
                                />
                              ) : (
                                <Expand
                                  className="mx-auto cursor-pointer"
                                  onClick={() =>
                                    setCustomActionToggle((prev: any) => ({
                                      ...prev,
                                      [row.id]: !prev[row.id],
                                    }))
                                  }
                                />
                              )}
                            </>
                          ) : (
                            <>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    {row
                      .getVisibleCells()
                      .map((cell) =>
                        cell.column.columnDef.id === "action" ? (
                          <>
                            {customActionToggle[row.id]
                              ? flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )
                              : null}
                          </>
                        ) : null,
                      )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </table>
        )}
      </div>

      {viewAll && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handleClick}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
