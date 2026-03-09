"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ChangePasswordForm,
  ChangePasswordFormSchema,
} from "../form/change-password-form";
import { Loader } from "../loader";
import { useToast } from "@/hooks/use-toast";
import { fetchBaseClient } from "@/lib/fetch-base-client";

export const verifyToken = async (token: string) => {
  const response = await fetchBaseClient(
    `/api/auth/verification?token=${token}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response;
};

export const resetPassword = async (
  token: string,
  data: ChangePasswordFormSchema,
) => {
  const response = await fetchBaseClient(
    `/api/auth/reset-password?token=${token}`,
    {
      method: "POST",
      body: JSON.stringify({
        password: data.password,
        confirmPassword: data.confirmPassword,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response;
};

interface ResetPasswordPageViewProps {
  token: string;
}

export function ResetPasswordPageView({ token }: ResetPasswordPageViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [countdown, setCountdown] = useState(3);

  const { isFetching, isError, error } = useQuery({
    queryKey: ["verifyToken", token],
    queryFn: () => verifyToken(token),
    refetchOnWindowFocus: false,
    enabled: !!token,
  });

  const {
    mutateAsync: handleResetPassword,
    isPending: resetPasswordLoading,
    isSuccess: isResetPasswordSuccess,
  } = useMutation({
    mutationFn: (data: ChangePasswordFormSchema) => resetPassword(token, data),
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Success",
        description: "Password has been changed successfully!",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message,
      });
    },
  });

  useEffect(() => {
    if (isResetPasswordSuccess) {
      if (countdown > 0) {
        const timer = setInterval(() => {
          setCountdown((prev) => prev - 1);
        }, 1000);

        // Clear the interval when countdown reaches 0
        return () => clearInterval(timer);
      } else {
        // Redirect to login page after countdown ends
        router.push("/login");
      }
    }
  }, [isResetPasswordSuccess, countdown, router]);

  if (isResetPasswordSuccess) {
    return (
      <div className="bg-transparent mb-20 flex flex-col items-center pt-10 px-4">
        <div className="flex flex-col items-center gap-4 w-full max-w-md p-8 bg-transparent">
          <h1 className="text-2xl font-bold text-center text-[#26045D]">
            Success! Your password has been reset.
          </h1>
          <p className="text-md text-center text-gray-600">
            We are reverting you back to the login page in {countdown} second
            {countdown > 1 ? "s" : ""}
          </p>
          <p className="text-md text-center text-gray-500 mt-4">
            If you are not redirected, click{" "}
            <Link href="/login" className="text-blue-500">
              here
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  if (isFetching)
    return (
      <div className="bg-transparent mb-20 flex flex-col items-center pt-10 px-4">
        <Loader />
      </div>
    );

  if (isError || error) {
    return (
      <div className="bg-transparent mb-20 flex flex-col items-center pt-10 px-4">
        <div className="flex flex-col items-center gap-4 w-full max-w-md p-8 bg-transparent">
          <h1 className="text-2xl font-bold text-center text-[#d32f2f]">
            Oops! We encountered an error!
          </h1>

          <p className="text-md text-start text-gray-600">
            Token is invalid, expired, or already used.
          </p>

          <Link
            href="/login"
            className="w-8/12 flex items-center justify-center gap-2 text-md font-semibold bg-gradient-to-r from-[#7747FF] to-[#9847FF] text-white py-3 rounded-full shadow-md hover:bg-gradient-to-r hover:from-[#26045D] hover:to-[#7747FF] focus:outline-none"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ChangePasswordForm
      isLoading={resetPasswordLoading}
      handleSubmit={handleResetPassword}
    />
  );
}
