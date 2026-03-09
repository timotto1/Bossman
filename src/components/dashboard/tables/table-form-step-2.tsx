import React, { useCallback, useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon, PlusIcon } from "lucide-react";

import { TableFormData } from "./table-form";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/context/user-context";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

const filterOptionsMap: Record<string, { value: string; label: string }[]> = {
  number: [
    { value: "equals", label: "Equals" },
    { value: "greaterThan", label: "Greater Than" },
    { value: "lessThan", label: "Less Than" },
    { value: "between", label: "Between" },
    { value: "isEmpty", label: "Is Empty" },
  ],
  date: [
    { value: "before", label: "Before" },
    { value: "after", label: "After" },
    { value: "between", label: "Between" },
    { value: "equals", label: "Equals" },
    { value: "isEmpty", label: "Is Empty" },
  ],
  string: [
    { value: "exactly", label: "Exactly" },
    { value: "contains", label: "Contains" },
    { value: "doesNotContain", label: "Does Not Contain" },
    { value: "isOneOf", label: "Is One Of" },
    { value: "isEmpty", label: "Is Empty" },
  ],
  array: [
    { value: "contains", label: "Contains" },
    { value: "doesNotContain", label: "Does Not Contain" },
  ],
  boolean: [
    { value: "isTrue", label: "Is True" },
    { value: "isFalse", label: "Is False" },
    { value: "isEmpty", label: "Is Empty" },
  ],
};

