import { AlertTriangle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <Card className="max-w-md w-full shadow-xl rounded-2xl">
      <CardContent className="p-6 text-center space-y-4">
        <div className="flex justify-center">
          <AlertTriangle className="text-yellow-500" size={48} />
        </div>
        <h1 className="text-xl font-semibold text-[#26045D]">
          Hmm… Something’s missing
        </h1>
        <p className="text-sm text-[#26045D]">
          It looks like we're missing some data to show you this page. Please
          reach out to{" "}
          <a
            href="mailto:hello@stairpay.com"
            className="text-[#7747FF] underline underline-offset-2"
          >
            hello@stairpay.com
          </a>{" "}
          if you have any questions.
        </p>
      </CardContent>
    </Card>
  );
}
