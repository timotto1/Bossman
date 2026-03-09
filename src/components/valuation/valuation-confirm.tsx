"use client";

import { useState } from "react";
import { DocumentArrowDownIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

interface UnitForValuation {
  unit_id: string;
  address_line_1: string;
  address_line_2: string;
  address_line_3: string;
  town: string;
  postcode: string;
  occupation_status: string;
  property_valuation_date: string;
  property_valuation_amount: string;
  hpi_value_at_valuation: string;
  hpi_valuation_date: string;
  hpi_valuation_amount: number;
  current_hpi_value: string;
}

export default function ValuationConfirmation({
  generatedUnits,
  handleBack,
}: {
  generatedUnits: string[];
  handleBack: () => void;
}) {
  const { id } = useParams();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const convertJsonToCSV = (units: UnitForValuation[]) => {
    const headers = {
      unit_id: "Unit ID",
      development_name: "Development Name",
      address_line_1: "Address Line 1",
      address_line_2: "Address Line 2",
      address_line_3: "Address Line 3",
      town: "Town",
      postcode: "Postcode",
      occupation_status: "Occupation status",
      purchase_date: "Purchase Date",
      property_valuation_date: "Property valuation date",
      property_valuation_amount: "Property valuation amount",
      hpi_value_at_valuation: "HPI value at valuation",
      hpi_valuation_date: "HPI valuation date",
      hpi_valuation_amount: "HPI valuation amount",
      current_hpi_value: "Current HPI value",
    };

    const csvRows = [];

    csvRows.push(Object.values(headers).join(","));

    for (const unit of units) {
      const values = (Object.keys(headers) as (keyof UnitForValuation)[]).map(
        (header) => {
          const value = unit[header];
          return typeof value === "string"
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        },
      );
      csvRows.push(values.join(","));
    }

    return csvRows.join("\n");
  };

  const downloadCsv = (units: UnitForValuation[]) => {
    const csv = convertJsonToCSV(units);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${Date.now()}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleDownload = async () => {
    //alert("Download CSV initiated");
    // Implement the download functionality here
    try {
      setIsLoading(true);

      const { data: units, error: unitsError } = await supabase.rpc(
        `platform_units_valuation_document`,
        {
          unit_ids: generatedUnits,
        },
      );

      if (unitsError) throw new Error(unitsError.message);

      downloadCsv(units);
    } catch (err) {
      console.error((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleSend = () => {
  //   // Navigate to the /valuation/send page with the units parameter
  //   router.push(`/valuation/send`);
  // };

  if (!generatedUnits.length) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full border text-center">
          <h2 className="text-2xl font-bold text-[#26045D] mb-4">
            Valuation statements not created
          </h2>
          <p className="text-sm font-normal text-gray-600 mb-4">
            No worries. Please visit your dashboard to generate a valuation
            statement
          </p>
          <Link
            href={`/valuation/${id}`}
            className="w-full bg-[#7747FF] hover:bg-[#6A3FE6] text-white rounded-full py-3 text-md font-bold flex items-center justify-center gap-2"
          >
            Back to Valuation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full border">
        {/* Title */}
        <h2 className="text-2xl font-bold text-[#26045D] mb-4">
          Valuation statements created
        </h2>
        <p className="text-sm font-normal text-gray-600 mb-4">
          You have successfully created valuation statements for{" "}
          <span className="font-bold text-[#26045D]">
            {generatedUnits.length} units.
          </span>
        </p>
        <p className="text-sm font-normal text-gray-600 mb-8">
          You can download this statement as a CSV
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-4 items-center">
          <Button
            disabled={isLoading}
            onClick={handleDownload}
            className="bg-[#7747FF] hover:bg-[#6A3FE6] text-white rounded-full py-3 w-6/12 text-md font-bold flex items-center justify-center gap-2"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            Download
          </Button>
          <Button
            onClick={handleBack}
            className="w-6/12 bg-[#7747FF] hover:bg-[#6A3FE6] text-white rounded-full py-3 text-md font-bold flex items-center justify-center gap-2"
          >
            Back to Valuation
          </Button>
        </div>
      </div>
    </div>
  );
}
