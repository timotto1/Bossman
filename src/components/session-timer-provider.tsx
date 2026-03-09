"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";

type SessionTimerContextType = {
  remainingSeconds: number;
  resetTimer: () => void;
};

const SessionTimerContext = createContext<SessionTimerContextType | undefined>(
  undefined,
);

const SESSION_TIMER_SECONDS = 1800; // 30 MINUTES

export const useSessionTimer = () => {
  const context = useContext(SessionTimerContext);
  if (!context) {
    throw new Error(
      "useSessionTimer must be used within a SessionTimerProvider",
    );
  }
  return context;
};

export const SessionTimerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [remainingSeconds, setRemainingSeconds] = useState(
    SESSION_TIMER_SECONDS,
  ); // 30 minutes
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => setRemainingSeconds(SESSION_TIMER_SECONDS);

  const handleSignout = useCallback(async () => {
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
  }, [router, toast, supabase]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, []);

  useEffect(() => {
    if (remainingSeconds <= 0) {
      clearInterval(intervalRef.current!);
      handleSignout();
    }
  }, [remainingSeconds, handleSignout]);

  return (
    <SessionTimerContext.Provider value={{ remainingSeconds, resetTimer }}>
      {children}
    </SessionTimerContext.Provider>
  );
};
