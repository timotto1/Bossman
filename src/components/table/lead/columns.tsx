"use client";

import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/solid";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import LeadDocuments from "./lead-documents";
import {
  CaseManagerTransactionsSchema,
  FinancialDifficultySchema,
  InsightsSchema,
  LeadSchema,
  MortgageExpirySchema,
  OverviewSchema,
  ReadyToTransactSchema,
  SignupsLast30DaysSchema,
  TransactionsSchema,
} from "./schema";
import TransactionCaseManagerDropdown from "./transaction-case-manager-dropdown";
import TransactionStatusDropdown from "./transaction-status-dropdown";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { getBucket } from "@/lib/utils";

export const signupsLast30DaysColumns: ColumnDef<SignupsLast30DaysSchema>[] = [
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
    accessorKey: "email",
    header: "Email",
    enableSorting: false,
    cell: ({ row }) => (
      <Link
        className="underline"
        href={`/dashboard/lead/${row.original.user_id}`}
      >
        {row.original.email}
      </Link>
    ),
  },
  {
    accessorKey: "first_name",
    header: "First Name",
    enableSorting: false,
  },
  {
    accessorKey: "last_name",
    header: "Last Name",
    enableSorting: false,
  },
  {
    accessorKey: "annual_household_income",
    header: "Salary",
    cell: ({ row }) => (
      <>
        £{(row.original.annual_household_income || 0)?.toLocaleString("en-GB")}
      </>
    ),
  },
  {
    accessorKey: "bucket",
    header: "Bucket",
    enableSorting: false,
    cell: ({ row }) => {
      const buckets = row.original.bucket?.split(",");

      return (
        <div className="flex flex-col space-y-2">
          {buckets?.map((bucket) => getBucket(bucket))}
        </div>
      );
    },
  },
  {
    accessorKey: "address",
    header: "Address",
    enableSorting: false,
  },
  {
    accessorKey: "current_share",
    header: "Ownership",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-3 text-xs font-light leading-4 text-left text-[#26045D]">
        {row.original.current_share || 0}%
        <Progress
          value={row.original.current_share || 0}
          className="h-[5px] bg-transparent"
          indicatorColor="bg-[#7747FF]"
        />
      </div>
    ),
  },
];

export const financialDifficultyColumns: ColumnDef<FinancialDifficultySchema>[] =
  [
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
      accessorKey: "email",
      header: "Email",
      enableSorting: false,
      cell: ({ row }) => (
        <Link
          className="underline"
          href={`/dashboard/lead/${row.original.user_id}`}
        >
          {row.original.email}
        </Link>
      ),
    },
    {
      accessorKey: "first_name",
      header: "First Name",
      enableSorting: false,
    },
    {
      accessorKey: "last_name",
      header: "Last Name",
      enableSorting: false,
    },
    {
      accessorKey: "monthly_income",
      header: "Monthly income",
      cell: ({ row }) => (
        <>£{row.original.monthly_income?.toLocaleString("en-GB")}</>
      ),
    },
    {
      accessorKey: "housing_costs",
      header: "Housing costs",
      enableSorting: false,
      cell: ({ row }) => (
        <>£{row.original.housing_costs?.toLocaleString("en-GB")}</>
      ),
    },
    {
      accessorKey: "other_monthly_costs",
      header: "Other monthly costs",
      enableSorting: false,
      cell: ({ row }) => (
        <>£{row.original.other_monthly_costs?.toLocaleString("en-GB")}</>
      ),
    },
    {
      accessorKey: "costs_percentage",
      header: "% costs",
      enableSorting: false,
      cell: ({ row }) => (
        <>
          {(
            ((row.original.housing_costs + row.original.other_monthly_costs) /
              row.original.monthly_income) *
            100
          )?.toFixed(2)}
          %
        </>
      ),
    },
  ];

