import ListingAttachmentsForm from "./listing-attachments-form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function ListingAttachmentsModal({
  open,
  id,
  type,
  handleOpenChange,
  refreshAttachmentsTable,
  refreshListing,
}: {
  open: boolean;
  id: string;
  type: "developments" | "units";
  handleOpenChange: (open: boolean) => void;
  refreshAttachmentsTable: () => void;
  refreshListing: () => Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="[&>button]:hidden max-w-[95%] md:w-[552px] w-full rounded-2xl">
        <DialogTitle className="font-bold text-[#26045D] text-2xl">
          Add documents to listing
        </DialogTitle>
        <ListingAttachmentsForm
          id={id}
          type={type}
          refreshListing={refreshListing}
          refreshAttachmentsTable={refreshAttachmentsTable}
          closeModal={() => handleOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
