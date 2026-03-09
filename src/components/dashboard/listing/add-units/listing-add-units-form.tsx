"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { z } from "zod";

import ListingAddUnitsDetailsForm, {
  addUnitsDetailsSchema,
} from "./listing-add-units-details";
import ListingAddUnitsInitialForm, {
  addUnitsInitialFormSchema,
} from "./listing-add-units-initial-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useDevelopmentListing } from "@/context/development-listing-context";
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";

const addUnitsSchema = z.object({
  initialForm: addUnitsInitialFormSchema,
  unitDetails: addUnitsDetailsSchema,
  step: z.enum(["initialForm", "unitDetails"]).nullable(),
});

export type AddUnitsFormData = z.infer<typeof addUnitsSchema>;

export default function ListingAddUnitsForm({
  selectedListingId,
  onUnitAdded,
}: {
  selectedListingId: string;
  onUnitAdded: () => void;
}) {
  const { user } = useUser();
  const { toast } = useToast();

  const { refreshListingUnits } = useDevelopmentListing();

  const form = useForm<AddUnitsFormData>({
    resolver: zodResolver(addUnitsSchema),
    defaultValues: {
      step: "initialForm",
    },
  });

  const steps = [
    {
      key: "initialForm",
      nextStep: () => "unitDetails",
    },
    {
      key: "unitDetails",
    },
  ];

  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const getDevelopmentListing = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("development_listings")
        .select("company_development_id")
        .eq("id", selectedListingId)
        .single();

      if (error) throw new Error(error.message);

      form.reset({
        initialForm: {
          developmentID: data?.company_development_id,
        },
        step: "initialForm",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [form, selectedListingId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const current = form.getValues("step");

      const currentStepConfig = steps.find((s) => s.key === current);

      if (!currentStepConfig) {
        console.error("Unknown step:", current);
        return setSubmitting(false);
      }

      const isValid = await form.trigger(
        currentStepConfig.key as keyof AddUnitsFormData,
      );
      if (!isValid) return setSubmitting(false);

      // Handle step transition logic
      if ("nextStep" in currentStepConfig && currentStepConfig.nextStep) {
        const next = currentStepConfig.nextStep();
        form.setValue("step", next as "initialForm" | "unitDetails" | null);
        setSubmitting(false);
        return;
      }

      const data = form.getValues();

      const supabase = createClient();

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
        rightmove_status: null,
        company_development_id: data.initialForm.developmentID,
        company_id: user?.companyID,
        company_development_unit_id: data.initialForm.unitID,
        development_listing_id: selectedListingId,
      });

      if (error) throw new Error(error.message);

      toast({
        title: "Success",
        description: "🎉 Unit added to this listing successfully!",
      });

      onUnitAdded();

      await refreshListingUnits();
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
        return <ListingAddUnitsInitialForm />;
      case "unitDetails":
        return <ListingAddUnitsDetailsForm />;
      default:
        return null;
    }
  };

  const currentStep = form.watch("step");

  useEffect(() => {
    getDevelopmentListing();
  }, [getDevelopmentListing]);

  if (isLoading) return null;

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-4"
      >
        {renderFormStep()}

        {currentStep === "unitDetails" && (
          <div className="flex items-center justify-center w-full">
            <Button
              disabled={submitting}
              type="submit"
              className="rounded-full px-6 py-2 bg-[#26045D] hover:bg-[#26045D] text-sm font-bold leading-5 text-left"
            >
              {submitting && <LoaderCircle className="w-4 h-4 animate-spin" />}
              {submitting ? "Adding..." : "Add unit to this listing"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
