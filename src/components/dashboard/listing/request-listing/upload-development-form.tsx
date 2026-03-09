"use client";

import { useState } from "react";

import UploadXLSXForm from "./upload-xlsx-form";
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";
import { fetchBaseClient } from "@/lib/fetch-base-client";
import { MessageEvent } from "@/types/klaviyo";
import { uploadingListingsToSupabase } from "@/utils/storage";
import { createClient } from "@/utils/supabase/client";

const developmentHeaders = [
  "Name",
  "Postcode",
  "City",
  "Is Shared Ownership (Y/N)?",
  "Is Help to Buy (Y/N)",
  "Housing Provider",
  "Completion Date",
  "Management Company",
];

export default function UploadDevelopmentForm({
  onDevelopmentAdded,
}: {
  onDevelopmentAdded: () => void;
}) {
  const { user } = useUser();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);

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

      const path = `requests/${user?.id}/developments_${new Date().getTime()}.csv`;
      const publicUrl = await uploadingListingsToSupabase(path, file);

      await fetchBaseClient(`/api/listing/request`, {
        method: "POST",
        body: JSON.stringify({
          event: MessageEvent.REQUEST_DEVELOPMENT_LISTING,
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
          "We have received your request to add a new Development. This will reflect in your account shortly.",
      });

      onDevelopmentAdded();
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

  return (
    <UploadXLSXForm
      expectedHeaders={developmentHeaders}
      onValidUpload={handleFileSubmit}
      isLoading={isLoading}
    />
  );
}
