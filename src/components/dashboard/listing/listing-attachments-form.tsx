import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { z } from "zod";

import FileUploadField, { FILE_TYPE_MIME_MAP } from "./file-upload-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { uploadingListingsToSupabase } from "@/utils/storage";
import { createClient } from "@/utils/supabase/client";

export const attachmentTypes = [
  {
    label: "Floor plan",
    value: "floor_plan",
  },
  {
    label: "Key information document",
    value: "kid",
  },
  {
    label: "Energy Certificate",
    value: "energy_cert",
  },
  {
    label: "Brochure",
    value: "brochure",
  },
  {
    label: "Price list",
    value: "price_list",
  },
];

const attachmentTypeValues = attachmentTypes.map((type) => type.value) as [
  "floor_plan",
  "kid",
  "energy_cert",
  "brochure",
  "price_list",
];

const attachmentsSchema = z.object({
  documentName: z.string().min(1, { message: "Document Name is required." }),
  documentType: z.enum(attachmentTypeValues, {
    required_error: "You need to select a document type",
  }),
  document: z
    .any()
    .refine((files) => files.length > 0, "Please select a file")
    .refine(
      (files) => files[0]?.size <= 5 * 1024 * 1024, // 5MB in bytes
      "File size must be less than 5MB",
    )
    .refine((files) => {
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        "application/msword", // .doc
        "image/png",
        "image/jpeg",
      ];
      return allowedTypes.includes(files[0]?.type);
    }, "Only PDF, DOC, DOCX, PNG, and JPG files are allowed"),
});

export default function ListingAttachmentsForm({
  closeModal,
  refreshAttachmentsTable,
  refreshListing,
  id,
  type,
}: {
  closeModal: () => void;
  refreshAttachmentsTable: () => void;
  refreshListing: () => Promise<void>;
  id: string;
  type: "developments" | "units";
}) {
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof attachmentsSchema>>({
    resolver: zodResolver(attachmentsSchema),
    defaultValues: {
      documentName: "",
    },
  });

  const getCurrentDateYYMMDD = () => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yy}_${mm}_${dd}`;
  };

  const handleSubmit = async (data: z.infer<typeof attachmentsSchema>) => {
    setIsLoading(true);
    try {
      const extension = FILE_TYPE_MIME_MAP[data?.document?.[0]?.type];
      const internalName = `${data.documentType}_${id}_${getCurrentDateYYMMDD()}_${data.documentName.toLowerCase().split(" ").join("_")}`;
      const supabasePath = `${type}/documents/${id}/${internalName}.${extension}`;

      await uploadingListingsToSupabase(supabasePath, data.document?.[0]);

      const supabase = await createClient();

      const { error } = await supabase
        .from(
          type === "developments"
            ? "development_listing_documents"
            : "unit_listing_documents",
        )
        .insert({
          document_name: data.documentName,
          document_type: data.documentType,
          document_size: data?.document?.[0].size,
          supabase_path: supabasePath,
          ...(type === "developments"
            ? {
                development_listing_id: id,
              }
            : {
                unit_listing_id: id,
              }),
        });

      if (error) throw new Error(error.message);

      closeModal();

      refreshAttachmentsTable();

      await refreshListing();

      toast({
        title: "Success",
        description: "File uploaded successfully!",
      });
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="documentType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="font-bold text-[#26045D]">
                Which type of document are you uploading?
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  {attachmentTypes.map((type, index) => (
                    <FormItem
                      key={index}
                      className="flex items-center space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value === type.value}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange(type.value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal text-[#26045D]">
                        {type.label}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="documentName"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="font-bold text-[#26045D]">
                What do you want to name this document?
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="Type here" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FileUploadField
          /*eslint-disable @typescript-eslint/no-explicit-any*/
          control={form.control as any}
          name="document"
          label=""
          accept=".pdf,.docx,.doc,.png,.jpg"
        />

        <Button
          disabled={isLoading}
          className="flex items-center gap-2 text-white px-6 text-sm rounded-full bg-gradient-to-r from-[#7747FF] to-[#9847FF] h-8 hover:from-[#5a2dbf] hover:to-[#6a2dbf]"
          type="submit"
        >
          {isLoading && <LoaderCircle className="w-4 h-4 animate-spin" />}
          {isLoading ? "Uploading..." : "Upload"}
        </Button>
      </form>
    </Form>
  );
}
