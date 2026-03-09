import { useState } from "react";
import { useParams } from "next/navigation";
import { z } from "zod";

import UpdateListingStatusModal from "../update-listing-status-modal";
import { Button } from "@/components/ui/button";
import { useDevelopmentListing } from "@/context/development-listing-context";
import { createClient } from "@/utils/supabase/client";

const schema = z.object({
  sharetobuyStatus: z.string().optional(),
  zooplaStatus: z.string().optional(),
  onthemarketStatus: z.string().optional(),
  rightmoveStatus: z.string().min(1, { message: "Please select a status" }),
});

const rightmoveStatuses = [
  { label: "Published", value: "available" },
  { label: "Unlisted", value: "off_market" },
];

export default function UpdateDevelopmentListingButton() {
  const params = useParams();

  const [modalOpen, setModalOpen] = useState(false);

  const { data, refreshListing } = useDevelopmentListing();

  const updateListing = async (id: string, values: z.infer<typeof schema>) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("development_listings")
      .update({
        rightmove_status: values.rightmoveStatus,
      })
      .eq("id", id);

    if (error) throw new Error(error.message);
  };

  return (
    <>
      <Button
        className="flex items-center gap-2 text-white px-6 text-sm rounded-[10px] h-8 bg-[#26045D]"
        onClick={() => {
          setModalOpen(true);
        }}
      >
        Update status
      </Button>

      <UpdateListingStatusModal
        open={modalOpen}
        handleOpenChange={setModalOpen}
        schema={schema}
        defaultValues={{
          rightmoveStatus: data!.rightmove_status!,
        }}
        refreshListing={refreshListing}
        updateListing={updateListing}
        id={params.id as string}
        rightmoveStatuses={rightmoveStatuses}
      />
    </>
  );
}
