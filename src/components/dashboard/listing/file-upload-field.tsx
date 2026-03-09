"use client"; // if using App Router

import {
  Control,
  ControllerRenderProps,
  FieldValues,
  useFormContext,
} from "react-hook-form";
import { CircleCheck } from "lucide-react";
import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export const FILE_TYPE_MIME_MAP: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "image/png": "png",
  "image/jpeg": "jpg",
};

type FileUploadFieldProps = {
  /*eslint-disable @typescript-eslint/no-explicit-any*/
  control: Control<FieldValues, any>;
  name: string;
  label: string;
  accept?: string;
  maxSizeMB?: number; // optional override (default to 5MB)
  simple?: boolean;
  placeholder?: string;
};

export default function FileUploadField({
  control,
  name,
  label,
  accept,
  maxSizeMB = 5,
  simple = false,
  placeholder = "Select file to upload",
}: FileUploadFieldProps) {
  const { setError, clearErrors } = useFormContext();

  if (simple) {
    return (
      <FormField
        control={control}
        name={name}
        /*eslint-disable @typescript-eslint/no-explicit-any*/
        render={({ field }: { field: ControllerRenderProps<any, string> }) => (
          <FormItem>
            <FormLabel className="text-sm md:text-base font-semibold text-powderpurple-600">
              {label}
            </FormLabel>
            <div className="relative">
              <Input
                type="text"
                className="text-base pointer-events-none"
                value={field.value?.[0]?.name || placeholder}
                readOnly
              />
              <FormControl>
                <Input
                  type="file"
                  className="absolute inset-0 opacity-0 h-full w-full cursor-pointer"
                  accept={accept}
                  onChange={(e) => {
                    const files = e.target.files;
                    const file = files?.[0];
                    const acceptedTypes =
                      accept?.split(",").map((type) => type.trim()) || [];

                    if (file && file.size > maxSizeMB * 1024 * 1024) {
                      setError(name, {
                        type: "manual",
                        message: `File must be smaller than ${maxSizeMB}MB`,
                      });
                      return;
                    }

                    if (
                      file &&
                      acceptedTypes.length &&
                      !acceptedTypes.includes(
                        `.${FILE_TYPE_MIME_MAP[file.type]}`,
                      )
                    ) {
                      setError(name, {
                        type: "manual",
                        message: `File must be of type: ${acceptedTypes
                          .map((t) => t?.split("/")[1].toUpperCase())
                          .join(", ")}`,
                      });
                      return;
                    }

                    clearErrors(name);
                    field.onChange(files);
                  }}
                  ref={field.ref}
                />
              </FormControl>
              {field.value?.[0]?.name && (
                <CircleCheck className="text-green-700 absolute right-1 top-[calc(50%_-_12px)]" />
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  return (
    <FormField
      control={control}
      name={name}
      /*eslint-disable @typescript-eslint/no-explicit-any*/
      render={({ field }: { field: ControllerRenderProps<any, string> }) => (
        <FormItem>
          <FormLabel className="text-sm md:text-base font-semibold text-powderpurple-600">
            {label}
          </FormLabel>
          <Card>
            <CardContent className="flex gap-4 p-4 relative">
              <Image
                className="flex-shrink-0"
                src="/images/upload-cloud-purple.png"
                alt="Upload"
                width={73}
                height={73}
              />
              <div className="overflow-hidden w-full min-w-0">
                <h4 className="text-sm md:text-base font-bold text-powderpurple-600 truncate max-w-full">
                  {field.value?.[0]?.name || "Select file to upload"}
                </h4>
                <p className="text-xs md:text-sm text-powderpurple-600">
                  Max size {maxSizeMB}MB
                </p>
                <p className="text-xs md:text-sm text-powderpurple-600">
                  Formats:{" "}
                  {accept
                    ?.split(",")
                    .map((type) => type.replace(".", "").toUpperCase())
                    .join(", ") || "Any"}
                </p>
              </div>
              {field.value?.[0]?.name && (
                <CircleCheck className="text-green-700 absolute right-1 bottom-1" />
              )}
              <FormControl>
                <Input
                  type="file"
                  className="absolute inset-0 opacity-0 h-full w-full cursor-pointer"
                  accept={accept}
                  onChange={(e) => {
                    const files = e.target.files;
                    const file = files?.[0];
                    const acceptedTypes =
                      accept?.split(",").map((type) => type.trim()) || [];

                    if (file && file.size > maxSizeMB * 1024 * 1024) {
                      setError(name, {
                        type: "manual",
                        message: `File must be smaller than ${maxSizeMB}MB`,
                      });
                      return;
                    }

                    if (
                      file &&
                      acceptedTypes.length &&
                      !acceptedTypes.includes(
                        `.${FILE_TYPE_MIME_MAP[file.type]}`,
                      )
                    ) {
                      setError(name, {
                        type: "manual",
                        message: `File must be of type: ${acceptedTypes
                          .map((t) => t?.split("/")[1].toUpperCase())
                          .join(", ")}`,
                      });
                      return;
                    }

                    clearErrors(name);
                    field.onChange(files);
                  }}
                  ref={field.ref}
                />
              </FormControl>
            </CardContent>
          </Card>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