export const mortgageExpiryColumns: ColumnDef<MortgageExpirySchema>[] = [
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
    accessorKey: "email",
    header: "Email",
    enableSorting: false,
    cell: ({ row }) => (
      <Link
        className="underline"
        href={`/dashboard/lead/${row.original.user_id}`}
      >
        {row.original.email}
      </Link>
    ),
  },
  {
    accessorKey: "first_name",
    header: "First Name",
    enableSorting: false,
  },
  {
    accessorKey: "last_name",
    header: "Last Name",
    enableSorting: false,
  },
  {
    accessorKey: "rate_end_date",
    header: "Mortgage expiry",
    cell: ({ row }) => (
      <>
        {row?.original?.rate_end_date
          ? new Date(row.original.rate_end_date)
              .toLocaleDateString("en-GB")
              .replaceAll("/", "-")
          : null}
      </>
    ),
  },
  {
    accessorKey: "lender_name",
    header: "Lender",
    enableSorting: false,
  },
  {
    accessorKey: "maximum_share",
    header: "Max share",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-3 text-xs font-light leading-4 text-left text-[#26045D]">
        {row.original.maximum_share || 0}%
        <Progress
          value={row.original.maximum_share || 0}
          className="h-[5px] bg-transparent"
          indicatorColor="bg-[#7747FF]"
        />
      </div>
    ),
  },
];

export const overviewColumns: ColumnDef<OverviewSchema>[] = [
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
    accessorKey: "email",
    header: "Email",
    enableSorting: false,
    cell: ({ row }) => (
      <Link
        className="underline"
        href={`/dashboard/lead/${row.original.user_id}`}
      >
        {row.original.email}
      </Link>
    ),
  },
  {
    accessorKey: "first_name",
    header: "First Name",
    enableSorting: false,
  },
  {
    accessorKey: "last_name",
    header: "Last Name",
    enableSorting: false,
  },
  {
    accessorKey: "annual_household_income",
    header: "Salary",
    cell: ({ row }) => (
      <>
        £{(row.original.annual_household_income || 0)?.toLocaleString("en-GB")}
      </>
    ),
  },
  {
    accessorKey: "bucket",
    header: "Bucket",
    enableSorting: false,
    cell: ({ row }) => {
      const buckets = row.original.bucket?.split(",");

      return !row.original.has_client_transaction ? (
        <div className="flex flex-col space-y-2">
          {buckets?.map((bucket) => getBucket(bucket))}
        </div>
      ) : (
        <div className="flex flex-col space-y-2">
          {getBucket("transacting")}
        </div>
      );
    },
  },
  {
    accessorKey: "address",
    header: "Address",
    enableSorting: false,
  },
  {
    accessorKey: "current_share",
    header: "Ownership",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-3 text-xs font-light leading-4 text-left text-[#26045D]">
        {row.original.current_share || 0}%
        <Progress
          value={row.original.current_share || 0}
          className="h-[5px] bg-transparent"
          indicatorColor="bg-[#7747FF]"
        />
      </div>
    ),
  },
  {
    accessorKey: "cash_savings",
    header: "Savings",
    enableSorting: false,
    cell: ({ row }) => (
      <>£{(row.original.cash_savings || 0)?.toLocaleString("en-GB")}</>
    ),
  },
  {
    accessorKey: "move_in_date",
    header: "Move-in Date",
    cell: ({ row }) => (
      <>
        {row?.original?.move_in_date
          ? new Date(row.original.move_in_date)
              .toLocaleDateString("en-GB")
              .replaceAll("/", "-")
          : null}
      </>
    ),
  },
  {
    accessorKey: "signup_date",
    header: "Signup Date",
    cell: ({ row }) => (
      <>
        {row?.original?.signup_date
          ? new Date(row.original.signup_date)
              .toLocaleDateString("en-GB")
              .replaceAll("/", "-")
          : null}
      </>
    ),
  },
];

