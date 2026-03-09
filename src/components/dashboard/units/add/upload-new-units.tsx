"use client";

import { useRef, useState } from "react";
import { CloudUploadIcon, LoaderCircle } from "lucide-react";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";
import { fetchBaseClient } from "@/lib/fetch-base-client";
import { MessageEvent } from "@/types/klaviyo";
import { validateHeaders } from "@/utils";
import { uploadingListingsToSupabase } from "@/utils/storage";
import { createClient } from "@/utils/supabase/client";

const unitHeaders = [
  "Development Name",
  "Address_1",
  "Address_2",
  "Address_3",
  "Postcode",
  "Lease Type",
  "Unit Type",
  "PurchaseDate (initial sale date)",
  "Purchase_Price (sale price)",
  "Monthly Rent at sale for 100%",
  "Specified Rent Percentage",
  "Percentage Sold",
  "Service Charge",
];

export default function UploadNewUnits() {
  const { user } = useUser();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSubmit = async (file: File) => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("company")
        .select("name")
        .eq("id", user?.companyID)
        .single();

      if (error) throw new Error(error.message);

      const path = `requests/${user?.id}/units_${new Date().getTime()}.csv`;
      const publicUrl = await uploadingListingsToSupabase(path, file);

      await fetchBaseClient(`/api/listing/request`, {
        method: "POST",
        body: JSON.stringify({
          event: MessageEvent.REQUEST_UNIT_LISTING,
          email: "freddie@withpluto.com",
          properties: {
            name: user?.name,
            company: data.name,
            download_url: publicUrl,
          },
        }),
        headers: {
          "Content-type": "application/json",
        },
      });

      toast({
        title: "Success",
        description:
          "We have received your request to add a new Unit. This will reflect in your account shortly.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "File must be a .csv file",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "File must be less than 10MB",
      });
      return;
    }

    setIsLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json<string[]>(worksheet, {
        header: 1,
        defval: "",
      });

      const [rawHeaders, ...dataRows] = rawRows;
      const { valid, missing } = validateHeaders(rawHeaders, unitHeaders);

      if (!valid) {
        alert(`Invalid template. Missing headers: ${missing.join(", ")}`);
        return;
      }

      if (dataRows.length === 0) {
        alert("The sheet has no data rows. At least one row is required.");
        return;
      }

      await handleFileSubmit(file);
    } catch (err) {
      console.error(err);
      alert("Error reading file.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileSelect}
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="flex items-center gap-2 text-white px-6 text-sm rounded-[10px] h-8 bg-[#26045D]"
      >
        {isLoading && <LoaderCircle className="w-4 h-4 animate-spin mr-2" />}
        <CloudUploadIcon className="w-5 h-5" />
        {isLoading ? "Uploading..." : "Upload CSV"}
      </Button>
    </div>
  );
}
