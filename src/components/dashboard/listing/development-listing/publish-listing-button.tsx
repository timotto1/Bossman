import { useState } from "react";

import ListingItemStatusModal from "./listing-item-status-modal";
import { Button } from "@/components/ui/button";

export default function PublishListingButton() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button
        className="flex items-center gap-2 text-white px-6 text-sm rounded-[10px] h-8 bg-[#26045D]"
        onClick={() => {
          setModalOpen(true);
        }}
      >
        Publish listing
      </Button>

      <ListingItemStatusModal
        open={modalOpen}
        handleOpenChange={setModalOpen}
      />
    </>
  );
}
