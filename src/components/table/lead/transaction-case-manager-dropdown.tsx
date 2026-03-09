"use client";

import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { ChevronDownIcon, Loader2, LoaderCircle } from "lucide-react";

import { TransactionsSchema } from "./schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PermissionGuard } from "@/guards/permission-guard";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";

export default function TransactionCaseManagerDropdown({
  row,
}: {
  row: Row<TransactionsSchema>;
}) {
  const { toast } = useToast();

  const [selectedCaseManager, setSelectedCaseManager] = useState(
    row.original.case_manager,
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentCaseManager = row.original.case_manager;

  const getCaseManagerName = (caseManagerValue: string) => {
    if (!caseManagerValue) return "";

    const caseManager = row.original.case_managers_list.find(
      (caseManager) => caseManager.id === caseManagerValue,
    );

    return `${caseManager?.first_name} ${caseManager?.last_name}`;
  };

  const getCaseManagerInitials = (caseManagerValue: string) => {
    if (!caseManagerValue) return "";

    const caseManager = row.original.case_managers_list.find(
      (caseManager) => caseManager.id === caseManagerValue,
    );

    return (
      (caseManager?.first_name?.[0] ?? "-").toUpperCase() +
      (caseManager?.last_name?.[0] ?? "-").toUpperCase()
    );
  };

  const handleCaseManagerSelect = (caseManagerValue: string) => {
    if (caseManagerValue === currentCaseManager) return;

    setSelectedCaseManager(caseManagerValue);
    setShowConfirmModal(true);
  };

  const handleCancelModal = () => {
    setShowConfirmModal(false);
    setSelectedCaseManager(currentCaseManager);
  };

  const handleOpenModalChange = (open: boolean) => {
    if (isUpdating) return null;

    if (!open) {
      handleCancelModal();
      return;
    }
    setShowConfirmModal(open);
  };

  const handleCaseManagerChange = async () => {
    setIsUpdating(true);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("client_transaction")
        .update({
          case_manager: selectedCaseManager,
        })
        .eq("resident_id", row.original.user_id);

      if (error) throw new Error(error.message);

      row.original.case_manager = selectedCaseManager;

      toast({
        title: "Success",
        description: `✅ ${getCaseManagerName(selectedCaseManager)} is assigned to this transaction.`,
      });

      setShowConfirmModal(false);
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

  return (
    <>
      <PermissionGuard
        permissions={["change_account_manager"]}
        fallback={
          <p className="text-[#26045D] text-sm text-left flex gap-2 items-center">
            <div className="uppercase rounded-full text-white text-base h-8 w-8 flex items-center justify-center bg-[#26045D]">
              {getCaseManagerInitials(selectedCaseManager)}
            </div>
            {getCaseManagerName(selectedCaseManager)}
          </p>
        }
      >
        <Select
          value={selectedCaseManager}
          onValueChange={handleCaseManagerSelect}
          disabled={isUpdating}
        >
          <SelectTrigger className="group text-[#26045D] border-0 shadow-none hover:bg-transparent focus:ring-1 focus:ring-blue-500 p-0 h-auto [&>svg:last-child]:hidden">
            <SelectValue asChild placeholder="Assign a case manager">
              {selectedCaseManager ? (
                <div className="truncate text-sm text-left flex gap-2 items-center">
                  {getCaseManagerName(selectedCaseManager)}
                </div>
              ) : (
                <div className="truncate text-left text-muted-foreground text-sm">
                  Assign a case manager
                </div>
              )}
            </SelectValue>
            <ChevronDownIcon className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </SelectTrigger>
          <SelectContent>
            {row.original.case_managers_list.map((caseManager) => {
              const isCurrent = caseManager.id === selectedCaseManager;

              return (
                <SelectItem
                  key={caseManager.id}
                  value={caseManager.id}
                  className={`${isCurrent ? "bg-blue-50" : ""}`}
                >
                  <div className="flex gap-1 py-1">
                    {isUpdating ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Updating...
                      </div>
                    ) : (
                      getCaseManagerName(caseManager.id)
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Dialog
          open={showConfirmModal}
          onOpenChange={(open) => handleOpenModalChange(open)}
        >
          <DialogContent className="[&>button]:hidden max-w-[600px] max-h-[200px] h-full w-full">
            <DialogTitle />
            <h1 className="font-bold text-base leading-6 tracking-normal text-center text-[#26045D]">
              Are you sure you want to update this application?
            </h1>
            <p className="font-medium text-sm text-center text-[#26045D]">
              You are assigning {getCaseManagerName(selectedCaseManager)} to
              this transaction.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={handleCaseManagerChange}
                disabled={isUpdating}
                className="bg-[#26045D] hover:bg-[#0D0021] rounded-full min-w-[100px] max-h-[30px] font-medium text-sm text-white text-center"
              >
                {isUpdating ? (
                  <>
                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>Update</>
                )}
              </Button>
              <Button
                onClick={handleCancelModal}
                disabled={isUpdating}
                className="border border-[#87858E] text-[#706D78] bg-white hover:border-[#706D78] hover:text-[#706D78] hover:bg-[#D6D5D7] rounded-full min-w-[100px] max-h-[30px] font-medium text-sm  text-center"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PermissionGuard>
    </>
  );
}
