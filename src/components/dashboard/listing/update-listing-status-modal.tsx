"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { z, ZodSchema } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type ListingStatus = {
  label: string;
  value: string;
};

type UpdateListingStatusModalProps<T extends ZodSchema> = {
  open: boolean;
  handleOpenChange: (open: boolean) => void;
  schema: T;
  defaultValues: z.infer<T>;
  refreshListing: () => Promise<void>;
  updateListing: (id: string, values: z.infer<T>) => Promise<void>;
  id: string;
  rightmoveStatuses: ListingStatus[];
};

export default function UpdateListingStatusModal<T extends ZodSchema>({
  open,
  handleOpenChange,
  refreshListing,
  updateListing,
  schema,
  defaultValues,
  rightmoveStatuses,
  id,
}: UpdateListingStatusModalProps<T>) {
  const { toast } = useToast();

  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
  });

  const handleSubmit = async (values: z.infer<T>) => {
    setSubmitting(true);
    try {
      await updateListing(id, values);

      toast({
        title: "Success",
        description: "Listing is updated successfully!",
      });

      handleOpenChange(false);

      await refreshListing();
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="[&>button]:hidden max-w-[95%] md:w-[552px] w-full rounded-2xl">
        <DialogTitle className="font-bold text-[#26045D] text-2xl">
          Update status
        </DialogTitle>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              /*eslint-disable @typescript-eslint/no-explicit-any*/
              name={"sharetobuyStatus" as any}
              render={({ field }) => (
                <FormItem className="flex gap-2 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/images/share-to-buy.png"
                      height={25}
                      width={38}
                      alt="share to buy"
                    />
                    <FormLabel className="font-medium text-[#26045D]">
                      Share to buy
                    </FormLabel>
                  </div>
                  <Select
                    disabled
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-[#26045D] max-w-[180px]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rightmoveStatuses.map((item, i) => (
                        <SelectItem key={`type-${i}`} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              /*eslint-disable @typescript-eslint/no-explicit-any*/
              name={"rightmoveStatus" as any}
              render={({ field }) => (
                <FormItem className="flex gap-2 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/images/rightmove.png"
                      height={10}
                      width={40}
                      alt="rightmove"
                    />
                    <FormLabel className="font-medium text-[#26045D]">
                      Rightmove
                    </FormLabel>
                  </div>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-[#26045D] max-w-[180px]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rightmoveStatuses.map((item, i) => (
                        <SelectItem key={`type-${i}`} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              /*eslint-disable @typescript-eslint/no-explicit-any*/
              name={"zooplaStatus" as any}
              render={({ field }) => (
                <FormItem className="flex gap-2 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/images/zoopla.png"
                      height={12}
                      width={40}
                      alt="zoopla"
                    />
                    <FormLabel className="font-medium text-[#26045D]">
                      Zoopla
                    </FormLabel>
                  </div>
                  <Select
                    disabled
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-[#26045D] max-w-[180px]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rightmoveStatuses.map((item, i) => (
                        <SelectItem key={`type-${i}`} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              /*eslint-disable @typescript-eslint/no-explicit-any*/
              name={"onthemarketStatus" as any}
              render={({ field }) => (
                <FormItem className="flex gap-2 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/images/onthemarket.png"
                      height={8}
                      width={38}
                      alt="onthemarket"
                    />
                    <FormLabel className="font-medium text-[#26045D]">
                      OnTheMarket
                    </FormLabel>
                  </div>
                  <Select
                    disabled
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-[#26045D] max-w-[180px]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rightmoveStatuses.map((item, i) => (
                        <SelectItem key={`type-${i}`} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              disabled={submitting}
              type="submit"
              className="mx-auto flex items-center gap-2 py-2 px-4 text-white rounded-full bg-gradient-to-r from-[#7747FF] to-[#9847FF] h-8 hover:from-[#5a2dbf] hover:to-[#6a2dbf]"
            >
              {submitting && <LoaderCircle className="w-4 h-4 animate-spin" />}
              {submitting ? "Updating..." : "Update"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
