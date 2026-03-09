"use client";

import { useState } from "react";

import UploadDevelopmentModal from "../request-listing/upload-development-modal";
import UploadUnitModal from "../request-listing/upload-unit-modal";
import CreateListingForm from "./create-listing-form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function CreateListingModal({
  open,
  handleOpenChange,
}: {
  open: boolean;
  handleOpenChange: (open: boolean) => void;
}) {
  const [requestDevelopmentModalOpen, setRequestDevelopmentModalOpen] =
    useState(false);
  const [requestUnitModalOpen, setRequestUnitModalOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="[&>button]:hidden max-w-[95%] w-[552px] rounded-2xl max-h-[95%] overflow-y-auto">
          <DialogTitle className="hidden" />
          <CreateListingForm
            onListingAdded={() => handleOpenChange(false)}
            onRequestDevelopment={() => {
              handleOpenChange(false);
              setRequestDevelopmentModalOpen(true);
            }}
            onRequestUnit={() => {
              handleOpenChange(false);
              setRequestUnitModalOpen(true);
            }}
          />
        </DialogContent>
      </Dialog>
      <UploadDevelopmentModal
        open={requestDevelopmentModalOpen}
        handleOpenChange={(open) => setRequestDevelopmentModalOpen(open)}
      />
      <UploadUnitModal
        open={requestUnitModalOpen}
        handleOpenChange={(open) => setRequestUnitModalOpen(open)}
      />
    </>
  );
}
