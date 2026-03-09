"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { Film, Globe2Icon, LoaderCircle } from "lucide-react";
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
import { useUnitListing } from "@/context/unit-listing-context";
import { useToast } from "@/hooks/use-toast";

const marketingDetailSchema = z.object({
  youtubeURL: z
    .string()
    .url({
      message: "Enter a valid url.",
    })
    .optional()
    .nullable(),
  vimeoURL: z
    .string()
    .url({
      message: "Enter a valid url.",
    })
    .optional(),
  virtualTourSupplier: z.string().optional().nullable(),
  virtualTourURL: z
    .string()
    .url({
      message: "Enter a valid url.",
    })
    .optional()
    .nullable(),
});

type MarketingDetailFormData = z.infer<typeof marketingDetailSchema>;

export default function UnitListingVideosCard() {
  const { toast } = useToast();

  const {
    isLoading,
    data: unitListing,
    updateListing,
    refreshListing,
  } = useUnitListing();
  const [isUpdating, setIsUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const form = useForm<MarketingDetailFormData>({
    resolver: zodResolver(marketingDetailSchema),
    mode: "onChange",
  });

  const handleSubmit = async (data: MarketingDetailFormData) => {
    setIsUpdating(true);
    try {
      await updateListing({
        youtube_url: data.youtubeURL!,
        vimeo_url: data.vimeoURL!,
        virtual_tour_supplier: data.virtualTourSupplier!,
        virtual_tour_url: data.virtualTourURL!,
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
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="youtubeURL"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="font-medium text-base text-[#26045D]">
                  Youtube URL
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
            name="vimeoURL"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="font-medium text-base text-[#26045D]">
                  Vimeo URL
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
            name="virtualTourSupplier"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="font-medium text-base text-[#26045D]">
                  Virtual tour supplier
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    className="border-[#26045D]"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="virtualTourURL"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="font-medium text-base text-[#26045D]">
                  Virtual tour URL
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
          <p className="font-medium text-base text-[#26045D]">Youtube URL</p>
          {isLoading ? (
            <Skeleton className="h-4 w-[100px]" />
          ) : (
            <p className="text-[#26045D] text-sm">
              {form.watch("youtubeURL") || "-"}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <p className="font-medium text-base text-[#26045D]">Vimeo URL</p>
          {isLoading ? (
            <Skeleton className="h-4 w-[100px]" />
          ) : (
            <p className="text-[#26045D] text-sm">
              {form.watch("vimeoURL") || "-"}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <p className="font-medium text-base text-[#26045D]">
            Virtual tour supplier
          </p>
          {isLoading ? (
            <Skeleton className="h-4 w-[100px]" />
          ) : (
            <p className="text-[#26045D] text-sm">
              {form.watch("virtualTourSupplier") || "-"}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <p className="font-medium text-base text-[#26045D]">
            Virtual tour URL
          </p>
          {isLoading ? (
            <Skeleton className="h-4 w-[100px]" />
          ) : (
            <p className="text-[#26045D] text-sm">
              {form.watch("virtualTourURL") || "-"}
            </p>
          )}
        </div>
      </>
    );
  };

  useEffect(() => {
    if (!isLoading && unitListing) {
      form.reset({
        youtubeURL: unitListing?.youtube_url,
        vimeoURL: unitListing?.vimeo_url,
        virtualTourSupplier: unitListing?.virtual_tour_supplier,
        virtualTourURL: unitListing?.virtual_tour_url,
      });
    }
  }, [isLoading, unitListing, form]);

  return (
    <Card className="p-6 space-y-6 rounded-2xl h-fit">
      <CardTitle className="flex items-center gap-2">
        <Film className="w-4 h-4" color="#26045D" />
        <p className="font-bold text-[#26045D] text-base">Videos</p>
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
