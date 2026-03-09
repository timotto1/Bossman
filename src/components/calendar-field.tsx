import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

type CalendarInputFieldProps = {
  date: Date | undefined;
  onSelect: (date: Date) => void;
};

export default function CalendarInputField({
  date,
  onSelect,
}: CalendarInputFieldProps) {
  const [calendarPopoverOpen, setCalendarPopoverOpen] = useState(false);

  return (
    <Popover open={calendarPopoverOpen} onOpenChange={setCalendarPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full pl-3 text-left font-normal">
          {date ? format(date, "PPP") : <span>Pick a date</span>}
          <CalendarIcon className="ml-auto text-[#4a07c3]" size={20} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => {
            onSelect(date!);
            setCalendarPopoverOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
