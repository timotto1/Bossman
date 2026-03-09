import { FileUpIcon } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

import UploadNewUnits from "@/components/dashboard/units/add/upload-new-units";

export const metadata: Metadata = {
  title: "Add new units",
};

export default function AddNewUnitsPage() {
  return (
    <>
      <div className="py-4 px-8 flex justify-between items-center border-b gap-4">
        <h1 className="text-xl font-medium leading-8 text-[#26045D]">
          Add new units
        </h1>
        <Link
          href="https://zuxxygfnipgdaeirxagh.supabase.co/storage/v1/object/public/stairpay//Units_Template_2025_07_10.csv"
          className="flex items-center gap-2 text-white px-6 text-sm rounded-[10px] h-8 bg-[#26045D]"
          download
        >
          <FileUpIcon className="w-5 h-5 text-white" />
          Download blank CSV
        </Link>
      </div>
      <div className="px-6 py-4">
        <div className="max-w-[834px] mx-auto rounded-[12px] shadow-[0px_2px_10px_0px_#0000001A] flex flex-col items-center justify-center min-h-[356px]">
          <div className="max-w-[482px] mx-auto space-y-2 text-center">
            <h1 className="font-medium text-[18px] text-[#26045D]">
              Upload a CSV to create new units
            </h1>
            <p className="text-[14px] text-[#B9B7BD]">
              This CSV can be downloaded using the button in the top right of
              this page. Units take up to 48 hours to be created.
            </p>
            <UploadNewUnits />
          </div>
        </div>
      </div>
    </>
  );
}