export default function TableFormStep2() {
  const form = useFormContext<TableFormData>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "step_2.filters",
  });

  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [filterableFields, setFilterableFields] = useState<
    { field: string; label: string; type: string }[]
  >([]);

  const formatLabel = (name: string) =>
    name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const getFieldType = (fieldName: string) =>
    filterableFields.find((f) => f.field === fieldName)?.type;

  const fetchTableFields = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("get_table_columns", {
        target_table: user?.dataTable,
      });
      if (error) throw new Error(error.message);

      const fields =
        data?.map(
          ({
            column_name,
            data_type,
          }: {
            column_name: string;
            data_type: string;
          }) => {
            const type = data_type.toLowerCase();
            let category: "date" | "number" | "string" | "boolean" | "array" =
              "string";

            if (type.includes("date") || type.includes("time"))
              category = "date";
            else if (
              ["int", "bigint", "decimal", "numeric", "real", "double"].some(
                (t) => type.includes(t),
              )
            )
              category = "number";
            else if (type.includes("bool")) category = "boolean";
            else if (type.includes("array")) category = "array";

            return {
              field: column_name,
              label: formatLabel(column_name),
              type: category,
            };
          },
        ) || [];

      setFilterableFields(fields);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.dataTable]);

  const renderFormField = (
    index: number,
    name: "filterValue" | "filterValue2",
    fieldType?: string,
  ) => {
    if (fieldType === "date") {
      return (
        <FormField
          control={form.control}
          name={`step_2.filters.${index}.${name}`}
          render={({ field }) => (
            <FormItem>
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "text-sm h-[28px] w-[180px] justify-start rounded-[12px]",
                        !field.value && "text-muted-foreground",
                        field.value
                          ? "border-[#26045D] text-[#26045D]"
                          : "border-[#D6D5D7]",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value
                        ? format(new Date(field.value), "PPP")
                        : "Pick a date"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => {
                      field.onChange(date?.toISOString() || "");
                    }}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    return (
      <FormField
        control={form.control}
        name={`step_2.filters.${index}.${name}`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                {...field}
                placeholder="Enter value"
                className={cn(
                  "py-1 px-3 text-sm h-[28px] border rounded-[12px]",
                  field.value
                    ? "border-[#26045D] text-[#26045D]"
                    : "border-[#D6D5D7]",
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  const renderValueInputs = (
    index: number,
    type: string,
    filterType: string,
  ) => {
    if (["isEmpty", "isTrue", "isFalse"].includes(filterType)) return null;
    if (filterType === "between") {
      return (
        <div className="flex items-center gap-1">
          {renderFormField(index, "filterValue", type)}
          <p className="text-sm text-[#26045D]">and</p>
          {renderFormField(index, "filterValue2", type)}
        </div>
      );
    }
    return renderFormField(index, "filterValue", type);
  };

  useEffect(() => {
    fetchTableFields();
  }, [fetchTableFields]);

  return (
    <div>
      <div className="flex items-center justify-end">
        <div className="bg-[#E5DAFB] h-[28px] rounded-full text-[#7114E2] mb-[50px] px-3 py-1">
          {form.watch("step_1.name")}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-1">
          <div className="lg:max-w-[220px] space-y-6">
            <h3 className="text-xl font-medium text-[#26045D]">
              Choose your filters
            </h3>
            <p className="text-[#87858E] text-sm">
              As you choose your filters, you can see a preview of how many
              residents fit into that category. You can always edit this later.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="col-span-2 flex items-center justify-center min-h-[300px]">
            <Loader />
          </div>
        ) : (
          <div className="col-span-2 border border-[#D6D5D7] p-4 rounded-[12px] space-y-3 h-[300px] overflow-y-auto">
            <h6 className="text-sm text-[#26045D]">Select Filters:</h6>

            {fields.map((_, index) => {
              const fieldName = form.watch(`step_2.filters.${index}.fieldName`);
              const filterType = form.watch(
                `step_2.filters.${index}.filterType`,
              );
              const logic = form.watch(`step_2.filters.${index}.logic`);
              const fieldType = getFieldType(fieldName || "");

              return (
                <React.Fragment key={index}>
                  <div className="flex flex-col gap-2 space-y-6">
                    {logic && index > 0 && (
                      <FormField
                        control={form.control}
                        name={`step_2.filters.${index}.logic`}
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-1 w-[110px] border border-[#D6D5D7] p-1 rounded-[10px]">
                              {["and", "or"].map((val) => (
                                <div
                                  key={val}
                                  className={cn(
                                    "py-1 px-3 cursor-pointer text-sm text-[#B9B7BD]",
                                    field.value === val &&
                                      "bg-[#26045D] text-white rounded-[10px]",
                                  )}
                                  onClick={() => field.onChange(val)}
                                >
                                  {val.toUpperCase()}
                                </div>
                              ))}
                            </div>
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Field Select */}
                        <FormField
                          control={form.control}
                          name={`step_2.filters.${index}.fieldName`}
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                value={field.value}
                                onValueChange={(value) => {
                                  form.setValue(
                                    `step_2.filters.${index}.filterType`,
                                    "",
                                  );
                                  form.setValue(
                                    `step_2.filters.${index}.filterValue`,
                                    "",
                                  );
                                  form.setValue(
                                    `step_2.filters.${index}.filterValue2`,
                                    "",
                                  );
                                  field.onChange(value);
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger
                                    className={cn(
                                      "rounded-[12px] text-sm h-7 border",
                                      fieldName
                                        ? "border-[#26045D] text-[#26045D]"
                                        : "border-[#D6D5D7] text-[#B9B7BD]",
                                    )}
                                  >
                                    <SelectValue placeholder="Select data to filter" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {filterableFields.map((f) => (
                                    <SelectItem key={f.field} value={f.field}>
                                      {f.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        {/* Filter Type Select */}
                        {fieldName && (
                          <>
                            <FormField
                              control={form.control}
                              name={`step_2.filters.${index}.filterType`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <FormControl>
                                      <SelectTrigger
                                        className={cn(
                                          "rounded-[12px] text-sm h-7 border",
                                          filterType
                                            ? "border-[#26045D] text-[#26045D]"
                                            : "border-[#D6D5D7] text-[#B9B7BD]",
                                        )}
                                      >
                                        <SelectValue placeholder="Select option" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {filterOptionsMap[fieldType!]?.map(
                                        (opt) => (
                                          <SelectItem
                                            key={opt.value}
                                            value={opt.value}
                                          >
                                            {opt.label}
                                          </SelectItem>
                                        ),
                                      )}
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />

                            {renderValueInputs(index, fieldType!, filterType!)}
                          </>
                        )}
                      </div>
                      {index > 0 && (
                        <div
                          className="text-sm bg-[#bb2124] rounded-full py-1 px-2 cursor-pointer"
                          onClick={() => remove(index)}
                        >
                          Remove
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </React.Fragment>
              );
            })}

            <div className="flex items-center justify-end">
              <Button
                type="button"
                variant="ghost"
                className="border border-[#D6D5D7] rounded-[12px] gap-3 text-sm text-[#B9B7BD] h-6 font-normal"
                onClick={() =>
                  append({
                    filterType: "",
                    filterValue: "",
                    filterValue2: "",
                    logic: "and",
                  })
                }
              >
                Add another filter <PlusIcon width={12} height={12} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
