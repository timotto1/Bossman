"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const PurpleSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    const targetValue = 50;
    const duration = 1000;
    const steps = 200;
    const increment = targetValue / steps;
    const interval = duration / steps;

    let currentValue = 0;
    const intervalId = setInterval(() => {
      currentValue += increment;
      if (currentValue >= targetValue) {
        currentValue = targetValue;
        clearInterval(intervalId);
      }
      setValue(Math.round(currentValue));
    }, interval);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className,
      )}
      value={[value]}
      onValueChange={(v) => setValue(v[0])}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gradient-to-r from-indigo-200 to-[#7747FF] via-[#CFCFFF]">
        <SliderPrimitive.Range className="absolute h-full bg-transparent" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full bg-[#5B10CC] shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  );
});
PurpleSlider.displayName = SliderPrimitive.Root.displayName;

export { PurpleSlider };
