"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { MagnifyingGlassIcon, XMarkIcon, ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { UI } from "@/lib/ui";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OlympusColumnDef<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: "text" | "number" | "date" | "select";
  filterOptions?: { value: string; label: string }[];
  render?: (value: unknown, row: T) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
};

export type OlympusTableProps<T> = {
  columns: OlympusColumnDef<T>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
  extraToolbar?: React.ReactNode;
  rowKey: (row: T) => string;
  pageSize?: number;
};

type ActiveFilter = {
  id: string;
  column: string;
  columnLabel: string;
  condition: string;
  value: string;
};

// ─── Condition options per filter type ───────────────────────────────────────

const CONDITIONS: Record<string, { value: string; label: string }[]> = {
  text:   [{ value: "contains", label: "contains" }, { value: "is", label: "is" }, { value: "is not", label: "is not" }],
  number: [{ value: "=", label: "=" }, { value: ">", label: ">" }, { value: "<", label: "<" }],
  date:   [{ value: "after", label: "after" }, { value: "before", label: "before" }],
  select: [{ value: "is", label: "is" }, { value: "is not", label: "is not" }],
};

// ─── Filter logic ─────────────────────────────────────────────────────────────

function applyFilter<T>(rows: T[], filter: ActiveFilter, columns: OlympusColumnDef<T>[]): T[] {
  const col = columns.find((c) => c.key === filter.column);
  if (!col) return rows;

  return rows.filter((row) => {
    const raw = (row as Record<string, unknown>)[filter.column];
    const val = raw === null || raw === undefined ? "" : raw;
    const fv = filter.value;

    switch (filter.condition) {
      case "contains":
        return String(val).toLowerCase().includes(fv.toLowerCase());
      case "is":
        return String(val) === fv || Number(val) === Number(fv);
      case "is not":
        return String(val) !== fv && Number(val) !== Number(fv);
      case "=":
        return Number(val) === Number(fv);
      case ">":
        return Number(val) > Number(fv);
      case "<":
        return Number(val) < Number(fv);
      case "after":
        return new Date(String(val)) > new Date(fv);
      case "before":
        return new Date(String(val)) < new Date(fv);
      default:
        return true;
    }
  });
}

// ─── Sort logic ───────────────────────────────────────────────────────────────

function applySort<T>(rows: T[], key: string, dir: "asc" | "desc"): T[] {
  return [...rows].sort((a, b) => {
    const av = (a as Record<string, unknown>)[key];
    const bv = (b as Record<string, unknown>)[key];
    if (av === null || av === undefined) return 1;
    if (bv === null || bv === undefined) return -1;
    const cmp = typeof av === "number" && typeof bv === "number"
      ? av - bv
      : String(av).localeCompare(String(bv));
    return dir === "asc" ? cmp : -cmp;
  });
}

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" | null }) {
  if (!active || dir === null) return <ChevronUpDownIcon className="w-3.5 h-3.5 text-gray-400 inline ml-1" />;
  if (dir === "asc") return <ChevronUpIcon className="w-3.5 h-3.5 text-purple-500 inline ml-1" />;
  return <ChevronDownIcon className="w-3.5 h-3.5 text-purple-500 inline ml-1" />;
}

// ─── Add-filter popover ───────────────────────────────────────────────────────

type FilterPopoverProps<T> = {
  columns: OlympusColumnDef<T>[];
  onAdd: (filter: Omit<ActiveFilter, "id">) => void;
  onClose: () => void;
};

