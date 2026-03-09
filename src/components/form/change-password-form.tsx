"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface ChangePasswordFormProps {
  isLoading: boolean;
  handleSubmit: (data: ChangePasswordFormSchema) => void;
}

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must include at least one uppercase letter")
      .regex(/[a-z]/, "Password must include at least one lowercase letter")
      .regex(/[0-9]/, "Password must include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormSchema = z.infer<typeof passwordSchema>;

export function ChangePasswordForm({
  isLoading,
  handleSubmit,
}: ChangePasswordFormProps) {
  const form = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <div className="bg-transparent mb-20 flex flex-col items-center pt-10 px-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col items-center justify-center gap-6 w-full max-w-md p-8 bg-transparent"
        >
          <span className="text-2xl font-bold text-[#26045D] text-center mb-10">
            Choose your password
          </span>

          {/* Enter Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-md font-medium text-[#26045D]">
                  Enter password
                </FormLabel>
                <FormControl>
                  <Input
                    id="password"
                    type="password"
                    {...field}
                    className="w-full p-3 border border-[#26045D] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-md font-medium text-[#26045D]">
                  Confirm password
                </FormLabel>
                <FormControl>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...field}
                    className="w-full p-3 border border-[#26045D] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Set Password Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-8/12 text-lg font-semibold bg-gradient-to-r from-[#7747FF] to-[#9847FF] text-white py-3 rounded-full shadow-md hover:bg-gradient-to-r hover:from-[#26045D] hover:to-[#7747FF] focus:outline-none"
          >
            {isLoading ? (
              <LoaderCircle className="mr-2 size-4 animate-spin" />
            ) : null}
            Set password
          </Button>
        </form>
      </Form>
    </div>
  );
}
