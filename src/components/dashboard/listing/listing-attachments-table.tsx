import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useParams } from "next/navigation";

import { listingAttachmentColumns } from "./attachment-columns";
import { DataTable } from "@/components/table/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { ListingDocument } from "@/types/types";
import { createClient } from "@/utils/supabase/client";

// Wrap component with forwardRef
const ListingAttachmentsTable = forwardRef(function ListingAttachmentsTable(
  {
    onSelectionChange,
    type,
  }: {
    onSelectionChange?: (selected: ListingDocument[]) => void;
    type: "developments" | "units";
  },
  ref,
) {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [attachments, setAttachments] = useState<ListingDocument[]>([]);

  const getListingAttachments = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from(
          type === "developments"
            ? "development_listing_documents"
            : "unit_listing_documents",
        )
        .select("*")
        .eq(
          type === "developments"
            ? "development_listing_id"
            : "unit_listing_id",
          type === "developments" ? params?.id : params.unitId,
        );

      if (error) throw new Error(error.message);

      setAttachments(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [params.id, params.unitId, type]);

  useEffect(() => {
    getListingAttachments();
  }, [getListingAttachments]);

  useImperativeHandle(ref, () => ({
    refresh: getListingAttachments,
  }));

  return (
    <Card className="rounded-[12px] border-[#EEEEEE] bg-white">
      <CardContent className="p-4 relative">
        <DataTable
          showTotal={false}
          showSearchFilter={true}
          showExport={false}
          showColumnToggle={false}
          columns={listingAttachmentColumns}
          data={attachments}
          isLoading={isLoading}
          onSelectionChange={onSelectionChange}
          title={
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium text-[#26045D]">
                Attachments
              </h2>
              <div className="bg-[#F4F0FE] py-[2px] px-2 text-xs text-[#AE78F1] max-w-fit rounded-full">
                {attachments.length} attachment
                {attachments.length > 1 ? "s" : ""}
              </div>
            </div>
          }
        />
      </CardContent>
    </Card>
  );
});

export default ListingAttachmentsTable;
