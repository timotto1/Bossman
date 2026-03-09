"use client";

import { ArrowRightEndOnRectangleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";

export function SignoutButton() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

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

  return (
    <div
      onClick={handleSignout}
      className="cursor-pointer rounded-sm flex gap-2 items-center py-2 px-4 text-[#87858E] hover:bg-[#F4F0FE] hover:text-[#AE78F1]"
    >
      <ArrowRightEndOnRectangleIcon className="h-6 w-6" />
      <h5 className="text-xs">Logout</h5>
      <span className="sr-only">Logout</span>
    </div>
  );
}
