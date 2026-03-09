import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { Button } from "../../../ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../ui/form";
import { RadioGroup, RadioGroupItem } from "../../../ui/radio-group";
import { CreateListingFormData } from "./create-listing-form";
import DevelopmentLookupField from "./development-lookup-field";
import UnitLookupField from "./unit-lookup-field";

export const createListingInitialFormSchema = z
  .object({
    type: z.enum(["new_build", "resale"], {
      required_error: "Please select a listing type",
    }),
    scope: z.enum(["development", "unit"]).optional(),
    developmentID: z.coerce.number().optional(),
    unitID: z.coerce.number().optional(),
    developmentListingID: z.coerce.number().optional(),
  })
  .superRefine((data, ctx) => {
    const { type, scope, developmentID, unitID } = data;

    if (type === "new_build") {
      if (!scope) {
        ctx.addIssue({
          path: ["scope"],
          message: "Scope is required for new build settings.",
          code: z.ZodIssueCode.custom,
        });
      } else if (scope === "development" && !developmentID) {
        ctx.addIssue({
          path: ["developmentID"],
          message: "Development is required when listing a whole development.",
          code: z.ZodIssueCode.custom,
        });
      } else if (scope === "unit" && !developmentID) {
        ctx.addIssue({
          path: ["developmentID"],
          message: "Development is required when listing a single unit.",
          code: z.ZodIssueCode.custom,
        });
      } else if (scope === "unit" && !unitID) {
        ctx.addIssue({
          path: ["unitID"],
          message: "Unit is required when listing a single unit.",
          code: z.ZodIssueCode.custom,
        });
      }
    }

    if (type === "resale" && !developmentID) {
      ctx.addIssue({
        path: ["unitID"],
        message: "Development is required for resale listings.",
        code: z.ZodIssueCode.custom,
      });
    } else if (type === "resale" && !unitID) {
      ctx.addIssue({
        path: ["unitID"],
        message: "Unit is required for resale listings.",
        code: z.ZodIssueCode.custom,
      });
    }
  });

export default function CreateListingInitialForm({
  onRequestDevelopment,
  onRequestUnit,
}: {
  onRequestDevelopment: () => void;
  onRequestUnit: () => void;
}) {
  const form = useFormContext<CreateListingFormData>();

  const renderDevelopmentLookupField = () => (
    <FormField
      control={form.control}
      name="initialForm.developmentID"
      render={() => (
        <FormItem>
          <FormLabel className="text-sm text-[#26045D]">
            Select development
          </FormLabel>
          <FormControl>
            <DevelopmentLookupField />
          </FormControl>
          <FormDescription className="text-xs text-[#26045D]">
            Can't find the development?{" "}
            <Button
              onClick={onRequestDevelopment}
              variant="ghost"
              className="font-bold underline text-[#26045D] hover:bg-transparent px-0"
            >
              Request a new development
            </Button>
          </FormDescription>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );

  const renderUnitLookupField = () => (
    <FormField
      control={form.control}
      name="initialForm.unitID"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm text-[#26045D]">Select unit</FormLabel>
          <FormControl>
            <UnitLookupField
              developmentID={form.watch("initialForm.developmentID")!}
              selected={field.value! ?? ""}
              onSelectUnit={(unitID) => field.onChange(unitID)}
            />
          </FormControl>
          <FormDescription className="text-xs text-[#26045D]">
            Can't find the unit?{" "}
            <Button
              onClick={onRequestUnit}
              variant="ghost"
              className="font-bold underline text-[#26045D] hover:bg-transparent px-0"
            >
              Request a new unit
            </Button>
          </FormDescription>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );

  const renderNewBuild = () => {
    return (
      <>
        <FormField
          control={form.control}
          name="initialForm.scope"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-[#26045D]">
                What kind of listing do you want to create?
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
                        value="development"
                        className="peer sr-only"
                      />
                    </FormControl>
                    <FormLabel className="block w-fit py-2 px-4 border text-xs rounded-full text-[#26045D] border-[#CFCFFF] cursor-pointer peer-aria-checked:bg-[#26045D] peer-aria-checked:text-white peer-aria-checked:font-bold">
                      Whole development
                    </FormLabel>
                  </FormItem>
                  <FormItem>
                    <FormControl>
                      <RadioGroupItem value="unit" className="peer sr-only" />
                    </FormControl>
                    <FormLabel className="block w-fit py-2 px-4 border text-xs rounded-full text-[#26045D] border-[#CFCFFF] cursor-pointer peer-aria-checked:bg-[#26045D] peer-aria-checked:text-white peer-aria-checked:font-bold">
                      Single Unit
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {watchScope === "development" && renderDevelopmentLookupField()}
        {watchScope === "unit" && (
          <>
            {renderDevelopmentLookupField()}
            {renderUnitLookupField()}
          </>
        )}
      </>
    );
  };

  const renderResale = () => {
    return (
      <>
        {renderDevelopmentLookupField()}
        {renderUnitLookupField()}
      </>
    );
  };

  const watchType = form.watch("initialForm.type");
  const watchScope = form.watch("initialForm.scope");

  return (
    <>
      <FormField
        control={form.control}
        name="initialForm.type"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm text-[#26045D]">
              What kind of listing do you want to create?
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
                      value="new_build"
                      className="peer sr-only"
                    />
                  </FormControl>
                  <FormLabel className="block w-fit py-2 px-4 border text-xs rounded-full text-[#26045D] border-[#CFCFFF] cursor-pointer peer-aria-checked:bg-[#26045D] peer-aria-checked:text-white peer-aria-checked:font-bold">
                    New Build
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormControl>
                    <RadioGroupItem value="resale" className="peer sr-only" />
                  </FormControl>
                  <FormLabel className="block w-fit py-2 px-4 border text-xs rounded-full text-[#26045D] border-[#CFCFFF] cursor-pointer peer-aria-checked:bg-[#26045D] peer-aria-checked:text-white peer-aria-checked:font-bold">
                    Resale
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
      {watchType === "new_build" && renderNewBuild()}
      {watchType === "resale" && renderResale()}

      <div className="flex items-center justify-center w-full">
        <Button
          type="submit"
          className="rounded-full px-6 py-2 bg-[#26045D] hover:bg-[#26045D] text-sm font-bold leading-5 text-left"
        >
          Next
        </Button>
      </div>
    </>
  );
}
