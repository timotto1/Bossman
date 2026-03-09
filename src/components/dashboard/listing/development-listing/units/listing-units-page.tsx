"use client";

import { useRef, useState } from "react";
import { DocumentPlusIcon } from "@heroicons/react/24/solid";
import { LoaderCircle } from "lucide-react";
import { useParams } from "next/navigation";

import ListingUnitsTable from "./listing-units-table";
import ListingAddUnitsModal from "@/components/dashboard/listing/add-units/listing-add-units-modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UnitListing } from "@/types/types";
import { createClient } from "@/utils/supabase/client";

export default function ListingUnitsPage() {
  const params = useParams();

  const { toast } = useToast();

  const [open, setOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState<UnitListing[]>([]);
  const tableRef = useRef<{ refresh: () => void }>(null); // ✅ Ref for refresh

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      const idsToDelete = selectedUnits.map((unit) => unit.id);

      const { error } = await supabase
        .from("unit_listings")
        .delete()
        .in("id", idsToDelete);

      if (error) throw new Error(error.message);

      tableRef.current?.refresh();

      setSelectedUnits([]);

      toast({
        title: "Success",
        description: "Unit removed successfully!",
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
      <div className="space-y-4 px-5 py-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 text-white px-6 text-sm rounded-[12px] h-8 bg-[#26045D] hover:bg-[#26045D]"
          >
            <DocumentPlusIcon className="w-5 h-5 text-white" />
            Add more units
          </Button>
          {selectedUnits.length ? (
            <Button
              disabled={isLoading}
              type="button"
              className="bg-[#F0F0FE] hover:bg-[#F0F0FE] rounded-[12px] max-w-[184px] w-full text-sm font-medium leading-5 text-left text-[#26045D]"
              onClick={handleRemove}
            >
              {isLoading && <LoaderCircle className="w-4 h-4 animate-spin" />}
              {isLoading ? "Removing..." : "Remove unit"}
            </Button>
          ) : null}
        </div>
        <ListingUnitsTable
          ref={tableRef}
          onSelectionChange={setSelectedUnits}
        />
      </div>
      <ListingAddUnitsModal
        open={open}
        handleOpenChange={(open) => setOpen(open)}
        selectedListingId={params?.id as string}
      />
    </>
  );
}
