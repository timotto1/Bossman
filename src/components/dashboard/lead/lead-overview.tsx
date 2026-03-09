/*eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain*/

import { MonthlyIncomingsOutgoingsChart } from "@/components/charts/monthly-incomings-outgoings";
import { CircularProgress } from "@/components/circular-progress";
import { CheckBadgeIcon } from "@/components/icons";
import { Card, CardContent } from "@/components/ui/card";
import { ResidentOutgoings, ResidentOwnership } from "@/types/types";

export function LeadOverview({
  residentOutgoings,
  residentOwnership,
}: {
  residentOutgoings: ResidentOutgoings | null;
  residentOwnership: ResidentOwnership | null;
}) {
  return (
    <div className="px-4 py-6 border-b border-b-[#D6D5D7] pt-0">
      <div className="flex flex-col md:flex-row bg-[#fafafa] px-6 py-4 w-full gap-2 rounded-md">
        {/* Resident Ownership Card */}
        <Card className="rounded-lg border-[#F5F5F5] max-w-[450px] w-full">
          <CardContent className="px-4 py-6">
            <div className="flex gap-8">
              <CircularProgress
                width={104}
                height={104}
                color="#5B10CC"
                progress={residentOwnership?.percentage_sold || 0}
              >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-semibold leading-7 text-center">
                  {residentOwnership?.percentage_sold || 0}%
                </div>
              </CircularProgress>
              <div>
                <h3 className="text-base font-semibold leading-6 text-left mb-6">
                  Resident ownership
                </h3>
                <p className="text-sm font-medium leading-5 text-left text-[#475467] mb-2">
                  Value of property
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-semibold leading-9 text-left">
                    £
                    {(residentOwnership?.purchase_price || 0)?.toLocaleString(
                      "en-GB",
                      {
                        maximumFractionDigits: 2,
                      },
                    )}
                  </p>
                  <CheckBadgeIcon className="w-4 h-4" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Incomings/Outgoings Card */}
        <Card className="rounded-lg flex-1 border-[#F5F5F5]">
          <CardContent className="px-4 py-6">
            <div className="flex gap-12 items-start">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-12">
                <div>
                  <h3 className="text-base font-semibold leading-6 text-left mb-6">
                    Monthly incomings/outgoings
                  </h3>
                  <p className="text-sm font-medium leading-5 text-left text-[#475467] mb-2">
                    Total monthly costs
                  </p>
                  <p className="text-3xl font-semibold leading-9 text-left">
                    £
                    {(
                      residentOutgoings?.total_monthly_costs || 0
                    )?.toLocaleString("en-GB", {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold leading-5 text-left text-[#475467] font-inter">
                    <div className="w-4 h-4 bg-[#F2F4F7] rounded-full" />
                    Income: £
                    {(residentOutgoings?.monthly_income || 0)?.toLocaleString(
                      "en-GB",
                      {
                        maximumFractionDigits: 2,
                      },
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium leading-5 text-left text-[#475467] font-inter">
                    <div className="w-4 h-4 bg-[#7747FF] rounded-full" />
                    Rent: £
                    {(residentOutgoings?.monthly_rent || 0)?.toLocaleString(
                      "en-GB",
                      {
                        maximumFractionDigits: 2,
                      },
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium leading-5 text-left text-[#475467] font-inter">
                    <div className="w-4 h-4 bg-[#D61F56] rounded-full" />
                    Mortgage: £
                    {(
                      residentOutgoings?.monthly_mortgage_payment || 0
                    )?.toLocaleString("en-GB", {
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium leading-5 text-left text-[#475467] font-inter">
                    <div className="w-4 h-4 bg-[#C2AEF9] rounded-full" />
                    Service charge: £
                    {(residentOutgoings?.service_charge || 0)?.toLocaleString(
                      "en-GB",
                      {
                        maximumFractionDigits: 2,
                      },
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium leading-5 text-left text-[#475467] font-inter">
                    <div className="w-4 h-4 bg-[#FADBE0] rounded-full" />
                    Debt/credit: £
                    {(residentOutgoings?.debt || 0)?.toLocaleString("en-GB", {
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <MonthlyIncomingsOutgoingsChart
                  expenses={{
                    rent: residentOutgoings?.monthly_rent || 0,
                    mortgage: residentOutgoings?.monthly_mortgage_payment || 0,
                    serviceCharge: residentOutgoings?.service_charge || 0,
                    debt: residentOutgoings?.debt || 0,
                  }}
                  income={residentOutgoings?.monthly_income || 0}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
