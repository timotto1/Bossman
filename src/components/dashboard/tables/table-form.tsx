"use client";

import { useState } from "react";
import { FieldPath, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { z } from "zod";

import TableFormStep1 from "./table-form-step-1";
import TableFormStep2 from "./table-form-step-2";
import TableFormStep3 from "./table-form-step-3";
import TableFormStep4 from "./table-form-step-4";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { TableQuery, useTable } from "@/context/table-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const filterSchema = z
  .object({
    fieldName: z.string().optional(),
    filterType: z.string().optional(),
    filterValue: z.string().optional(),
    filterValue2: z.string().optional(),
    logic: z.enum(["and", "or"]).default("and"),
  })
  .refine(
    (data) => {
      // If nothing chosen, skip validation
      if (
        !data.fieldName &&
        !data.filterType &&
        !data.filterValue &&
        !data.filterValue2
      ) {
        return true;
      }

      // If a filterType is chosen, check rules
      if (data.filterType === "isEmpty") return true;
      if (data.filterType === "between")
        return !!data.filterValue && !!data.filterValue2;
      return !!data.filterValue;
    },
    {
      message: "Filter value(s) required",
      path: ["filterValue"],
    },
  );

const permissionSchema = z
  .object({
    type: z.enum(["all", "none", "user"], {
      required_error: "Permission type is required",
    }),
    userId: z.string().uuid().optional(), // only required if type === "user"
  })
  .superRefine((val, ctx) => {
    if (val.type === "user" && !val.userId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "User must be selected when permission type is 'user'",
        path: ["userId"],
      });
    }
  });

const tableSchema = z.object({
  step_1: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
  }),
  step_2: z.object({
    filters: z.array(filterSchema).superRefine((filters, ctx) => {
      filters.forEach((filter, index) => {
        const isEmptyRow =
          !filter.fieldName &&
          !filter.filterType &&
          !filter.filterValue &&
          !filter.filterValue2;

        const multipleFilters = filters.length > 1;
        const skipValueTypes = ["isEmpty", "isTrue", "isFalse"];

        // RULE 1: If multiple filters, first one must have fieldName
        if (multipleFilters && index === 0 && !filter.fieldName) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "First filter must have a field selected",
            path: [index, "fieldName"],
          });
        }

        // RULE 2: If only one filter and fieldName selected → require the rest
        if (!multipleFilters && index === 0 && filter.fieldName) {
          if (!filter.filterType) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Filter type is required",
              path: [index, "filterType"],
            });
          }

          if (filter.filterType === "between") {
            if (!filter.filterValue || !filter.filterValue2) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Both values are required for 'between'",
                path: [index, "filterValue"],
              });
            }
          } else if (
            filter.filterType &&
            !skipValueTypes.includes(filter.filterType) &&
            !filter.filterValue
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Filter value is required",
              path: [index, "filterValue"],
            });
          }
        }

        // RULE 3: Any filter after the first one (index >= 1) is required
        if (index >= 1 && isEmptyRow) {
          if (!filter.fieldName) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Field is required",
              path: [index, "fieldName"],
            });
          }
          if (!filter.logic) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Logic ("and" or "or") is required',
              path: [index, "logic"],
            });
          }
        }
      });
    }),
  }),
  step_3: z.object({
    view: permissionSchema,
    edit: permissionSchema,
  }),
  step_4: z.string().optional(),
  step: z.coerce.number(),
});

export type TableFormData = z.infer<typeof tableSchema>;

export type StepNamesType = keyof TableFormData;

const STEPS_TO_STEP_NAMES: { [key in number]: StepNamesType } = {
  1: "step_1",
  2: "step_2",
  3: "step_3",
  4: "step_4",
};

const STEP_FIELDS: Record<StepNamesType, FieldPath<TableFormData>[]> = {
  step_1: ["step_1.name", "step_1.description"],
  step_2: ["step_2.filters"],
  step_3: [
    "step_3.view.type",
    "step_3.view.userId",
    "step_3.edit.type",
    "step_3.edit.userId",
  ],
  step_4: [],
  step: [],
};

export default function TableForm({
  initialForm,
  handleClose,
}: {
  initialForm: Partial<TableQuery> | null;
  handleClose: () => void;
}) {
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);

  const { createTable, updateTable, refreshTables } = useTable();

  const form = useForm<TableFormData>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      step_1: {
        name: initialForm?.name || "",
        description: initialForm?.description || "",
      },
      step_2: {
        filters: initialForm?.filters || [
          {
            fieldName: "",
            filterType: "",
            filterValue: "",
            filterValue2: "",
          },
        ],
      },
      step_3: {
        view: {
          type: initialForm?.view_permission_type || undefined,
          userId: initialForm?.view_permission_user_id || undefined,
        },
        edit: {
          type: initialForm?.edit_permission_type || undefined,
          userId: initialForm?.view_permission_user_id || undefined,
        },
      },
      step: 1,
    },
    mode: "onSubmit",
  });

  const currentStep = form.watch("step");
  const currentStepName = STEPS_TO_STEP_NAMES[currentStep];
  const numOfSteps = Object.keys(STEPS_TO_STEP_NAMES).length;
  const isLastStep = currentStep === numOfSteps;

  const renderCurrentStep = () => {
    switch (currentStepName) {
      case "step_1":
        return <TableFormStep1 />;
      case "step_2":
        return <TableFormStep2 />;
      case "step_3":
        return <TableFormStep3 />;
      case "step_4":
        return <TableFormStep4 />;
      default:
        return null;
    }
  };

  const renderFormSteps = () => {
    return Array.from({ length: numOfSteps }, (_, index) => {
      return (
        <div
          key={index}
          className={cn(
            "rounded-full flex-1 h-[12px]",
            currentStep === index + 1 ? "bg-[#7114E2]" : "bg-[#D9D9D9]",
          )}
        />
      );
    });
  };

  const prevStep = () => {
    form.setValue("step", Math.max(1, currentStep - 1));
  };

  const nextStep = async () => {
    const fields = STEP_FIELDS[currentStepName] ?? [];
    const ok = await form.trigger(fields, { shouldFocus: true });
    if (!ok) return;

    if (isLastStep) {
      await form.handleSubmit(handleSubmit)();
    } else {
      form.setValue("step", currentStep + 1);
    }
  };

  const handleSubmit = async (data: TableFormData) => {
    setIsLoading(true);
    try {
      if (initialForm?.id) {
        await updateTable(initialForm.id, data);
      } else {
        await createTable(data);
      }

      toast({
        title: "Success",
        description: `Table was ${initialForm?.id ? "updated" : "created"} successfully!`,
      });

      handleClose();

      await refreshTables();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="overflow-hidden"
      >
        {renderCurrentStep()}

        <div className="my-[30px] flex items-center gap-3">
          {renderFormSteps()}
        </div>

        <div className="flex items-center justify-between">
          <Button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1 || isLoading}
            className="bg-[#E3E2E4] hover:bg-[#E3E2E4] font-medium text-sm text-[#706D78] rounded-[12px]"
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={nextStep}
            disabled={isLoading}
            className="bg-[#26045D] hover:bg-[#26045D] font-medium text-sm text-white rounded-[12px]"
          >
            {isLoading && <LoaderCircle className="w-4 h-4 animate-spin" />}
            {isLastStep
              ? initialForm?.id
                ? "Update Table"
                : "Create Table"
              : "Next"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
