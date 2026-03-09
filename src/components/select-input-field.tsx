import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type SelectItem = {
  label: string;
  value: string;
};

type SelectInputFieldProps = {
  value: string;
  onChange: (value: string) => void;
  items: SelectItem[];
};

export default function SelectInputField({
  value,
  onChange,
  items,
}: SelectInputFieldProps) {
  return (
    <Select onValueChange={onChange} defaultValue={value}>
      <SelectTrigger>
        <SelectValue placeholder="Select one from dropdown" />
      </SelectTrigger>
      <SelectContent>
        {items.map((item, i) => (
          <SelectItem key={`type-${i}`} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