export const readyToTransactColumns: ColumnDef<ReadyToTransactSchema>[] = [
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
    accessorKey: "email",
    header: "Email",
    enableSorting: false,
    cell: ({ row }) => (
      <Link
        className="underline"
        href={`/dashboard/lead/${row.original.user_id}`}
      >
        {row.original.email}
      </Link>
    ),
  },
  {
    accessorKey: "first_name",
    header: "First Name",
    enableSorting: false,
  },
  {
    accessorKey: "last_name",
    header: "Last Name",
    enableSorting: false,
  },
  {
    accessorKey: "annual_household_income",
    header: "Salary",
    cell: ({ row }) => (
      <>
        £{(row.original.annual_household_income || 0)?.toLocaleString("en-GB")}
      </>
    ),
  },
  {
    accessorKey: "cash_savings",
    header: "Savings",
    enableSorting: false,
    cell: ({ row }) => (
      <>£{(row.original.cash_savings || 0)?.toLocaleString("en-GB")}</>
    ),
  },
  {
    accessorKey: "maximum_share",
    header: "Max share",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-3 text-xs font-light leading-4 text-left text-[#26045D]">
        {row.original.maximum_share || 0}%
        <Progress
          value={row.original.maximum_share || 0}
          className="h-[5px] bg-transparent"
          indicatorColor="bg-[#7747FF]"
        />
      </div>
    ),
  },
  {
    accessorKey: "transaction_value",
    header: "Transaction Value",
    cell: ({ row }) => (
      <>£{(row.original.transaction_value || 0)?.toLocaleString("en-GB")}</>
    ),
  },
];

export const transactionsColumn: ColumnDef<TransactionsSchema>[] = [
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
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => (
      <div className="w-[80px]">
        {row?.original?.created_at
          ? new Date(row.original.created_at)
              .toLocaleDateString("en-GB")
              .replaceAll("/", "-")
          : null}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    enableSorting: false,
    cell: ({ row }) => (
      <Link
        className="underline"
        href={`/dashboard/lead/${row.original.user_id}`}
      >
        {row.original.email}
      </Link>
    ),
  },
  {
    accessorKey: "first_name",
    header: "First Name",
    enableSorting: false,
  },
  {
    accessorKey: "last_name",
    header: "Last Name",
    enableSorting: false,
  },
  {
    accessorKey: "address",
    header: "Address",
    enableSorting: false,
    cell: ({ row }) => row.original.address || "",
  },
  {
    accessorKey: "purchase_amount",
    header: "Transaction Value",
    cell: ({ row }) => (
      <>£{(row.original.purchase_amount || 0)?.toLocaleString("en-GB")}</>
    ),
  },
  {
    accessorKey: "application_status",
    header: "Application status",
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="flex flex-col space-y-2">
          <TransactionStatusDropdown row={row} />
        </div>
      );
    },
  },
  {
    accessorKey: "current_share",
    header: "Ownership",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-3 text-xs font-light leading-4 text-left text-[#26045D]">
        {row.original.current_share || 0}%
        <Progress
          value={row.original.current_share || 0}
          className="h-[5px] bg-transparent"
          indicatorColor="bg-[#7747FF]"
        />
      </div>
    ),
  },
  {
    accessorKey: "case_manager",
    header: "Case Manager",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col space-y-2">
          <TransactionCaseManagerDropdown row={row} />
        </div>
      );
    },
  },
  {
    id: "action",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => <LeadDocuments row={row} />,
  },
];

export const complaintColumns: ColumnDef<LeadSchema>[] = [
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
    accessorKey: "email",
    header: "Email",
    enableSorting: false,
  },
  {
    accessorKey: "first_name",
    header: "First name",
    enableSorting: false,
  },
  {
    accessorKey: "last_name",
    header: "Last name",
    enableSorting: false,
  },
  {
    accessorKey: "complaintDate",
    header: "Complaint Date",
  },
  {
    accessorKey: "complaintStatus",
    header: "Status",
    enableSorting: false,
    cell: () => "In Progress",
  },
  {
    accessorKey: "complaintDescription",
    header: "Description",
    enableSorting: false,
  },
];

export const vulnerableClientsColumns: ColumnDef<LeadSchema>[] = [
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
    accessorKey: "email",
    header: "Email",
    enableSorting: false,
  },
  {
    accessorKey: "first_name",
    header: "First name",
    enableSorting: false,
  },
  {
    accessorKey: "last_name",
    header: "Last name",
    enableSorting: false,
  },
  {
    accessorKey: "bucket",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => {
      const buckets = row.original.bucket?.split(",");

      return (
        <div className="flex flex-col space-y-2">
          {buckets?.map((bucket) => getBucket(bucket))}
        </div>
      );
    },
  },
  {
    accessorKey: "vulnerableDateIdentified",
    header: "Date Identified",
  },
  {
    accessorKey: "vulnerableDateAdded",
    header: "Date Added",
  },
  {
    accessorKey: "vulnerableScore",
    header: "Vulnerable Score",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-3 text-xs font-light leading-4 text-left text-[#26045D]">
        {row.original.vulnerableScore}%
        <Progress
          value={row.original.vulnerableScore}
          className="h-[5px] bg-transparent"
          indicatorColor="bg-[#7747FF]"
        />
      </div>
    ),
  },
];

