import { useCallback, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Percent, PoundSterling } from "lucide-react";
import { z } from "zod";

import { AddUnitsFormData } from "./listing-add-units-form";
import { UNIT_TYPES } from "@/components/dashboard/listing/create-listing/data";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";

export const addUnitsDetailsSchema = z
  .object({
    fullMarketValue: z.coerce.number({
      message: "Full market value is required.",
    }),
    monthlyRent: z.coerce.number({ message: "Monthly rent is required." }),
    groundRent: z.coerce.number({ message: "Ground rent is required." }),
    serviceCharge: z.coerce.number({ message: "Service charge is required." }),
    minimumShare: z.coerce.number({ message: "Minimum share is required." }),
    minimumDeposit: z.coerce.number({
      message: "Minimum deposit is required.",
    }),
    address1: z.string().min(1, { message: "Address Line 1 is required." }),
    address2: z.string().optional(),
    address3: z.string().optional(),
    postcode: z.string().min(1, { message: "Postcode is required." }),
    type: z.string().min(1, { message: "Unit type is required" }),
    scheme: z.enum(["shared_ownership", "help_to_buy"], {
      required_error: "Unit scheme is required.",
    }),
  })
  .optional();

export default function ListingAddUnitsDetailsForm() {
  const form = useFormContext<AddUnitsFormData>();

  const getUnit = useCallback(async () => {
    try {
      const watchUnitID = form.watch("initialForm.unitID");

      const supabase = createClient();

      const { data, error } = await supabase
        .from("company_development_units")
        .select("*")
        .eq("id", watchUnitID)
        .single();

      if (error) throw new Error(error.message);

      form.setValue("unitDetails.address1", data.address_1);
      form.setValue("unitDetails.address2", data.address_2 ?? "");
      form.setValue("unitDetails.address3", data.address_3 ?? "");
      form.setValue("unitDetails.postcode", data.postcode);
      form.setValue("unitDetails.monthlyRent", data.monthly_rent);
      form.setValue("unitDetails.serviceCharge", data.service_charge);
      form.setValue("unitDetails.type", data.unit_type ?? "");
      form.setValue("unitDetails.fullMarketValue", data.purchase_price);
    } catch (error) {
      console.error(error);
    }
  }, [form]);

  useEffect(() => {
    getUnit();
    /*eslint-disable react-hooks/exhaustive-deps*/
  }, []);

  return (
    <>
      <FormField
        control={form.control}
        name="unitDetails.fullMarketValue"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm text-[#26045D]">
              Full market value
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
        name="unitDetails.monthlyRent"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm text-[#26045D]">
              Monthly rent
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
        name="unitDetails.groundRent"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm text-[#26045D]">
              Ground rent (pcm)
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
        name="unitDetails.serviceCharge"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm text-[#26045D]">
              Service charge (pcm)
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
        name="unitDetails.minimumDeposit"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm text-[#26045D]">
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
        name="unitDetails.minimumShare"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm text-[#26045D]">
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
        name="unitDetails.address1"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm text-[#26045D]">
              Address line 1
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
        name="unitDetails.address2"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm text-[#26045D]">
              Address line 2 (optional)
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
        name="unitDetails.address3"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm text-[#26045D]">
              Address line 3 (optional)
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
        name="unitDetails.type"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm text-[#26045D]">
              What type of property is it?
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="border-[#26045D]">
                  <SelectValue placeholder="Select one from dropdown" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {UNIT_TYPES.map((item, i) => (
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

      <FormField
        control={form.control}
        name="unitDetails.scheme"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm text-[#26045D]">
              Unit Scheme
            </FormLabel>
            <FormControl>
              <RadioGroup
                defaultValue={field.value}
                onValueChange={field.onChange}
                className="flex gap-2"
              >
                <FormItem>
                  <FormControl>
                    <RadioGroupItem
                      value="shared_ownership"
                      className="peer sr-only"
                    />
                  </FormControl>
                  <FormLabel className="block w-fit py-2 px-4 border text-xs rounded-full text-[#26045D] border-[#CFCFFF] cursor-pointer peer-aria-checked:bg-[#26045D] peer-aria-checked:text-white peer-aria-checked:font-bold">
                    Shared Ownership
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormControl>
                    <RadioGroupItem
                      value="help_to_buy"
                      className="peer sr-only"
                    />
                  </FormControl>
                  <FormLabel className="block w-fit py-2 px-4 border text-xs rounded-full text-[#26045D] border-[#CFCFFF] cursor-pointer peer-aria-checked:bg-[#26045D] peer-aria-checked:text-white peer-aria-checked:font-bold">
                    Help to Buy
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
    </>
  );
}
