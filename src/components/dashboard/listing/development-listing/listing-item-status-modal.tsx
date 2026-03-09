"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDevelopmentListing } from "@/context/development-listing-context";
import { cn } from "@/lib/utils";

export default function ListingItemStatusModal({
  open,
  handleOpenChange,
}: {
  open: boolean;
  handleOpenChange: (open: boolean) => void;
}) {
  const params = useParams();

  const { completion } = useDevelopmentListing();

  const getStatusIndicator = (
    label: string,
    completed: boolean,
    percentage: number,
  ) => {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-sm font-normal leading-4 text-[#26045D] justify-center",
        )}
      >
        <span className="font-bold">{label}</span>
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: completed ? "#00C875" : "#FDAB3D" }}
        />
        <span className="font-medium">{percentage}%</span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="[&>button]:hidden max-w-[95%] md:w-[552px] w-full rounded-2xl">
        <DialogTitle className="font-bold text-[#26045D] text-2xl">
          Listing status
        </DialogTitle>
        <p className="text-[#26045D]">
          We recommend you to complete all the information prior to publishing.
        </p>
        <Accordion type="single" collapsible>
          <AccordionItem value="overview">
            <AccordionTrigger>
              {getStatusIndicator(
                "Overview",
                completion!.sections.overview.complete!,
                completion!.sections.overview.percentage!,
              )}
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="flex text-sm items-center justify-between">
                <p className="text-[#26045D]">Development name</p>
                {completion!.sections?.overview?.fields?.development_name ? (
                  <Image
                    src="/images/check-circle.png"
                    width={20}
                    height={20}
                    alt="check circle"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/listing/${params.id}`}
                      className="text-sm text-gray-600"
                    >
                      Edit
                    </Link>
                    <Image
                      src="/images/plus-circle.png"
                      width={20}
                      height={20}
                      alt="plus circle"
                    />
                  </div>
                )}
              </div>
              <div className="flex text-sm items-center justify-between">
                <p className="text-[#26045D]">Scheme</p>
                {completion!.sections?.overview?.fields?.scheme ? (
                  <Image
                    src="/images/check-circle.png"
                    width={20}
                    height={20}
                    alt="check circle"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/listing/${params.id}`}
                      className="text-sm text-gray-600"
                    >
                      Edit
                    </Link>
                    <Image
                      src="/images/plus-circle.png"
                      width={20}
                      height={20}
                      alt="plus circle"
                    />
                  </div>
                )}
              </div>
              <div className="flex text-sm items-center justify-between">
                <p className="text-[#26045D]">Minimum share</p>
                {completion!.sections?.overview?.fields?.minimum_share ? (
                  <Image
                    src="/images/check-circle.png"
                    width={20}
                    height={20}
                    alt="check circle"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/listing/${params.id}`}
                      className="text-sm text-gray-600"
                    >
                      Edit
                    </Link>
                    <Image
                      src="/images/plus-circle.png"
                      width={20}
                      height={20}
                      alt="plus circle"
                    />
                  </div>
                )}
              </div>
              <div className="flex text-sm items-center justify-between">
                <p className="text-[#26045D]">Minimum deposit</p>
                {completion!.sections?.overview?.fields?.minimum_deposit ? (
                  <Image
                    src="/images/check-circle.png"
                    width={20}
                    height={20}
                    alt="check circle"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/listing/${params.id}`}
                      className="text-sm text-gray-600 underline"
                    >
                      Edit
                    </Link>
                    <Image
                      src="/images/plus-circle.png"
                      width={20}
                      height={20}
                      alt="plus circle"
                    />
                  </div>
                )}
              </div>
              <div className="flex text-sm items-center justify-between">
                <p className="text-[#26045D]">Add criteria</p>
                {completion!.sections?.overview?.fields?.criteria ? (
                  <Image
                    src="/images/check-circle.png"
                    width={20}
                    height={20}
                    alt="check circle"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/listing/${params.id}`}
                      className="text-sm text-gray-600 underline"
                    >
                      Edit
                    </Link>
                    <Image
                      src="/images/plus-circle.png"
                      width={20}
                      height={20}
                      alt="plus circle"
                    />
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="units">
            <AccordionTrigger>
              {getStatusIndicator(
                "Units",
                completion!.sections.units.complete!,
                completion!.sections.units.percentage!,
              )}
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="flex text-sm items-center justify-between">
                <p className="text-[#26045D]">
                  Add at least 1 unit to the listing
                </p>
                {completion!.sections?.units?.fields?.has_unit_listings ? (
                  <Image
                    src="/images/check-circle.png"
                    width={20}
                    height={20}
                    alt="check circle"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/listing/${params.id}?t=units`}
                      className="text-sm text-gray-600 underline"
                    >
                      Edit
                    </Link>
                    <Image
                      src="/images/plus-circle.png"
                      width={20}
                      height={20}
                      alt="plus circle"
                    />
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="marketing">
            <AccordionTrigger>
              {getStatusIndicator(
                "Marketing",
                completion!.sections.media.complete!,
                completion!.sections.media.percentage!,
              )}
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="flex text-sm items-center justify-between">
                <p className="text-[#26045D]">
                  Add at least 1 photo to the listing
                </p>
                {completion!.sections?.media?.fields?.has_media ? (
                  <Image
                    src="/images/check-circle.png"
                    width={20}
                    height={20}
                    alt="check circle"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/listing/${params.id}?t=marketing`}
                      className="text-sm text-gray-600 underline"
                    >
                      Edit
                    </Link>
                    <Image
                      src="/images/plus-circle.png"
                      width={20}
                      height={20}
                      alt="plus circle"
                    />
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="attachments">
            <AccordionTrigger>
              {getStatusIndicator(
                "Attachments",
                completion!.sections.attachments.complete!,
                completion!.sections.attachments.percentage!,
              )}
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="flex text-sm items-center justify-between">
                <p className="text-[#26045D]">
                  Add Floorplan, Key Information Document, Energy Certificate,
                  Brochure
                </p>
                {completion!.sections?.attachments?.fields?.brochure &&
                completion!.sections?.attachments?.fields?.energy_cert &&
                completion!.sections?.attachments?.fields?.kid &&
                completion!.sections?.attachments?.fields?.floor_plan ? (
                  <Image
                    src="/images/check-circle.png"
                    width={20}
                    height={20}
                    alt="check circle"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/listing/${params.id}?t=attachments`}
                      className="text-sm text-gray-600 underline"
                    >
                      Edit
                    </Link>
                    <Image
                      src="/images/plus-circle.png"
                      width={20}
                      height={20}
                      alt="plus circle"
                    />
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        {completion?.complete && (
          <DialogFooter>
            <Link
              href={`/dashboard/listing/${params.id}/publish`}
              className="bg-[#26045D] text-center hover:bg-[#26045D] text-white rounded-full px-4 py-2 text-sm min-w-[184px] mx-auto"
            >
              Continue
            </Link>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