export const activeTransactionsColumn: ColumnDef<TransactionsSchema>[] = [
  // {
  //   id: "select",
  //   cell: ({ row }) => (
  //     <Checkbox
  //       className="data-[state=checked]:bg-[#26045D] border-[#26045D]"
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "first_name",
    header: "Name",
    enableSorting: false,
    cell: ({ row }) => (
      <Link
        className="text-[#26045D] font-[500]"
        href={`/dashboard/lead/${row.original.user_id}`}
      >
        {row.original.first_name}&nbsp;{row.original.last_name}
      </Link>
    ),
  },
  {
    accessorKey: "address",
    header: "Address",
    enableSorting: false,
    cell: ({ row }) => row.original.address || "",
  },
  {
    accessorKey: "transaction_size",
    header: "Transaction size",
    cell: ({ row }) => (
      <>£{(row.original.transaction_size || 0)?.toLocaleString("en-GB")}</>
    ),
  },
  {
    accessorKey: "application_status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="flex flex-col space-y-2">
          <TransactionStatusDropdown row={row} />
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Length",
    cell: ({ row }) => {
      const createdAtRaw = row?.original?.created_at;
      if (!createdAtRaw) return <div className="w-[80px]"></div>;

      const createdAt = new Date(createdAtRaw);
      const now = new Date();

      const diffMs = now.getTime() - createdAt.getTime(); // ✅ both numbers
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      let lengthText;
      if (diffDays < 1) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        lengthText = `${diffHours} hours`;
      } else {
        lengthText = `${diffDays} days`;
      }

      return <div className="w-[80px]">{lengthText}</div>;
    },
  },
  {
    accessorKey: "case_manager",
    header: "Case Manager",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col space-y-2">
          <TransactionCaseManagerDropdown row={row} />
        </div>
      );
    },
  },
  // {
  //   id: "edit",
  //   header: "Edit",
  //   enableSorting: false,
  //   cell: ({ row }) => (
  //     <div className="flex gap-2 items-center">
  //       <PermissionGuard permissions={["archive_transaction"]}>
  //         <ArchiveTransactionButton row={row} simpleMode />
  //       </PermissionGuard>
  //       <div
  //         className="text-sm text-[#AE78F1] font-semibold w-fit cursor-pointer"
  //         onClick={() => {
  //           row.toggleSelected(!!!row.getIsSelected());
  //         }}
  //       >
  //         {row.getIsSelected() ? "Done" : "Edit"}
  //       </div>
  //     </div>
  //   ),
  // },
  {
    id: "action",
    header: "",
    enableSorting: false,
    cell: ({ row }) => <LeadDocuments key={row.id} row={row} />,
  },
];

