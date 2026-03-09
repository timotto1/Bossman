"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TableQuery, useTable } from "@/context/table-context";
import { useToast } from "@/hooks/use-toast";

export default function DeleteTableButton({ query }: { query: TableQuery }) {
  const { toast } = useToast();
  const { deleteTable, refreshTables } = useTable();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleTableDeleted = async () => {
    setIsUpdating(true);
    try {
      await deleteTable(query?.id);

      toast({
        title: "Success",
        description: `✅ This table has been deleted`,
      });

      setShowConfirmModal(false);

      await refreshTables();
    } catch (error) {
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
      <div
        className="rounded-full text-[#D6D5D7]"
        onClick={() => setShowConfirmModal(true)}
      >
        Delete
      </div>

      <Dialog
        open={showConfirmModal}
        onOpenChange={(open) => handleOpenModalChange(open)}
      >
        <DialogContent className="[&>button]:hidden max-w-[600px] max-h-[200px] h-full w-full">
          <DialogTitle />
          <h1 className="font-bold text-base leading-6 tracking-normal text-center text-[#26045D]">
            Are you sure you want to delete this table?
          </h1>
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={handleTableDeleted}
              disabled={isUpdating}
              className="bg-[#B84467] hover:bg-[#B84467] rounded-full min-w-[100px] max-h-[30px] font-medium text-sm text-white text-center"
            >
              {isUpdating ? (
                <>
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>Delete</>
              )}
            </Button>
            <Button
              onClick={handleCancelModal}
              disabled={isUpdating}
              className="bg-[#00C875] hover:bg-[#00C875] rounded-full min-w-[100px] max-h-[30px] font-medium text-sm text-white text-center"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
