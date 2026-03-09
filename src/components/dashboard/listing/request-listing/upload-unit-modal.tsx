import { FileUpIcon } from "lucide-react";
import Link from "next/link";

import UploadUnitForm from "./upload-unit-form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function UploadUnitModal({
  open,
  handleOpenChange,
}: {
  open: boolean;
  handleOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="[&>button]:hidden max-w-[95%] w-[552px] rounded-2xl max-h-[95%] overflow-y-auto">
        <DialogTitle className="hidden" />
        <h4 className="text-2xl font-bold text-[#26045D] mb-2">
          Request a new unit
        </h4>
        <p className="text-xs text-[#26045D]">
          If you can’t find the unit in the list, you will need to make a
          request for a new unit to be created. In order to do this, please
          download the below CSV and provide the necessary information.
        </p>
        <Link
          href="https://zuxxygfnipgdaeirxagh.supabase.co/storage/v1/object/public/stairpay//Units_Template_2025_07_10.csv"
          target="_blank"
          className="max-w-fit mx-auto flex items-center gap-2 py-2 px-4 text-white rounded-full bg-gradient-to-r from-[#7747FF] to-[#9847FF] h-8 hover:from-[#5a2dbf] hover:to-[#6a2dbf]"
          download
        >
          <FileUpIcon className="w-5 h-5 text-white" />
          Download CSV
        </Link>
        <p className="text-xs text-[#26045D]">
          Once you have filled in the CSV, upload it below and Stairpay will
          create the development in the next 24 hours. You will receive an email
          notification when this has been completed.
        </p>
        <UploadUnitForm onUnitAdded={() => handleOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
