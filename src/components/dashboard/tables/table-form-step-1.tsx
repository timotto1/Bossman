"use client";

import { useFormContext } from "react-hook-form";
import Image from "next/image";

import { TableFormData } from "./table-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function TableFormStep1() {
  const form = useFormContext<TableFormData>();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="col-span-1">
        <div className="lg:max-w-[220px] w-full space-y-6">
          <div>
            <p className="text-[#7114E2] text-sm">TRY ME!!</p>
            <div className="max-w-[220px] border border-[#AE78F1] rounded-full py-1 px-5 flex items-center gap-1 bg-[linear-gradient(271.86deg,rgba(174,120,241,0.1)_-0.01%,rgba(113,20,226,0.1)_101.98%)] text-[#7114E2] text-sm">
              <Image
                src="/icon/sparkles-mini.png"
                height={14}
                width={14}
                alt="sparkles"
                className="w-[16px] h-[16px]"
              />
              Build your table with AI
            </div>
          </div>
          <h3 className="text-xl font-medium text-[#26045D]">
            Give your table a concise name{" "}
          </h3>
          <p className="text-[#87858E] text-sm">
            Naming your table and providing a description will ensure you can
            quickly navigate through Stairpay in the future. Make sure your
            title is as short as possible.{" "}
          </p>
        </div>
      </div>
      <div className="col-span-2 space-y-3 ">
        <FormField
          control={form.control}
          name="step_1.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-[#26045D]">Name</FormLabel>
              <FormControl>
                <div className="px-1">
                  <Input
                    {...field}
                    className="rounded-[15px] py-2 px-4 border border-[#87858E]"
                    placeholder="My name is Jerry"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="step_1.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-[#26045D]">
                Description
              </FormLabel>
              <FormControl>
                <div className="px-1">
                  <Textarea
                    {...field}
                    className="max-h-[200px] h-full rounded-[15px] py-2 px-4 border border-[#87858E]"
                    placeholder="Description of your beautiful table"
                    rows={10}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
