"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { StaircasingInitiativeSchema } from "./schema";

export const attentionRequiredColumns: ColumnDef<StaircasingInitiativeSchema>[] =
  [
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const getCategoryLabel = () => {
          switch (row.original.category) {
            case "new_complaint":
              return "New Complaint";
            case "consumer_duty_failing":
              return "Consumer Duty Failing";
          }
        };

        return (
          <Link
            href={`/dashboard/staircasing-initiative/${row.original.id}/breakdown`}
            className="underline"
          >
            {getCategoryLabel()}
          </Link>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span
          dangerouslySetInnerHTML={{
            __html: row.original.description,
          }}
        />
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: () => (
        <div className="flex items-center gap-2 text-xs font-normal leading-4 text-center text-[#26045D]">
          <div className="w-3 h-3 rounded-full bg-[#B84467]" />
          Action Required
        </div>
      ),
    },
    {
      accessorKey: "reviewDate",
      header: "Review Date",
    },
    {
      accessorKey: "completeDate",
      header: "Complete by Date",
    },
  ];

export const initiativeColumns: ColumnDef<StaircasingInitiativeSchema>[] = [
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const getCategoryLabel = () => {
        switch (row.original.category) {
          case "staircasing":
            return "Staircasing";
          case "internal_strategy":
            return "Internal Strategy";
          case "consumer_duty":
            return "Consumer Duty";
        }
      };

      return (
        <Link
          href={`/dashboard/staircasing-initiative/${row.original.id}`}
          className="underline"
        >
          {getCategoryLabel()}
        </Link>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span
        dangerouslySetInnerHTML={{
          __html: row.original.description,
        }}
      />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      switch (row.original.status) {
        case "in_progress":
          return (
            <div className="flex items-center gap-2 text-xs font-normal leading-4 text-center text-[#26045D]">
              <div className="w-3 h-3 rounded-full bg-[#00C875]" />
              In progress
            </div>
          );
        case "draft":
          return (
            <div className="flex items-center gap-2 text-xs font-normal leading-4 text-center text-[#26045D]">
              <div className="w-3 h-3 rounded-full bg-[#7747FF]" />
              Draft
            </div>
          );
        case "in_review":
          return (
            <div className="flex items-center gap-2 text-xs font-normal leading-4 text-center text-[#26045D]">
              <div className="w-3 h-3 rounded-full bg-[#3B0CBC]" />
              In Review
            </div>
          );
        case "actions_overdue":
          return (
            <div className="flex items-center gap-2 text-xs font-normal leading-4 text-[#26045D]">
              <div className="w-3 h-3 rounded-full bg-[#B84467]" />
              Actions Overdue
            </div>
          );
        default:
          return null;
      }
    },
  },
  {
    accessorKey: "createDate",
    header: "Create Date",
  },
  {
    accessorKey: "nextReviewDate",
    header: "Next Review Date",
  },
];

export const actionsRequiredColumns: ColumnDef<StaircasingInitiativeSchema>[] =
  [
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const getCategoryLabel = () => {
          switch (row.original.category) {
            case "target_market_assessments":
              return "Target Market Assessments";
            case "testing_outcomes":
              return "Testing Outcomes";
            case "fair_value_analysis":
              return "Fair Value Analysis";
            case "policies_and_procedures":
              return "Policies and Procedures";
          }
        };

        return (
          <Link
            href={`/dashboard/staircasing-initiative/${row.original.id}/breakdown`}
            className="underline"
          >
            {getCategoryLabel()}
          </Link>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span
          dangerouslySetInnerHTML={{
            __html: row.original.description,
          }}
        />
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: () => (
        <div className="flex items-center gap-2 text-xs font-normal leading-4 text-[#26045D]">
          <div className="w-3 h-3 rounded-full bg-[#B84467]" />
          Action Required
        </div>
      ),
    },
    {
      accessorKey: "reviewDate",
      header: "Review Date",
    },
    {
      accessorKey: "deadline",
      header: "Deadline",
    },
  ];
