import { KeyIcon } from "@heroicons/react/24/outline";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUnitListing } from "@/context/unit-listing-context";

export default function UnitListingDetailCard() {
  const { isLoading, data } = useUnitListing();

  const capitalizeLetter = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Card className="p-6 space-y-6 rounded-2xl h-fit">
      <CardTitle className="flex items-center gap-2">
        <KeyIcon className="w-4 h-4" color="#26045D" />
        <p className="font-bold text-[#26045D] text-base">Listing</p>
      </CardTitle>
      <CardContent className="p-0">
        <div className="space-y-6">
          <div className="space-y-1">
            <p className="font-medium text-base text-[#26045D]">
              Share to Buy listing
            </p>
            {isLoading ? (
              <Skeleton className="h-4 w-[100px]" />
            ) : (
              <p className="text-[#26045D] text-sm">Coming Soon</p>
            )}
          </div>
          <div className="space-y-1">
            <p className="font-medium text-base text-[#26045D]">
              Rightmove listing
            </p>
            {isLoading ? (
              <Skeleton className="h-4 w-[100px]" />
            ) : (
              <p className="text-[#26045D] text-sm">
                {capitalizeLetter(data?.rightmove_status ?? "Draft")}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <p className="font-medium text-base text-[#26045D]">
              Zoopla listing
            </p>
            {isLoading ? (
              <Skeleton className="h-4 w-[100px]" />
            ) : (
              <p className="text-[#26045D] text-sm">Coming Soon</p>
            )}
          </div>
          <div className="space-y-1">
            <p className="font-medium text-base text-[#26045D]">
              OnTheMarket listing
            </p>
            {isLoading ? (
              <Skeleton className="h-4 w-[100px]" />
            ) : (
              <p className="text-[#26045D] text-sm">Coming Soon</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
