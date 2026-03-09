"use client";

import { useEffect, useState } from "react";
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
import { getTransactionStatus } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

export const TRANSACTION_STATUSES = [
  {
    value: "started",
    label: "Started",
    color: "#F5AB47",
    bgColor: "#FDF4E4",
  },
  {
    value: "submitted",
    label: "Submitted",
    color: "#6898F4",
    bgColor: "#E8F0FD",
  },
  {
    value: "in_review",
    label: "In Review",
    color: "#F4C542",
    bgColor: "#FEF8E4",
  },
  {
    value: "mos_generated",
    label: "MOS Generated",
    color: "#6EC1E4",
    bgColor: "#E7F6FB",
  },
  {
    value: "pending_legals",
    label: "Pending Legals",
    color: "#E46EC1",
    bgColor: "#FAE8F3",
  },
  {
    value: "exchanged",
    label: "Exchanged",
    color: "#4CAF50",
    bgColor: "#E6F4E7",
  },
  {
    value: "completed",
    label: "Completed",
    color: "#9C27B0",
    bgColor: "#F5E6F7",
  },
];

const StatusIndicator = ({
  color,
  bgColor,
  label,
}: {
  color: string;
  bgColor: string;
  label: string;
}) => {
  return (
    <div
      className={`
        max-w-fit rounded-full py-[2px] px-2 
        bg-[${bgColor}] text-xs text-[${color}] 
      `}
      style={{
        backgroundColor: bgColor || "#F0F1F4",
        color: color || "#535862",
      }}
    >
      {label || "No status"}
    </div>
  );
};

export default function TransactionStatusDropdown({
  row,
}: {
  row: Row<TransactionsSchema>;
}) {
  const { toast } = useToast();

  const [selectedStatus, setSelectedStatus] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentStatus = row.original.application_status;

  const getStatusLabel = (statusValue: string) =>
    TRANSACTION_STATUSES.find((status) => status.value === statusValue)?.label;

  const handleStatusSelect = (statusValue: string) => {
    if (statusValue === currentStatus) return;

    setSelectedStatus(statusValue);
    setShowConfirmModal(true);
  };

  const handleCancelModal = () => {
    setShowConfirmModal(false);
    setSelectedStatus(currentStatus);
  };

  const handleOpenModalChange = (open: boolean) => {
    if (isUpdating) return null;

    if (!open) {
      handleCancelModal();
      return;
    }
    setShowConfirmModal(open);
  };

  const handleStatusUpdateChange = async () => {
    setIsUpdating(true);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("client_transaction")
        .update({
          status: selectedStatus,
        })
        .eq("resident_id", row.original.user_id);

      if (error) throw new Error(error.message);

      row.original.application_status = selectedStatus;

      toast({
        title: "Success",
        description: `✅ Status successfully changed to ${getStatusLabel(selectedStatus)}`,
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

  useEffect(() => {
    setSelectedStatus(row.original.application_status);
  }, [row.original.application_status]);

  return (
    <>
      <PermissionGuard
        permissions={["change_transaction_status"]}
        fallback={
          <p className="text-[#26045D]">
            {getTransactionStatus(selectedStatus)}
          </p>
        }
      >
        <Select
          value={selectedStatus}
          onValueChange={handleStatusSelect}
          disabled={isUpdating}
        >
          <SelectTrigger className="group text-[#26045D] border-0 shadow-none hover:bg-gray-50 focus:ring-1 focus:ring-blue-500 p-0 h-auto [&>svg:last-child]:hidden">
            <SelectValue>{getTransactionStatus(selectedStatus)}</SelectValue>
            <ChevronDownIcon className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </SelectTrigger>
          <SelectContent>
            {TRANSACTION_STATUSES.map((status) => {
              const isCurrent = status.value === selectedStatus;

              return (
                <SelectItem
                  key={status.value}
                  value={status.value}
                  className={`${isCurrent ? "bg-blue-50" : ""}`}
                >
                  <div className="flex gap-1 py-1">
                    {isUpdating ? (
                      <div className="flex items-center gap-2 text-xs">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Updating...
                      </div>
                    ) : (
                      <StatusIndicator
                        color={status.color}
                        bgColor={status.bgColor}
                        label={status.label}
                      />
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
              You are about to change the application status from{" "}
              {getStatusLabel(currentStatus)} to{" "}
              {getStatusLabel(selectedStatus)}.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={handleStatusUpdateChange}
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
