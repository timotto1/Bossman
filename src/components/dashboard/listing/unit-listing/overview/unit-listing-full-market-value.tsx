import { useState } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { LoaderCircle } from "lucide-react";

import CurrencyInputField from "@/components/currency-input-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUnitListing } from "@/context/unit-listing-context";
import { useToast } from "@/hooks/use-toast";
import { convertToNumber } from "@/utils";

export default function UnitListingFullMarketValue() {
  const { data, updateListing } = useUnitListing();

  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [fullMarketValue, setFullMarketValue] = useState(
    data?.property_value?.toString(),
  );

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateListing({
        property_value: convertToNumber(fullMarketValue!),
      });

      toast({
        title: "Success",
        description: "Full market value has been updated.",
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
    setFullMarketValue(data?.property_value?.toString());
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
                value={fullMarketValue!}
                onChange={(value) => setFullMarketValue(value)}
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
                {convertToNumber(fullMarketValue!)?.toLocaleString("en-GB", {
                  maximumFractionDigits: 2,
                })}
              </p>
              <h3 className="text-[14px] font-normal leading-5 text-[#26045D]">
                Full market value
              </h3>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
