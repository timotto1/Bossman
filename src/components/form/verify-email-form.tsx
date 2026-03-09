"use client";

import { PaperAirplaneIcon } from "@heroicons/react/20/solid"; // Importing the PaperAirplaneIcon

import { Button } from "@/components/ui/button";

export function VerifyEmail() {
  const handleSendAgain = () => {
    console.log("Send again clicked");
    // Handle sending the email verification again
  };

  return (
    <div className="bg-transparent mb-20 flex flex-col items-center pt-10 px-4">
      <div className="flex flex-col items-center gap-4 w-full max-w-md p-8 bg-transparent">
        <h1 className="text-2xl font-bold text-center text-[#26045D]">
          Nearly there! Verify your email
        </h1>

        <p className="text-md text-start text-gray-600">
          We have sent you an email to make sure that you are using a valid
          email address.
        </p>
        <p className="text-md text-start text-gray-600">
          Click on the link we sent you to verify your email address.
        </p>

        <p className="text-md text-start text-black font-bold text-[#26045D] mt-4">
          Haven’t received an email?{" "}
          <span className="font-normal">
            Check your spam, or request a new one.
          </span>
        </p>

        {/* Send Again Button with Larger Icon */}
        <Button
          onClick={handleSendAgain}
          className="w-8/12 flex items-center justify-center gap-2 text-lg font-semibold bg-gradient-to-r from-[#7747FF] to-[#9847FF] text-white py-3 rounded-full shadow-md hover:bg-gradient-to-r hover:from-[#26045D] hover:to-[#7747FF] focus:outline-none"
        >
          <PaperAirplaneIcon
            className="text-white"
            style={{ width: "25px", height: "25px" }}
          />
          Send again
        </Button>

        <p className="w-full text-md text-start text-black mt-4 font-bold">
          Having trouble?{" "}
          <a
            href="/contact-support"
            className="underline font-medium text-[#7747FF]"
          >
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
