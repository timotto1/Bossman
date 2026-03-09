"use client";

import { useCallback, useEffect, useState } from "react";

import { enquiryColumns } from "./columns";
import { EnquirySchema } from "./schema";
import { DataTable } from "@/components/table/data-table";
import { Card, CardContent } from "@/components/ui/card";

const data: EnquirySchema[] = [
  {
    id: 1,
    name: "Tim Otto",
    development_name: "Dev. name",
    unit_id: 5,
    email: "tim@stairpay.com",
    household_income: 45256,
    deposit: 5256,
    eligibility_status: "eligible",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Tim Otto",
    development_name: "Dev. name",
    unit_id: 9,
    email: "tim@stairpay.com",
    household_income: 45256,
    deposit: 5256,
    eligibility_status: "eligible",
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Tim Otto",
    development_name: "Dev. name",
    unit_id: 24,
    email: "tim@stairpay.com",
    household_income: 45256,
    deposit: 5256,
    eligibility_status: "eligible",
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: "Tim Otto",
    development_name: "Dev. name",
    unit_id: 52,
    email: "tim@stairpay.com",
    household_income: 45256,
    deposit: 5256,
    eligibility_status: "eligible",
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    name: "Tim Otto",
    development_name: "Dev. name",
    unit_id: 765,
    email: "tim@stairpay.com",
    household_income: 45256,
    deposit: 5256,
    eligibility_status: "eligible",
    created_at: new Date().toISOString(),
  },
];

export default function EnquiriesTable() {
  const [isLoading, setIsLoading] = useState(true);
  const [enquiries, setEnquiries] = useState<EnquirySchema[]>([]);

  const getEnquiries = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsLoading(false);
    setEnquiries(data);
  }, []);

  useEffect(() => {
    getEnquiries();
  }, [getEnquiries]);

  return (
    <Card className="rounded-lg border-[#EEEEEE] bg-white">
      <CardContent className="p-4 relative">
        <DataTable
          isLoading={isLoading}
          showTotal={false}
          showSearchFilter={true}
          showFilter={false}
          showColumnToggle={true}
          showExport={true}
          columns={enquiryColumns}
          data={enquiries}
          //   filters={filtersCaseManagerTransactions}
          //   updateFilters={updateFiltersCaseManagerTransactions}
          //   filterConfig={FILTER_CONFIG}
          searchPlaceholder="Search"
          title={
            <div className="flex gap-2 px-2 items-center">
              <h2 className="text-lg font-medium text-[#26045D]">Enquiries</h2>
            </div>
          }
        />
      </CardContent>
    </Card>
  );
}
