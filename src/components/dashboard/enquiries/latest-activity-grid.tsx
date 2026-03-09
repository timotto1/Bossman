"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function LatestActivityGrid() {
  const date = new Date();
  const formattedDate = date.toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  return (
    <Card className="rounded-lg border-[#EEEEEE] bg-[linear-gradient(92.1deg,rgba(174,120,241,0.09)_0%,rgba(104,152,244,0.09)_105.32%)]">
      <CardContent className="px-4 py-2 text-[#26045D] relative">
        <Carousel
          opts={{
            align: "start",
          }}
          orientation="vertical"
          className="w-full"
        >
          <CarouselContent className="-mt-1 mb-2 h-[68px]">
            <CarouselItem className=" space-y-1">
              <h6 className="text-xs">{formattedDate}</h6>
              <div className="flex gap-2 font-medium items-center text-sm flex-wrap">
                <div className="bg-[#89F5C8] py-1 px-3 text-[#215942] rounded-full">
                  Tim Otto
                </div>
                <div>updated</div>
                <div className="border-2 border-[#87858E] py-1 px-3 text-[#4A4851] rounded-full">
                  Tim Otto, 50 Glenloch Road
                </div>
                <div>to</div>
                <div className="bg-[#E5DAFB] py-1 px-3 text-[#7114E2] rounded-full">
                  RICS Valuation Booked
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="left-[unset] top-0 right-0 translate-x-[0%]" />
          <CarouselNext className="left-[unset] bottom-0 right-0 translate-x-[0%]" />
        </Carousel>
      </CardContent>
    </Card>
  );
}
