import React from "react";
import { PoundSterling } from "lucide-react";

import { Input } from "./ui/input";
import { formatInputWithCommas } from "@/utils";

type CurrencyInputFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function CurrencyInputField({
  value,
  onChange,
}: CurrencyInputFieldProps) {
  return (
    <div className="relative w-full">
      <PoundSterling
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a07c3]"
        size={20}
      />
      <Input
        value={value}
        type="text"
        className="pl-10"
        onChange={(e) => onChange(formatInputWithCommas(e.target.value))}
        onBlur={(e) => {
          if (e.target.value.endsWith(".")) {
            onChange(e.target.value.slice(0, -1));
          }
        }}
      />
    </div>
  );
}
