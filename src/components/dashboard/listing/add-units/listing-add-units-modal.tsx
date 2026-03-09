"use client";

import ListingAddUnitsForm from "./listing-add-units-form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function ListingAddUnitsModal({
  open,
  handleOpenChange,
  selectedListingId,
}: {
  open: boolean;
  handleOpenChange: (open: boolean) => void;
  selectedListingId: string;
}) {
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="[&>button]:hidden max-w-[95%] w-fit rounded-2xl max-h-[95%] overflow-y-auto">
        <DialogTitle className="text-2xl font-bold text-[#26045D] mb-2">
          Add multiple units to this listing?
        </DialogTitle>
        <ListingAddUnitsForm
          selectedListingId={selectedListingId}
          onUnitAdded={() => {
            handleOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
