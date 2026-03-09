"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { z } from "zod";

import CreateListingDevelopmentDetails, {
  createListingDevelopmentDetailsSchema,
} from "./create-listing-development-details";
import CreateListingInitialForm, {
  createListingInitialFormSchema,
} from "./create-listing-initial-form";
import CreateListingUnitDetails, {
  createListingUnitDetailsSchema,
} from "./create-listing-unit-details";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";

const createListingSchema = z
  .object({
    initialForm: createListingInitialFormSchema,
    developmentDetails: createListingDevelopmentDetailsSchema,
    unitDetails: createListingUnitDetailsSchema,
    step: z
      .enum(["initialForm", "unitDetails", "developmentDetails"])
      .nullable(),
  })
  .superRefine((data, ctx) => {
    const {
      initialForm: { type, scope },
      developmentDetails,
      unitDetails,
    } = data;

    if (
      type === "new_build" &&
      scope === "development" &&
      !developmentDetails
    ) {
      ctx.addIssue({
        path: ["developmentDetails"],
        message: "Development details are required when listing a development.",
        code: z.ZodIssueCode.custom,
      });
    }

    if (type === "new_build" && scope === "unit" && !unitDetails) {
      ctx.addIssue({
        path: ["unitDetails"],
        message: "Unit details are required when listing a unit",
        code: z.ZodIssueCode.custom,
      });
    }

    if (type === "resale" && !unitDetails) {
      ctx.addIssue({
        path: ["unitDetails"],
        message: "Unit details are required for resale listing",
        code: z.ZodIssueCode.custom,
      });
    }
  });

export type CreateListingFormData = z.infer<typeof createListingSchema>;

export default function CreateListingForm({
  onListingAdded,
  onRequestDevelopment,
  onRequestUnit,
}: {
  onListingAdded: () => void;
  onRequestDevelopment: () => void;
  onRequestUnit: () => void;
}) {
  const { user } = useUser();

  const { toast } = useToast();

  const form = useForm<CreateListingFormData>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      developmentDetails: {
        name: "",
        postcode: "",
      },
      unitDetails: {
        address2: "",
        address3: "",
      },
      step: "initialForm",
    },
  });

  const steps = [
    {
      key: "initialForm",
      nextStep: (values: CreateListingFormData) => {
        if (values.initialForm.developmentListingID) {
          return "unitDetails";
        }

        return "developmentDetails";
      },
    },
    {
      key: "developmentDetails",
      nextStep: (values: CreateListingFormData) => {
        if (values.initialForm.type === "resale") {
          return "unitDetails";
        }

        if (values.initialForm.scope === "unit") {
          return "unitDetails";
        }

        return null;
      },
    },
    { key: "unitDetails" },
  ] as const;

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const current = form.getValues("step");
      const currentStepConfig = steps.find((s) => s.key === current);

      if (!currentStepConfig) {
        console.error("Unknown step:", current);
        return setSubmitting(false);
      }

      const isValid = await form.trigger(currentStepConfig.key);
      if (!isValid) return setSubmitting(false);

      // Handle step transition logic
      if ("nextStep" in currentStepConfig && currentStepConfig.nextStep) {
        // Pass the entire form data to nextStep
        const formValues = form.getValues();
        const next = currentStepConfig.nextStep(formValues);

        if (next) {
          form.setValue(
            "step",
            next as "initialForm" | "developmentDetails" | "unitDetails" | null,
          );
          setSubmitting(false);
          return;
        }
      }

      const data = form.getValues();

      const supabase = createClient();

      let developmentListingID = data.initialForm.developmentListingID;

      if (!data.initialForm.developmentListingID) {
        const { data: developmentData, error: developmentError } =
          await supabase
            .from("development_listings")
            .insert({
              development_name: data.developmentDetails?.name,
              address_1: data.developmentDetails?.address_1,
              postcode: data.developmentDetails?.postcode,
              city: data.developmentDetails?.city,
              type: data.developmentDetails?.type,
              scheme: data.developmentDetails?.scheme,
              company_development_id: data.initialForm.developmentID,
              company_id: user?.companyID,
              listing_type: data.initialForm.type,
              rightmove_status: null, //for draft
            })
            .select("id")
            .single();

        if (developmentError) throw new Error(developmentError.message);

        developmentListingID = developmentData?.id;
      }

      if (scope !== "development") {
        const { error } = await supabase.from("unit_listings").insert({
          postcode: data.unitDetails?.postcode,
          unit_type: data.unitDetails?.type,
          address_1: data.unitDetails?.address1,
          address_2: data.unitDetails?.address2,
          address_3: data.unitDetails?.address3,
          scheme: data.unitDetails?.scheme,
          minimum_share: data.unitDetails?.minimumShare,
          minimum_deposit: data.unitDetails?.minimumDeposit,
          monthly_rent: data.unitDetails?.monthlyRent,
          ground_rent: data.unitDetails?.groundRent,
          service_charge: data.unitDetails?.serviceCharge,
          property_value: data.unitDetails?.fullMarketValue,
          rightmove_status: null, //for draft
          company_development_id: data.initialForm.developmentID,
          company_id: user?.companyID,
          company_development_unit_id: data.initialForm.unitID,
          development_listing_id: developmentListingID,
        });

        if (error) throw new Error(error.message);
      }

      toast({
        title: "Success",
        description: "🎉 Listing created successfully!",
      });

      onListingAdded();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderFormStep = () => {
    switch (currentStep) {
      case "initialForm":
        return (
          <CreateListingInitialForm
            onRequestDevelopment={onRequestDevelopment}
            onRequestUnit={onRequestUnit}
          />
        );
      case "developmentDetails":
        return <CreateListingDevelopmentDetails />;
      case "unitDetails":
        return <CreateListingUnitDetails />;
      default:
        return null;
    }
  };

  const currentStep = form.watch("step");
  const scope = form.watch("initialForm.scope");

  return (
    <div className="bg-white rounded-[12px] shadow-none rounded-xl max-w-xl w-full">
      <h4 className="text-2xl font-bold text-[#26045D] mb-2">
        Create new listing
      </h4>
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          {renderFormStep()}

          {((scope === "development" && currentStep === "developmentDetails") ||
            currentStep === "unitDetails") && (
            <div className="flex items-center justify-center w-full">
              <Button
                disabled={submitting}
                type="submit"
                className="rounded-full px-6 py-2 bg-[#26045D] hover:bg-[#26045D] text-sm font-bold leading-5 text-left"
              >
                {submitting && (
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                )}
                {submitting ? "Creating..." : "Create a draft for listing"}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
