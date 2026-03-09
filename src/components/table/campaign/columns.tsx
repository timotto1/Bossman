"use client";

import { ColumnDef } from "@tanstack/react-table";

import { CampaignSchema } from "./schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

export const campaignsColumns: ColumnDef<CampaignSchema>[] = [
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
    accessorKey: "campaign",
    header: "Campaign",
    cell: ({ row }) => row.original.campaign,
  },
  {
    accessorKey: "channel",
    header: "Channel",
    cell: ({ row }) => row.original.channel,
  },
  {
    accessorKey: "sendDate",
    header: "Send Date",
    cell: ({ row }) =>
      new Date(row.original.sendDate)
        .toLocaleDateString("en-GB")
        .replaceAll("/", "-"),
  },
  {
    accessorKey: "clientName",
    header: "Client Name",
    cell: ({ row }) => row.original.clientName,
  },
  {
    accessorKey: "clientStatus",
    header: "Client Status",
    cell: ({ row }) => {
      const statusColors: Record<string, string> = {
        "Mortgage expiry": "#FF4774",
        "Ready to transact": "#36C68C",
        "Financial difficulty": "#FFB047",
        "Accessibility needs": "#8C47FF",
      };

      return (
        <div className="flex pl-20 items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: statusColors[row.original.clientStatus] }}
          />
          {row.original.clientStatus}
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email Address",
    cell: ({ row }) => row.original.email,
  },
  {
    accessorKey: "engagementRate",
    header: "Engagement Rate",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span>{row.original.engagementRate}%</span>
        <Progress
          className="h-[5px] bg-transparent"
          indicatorColor="bg-[#7747FF]"
          value={row.original.engagementRate}
        />
      </div>
    ),
  },
];
