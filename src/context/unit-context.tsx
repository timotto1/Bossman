"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useParams } from "next/navigation";

import { createClient } from "@/utils/supabase/client";

type PlatformUnit = {
  address: string;
  development_name: string;
  lease_type: string;
  percentage_sold: number;
  purchase_date: string;
  purchase_price: number;
  region: string;
  resident: string;
  status: string;
  unit_type: string;
  user_id: number;
  valuation_amount: number;
};

type PlatformUnitValuation = {
  month: string;
  total_valuation: number;
  year: number;
};

type UnitContextType = {
  data: PlatformUnit | null;
  valuations: PlatformUnitValuation[];
  isLoading: boolean;
  isHistoricalValuationsLoading: boolean;
  updateUnitValuation: () => Promise<void>;
  refreshUnit: () => Promise<void>;
  refreshUnitValuations: () => Promise<void>;
  //refreshUnitValuations: () => Promise<void>;
  //updateListing: (updates: Partial<PlatformUnit>) => Promise<void>;
};

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export const useUnit = () => {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error("useUnit must be used within a UnitProvider");
  }
  return context;
};

export function UnitProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const params = useParams();

  const [data, setData] = useState<PlatformUnit | null>(null);
  const [valuations, setValuations] = useState<PlatformUnitValuation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoricalValuationsLoading, setIsHistoricalValuationsLoading] =
    useState(true);

  const fetchUnit = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc(`platform_unit`, {
        unit: params.id,
      });

      if (error) throw new Error(error.message);

      setData(data?.[0]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, params.id]);

  const fetchUnitHistoricalValuation = useCallback(async () => {
    setIsHistoricalValuationsLoading(true);
    try {
      const { data: historicalHpi, error: historicalHpiError } =
        await supabase.rpc(`platform_unit_valuation`, {
          unit: params.id,
        });

      if (historicalHpiError) throw new Error(historicalHpiError.message);

      setValuations(historicalHpi);
    } catch (error) {
      console.error(error);
    } finally {
      setIsHistoricalValuationsLoading(false);
    }
  }, [supabase, params.id]);

  const updateUnitValuation = async () => {
    try {
      await fetch(`/api/internal/hpi/update-unit`, {
        method: "POST",
        body: JSON.stringify({
          unitID: params.id,
        }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUnit();
    fetchUnitHistoricalValuation();
  }, [fetchUnit, fetchUnitHistoricalValuation]);

  return (
    <UnitContext.Provider
      value={{
        data,
        valuations,
        isLoading,
        isHistoricalValuationsLoading,
        updateUnitValuation,
        refreshUnit: fetchUnit,
        refreshUnitValuations: fetchUnitHistoricalValuation,
      }}
    >
      {children}
    </UnitContext.Provider>
  );
}
