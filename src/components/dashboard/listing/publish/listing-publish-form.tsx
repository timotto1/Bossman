"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useDevelopmentListing } from "@/context/development-listing-context";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";

const publishSchema = z.object({
  selections: z.string().array().min(1, {
    message: "Select at least one option",
  }),
});

export type PublishFormData = z.infer<typeof publishSchema>;

export default function ListingPublishForm() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const { completion } = useDevelopmentListing();

  const [submitting, setSubmitting] = useState(false);

  const form = useForm<PublishFormData>({
    resolver: zodResolver(publishSchema),
    defaultValues: {
      selections: [],
    },
  });

  const selections = form.watch("selections");

  const toggleSelection = (option: string) => {
    const updatedSelections = selections.includes(option)
      ? selections.filter((item) => item !== option)
      : [...selections, option];

    form.setValue("selections", updatedSelections, { shouldValidate: true });
  };

  const handleSubmit = async (data: PublishFormData) => {
    setSubmitting(true);
    try {
      const supabase = createClient();

      //only supports rightmove for now
      if (data.selections.includes("rightmove")) {
        const { error } = await supabase
          .from("development_listings")
          .update({
            rightmove_status: "available",
            user_published_to_rightmove_at: new Date(),
          })
          .eq("id", params.id);

        if (error) throw new Error(error.message);

        toast({
          title: "Success",
          description: "Listing has been published successfully!",
        });
      }

      router.push("/dashboard/listing");
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

  if (completion?.percentage !== 100) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="text-center">
          <h1 className="text-xl font-bold leading-8 text-[#26045D]">Oops!</h1>
          <p className="text-md leading-8">
            You're almost there! Please fill in the remaining details before
            publishing your listing.
          </p>
        </div>
        <Link
          href="/dashboard/listings"
          className="text-white rounded-full mt-12 px-6 py-2 bg-[#7747FF] hover:bg-[#7747FF] text-base font-bold font-open-sans leading-5 text-left"
        >
          Back to Listings
        </Link>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="selections"
          render={() => (
            <FormItem className="flex flex-col space-y-4">
              <div className="flex gap-2 items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/share-to-buy.png"
                    height={25}
                    width={38}
                    alt="share to buy"
                  />
                  <p className="font-medium text-[#26045D]">Share to buy</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-gray-500 text-xs">Coming soon</p>
                  <Switch
                    disabled={true}
                    className="data-[state=checked]:bg-[#6941C6]"
                    checked={selections.includes("share_to_buy")}
                    onCheckedChange={() => toggleSelection("share_to_buy")}
                  />
                </div>
              </div>
              <div className="flex gap-2 items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/rightmove.png"
                    height={10}
                    width={40}
                    alt="rightmove"
                  />
                  <p className="font-medium text-[#26045D]">Rightmove</p>
                </div>
                <Switch
                  className="data-[state=checked]:bg-[#6941C6]"
                  checked={selections.includes("rightmove")}
                  onCheckedChange={() => toggleSelection("rightmove")}
                />
              </div>
              <div className="flex gap-2 items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/zoopla.png"
                    height={12}
                    width={40}
                    alt="zoopla"
                  />
                  <p className="font-medium text-[#26045D]">Zoopla</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-gray-500 text-xs">Coming soon</p>
                  <Switch
                    disabled={true}
                    className="data-[state=checked]:bg-[#6941C6]"
                    checked={selections.includes("zoopla")}
                    onCheckedChange={() => toggleSelection("zoopla")}
                  />
                </div>
              </div>
              <div className="flex gap-2 items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/onthemarket.png"
                    height={8}
                    width={38}
                    alt="onthemarket"
                  />
                  <p className="font-medium text-[#26045D]">OnTheMarket</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-gray-500 text-xs">Coming soon</p>
                  <Switch
                    disabled={true}
                    className="data-[state=checked]:bg-[#6941C6]"
                    checked={selections.includes("onthemarket")}
                    onCheckedChange={() => toggleSelection("onthemarket")}
                  />
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-center">
          <Button
            disabled={submitting}
            type="submit"
            className="rounded-full px-6 py-2 bg-[#26045D] hover:bg-[#26045D] text-sm font-bold leading-5 min-w-[184px]"
          >
            {submitting && <LoaderCircle className="w-4 h-4 animate-spin" />}
            {submitting ? "Publishing..." : "Continue"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
