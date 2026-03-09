"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/solid";
import { ArrowDown, ArrowUp } from "lucide-react";
import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/context/user-context";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

interface HighestGrowthDevelopment {
  development_id: number;
  development_name: string;
  growth_amount: number;
  growth_pct: number;
  latest_valuation_total: number;
  total_purchase_price: number;
  unit_count: number;
}

export default function DevelopmentsAnalytics() {
  const { user } = useUser();

  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
  const [staircasingPotential, setStaircasingPotential] = useState(0);
  const [changeSincePurchase, setChangeSincePurchase] = useState(0);
  const [highestGrowthDevelopments, setHighestGrowthDevelopments] = useState<
    HighestGrowthDevelopment[]
  >([]);

  const renderChange = (change: number) => (
    <div className="flex gap-2 items-center justify-center">
      <div
        className={`py-[2px] px-2 text-xs max-w-fit rounded-full flex gap-1 ${
          change >= 0
            ? "bg-[#ECFDF3] text-[#027A48]"
            : "bg-[#FEF3F2] text-[#B42318]"
        }`}
      >
        {change >= 0 ? (
          <ArrowUpIcon className="w-3 h-3" />
        ) : (
          <ArrowDownIcon className="w-3 h-3" />
        )}
        {change?.toLocaleString("en-GB", {
          maximumFractionDigits: 2,
        })}
        %
      </div>
    </div>
  );

  const getTotalPortfolioValue = useCallback(async () => {
    const { data: portfolioValue, error: portfolioValueError } =
      await supabase.rpc(`platform_units_total_portfolio_value`, {
        company_id: user?.companyID,
      });

    if (portfolioValueError) throw new Error(portfolioValueError.message);

    setTotalPortfolioValue(portfolioValue);
  }, [supabase, user?.companyID]);

  const getPlatformUnitsChangeSincePurchase = useCallback(async () => {
    const { data, error } = await supabase.rpc(
      `platform_units_change_since_purchase`,
      {
        company_id: user?.companyID,
      },
    );

    if (error) throw new Error(error.message);

    setChangeSincePurchase(data?.[0]?.change_since_purchase);
  }, [supabase, user?.companyID]);

  const getStaircasingPotential = useCallback(async () => {
    const { data: portfolioValue, error: portfolioValueError } =
      await supabase.rpc(`get_staircasing_potential`, {
        company_id: user?.companyID,
      });

    if (portfolioValueError) throw new Error(portfolioValueError.message);

    setStaircasingPotential(portfolioValue?.[0]?.staircasing_potential);
  }, [supabase, user?.companyID]);

  const getHighestGrowthDevelopments = useCallback(async () => {
    const { data, error } = await supabase.rpc(`highest_growth_developments`, {
      company_id: user?.companyID,
      limit_count: 3,
    });

    if (error) throw new Error(error.message);

    setHighestGrowthDevelopments(data);
  }, [supabase, user?.companyID]);

  const initializeData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        getTotalPortfolioValue(),
        getPlatformUnitsChangeSincePurchase(),
        getStaircasingPotential(),
        getHighestGrowthDevelopments(),
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [
    getTotalPortfolioValue,
    getPlatformUnitsChangeSincePurchase,
    getStaircasingPotential,
    getHighestGrowthDevelopments,
  ]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="rounded-[12px] border border-[#EEEEEE] min-h-[132px]">
        <CardContent className="pt-6 h-full flex flex-col gap-2 items-center justify-center">
          {loading ? (
            <Skeleton className="w-[100px]" />
          ) : (
            <>
              <h3 className="font-medium text-[#4E1A8F] text-3xl">
                £{" "}
                {(totalPortfolioValue || 0).toLocaleString("en-GB", {
                  maximumFractionDigits: 2,
                })}
              </h3>
              <div className="flex items-center gap-1">
                <div
                  className={cn(
                    "flex items-center min-w-[48px] rounded-[16px] p-1",
                    changeSincePurchase < 0 ? "bg-[#FEF3F2]" : "bg-[#E8FAF0]",
                  )}
                >
                  {changeSincePurchase < 0 ? (
                    <ArrowDown size={12} color="#F04438" />
                  ) : (
                    <ArrowUp size={12} color="#14A44D" />
                  )}
                  <p
                    className={cn(
                      "text-[12px] font-medium",
                      changeSincePurchase < 0
                        ? "text-[#B42318]"
                        : "text-[#15803d]",
                    )}
                  >
                    {Math.abs(changeSincePurchase)}%
                  </p>
                </div>
                <p className="text-[#87858E] text-[12px]">since purchase</p>
              </div>
              <p className="text-[14px] text-[#26045D]">
                Total Portfolio Value
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-[12px] border border-[#EEEEEE] min-h-[132px]">
        <CardContent className="pt-6 h-full flex flex-col gap-2 items-center justify-center">
          {loading ? (
            <Skeleton className="w-[100px]" />
          ) : (
            <>
              <h3 className="font-medium text-[#4E1A8F] text-3xl">
                £{" "}
                {(staircasingPotential || 0).toLocaleString("en-GB", {
                  maximumFractionDigits: 2,
                })}
              </h3>
              <p className="text-[14px] text-[#26045D]">
                Staircasing Potential
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-[12px] border border-[#EEEEEE] min-h-[132px]">
        <CardContent className="pt-6 h-full flex flex-col items-center justify-center">
          {loading ? (
            <Skeleton className="w-[100px]" />
          ) : (
            <div className="flex items-center gap-1">
              <h3 className="text-[14px] text-[#26045D]">
                Highest growth developments
              </h3>
              <div className="flex flex-col flex-1 gap-2">
                {highestGrowthDevelopments.map((development, index) => (
                  <div
                    key={development.development_id}
                    className="flex items-center gap-2"
                  >
                    <Image
                      src={`/images/medal-${index + 1}.png`}
                      width={20}
                      height={20}
                      alt="medal"
                    />
                    <p className="text-[14px]">
                      {development.development_name}
                    </p>
                    {renderChange(development.growth_pct)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
