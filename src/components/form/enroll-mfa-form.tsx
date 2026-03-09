"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";

const formSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

type FormSchema = z.infer<typeof formSchema>;

export function EnrollMFAForm() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [factorId, setFactorId] = useState("");
  const [qr, setQR] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pin: "",
    },
  });

  const enrollMFA = useCallback(async () => {
    const factors = await supabase.auth.mfa.listFactors();
    const totp = factors.data?.all[0];

    // //cleanup call so we dont spam factors
    if (totp?.id) {
      await supabase.auth.mfa.unenroll({
        factorId: totp?.id,
      });
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      issuer: "Stairpay",
    });

    if (error) throw error;

    setFactorId(data.id);
    setQR(data.totp.qr_code);

    /*eslint-disable react-hooks/exhaustive-deps*/
  }, []);

  const onSubmit = async (data: FormSchema) => {
    try {
      setIsLoading(true);

      const challenge = await supabase.auth.mfa.challenge({ factorId });

      if (challenge.error) throw challenge.error;

      const challengeId = challenge.data.id;

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: data.pin,
      });

      if (verify.error) throw verify.error;

      await supabase.auth.refreshSession();

      toast({
        title: "Success",
        description: "Login Success!",
      });

      router.push("/dashboard");
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

  useEffect(() => {
    enrollMFA();
  }, [enrollMFA]);

  return (
    <div className="space-y-4 flex flex-col items-center">
      <div className="relative mx-auto w-[200px] h-[200px]">
        {qr && <Image src={qr} alt="qr-code" layout="fill" />}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="pin"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    {...field}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot className="bg-white" index={0} />
                      <InputOTPSlot className="bg-white" index={1} />
                      <InputOTPSlot className="bg-white" index={2} />
                      <InputOTPSlot className="bg-white" index={3} />
                      <InputOTPSlot className="bg-white" index={4} />
                      <InputOTPSlot className="bg-white" index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            disabled={isLoading}
            type="submit"
            className="w-full text-lg font-semibold bg-gradient-to-r from-[#7747FF] to-[#9847FF] text-white p-3 rounded-full shadow-md hover:bg-gradient-to-r hover:from-[#26045D] hover:to-[#7747FF] focus:outline-none"
          >
            {isLoading ? (
              <LoaderCircle className="mr-2 size-4 animate-spin" />
            ) : null}
            Enroll
          </Button>
        </form>
      </Form>
    </div>
  );
}
