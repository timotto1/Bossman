import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Bars3Icon,
  PaintBrushIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe2Icon, LoaderCircle } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useUnitListing } from "@/context/unit-listing-context";
import { useToast } from "@/hooks/use-toast";

const descriptionSchema = z.object({
  keyInformationURL: z
    .string()
    .url({
      message: "Enter a valid url.",
    })
    .optional()
    .nullable(),
  description: z.string().optional(),
});

type DescriptionFormData = z.infer<typeof descriptionSchema>;

export default function UnitListingDescriptionCard() {
  const { toast } = useToast();

  const {
    isLoading,
    data: unitListing,
    updateListing,
    refreshListing,
  } = useUnitListing();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const form = useForm<DescriptionFormData>({
    resolver: zodResolver(descriptionSchema),
    mode: "onChange",
    defaultValues: {
      keyInformationURL: unitListing?.key_information_url,
      description: unitListing?.unit_description,
    },
  });

  const description = form.watch("description") || "-";
  const MAX_LENGTH = 100; // adjust as needed
  const shouldTruncate = description.length > MAX_LENGTH;
  const displayText = isExpanded
    ? description
    : description.slice(0, MAX_LENGTH);

  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  const generateListingDescription = async () => {
    setIsGeneratingDescription(true);
    try {
      const response = await fetch(`/api/listing/generate-description`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId: unitListing?.id,
          type: "units",
        }),
      });

      const body = await response.json();

      form.setValue("description", body.description);

      toast({
        variant: "default",
        title: "Success",
        description: "Your listing description is ready! 🎉",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleSubmit = async (data: DescriptionFormData) => {
    setIsUpdating(true);
    try {
      await updateListing({
        key_information_url: data.keyInformationURL!,
        unit_description: data.description!,
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

  const renderGenerateDescription = () => {
    return (
      <div className="space-y-1">
        <p className="font-medium text-base text-[#26045D]">
          Get Stairpay AI to generate a description for your property.
        </p>
        {isLoading ? (
          <Skeleton className="h-4 w-[100px]" />
        ) : (
          <Button
            disabled={isGeneratingDescription}
            type="button"
            className="bg-[#F0F0FE] hover:bg-[#F0F0FE] rounded-full max-w-[184px] w-full text-sm font-medium leading-5 text-left text-[#26045D]"
            onClick={async () => {
              setEditMode(true);
              await generateListingDescription();
            }}
          >
            {isGeneratingDescription && (
              <LoaderCircle className="w-5 h-5 animate-spin" />
            )}
            {isGeneratingDescription ? "Generating..." : "Tap to generate"}
            <PaintBrushIcon className="h-6 w-6" />
          </Button>
        )}
      </div>
    );
  };

  const renderEditMode = () => {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="keyInformationURL"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="font-medium text-base text-[#26045D]">
                  Key information URL
                </FormLabel>
                <FormControl>
                  <div className="relative w-full">
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      className="pl-10 border-[#26045D]"
                    />
                    <Globe2Icon
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
            name="description"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="font-medium text-base text-[#26045D]">
                  Description
                </FormLabel>
                <FormControl>
                  <div className="relative w-full">
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      className="border-[#26045D]"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {renderGenerateDescription()}

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
          <p className="font-medium text-base text-[#26045D]">
            Key Information URL
          </p>
          {isLoading ? (
            <Skeleton className="h-4 w-[100px]" />
          ) : (
            <p className="text-[#26045D] text-sm">
              {form.watch("keyInformationURL") || "-"}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <p className="font-medium text-base text-[#26045D]">Description</p>
          {isLoading ? (
            <Skeleton className="h-4 w-[100px]" />
          ) : (
            <div className="text-[#26045D] text-sm">
              {displayText}
              {shouldTruncate && !isExpanded && "..."}
              {shouldTruncate && (
                <button
                  onClick={toggleExpanded}
                  className="ml-1 text-[#5A35B9] text-xs font-medium hover:underline"
                >
                  {isExpanded ? "See less" : " See more"}
                </button>
              )}
            </div>
          )}
        </div>

        {renderGenerateDescription()}
      </>
    );
  };

  useEffect(() => {
    if (!isLoading && unitListing) {
      form.reset({
        keyInformationURL: unitListing?.key_information_url,
        description: unitListing?.unit_description,
      });
    }
  }, [isLoading, unitListing, form]);

  return (
    <Card className="p-6 space-y-6 rounded-2xl h-fit">
      <CardTitle className="flex items-center gap-2">
        <Bars3Icon className="w-4 h-4" color="#26045D" />
        <p className="font-bold text-[#26045D] text-base">Description</p>
        {!editMode && (
          <PencilSquareIcon
            className="w-4 h-4 cursor-pointer"
            color="#26045D"
            onClick={() => setEditMode(true)}
          />
        )}
      </CardTitle>
      <CardContent className="p-0">
        <div className="space-y-6">
          {editMode ? renderEditMode() : renderViewMode()}
        </div>
      </CardContent>
    </Card>
  );
}
