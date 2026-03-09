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
import { useUnitListing } from "@/context/unit-listing-context";
import { useToast } from "@/hooks/use-toast";

const schemeMappings: Record<string, string> = {
  shared_ownership: "Shared Ownership",
  help_to_buy: "Help to Buy",
};

const unitDetailSchema = z.object({
  scheme: z.enum(["shared_ownership", "help_to_buy"], {
    required_error: "Development scheme is required.",
  }),
  address_1: z.string().min(1, { message: "Address 1 is required." }),
  address_2: z.string().optional(),
  address_3: z.string().optional(),
  postcode: z.string().min(1, { message: "Postcode is required." }),
  town: z.string().min(1, { message: "City is required." }),
  size: z.coerce.number().min(1, { message: "Unit size is required." }),
});

type UnitDetailFormData = z.infer<typeof unitDetailSchema>;

export default function UnitListingDevelopmentDetailCard() {
  const { toast } = useToast();

  const {
    isLoading,
    data: unitListing,
    updateListing,
    refreshListing,
  } = useUnitListing();
  const [isUpdating, setIsUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const form = useForm<UnitDetailFormData>({
    resolver: zodResolver(unitDetailSchema),
    mode: "onChange",
  });

  const getUnitAddress = () => {
    return [
      form.watch("address_1"),
      form.watch("address_2"),
      form.watch("address_3"),
      form.watch("town"),
      form.watch("postcode"),
    ]
      .filter(Boolean)
      .join(", ");
  };

  const handleSubmit = async (data: UnitDetailFormData) => {
    setIsUpdating(true);
    try {
      await updateListing({
        address_1: data.address_1,
        address_2: data.address_2,
        address_3: data.address_3,
        postcode: data.postcode,
        town: data.town,
        scheme: data.scheme,
        size: data.size,
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
              name="address_2"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Address 2"
                      className="h-11 w-full pr-8 text-xs font-normal leading-4 text-left border-[#26045D] focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address_3"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Address 3"
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
              name="town"
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

          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative w-full">
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Size"
                      className="h-11 w-full pr-14 text-xs font-normal leading-4 text-left border-[#26045D] focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <p className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a07c3]">
                      sq ft.
                    </p>
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
              {getUnitAddress()}, United Kingdom
            </p>
          )}
        </div>

        <div className="space-y-1">
          <p className="font-medium text-base text-[#26045D]">Size</p>
          {isLoading ? (
            <Skeleton className="h-4 w-[100px]" />
          ) : (
            <p className="text-[#26045D] text-sm">
              {form.watch("size")
                ? `${form.watch("size")} sq. ft.`
                : "Not available"}
            </p>
          )}
        </div>
      </>
    );
  };

  useEffect(() => {
    if (!isLoading && unitListing) {
      form.reset({
        scheme: unitListing?.scheme ?? "shared_ownership",
        address_1: unitListing?.address_1 ?? "",
        address_2: unitListing?.address_2 ?? "",
        address_3: unitListing?.address_3 ?? "",
        postcode: unitListing?.postcode ?? "",
        town: unitListing?.town ?? "",
        size: unitListing?.size ?? "",
      });
    }
  }, [isLoading, unitListing, form]);

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
