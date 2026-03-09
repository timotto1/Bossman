import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  IdentificationIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Percent, PoundSterling } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDevelopmentListing } from "@/context/development-listing-context";
import { useToast } from "@/hooks/use-toast";

const eligibilityOptions = [
  { label: "User Live Location", value: "user_live_location" },
  { label: "User Work Location", value: "user_work_location" },
  { label: "User Live Or Work Location", value: "user_live_or_work_location" },
  { label: "Min Income", value: "min_income" },
  { label: "Max Income", value: "max_income" },
  { label: "Min Deposit", value: "min_deposit" },
  { label: "Max Deposit", value: "max_deposit" },
  {
    label: "Min Number Of People In The Household",
    value: "min_number_of_people_in_the_household",
  },
  {
    label: "Max Number Of People In The Household",
    value: "max_number_of_people_in_the_household",
  },
  { label: "Wheelchair / Mobility", value: "wheelchair_mobility" },
  { label: "Children / Dependents", value: "children_dependents" },
  { label: "Min Age", value: "min_age" },
  { label: "Current Housing Status", value: "current_housing_status" },
];

const eligibilitySchema = z.object({
  criteria: z.enum(
    eligibilityOptions.map((eligibility) => eligibility.value) as unknown as [
      string,
      ...string[],
    ],
    {
      required_error: "Please select one eligibility criterion.",
    },
  ),
  minimumShare: z.coerce.number({
    message: "Minimum share is required.",
  }),
  minimumDeposit: z.coerce.number({
    message: "Minimum deposit is required.",
  }),
});

type EligibilityFormData = z.infer<typeof eligibilitySchema>;

export default function ListingEligibilityCard() {
  const { toast } = useToast();

  const {
    isLoading,
    data: developmentListing,
    updateListing,
    refreshListing,
  } = useDevelopmentListing();

  const [isUpdating, setIsUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const form = useForm<EligibilityFormData>({
    resolver: zodResolver(eligibilitySchema),
    mode: "onChange",
  });

  const handleSubmit = async (data: EligibilityFormData) => {
    setIsUpdating(true);
    try {
      await updateListing({
        criteria: data.criteria,
        minimum_deposit: data.minimumDeposit,
        minimum_share: data.minimumShare,
      });

      await refreshListing();

      toast({
        title: "Success",
        description: "Details updated!",
      });

      setEditMode(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setEditMode(false);
  };

  const renderEditMode = () => {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="minimumShare"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium text-base text-[#26045D]">
                  Minimum share
                </FormLabel>
                <FormControl>
                  <div className="relative w-full">
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      className="pr-10 border-[#26045D]"
                    />
                    <Percent
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#26045D]"
                      size={14}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minimumDeposit"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium text-base text-[#26045D]">
                  Minimum deposit
                </FormLabel>
                <FormControl>
                  <div className="relative w-full">
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      className="pl-10 border-[#26045D]"
                    />
                    <PoundSterling
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#26045D]"
                      size={14}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="criteria"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="font-medium text-base text-[#26045D]">
                  Criteria
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-[#26045D]">
                      <SelectValue placeholder="Select one from dropdown" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {eligibilityOptions.map((item, i) => (
                      <SelectItem key={`type-${i}`} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-end w-full gap-2">
            <Button
              disabled={isUpdating}
              type="submit"
              className="rounded-full px-6 py-2 bg-[#26045D] hover:bg-[#26045D] text-sm font-bold leading-5 text-left max-h-[30px]"
            >
              {isUpdating && <LoaderCircle className="w-4 h-4 animate-spin" />}
              Save
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isUpdating}
              className="bg-[#dc3545] hover:bg-[#dc3545] rounded-full min-w-[100px] max-h-[30px] font-medium text-sm text-white text-center"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    );
  };

  const renderViewMode = () => {
    return (
      <>
        <div className="space-y-1">
          <p className="font-medium text-base text-[#26045D]">Minimum share</p>
          {isLoading ? (
            <Skeleton className="h-4 w-[100px]" />
          ) : (
            <p className="text-[#26045D] text-sm">
              {form.watch("minimumShare") ?? 0}%
            </p>
          )}
        </div>

        <div className="space-y-1">
          <p className="font-medium text-base text-[#26045D]">
            Minimum deposit
          </p>
          {isLoading ? (
            <Skeleton className="h-4 w-[100px]" />
          ) : (
            <p className="text-[#26045D] text-sm">
              £
              {(form.watch("minimumDeposit") ?? 0).toLocaleString("en-GB", {
                maximumFractionDigits: 2,
              })}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <p className="font-medium text-base text-[#26045D]">Criteria</p>
          {isLoading ? (
            <Skeleton className="h-4 w-[100px]" />
          ) : (
            <p className="text-[#26045D] text-sm">
              {form.watch("criteria")
                ? getCriteriaLabel(form.watch("criteria"))
                : "Select from dropdown"}
            </p>
          )}
        </div>
      </>
    );
  };

  const getCriteriaLabel = (value: string) => {
    return eligibilityOptions.find((eligibility) => eligibility.value === value)
      ?.label;
  };

  useEffect(() => {
    if (!isLoading && developmentListing) {
      form.reset({
        criteria: developmentListing?.criteria,
        minimumDeposit: developmentListing?.minimum_deposit,
        minimumShare: developmentListing?.minimum_share,
      });
    }
  }, [isLoading, developmentListing, form]);

  return (
    <Card className="p-6 space-y-6 rounded-2xl h-fit">
      <CardTitle className="flex items-center gap-2">
        <IdentificationIcon className="w-4 h-4" color="#26045D" />
        <p className="font-bold text-[#26045D] text-base">Eligibility</p>
        <PencilSquareIcon
          className="w-4 h-4 cursor-pointer"
          color="#26045D"
          onClick={() => setEditMode(true)}
        />
      </CardTitle>
      <CardContent className="p-0">
        <div className="space-y-6">
          {editMode ? renderEditMode() : renderViewMode()}
        </div>
      </CardContent>
    </Card>
  );
}
