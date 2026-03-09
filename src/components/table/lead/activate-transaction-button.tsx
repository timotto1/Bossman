"use client";
import { useState } from "react";
import { DocumentIcon } from "@heroicons/react/20/solid";
import { Row } from "@tanstack/react-table";
import { LoaderCircle } from "lucide-react";

import { TransactionsSchema } from "./schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";

export default function ActivateTransactionButton({
  row,
}: {
  row: Row<TransactionsSchema>;
}) {
  const { toast } = useToast();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleTransactionArchived = async () => {
    setIsUpdating(true);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("client_transaction")
        .update({
          archived: false,
        })
        .eq("resident_id", row.original.user_id);

      if (error) throw new Error(error.message);

      toast({
        title: "Success",
        description: `✅ This transaction has been reactivated.`,
      });

      setShowConfirmModal(false);

      location.reload();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelModal = () => {
    setShowConfirmModal(false);
  };

  const handleOpenModalChange = (open: boolean) => {
    if (isUpdating) return null;

    if (!open) {
      handleCancelModal();
      return;
    }
    setShowConfirmModal(open);
  };

  return (
    <>
      <Button
        disabled={isUpdating}
        className="rounded-full bg-gradient-to-r from-[#7747FF] to-[#9847FF] h-8 hover:from-[#5a2dbf] hover:to-[#6a2dbf] w-full"
        onClick={() => setShowConfirmModal(true)}
      >
        {isUpdating ? (
          <LoaderCircle className="w-4 h-4 animate-spin" />
        ) : (
          <DocumentIcon className="w-5 h-5 text-white" />
        )}
        {isUpdating ? "Updating..." : "Reactivate"}
      </Button>

      <Dialog
        open={showConfirmModal}
        onOpenChange={(open) => handleOpenModalChange(open)}
      >
        <DialogContent className="[&>button]:hidden max-w-[600px] max-h-[200px] h-full w-full">
          <DialogTitle />
          <h1 className="font-bold text-base leading-6 tracking-normal text-center text-[#26045D]">
            Are you sure you want to Reactivate this application?
          </h1>
          <p className="font-medium text-sm text-center text-[#26045D]">
            Reactivating this transaction will move it back to your active
            transactions list. You can always archive it again later if needed.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={handleTransactionArchived}
              disabled={isUpdating}
              className="bg-[#26045D] hover:bg-[#0D0021] rounded-full min-w-[100px] max-h-[30px] font-medium text-sm text-white text-center"
            >
              {isUpdating ? (
                <>
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>Reactivate</>
              )}
            </Button>
            <Button
              onClick={handleCancelModal}
              disabled={isUpdating}
              className="border border-[#87858E] text-[#706D78] bg-white hover:border-[#706D78] hover:text-[#706D78] hover:bg-[#D6D5D7] rounded-full min-w-[100px] max-h-[30px] font-medium text-sm text-center"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
