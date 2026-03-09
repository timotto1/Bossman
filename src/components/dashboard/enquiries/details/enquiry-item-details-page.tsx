import { useRef } from "react";
import {
  BanknotesIcon,
  BuildingOfficeIcon,
  CakeIcon,
  Cog8ToothIcon,
  HomeIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { DocumentPlusIcon, InboxStackIcon } from "@heroicons/react/24/solid";

import ListingAttachmentsTable from "../../listing/listing-attachments-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function EnquiryItemDetailsPage() {
  const tableRef = useRef<{ refresh: () => void }>(null); // ✅ Ref for refresh

  return (
    <div className="space-y-6 py-2 px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-[12px] h-full">
          <CardContent className="p-10 space-y-2">
            <h6 className="font-bold text-[#26045D] text-[14px]">
              Additional details
            </h6>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CakeIcon className="w-4 h-4 shrink-0" color="#26045D" />
                <p className="text-[#26045D] text-[14px]">Date of birth</p>
              </div>
              <p className="text-[#26045D] text-[14px]">22 Feb 1993</p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <HomeIcon className="w-4 h-4 shrink-0" color="#26045D" />
                <p className="text-[#26045D] text-[14px]">Home Location</p>
              </div>
              <p className="text-[#26045D] text-[14px]">London</p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BuildingOfficeIcon
                  className="w-4 h-4 shrink-0"
                  color="#26045D"
                />
                <p className="text-[#26045D] text-[14px]">Work Location</p>
              </div>
              <p className="text-[#26045D] text-[14px]">London</p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BanknotesIcon className="w-4 h-4 shrink-0" color="#26045D" />
                <p className="text-[#26045D] text-[14px]">Current status</p>
              </div>
              <p className="text-[#26045D] text-[14px]">Nothing</p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Cog8ToothIcon className="w-4 h-4 shrink-0" color="#26045D" />
                <p className="text-[#26045D] text-[14px]">
                  Is anyone in the household a wheelchair user or otherwise have
                  mobility issues?
                </p>
              </div>
              <p className="text-[#26045D] text-[14px]">No</p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4 shrink-0" color="#26045D" />
                <p className="text-[#26045D] text-[14px]">Is key worker?</p>
              </div>
              <p className="text-[#26045D] text-[14px]">No</p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <UsersIcon className="w-4 h-4 shrink-0" color="#26045D" />
                <p className="text-[#26045D] text-[14px]">
                  People in household
                </p>
              </div>
              <p className="text-[#26045D] text-[14px]">2</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <InboxStackIcon className="h-4 w-4" color="#26045D" />
          <p className="text-sm font-medium leading-5 text-left text-[#26045D]">
            Attachments
          </p>
        </div>
        <Button
          type="button"
          className="flex items-center gap-2 text-white px-6 text-sm rounded-[12px] bg-gradient-to-r from-[#7747FF] to-[#9847FF] h-8 hover:from-[#5a2dbf] hover:to-[#6a2dbf]"
        >
          <DocumentPlusIcon className="w-5 h-5 text-white" />
          Add document
        </Button>
        <ListingAttachmentsTable
          type="developments"
          ref={tableRef}
          onSelectionChange={() => {}}
        />
      </div>
    </div>
  );
}