export const caseManagerTransactionsColumn: ColumnDef<CaseManagerTransactionsSchema>[] =
  [
    // {
    //   id: "select",
    //   cell: ({ row }) => (
    //     <Checkbox
    //       className="data-[state=checked]:bg-[#26045D] border-[#26045D]"
    //       checked={row.getIsSelected()}
    //       onCheckedChange={(value) => row.toggleSelected(!!value)}
    //       aria-label="Select row"
    //     />
    //   ),
    //   enableSorting: false,
    //   enableHiding: false,
    // },
    {
      accessorKey: "case_manager_name",
      header: "Name",
      enableSorting: false,
      cell: ({ row }) => (
        <h5 className="text-[#26045D] font-[500]">
          {row.original.case_manager_name}
        </h5>
      ),
    },
    {
      accessorKey: "pipeline_value",
      header: "Pipeline",
      cell: ({ row }) => {
        const value = row.original.pipeline_value.value || 0;
        const change = row.original.pipeline_value.change;

        return (
          <div className="flex items-center gap-2">
            £{value.toLocaleString("en-GB")}&nbsp;
            {change !== null && change !== 0 ? (
              change >= 0 ? (
                <div className="bg-[#ECFDF3] py-[2px] px-2 text-xs text-[#027A48] max-w-fit rounded-full flex items-center">
                  <ArrowUpIcon className="w-3 text-[#12B76A] font-bold" />
                  &nbsp;{change}%
                </div>
              ) : (
                <div className="bg-[#FEF3F2] py-[2px] px-2 text-xs text-[#B42318] max-w-fit rounded-full flex items-center">
                  <ArrowDownIcon className="w-3 text-[#F04438] font-bold" />
                  &nbsp;{Math.abs(change)}%
                </div>
              )
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: "pipeline_cases",
      header: "No. cases",
      cell: ({ row }) => {
        const value = row.original.pipeline_cases.value || 0;
        const change = row.original.pipeline_cases.change;

        return (
          <div className="flex items-center gap-2">
            {value}
            {change !== null && change !== 0 ? (
              change >= 0 ? (
                <div className="bg-[#ECFDF3] py-[2px] px-2 text-xs text-[#027A48] max-w-fit rounded-full flex items-center">
                  <ArrowUpIcon className="w-3 text-[#12B76A] font-bold" />
                  &nbsp;{change}%
                </div>
              ) : (
                <div className="bg-[#FEF3F2] py-[2px] px-2 text-xs text-[#B42318] max-w-fit rounded-full flex items-center">
                  <ArrowDownIcon className="w-3 text-[#F04438] font-bold" />
                  &nbsp;{Math.abs(change)}%
                </div>
              )
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: "completed_value",
      header: "Completed",
      cell: ({ row }) => {
        const value = row.original.completed_value.value || 0;
        const change = row.original.completed_value.change;

        return (
          <div className="flex items-center gap-2">
            £{value.toLocaleString("en-GB")}
            {change !== null && change !== 0 ? (
              change >= 0 ? (
                <div className="bg-[#ECFDF3] py-[2px] px-2 text-xs text-[#027A48] max-w-fit rounded-full flex items-center">
                  <ArrowUpIcon className="w-3 text-[#12B76A] font-bold" />
                  &nbsp;{change}%
                </div>
              ) : (
                <div className="bg-[#FEF3F2] py-[2px] px-2 text-xs text-[#B42318] max-w-fit rounded-full flex items-center">
                  <ArrowDownIcon className="w-3 text-[#F04438] font-bold" />
                  &nbsp;{Math.abs(change)}%
                </div>
              )
            ) : null}
          </div>
        );
      },
    },
    // {
    //   accessorKey: "average_time",
    //   header: "Avg. time",
    //   enableSorting: false,
    //   cell: ({ row }) => row.original.average_time || "n/a",
    // },
    // {
    //   id: "edit",
    //   header: "Edit",
    //   enableSorting: false,
    //   cell: () => (
    //     <div className="flex gap-2 items-center">
    //       <PencilIcon className="w-5" />
    //     </div>
    //   ),
    // },
  ];

export const insightsColumn: ColumnDef<InsightsSchema>[] = [
  // {
  //   id: "select",
  //   cell: ({ row }) => (
  //     <Checkbox
  //       className="data-[state=checked]:bg-[#26045D] border-[#26045D]"
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "first_name",
    header: "Name",
    cell: ({ row }) => (
      <Link
        className="text-[#26045D] font-[500]"
        href={`/dashboard/lead/${row.original.user_id}`}
      >
        {row.original.first_name}&nbsp;{row.original.last_name}
      </Link>
    ),
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "annual_household_income",
    header: "Salary",
    cell: ({ row }) => (
      <>
        £{(row.original.annual_household_income || 0)?.toLocaleString("en-GB")}
      </>
    ),
  },
  {
    accessorKey: "cash_savings",
    header: "Savings",
    cell: ({ row }) => (
      <>£{(row.original.cash_savings || 0)?.toLocaleString("en-GB")}</>
    ),
  },
  {
    accessorKey: "move_in_date",
    header: "Move-in Date",
    cell: ({ row }) => (
      <>
        {row?.original?.move_in_date
          ? new Date(row.original.move_in_date)
              .toLocaleDateString("en-GB")
              .replaceAll("/", "-")
          : null}
      </>
    ),
  },
];
