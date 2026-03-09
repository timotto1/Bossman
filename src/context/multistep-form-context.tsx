"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface MultistepContextType {
  step: number;
  nextStep: () => void;
  prevStep: () => void;
}

export const MultistepFormContext = createContext({} as MultistepContextType);

export function MultistepFormContextProvider({
  maxStep,
  children,
}: {
  maxStep: number;
  children: React.ReactNode;
}) {
  const [step, setStep] = useState(1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const nextStep = () => {
    if (step === maxStep) return;
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (step === 1) return;
    setStep((prev) => prev - 1);
  };

  return (
    <MultistepFormContext.Provider
      value={{
        step,
        nextStep,
        prevStep,
      }}
    >
      {children}
    </MultistepFormContext.Provider>
  );
}

export const useMultistepForm = () => useContext(MultistepFormContext);
