import {
  BuildingOffice2Icon,
  CheckBadgeIcon,
  DevicePhoneMobileIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { CopyIcon } from "lucide-react";

import HalfCircleProgressTop from "./half-circle-progress";
import { Card, CardContent } from "@/components/ui/card";

export default function EnquiryItemOverviewPage() {
  return (
    <div className="space-y-6 py-2 px-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BuildingOffice2Icon className="h-4 w-4" color="#26045D" />
          <p className="text-sm font-medium leading-5 text-left text-[#26045D]">
            Listing enquired details
          </p>
        </div>
        <p className="text-[14px] text-[#26045D]">7 Johnston Road, SE1 4MU</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-[12px] h-full">
          <CardContent className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-bold">Current Affordability</h3>
              <p>
                Household income: <span className="font-bold">£70,000</span>
              </p>
              <p>
                Household deposit: <span className="font-bold">£50,000</span>
              </p>
            </div>
            <div className="space-y-2 text-center">
              <h3 className="font-bold text-[24px]">Very good</h3>
              <HalfCircleProgressTop progress={50} trackColor="#F0F0FE" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[12px] h-full">
          <CardContent className="p-10 space-y-6">
            <div className="flex items-center gap-2">
              <DevicePhoneMobileIcon className="h-4 w-4" color="#26045D" />
              <p className="text-[14px] font-bold leading-5 text-left text-[#26045D]">
                Contact details
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <h6 className="font-medium text-[#26045D] text-[14px]">
                  Email address
                </h6>
                <div className="flex items-center gap-2">
                  <p className="text-[#26045D] text-[14px]">
                    hinelk20@gmail.com
                  </p>
                  <CopyIcon className="w-4 h-4" color="#26045D" />
                </div>
              </div>
              <div className="space-y-1">
                <h6 className="font-medium text-[#26045D] text-[14px]">
                  Telephone number
                </h6>
                <div className="flex items-center gap-2">
                  <p className="text-[#26045D] text-[14px]">07884560392</p>
                  <CopyIcon className="w-4 h-4" color="#26045D" />
                </div>
              </div>
              <div className="space-y-1">
                <h6 className="font-medium text-[#26045D] text-[14px]">
                  Preferred
                </h6>
                <div className="flex items-center gap-2">
                  <p className="text-[#26045D] text-[14px]">Email</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[12px] h-full">
          <CardContent className="p-10 space-y-6">
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-bold leading-5 text-left text-[#26045D]">
                Enquiry
              </p>
            </div>
            <div className="flex gap-2">
              <div className="shrink-0 w-[24px] h-[24px] bg-[#A5A6F8] rounded-full" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-gray-700 text-[14px]">Hinel Karimi</p>
                  <p className="text-gray-700 text-[14px]">
                    12 November, 11:40am
                  </p>
                </div>
                <div className="w-full bg-gray-100 rounded-[8px] py-2 px-3">
                  <p className="text-[16px] text-[#26045D]">
                    I'm keen to learn more about this property.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[12px] h-full">
          <CardContent className="p-10 space-y-6">
            <div className="flex items-center gap-2">
              <CheckBadgeIcon className="h-4 w-4" color="#26045D" />
              <p className="text-[14px] font-bold leading-5 text-left text-[#26045D]">
                Eligibility
              </p>
            </div>
            <p className="text-[#26045D] text-[12px]">
              Meets 3 of the 4 eligibility criteria
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircleIcon color="#5B10CC" className="h-4 w-4 shrink-0" />
                <p className="text-[#26045D] text-[12px]">
                  At least 18 years old
                </p>
              </div>
              <div className="flex items-center gap-2">
                <XCircleIcon color="#B84467" className="h-4 w-4 shrink-0" />
                <p className="text-[#26045D] text-[12px]">
                  Annual household income is less than £90,000
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon color="#5B10CC" className="h-4 w-4 shrink-0" />
                <p className="text-[#26045D] text-[12px]">
                  Are unable to purchase a suitable home to meet your housing
                  needs on the open market
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon color="#5B10CC" className="h-4 w-4 shrink-0" />
                <p className="text-[#26045D] text-[12px]">
                  Do not already own a property or you are in the process of
                  selling your property
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
