"use client";

import { useState } from "react";
import { CalendarIcon } from "@heroicons/react/20/solid";
import { addDays, format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function LeadDateFilter() {
  const [dateFrom, setDateFrom] = useState<Date>(new Date());
  const [dateTo, setDateTo] = useState<Date>(addDays(new Date(), 7));

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="max-w-[215px] w-full border rounded-md p-4">
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                className="justify-start text-center font-normal text-sm text-[#757575]"
              >
                Date From{" "}
                <CalendarIcon className="mr-2 h-4 w-4" color="#4E1A8F" />
              </Button>
              <p className="text-xs font-bold leading-8 text-center text-[#4E1A8F]">
                {dateFrom ? format(dateFrom, "dd MMMM yyyy") : "Pick a date"}
              </p>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateTo}
              onSelect={setDateTo}
              required
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="max-w-[215px] w-full border rounded-md p-4">
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                className="justify-start text-left font-normal text-sm text-[#757575]"
              >
                Date To{" "}
                <CalendarIcon className="mr-2 h-4 w-4" color="#4E1A8F" />
              </Button>
              <p className="text-xs font-bold leading-8 text-center text-[#4E1A8F]">
                {dateTo ? format(dateTo, "dd MMMM yyyy") : "Pick a date"}
              </p>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateFrom}
              onSelect={setDateFrom}
              required
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
