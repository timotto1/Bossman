"use client";

import { useCallback, useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/context/user-context";
import { createClient } from "@/utils/supabase/client";

type TransactionHistory = {
  transaction_id: number;
  resident_id: number;
  changed_by_user_id: string;
  created_at: string;
  client_name: string;
  resident_name: string;
  address_1: string;
  address_2: string;
  address_3: string;
  postcode: string;
  new_value: string;
};

export function LatestActivityGrid() {
  const supabase = createClient();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState<
    TransactionHistory[]
  >([]);

  const getTransactionHistory = useCallback(async () => {
    if (!user?.companyID) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc(
        "get_client_transaction_history_with_address",
        { company_id: user.companyID },
      );

      if (error) throw new Error(error.message);

      setTransactionHistory((data as TransactionHistory[]) || []);
    } catch (err) {
      console.error("Error fetching transaction history:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    getTransactionHistory();
  }, [getTransactionHistory]);

  if (loading) {
    return <Skeleton className="h-[88px]" />;
  }

  if (!transactionHistory.length) return null;

  return (
    <Card className="rounded-lg border-[#EEEEEE] bg-[linear-gradient(92.1deg,rgba(174,120,241,0.09)_0%,rgba(104,152,244,0.09)_105.32%)]">
      <CardContent className="px-4 py-2 text-[#26045D] relative">
        <Carousel
          opts={{
            align: "start",
          }}
          orientation="vertical"
          className="w-full"
        >
          <CarouselContent className="-mt-1 mb-2 h-[68px]">
            {transactionHistory.map((tx) => {
              const date = new Date(tx.created_at);
              const formattedDate = date.toLocaleString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              });

              return (
                <CarouselItem key={tx.transaction_id} className=" space-y-1">
                  <h6 className="text-xs">{formattedDate}</h6>
                  <div className="flex gap-2 font-medium items-center text-sm flex-wrap">
                    <div className="bg-[#89F5C8] py-1 px-3 text-[#215942] rounded-full">
                      {tx.client_name || "N/A"}
                    </div>
                    <div>updated</div>
                    <div className="border-2 border-[#87858E] py-1 px-3 text-[#4A4851] rounded-full">
                      {`
                        ${tx?.resident_name ? tx?.resident_name + ", " : ""}
                        ${tx?.address_1 ? tx?.address_1 + " " : ""}
                        ${tx?.address_2 ? tx?.address_2 + " " : ""}
                        ${tx?.address_3 ? tx?.address_3 + " " : ""}
                        ${tx?.postcode ? tx?.postcode : ""}
                      `}
                    </div>
                    <div>to</div>
                    <div className="bg-[#E5DAFB] py-1 px-3 text-[#7114E2] rounded-full">
                      {tx.new_value || "N/A"}
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="left-[unset] top-0 right-0 translate-x-[0%]" />
          <CarouselNext className="left-[unset] bottom-0 right-0 translate-x-[0%]" />
        </Carousel>
      </CardContent>
    </Card>
  );
}
