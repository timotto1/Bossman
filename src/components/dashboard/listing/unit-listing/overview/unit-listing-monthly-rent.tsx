import { useState } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { LoaderCircle } from "lucide-react";

import CurrencyInputField from "@/components/currency-input-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUnitListing } from "@/context/unit-listing-context";
import { useToast } from "@/hooks/use-toast";
import { convertToNumber } from "@/utils";

export default function UnitListingMonthlyRent() {
  const { data, updateListing } = useUnitListing();

  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [monthlyRent, setMonthlyRent] = useState(
    data?.monthly_rent?.toString(),
  );

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateListing({
        monthly_rent: convertToNumber(monthlyRent!),
      });

      toast({
        title: "Success",
        description: "Monthly rent has been updated.",
      });

      setIsEditing(false);
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

  const handleCancel = () => {
    setIsEditing(false);
    setMonthlyRent(data?.monthly_rent?.toString());
  };

  return (
    <Card className="rounded-[12px]">
      <CardContent className="relative px-4 py-6">
        {!isEditing && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 w-4 h-4"
            onClick={() => setIsEditing(true)}
          >
            <PencilSquareIcon className="text-[#4E1A8F] cursor-pointer" />
          </Button>
        )}
        <div className="flex flex-col items-center justify-between gap-2">
          {isEditing ? (
            <div className="space-y-2">
              <CurrencyInputField
                value={monthlyRent!}
                onChange={(value) => setMonthlyRent(value)}
              />
              <div className="flex gap-2">
                <Button
                  disabled={isLoading}
                  size="sm"
                  className="h-8 bg-green-600 hover:bg-green-700 text-white text-xs"
                  onClick={handleSave}
                >
                  {isLoading && (
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                  )}
                  Save
                </Button>
                <Button
                  disabled={isLoading}
                  variant="destructive"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-[32px] font-medium leading-8 text-[#4E1A8F]">
                £
                {convertToNumber(monthlyRent!)?.toLocaleString("en-GB", {
                  maximumFractionDigits: 2,
                })}
              </p>
              <h3 className="text-[14px] font-normal leading-5 text-[#26045D]">
                Monthly rent
              </h3>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
