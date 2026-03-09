import { useCallback } from "react";
import { Row } from "@tanstack/react-table";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { ListingDocument } from "@/types/types";
import { createClient } from "@/utils/supabase/client";

export default function ListingAttachmentsTableActions({
  row,
}: {
  row: Row<ListingDocument>;
}) {
  const getSignedUrl = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from("listings")
      .createSignedUrl(row.original.supabase_path, 60 * 60);

    if (error) throw new Error(error.message);

    return data.signedUrl;
  }, [row.original.supabase_path]);

  const downloadFile = async (file: ListingDocument) => {
    const signedUrl = await getSignedUrl();
    if (signedUrl) {
      const link = document.createElement("a");
      link.href = signedUrl;
      link.download = file.document_name; // Extract filename
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex items-center gap-2 mx-auto w-fit">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => downloadFile(row.original)}
      >
        <Image
          src="/images/download-attachment.png"
          height={16}
          width={16}
          alt="download attachment"
        />
      </Button>
    </div>
  );
}
