import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ListBulletIcon, PencilSquareIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useDevelopmentListing } from "@/context/development-listing-context";
import { useToast } from "@/hooks/use-toast";

const schemeMappings: Record<string, string> = {
  shared_ownership: "Shared Ownership",
  help_to_buy: "Help to Buy",
};

const developmentDetailSchema = z.object({
  developmentName: z
    .string()
    .min(1, { message: "Development name is required." }),
  scheme: z.enum(["shared_ownership", "help_to_buy"], {
    required_error: "Development scheme is required.",
  }),
  address_1: z.string().min(1, { message: "Address 1 is required." }),
  postcode: z.string().min(1, { message: "Postcode is required." }),
  city: z.string().min(1, { message: "City is required." }),
});

type DevelopmentDetailFormData = z.infer<typeof developmentDetailSchema>;

export default function ListingDevelopmentDetailCard() {
  const { toast } = useToast();

  const {
    isLoading,
    data: developmentListing,
    updateListing,
    refreshListing,
  } = useDevelopmentListing();
  const [isUpdating, setIsUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const form = useForm<DevelopmentDetailFormData>({
    resolver: zodResolver(developmentDetailSchema),
    mode: "onChange",
  });

  const handleSubmit = async (data: DevelopmentDetailFormData) => {
    setIsUpdating(true);
    try {
      await updateListing({
        development_name: data.developmentName,
        address_1: data.address_1,
        postcode: data.postcode,
        city: data.city,
        scheme: data.scheme,
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
            name="developmentName"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="font-medium text-base text-[#26045D]">
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
            name="scheme"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-[#26045D]">Scheme</FormLabel>
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

          <div className="space-y-1">
            <p className="text-sm text-[#26045D]">Listing Address</p>
            <FormField
              control={form.control}
              name="address_1"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Address 1"
                      className="h-11 w-full pr-8 text-xs font-normal leading-4 text-left border-[#26045D] focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postcode"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Postcode"
                      className="h-11 w-full pr-8 text-xs font-normal leading-4 text-left border-[#26045D] focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="City"
                      className="h-11 w-full pr-8 text-xs font-normal leading-4 text-left border-[#26045D] focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

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
            Development name
          </p>
          {isLoading ? (
            <Skeleton className="h-4 w-[100px]" />
          ) : (
            <p className="text-[#26045D] text-sm underline">
              {form.watch("developmentName")}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <p className="font-medium text-base text-[#26045D]">Scheme</p>
          {isLoading ? (
            <Skeleton className="h-4 w-[100px]" />
          ) : (
            <p className="text-[#26045D] text-sm">
              {schemeMappings[form.watch("scheme")]}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <p className="font-medium text-base text-[#26045D]">
            Listing Address
          </p>
          {isLoading ? (
            <Skeleton className="h-4 w-[100px]" />
          ) : (
            <p className="text-[#26045D] text-sm">
              {form.watch("address_1")}, {form.watch("postcode")},{" "}
              {form.watch("city")}, United Kingdom
            </p>
          )}
        </div>
      </>
    );
  };

  useEffect(() => {
    if (!isLoading && developmentListing) {
      form.reset({
        developmentName: developmentListing?.development_name ?? "",
        scheme: developmentListing?.scheme ?? "shared_ownership",
        address_1: developmentListing?.address_1 ?? "",
        postcode: developmentListing?.postcode ?? "",
        city: developmentListing?.city ?? "",
      });
    }
  }, [isLoading, developmentListing, form]);

  return (
    <Card className="p-6 space-y-6 rounded-2xl h-fit">
      <CardTitle className="flex items-center gap-2">
        <ListBulletIcon className="w-4 h-4" color="#26045D" />
        <p className="font-bold text-[#26045D] text-base">Details</p>
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