function FilterPopover<T>({ columns, onAdd, onClose }: FilterPopoverProps<T>) {
  const filterableCols = columns.filter((c) => c.filterable);
  const [draftColumn, setDraftColumn] = useState(filterableCols[0]?.key ?? "");
  const [draftCondition, setDraftCondition] = useState("");
  const [draftValue, setDraftValue] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const col = filterableCols.find((c) => c.key === draftColumn);
  const filterType = col?.filterType ?? "text";
  const conditionOptions = CONDITIONS[filterType] ?? CONDITIONS.text;

  // Reset condition when column changes
  useEffect(() => {
    setDraftCondition(conditionOptions[0]?.value ?? "");
    setDraftValue("");
  }, [draftColumn]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  function handleAdd() {
    if (!draftColumn || !draftCondition || draftValue.trim() === "") return;
    onAdd({ column: draftColumn, columnLabel: col?.label ?? draftColumn, condition: draftCondition, value: draftValue.trim() });
    onClose();
  }

  const selectCls = "text-sm border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 bg-white dark:bg-white/10 text-gray-700 dark:text-gray-200 outline-none cursor-pointer";
  const inputCls  = "text-sm border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 bg-white dark:bg-white/10 text-gray-700 dark:text-gray-200 outline-none w-full";

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-[#1A0F35] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg p-4 w-[340px]"
    >
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Add filter</p>
      <div className="flex flex-col gap-2">
        {/* Column select */}
        <select className={selectCls} value={draftColumn} onChange={(e) => setDraftColumn(e.target.value)}>
          {filterableCols.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
        {/* Condition select */}
        <select className={selectCls} value={draftCondition} onChange={(e) => setDraftCondition(e.target.value)}>
          {conditionOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {/* Value input */}
        {filterType === "select" && col?.filterOptions ? (
          <select className={selectCls} value={draftValue} onChange={(e) => setDraftValue(e.target.value)}>
            <option value="">Choose…</option>
            {col.filterOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        ) : (
          <input
            type={filterType === "number" ? "number" : filterType === "date" ? "date" : "text"}
            placeholder="Value…"
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            className={inputCls}
          />
        )}
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <button
          onClick={onClose}
          className="text-sm px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleAdd}
          disabled={!draftValue.trim()}
          className="text-sm px-3 py-1.5 rounded-lg bg-[#26045D] dark:bg-purple-700 text-white font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          Add
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function OlympusTable<T>({
  columns,
  data,
  loading = false,
  onRowClick,
  searchKeys = [],
  searchPlaceholder = "Search…",
  extraToolbar,
  rowKey,
  pageSize = 15,
}: OlympusTableProps<T>) {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);
  const [page, setPage] = useState(1);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Reset page when filters/search/sort change
  useEffect(() => { setPage(1); }, [search, activeFilters, sortKey, sortDir]);

  // Derived data
  const processed = useMemo(() => {
    let rows = [...data];

    // Search
    if (search.trim() && searchKeys.length > 0) {
      const q = search.toLowerCase().trim();
      rows = rows.filter((row) =>
        searchKeys.some((k) => {
          const v = (row as Record<string, unknown>)[k as string];
          return v != null && String(v).toLowerCase().includes(q);
        })
      );
    }

    // Active filters (AND)
    for (const filter of activeFilters) {
      rows = applyFilter(rows, filter, columns);
    }

    // Sort
    if (sortKey && sortDir) {
      rows = applySort(rows, sortKey, sortDir);
    }

    return rows;
  }, [data, search, searchKeys, activeFilters, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const paged = processed.slice((page - 1) * pageSize, page * pageSize);

  // Clamp page if data shrinks
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  function handleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey(null);
      setSortDir(null);
    }
  }

  function addFilter(filter: Omit<ActiveFilter, "id">) {
    setActiveFilters((prev) => [...prev, { ...filter, id: Math.random().toString(36).slice(2) }]);
  }

  function removeFilter(id: string) {
    setActiveFilters((prev) => prev.filter((f) => f.id !== id));
  }

  // Page pills: show up to 6 around current page
  const pagePills = useMemo(() => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const start = Math.max(1, Math.min(page - 2, totalPages - 5));
    return Array.from({ length: Math.min(6, totalPages) }, (_, i) => start + i);
  }, [totalPages, page]);

  const colSpan = columns.length;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* ── Toolbar ── */}
      <div className={UI.toolbar}>
        {/* Search */}
        <div className={`${UI.searchInput} flex-1 max-w-sm`}>
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 outline-none w-full"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Extra toolbar slot */}
        {extraToolbar}

        {/* Add filter button */}
        <div className="relative">
          <button
            onClick={() => setPopoverOpen((o) => !o)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            <span className="text-base leading-none">+</span> Add filter
          </button>
          {popoverOpen && (
            <FilterPopover columns={columns} onAdd={addFilter} onClose={() => setPopoverOpen(false)} />
          )}
        </div>

        {/* Result count */}
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto whitespace-nowrap">
          {processed.length.toLocaleString()} {processed.length === 1 ? "result" : "results"}
        </span>
      </div>

      {/* ── Active filter chips ── */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap px-6 py-2 border-b border-gray-100 dark:border-white/10 bg-white dark:bg-[#160B30]">
          {activeFilters.map((f) => (
            <span key={f.id} className={UI.filterChip}>
              {f.columnLabel} · {f.condition} · {f.value}
              <button onClick={() => removeFilter(f.id)} className="hover:opacity-70">
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={() => setActiveFilters([])}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 underline ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div className={`${UI.content} flex flex-col`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/10">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`${UI.tableHeader} ${col.headerClassName ?? ""} ${col.sortable ? "cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" : ""}`}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    {col.label}
                    {col.sortable && (
                      <SortIcon active={sortKey === col.key} dir={sortKey === col.key ? sortDir : null} />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={colSpan} className="py-16 text-center text-gray-400 dark:text-gray-600">
                    Loading…
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="py-16 text-center text-gray-400 dark:text-gray-600">
                    No results found
                  </td>
                </tr>
              ) : (
                paged.map((row) => (
                  <tr
                    key={rowKey(row)}
                    className={UI.tableRow}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((col) => {
                      const raw = (row as Record<string, unknown>)[col.key];
                      const cell = col.render ? col.render(raw, row) : (raw === null || raw === undefined ? "—" : String(raw));
                      return (
                        <td key={col.key} className={`${UI.tableCell} ${col.cellClassName ?? ""}`}>
                          {cell}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ── */}
      <div className={UI.paginationBar}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          ← Previous
        </button>
        <div className="flex items-center gap-1">
          {pagePills.map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-8 h-8 text-sm rounded-lg font-medium transition-colors ${
                page === n
                  ? "bg-[#26045D] dark:bg-purple-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
