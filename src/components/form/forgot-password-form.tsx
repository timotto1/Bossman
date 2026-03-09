"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { fetchBaseClient } from "@/lib/fetch-base-client";

export const forgotPassword = async (email: string) => {
  const response = await fetchBaseClient("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
    headers: {
      "Content-type": "application/json",
    },
  });

  return response;
};

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const { toast } = useToast();

  const {
    mutateAsync: handleForgotPassword,
    isPending: forgotPasswordLoading,
  } = useMutation({
    mutationFn: (data: ForgotPasswordSchema) => forgotPassword(data.email),
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Success",
        description:
          "A password reset link has been sent to your email address. Please check your inbox.",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordSchema) => handleForgotPassword(data);

  return (
    <div className="bg-transparent mb-10 flex flex-col items-center pt-10 px-4 sm:px-6 md:px-8 overflow-y-auto">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col items-center justify-center gap-6 w-full sm:w-10/12 md:w-full lg:w-full pt-10 bg-transparent"
        >
          <span className="w-full text-2xl font-semibold text-[#26045D] text-center mb-10">
            Forgot your password? No worries!
          </span>

          {/* Email Input */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-10/12 sm:w-8/12 lg:w-6/12">
                <FormLabel className="text-md font-medium text-[#26045D]">
                  Email address
                </FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    {...field}
                    className="w-full p-3 border border-[#26045D] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Reset Password Button */}
          <Button
            type="submit"
            disabled={forgotPasswordLoading}
            className="w-8/12 sm:w-8/12 md:w-6/12 lg:w-5/12 text-md font-semibold mb-10 bg-gradient-to-r from-[#7747FF] to-[#9847FF] text-white py-3 rounded-full shadow-md hover:bg-gradient-to-r hover:from-[#26045D] hover:to-[#7747FF] focus:outline-none"
          >
            {forgotPasswordLoading ? (
              <LoaderCircle className="mr-2 size-4 animate-spin" />
            ) : null}
            Reset password
          </Button>
        </form>
      </Form>

      <p className="w-10/12 sm:w-10/12 md:w-10/12 lg:w-6/12 text-sm text-gray-600 text-start px-4 mt-4">
        If your email exists in our system you will receive an email from us
        shortly. (Make sure to check your spam folder)
      </p>

      <Separator className="w-6/12 sm:w-10/12 md:w-10/12 lg:w-6/12 bg-[#26045D] rounded-full h-[0.1rem] mt-8" />

      <div className="pt-10 text-center">
        <span className="text-lg font-bold text-[#26045D]">
          Not signed up yet? Try{" "}
          <a
            className="underline text-[#26045D]"
            target="_blank"
            rel="noreferrer"
            href="https://meetings-eu1.hubspot.com/meetings/floris-ten-nijenhuis/provider-partnership-request"
          >
            here
          </a>
        </span>
      </div>
    </div>
  );
}
