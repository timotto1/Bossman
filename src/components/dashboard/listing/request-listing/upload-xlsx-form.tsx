"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { z } from "zod";

import { XLSXUploader } from "./xlsx-uploader";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { validateHeaders } from "@/utils";

const xlsxUploadSchema = z.object({
  file: z
    .instanceof(File, { message: "Please upload a file." })
    .refine((file) => file.name.endsWith(".csv"), {
      message: "File must be an .csv Excel file",
    })
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "File must be less than 10MB",
    }),
});

type XLSXUploadValues = z.infer<typeof xlsxUploadSchema>;

type Props = {
  expectedHeaders: string[];
  onValidUpload: (file: File) => Promise<void>;
  isLoading: boolean;
};

export default function UploadXLSXForm({
  expectedHeaders,
  onValidUpload,
}: Props) {
  const form = useForm<XLSXUploadValues>({
    resolver: zodResolver(xlsxUploadSchema),
    defaultValues: { file: undefined },
  });

  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data: XLSXUploadValues) => {
    if (!data.file) return;
    setSubmitting(true);
    try {
      const buffer = await data.file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json<string[]>(worksheet, {
        header: 1,
        defval: "",
      });

      const [rawHeaders, ...dataRows] = rawRows;
      const { valid, missing } = validateHeaders(rawHeaders, expectedHeaders);

      if (!valid) {
        form.setError("file", {
          message: `Invalid template. Missing headers: ${missing.join(", ")}`,
        });
        return;
      }

      if (dataRows.length === 0) {
        form.setError("file", {
          message: "The sheet has no data rows. At least one row is required.",
        });
        return;
      }

      const headerIndexes = expectedHeaders.map((header) =>
        rawHeaders.indexOf(header),
      );

      const invalidRowDetails = dataRows
        .map((row, i) => ({
          rowNumber: i + 2,
          isValid: headerIndexes.every((index) => {
            const value = row[index];
            return value !== "" && value !== null && value !== undefined;
          }),
        }))
        .filter((r) => !r.isValid);

      if (invalidRowDetails.length) {
        form.setError("file", {
          message: `Missing values in ${invalidRowDetails.length} rows.\nAffected rows: ${invalidRowDetails
            .map((r) => r.rowNumber)
            .join(", ")}`,
        });
        return;
      }

      await onValidUpload(data.file);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <XLSXUploader
                    value={field.value}
                    onChange={(file) =>
                      form.setValue(field.name, file!, { shouldValidate: true })
                    }
                  />
                </FormControl>
                <FormMessage className="max-w-md mx-auto" />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-center w-full">
            <Button
              disabled={submitting}
              type="submit"
              className="rounded-full px-6 py-2 bg-[#26045D] hover:bg-[#26045D] text-sm font-bold"
            >
              {submitting && (
                <LoaderCircle className="w-4 h-4 animate-spin mr-2" />
              )}
              {submitting ? "Uploading..." : "Submit"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
