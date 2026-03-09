"use client";

import { useRef, useState } from "react";
import { DocumentPlusIcon } from "@heroicons/react/24/solid";
import { LoaderCircle } from "lucide-react";

import ListingAttachmentsModal from "../../listing-attachments-modal";
import ListingAttachmentsTable from "../../listing-attachments-table";
import { Button } from "@/components/ui/button";
import { useUnitListing } from "@/context/unit-listing-context";
import { useToast } from "@/hooks/use-toast";
import { ListingDocument } from "@/types/types";
import { deleteListingsFromSupabase } from "@/utils/storage";
import { createClient } from "@/utils/supabase/client";

export default function UnitListingAttachmentsPage() {
  const { toast } = useToast();

  const { data: unitListing, refreshListing } = useUnitListing();

  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<
    ListingDocument[]
  >([]);
  const tableRef = useRef<{ refresh: () => void }>(null); // ✅ Ref for refresh

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      const idsToDelete = selectedAttachments.map(
        (attachment) => attachment.id,
      );
      const pathsToDelete = selectedAttachments.map(
        (attachment) => attachment.supabase_path,
      );

      await deleteListingsFromSupabase(pathsToDelete);

      const { error } = await supabase
        .from("unit_listing_documents")
        .delete()
        .in("id", idsToDelete);

      if (error) throw new Error(error.message);

      tableRef.current?.refresh();

      await refreshListing();

      setSelectedAttachments([]);

      toast({
        title: "Success",
        description: "Attachment removed successfully!",
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

  return (
    <>
      <div className="px-5 py-4 space-y-4">
        <div className="flex items gap-4">
          <Button
            type="button"
            className="flex items-center gap-2 text-white px-6 text-sm rounded-[12px] bg-gradient-to-r from-[#7747FF] to-[#9847FF] h-8 hover:from-[#5a2dbf] hover:to-[#6a2dbf]"
            onClick={() => setModalOpen(true)}
          >
            <DocumentPlusIcon className="w-5 h-5 text-white" />
            Add document
          </Button>
          {selectedAttachments.length ? (
            <Button
              disabled={isLoading}
              type="button"
              className="bg-[#F0F0FE] hover:bg-[#F0F0FE] rounded-full max-w-[184px] w-full text-sm font-medium leading-5 text-left text-[#26045D] h-8"
              onClick={handleRemove}
            >
              {isLoading && <LoaderCircle className="w-4 h-4 animate-spin" />}
              {isLoading ? "Removing..." : "Remove attachment"}
            </Button>
          ) : null}
        </div>
        <ListingAttachmentsTable
          type="units"
          ref={tableRef}
          onSelectionChange={setSelectedAttachments}
        />
      </div>

      <ListingAttachmentsModal
        type="units"
        id={unitListing!.id!}
        refreshListing={refreshListing}
        open={modalOpen}
        handleOpenChange={setModalOpen}
        refreshAttachmentsTable={() => tableRef?.current?.refresh()}
      />
    </>
  );
}
