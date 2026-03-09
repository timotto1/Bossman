import { ColumnDef } from "@tanstack/react-table";

import { MetricSchema } from "./schema";
import { cn } from "@/lib/utils";

export const topPerformingRegionsColumns: ColumnDef<MetricSchema>[] = [
  {
    header: "Metric",
    cell: ({ row }) => (
      <div>
        <h3 className="text-sm font-medium leading-5 text-left text-[#7747FF]">
          {row.original.title}
        </h3>
        <p className="font-medium leading-3 text-left text-[#757575]">
          {row.original.description}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "performance",
    header: "Performance",
    cell: ({ row }) => (
      <div
        className={cn(
          "rounded-full max-w-[67px] text-sm font-medium leading-5 text-center mx-auto px-2 py-1",
          row.original.performance === "great" &&
            "bg-[#00C8754A] text-[#00C875]",
        )}
      >
        {row.original.performance.charAt(0).toUpperCase() +
          row.original.performance.slice(1)}
      </div>
    ),
  },
  {
    accessorKey: "value",
    header: "Your Value",
    cell: ({ row }) => (
      <p className="text-sm font-medium leading-5 text-center text-[#7747FF]">
        {row.original.value}%
      </p>
    ),
  },
];
