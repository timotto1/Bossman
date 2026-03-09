"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useSessionTimer } from "./session-timer-provider";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";

export const SessionTimeoutModal = () => {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const { remainingSeconds, resetTimer } = useSessionTimer();
  const [show, setShow] = useState(false);

  const handleSignout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message,
      });

      return;
    }

    toast({
      title: "Success",
      description: "Logout Successful!",
    });

    router.push("/login");
  };

  useEffect(() => {
    if (remainingSeconds <= 60) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [remainingSeconds]);

  if (!show) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div className="fixed inset-0 bg-[rgba(255,255,255,0.7)] z-10 flex items-center justify-center">
      <div className="bg-white border border-gray-200 shadow-xl rounded-xl p-6 max-w-screen-sm">
        <div className="relative flex items-center justify-center py-4">
          <X
            className="absolute top-0 right-0 cursor-pointer"
            onClick={resetTimer}
          />
          <Image
            src="/images/time-gradient.webp"
            alt="Stairpay Logo"
            width={180}
            height={180}
          />
        </div>
        <h3 className="text-center text-2xl font-semibold mb-2 text-gray-900">
          You're about to be logged out
        </h3>
        <p className="text-center text-sm text-gray-700 mb-4">
          It looks like you're not active right now. To keep your account
          secure, we'll automatically log you out when the timer runs out.
        </p>
        <h4 className="text-center text-xl font-bold text-gray-700 mb-4">
          {minutes}:{seconds.toString().padStart(2, "0")}
        </h4>
        <Button
          onClick={resetTimer}
          className="w-full bg-[#26045D] hover:bg-[#26045D] text-white py-2 rounded-full font-medium transition"
        >
          Stay Logged In
        </Button>
        <Button
          onClick={handleSignout}
          className="w-full bg-transparent hover:bg-transparent text-gray-900 py-2 rounded-full font-medium transition underline"
        >
          Log out now
        </Button>
      </div>
    </div>
  );
};
