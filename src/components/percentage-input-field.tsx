import { Percent } from "lucide-react";

import { Input } from "./ui/input";

type PercentageInputFieldProps = {
  value: number;
  onChange: (value: number) => void;
};

export default function PercentageInputField({
  value,
  onChange,
}: PercentageInputFieldProps) {
  return (
    <div className="relative w-full">
      <Input
        value={value}
        type="number"
        className="pr-10"
        onChange={(event) => onChange(parseFloat(event.target.value))}
      />
      <Percent
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a07c3]"
        size={20}
      />
    </div>
  );
}
