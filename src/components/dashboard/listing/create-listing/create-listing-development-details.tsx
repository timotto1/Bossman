import { useCallback, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { Button } from "../../../ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../ui/form";
import { Input } from "../../../ui/input";
import { RadioGroup, RadioGroupItem } from "../../../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { CreateListingFormData } from "./create-listing-form";
import { UNIT_TYPES } from "./data";
import { createClient } from "@/utils/supabase/client";

export const createListingDevelopmentDetailsSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required." }),
    address_1: z.string().min(1, { message: "Address 1 is required." }),
    postcode: z.string().min(1, { message: "Postcode is required." }),
    city: z.string().min(1, { message: "City is required." }),
    type: z.string().min(1, { message: "Type is required" }),
    scheme: z.enum(["shared_ownership", "help_to_buy"], {
      required_error: "Development scheme is required.",
    }),
  })
  .optional();

export default function CreateListingDevelopmentDetails() {
  const form = useFormContext<CreateListingFormData>();

  const watchDevelopmentID = form.watch("initialForm.developmentID");

  const getDevelopment = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("company_development")
        .select("name, postcode, city")
        .eq("id", watchDevelopmentID)
        .single();

      if (error) throw new Error(error.message);

      form.setValue("developmentDetails.name", data.name ?? "");
      form.setValue("developmentDetails.postcode", data.postcode ?? "");
    } catch (error) {
      console.error(error);
    }
  }, [form, watchDevelopmentID]);

  useEffect(() => {
    if (watchDevelopmentID) {
      getDevelopment();
    }
  }, [watchDevelopmentID, getDevelopment]);

  const scope = form.watch("initialForm.scope");
  const type = form.watch("initialForm.type");

  return (
    <>
      <FormField
        control={form.control}
        name="developmentDetails.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm text-[#26045D]">
              Development name
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                className="h-11 w-full pr-8 text-xs font-normal leading-4 text-left border-[#26045D] focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="developmentDetails.address_1"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm text-[#26045D]">Address 1</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                className="h-11 w-full pr-8 text-xs font-normal leading-4 text-left border-[#26045D] focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="developmentDetails.postcode"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm text-[#26045D]">Postcode</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                className="h-11 w-full pr-8 text-xs font-normal leading-4 text-left border-[#26045D] focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="developmentDetails.city"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm text-[#26045D]">City</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                className="h-11 w-full pr-8 text-xs font-normal leading-4 text-left border-[#26045D] focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="developmentDetails.type"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm text-[#26045D]">
              What type of development is it?
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
        name="developmentDetails.scheme"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm text-[#26045D]">
              Development Scheme
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

      {(scope === "unit" || type === "resale") && (
        <div className="flex items-center justify-center w-full">
          <Button
            type="submit"
            className="rounded-full px-6 py-2 bg-[#26045D] hover:bg-[#26045D] text-sm font-bold leading-5 text-left"
          >
            Next
          </Button>
        </div>
      )}
    </>
  );
}
