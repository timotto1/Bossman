import { useFormContext } from "react-hook-form";
import Link from "next/link";
import { z } from "zod";

import { AddUnitsFormData } from "./listing-add-units-form";
import UnitLookupField from "@/components/dashboard/listing/create-listing/unit-lookup-field";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export const addUnitsInitialFormSchema = z.object({
  developmentID: z.coerce.number(),
  unitID: z.coerce.number({
    message: "Unit is required",
  }),
});

export default function ListingAddUnitsInitialForm() {
  const form = useFormContext<AddUnitsFormData>();

  return (
    <>
      <FormField
        control={form.control}
        name="initialForm.unitID"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm text-[#26045D]">
              Select unit
            </FormLabel>
            <FormControl>
              <UnitLookupField
                developmentID={form.watch("initialForm.developmentID")!}
                selected={field.value! ?? ""}
                onSelectUnit={(unitID) => field.onChange(unitID)}
              />
            </FormControl>
            <FormDescription className="text-xs text-[#26045D]">
              Can't find the unit?{" "}
              <Link
                href="/dashboard/listing/request/unit"
                className="font-bold underline"
              >
                Request a new unit
              </Link>
            </FormDescription>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      <div className="flex items-center justify-center w-full">
        <Button
          type="submit"
          className="rounded-full px-6 py-2 bg-[#26045D] hover:bg-[#26045D] text-sm font-bold leading-5 text-left"
        >
          Continue
        </Button>
      </div>
    </>
  );
}
