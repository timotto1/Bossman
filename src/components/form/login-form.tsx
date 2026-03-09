"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { createClient } from "@/utils/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginSchema = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginSchema) => {
    // Handle form submission here
    try {
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      router.refresh();
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
    <div className="bg-transparent mb-10 flex flex-col items-center px-4 gap-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col items-center justify-center gap-8 w-full max-w-md p-8 bg-transparent"
        >
          <span className="text-2xl font-semibold text-[#26045D]">
            Welcome back!
          </span>

          {/* Email Input */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
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

          {/* Password Input */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-md font-medium text-[#26045D]">
                  Password
                </FormLabel>
                <FormControl>
                  <Input
                    id="password"
                    type="password"
                    {...field}
                    className="w-full p-3 border border-[#26045D] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Login Button */}
          <div className="mt-6 w-full flex flex-col items-center gap-4">
            <Button
              disabled={isLoading}
              type="submit"
              className="w-8/12 text-lg font-semibold bg-gradient-to-r from-[#7747FF] to-[#9847FF] text-white p-3 rounded-full shadow-md hover:bg-gradient-to-r hover:from-[#26045D] hover:to-[#7747FF] focus:outline-none"
            >
              {isLoading ? (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              ) : null}
              Login
            </Button>
            <p className="text-sm text-center text-gray-600">
              Forgot your password? click{" "}
              <Link
                href="/forgot-password"
                className="underline text-purple-600"
              >
                here
              </Link>
            </p>
          </div>
        </form>
      </Form>

      <Separator className="w-6/12 bg-[#26045D] rounded-full h-[0.1rem]" />

      <div className="pt-8">
        <span className="text-xl font-bold text-[#26045D]">
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
