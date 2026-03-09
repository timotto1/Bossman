"use client";

import { useCallback, useEffect, useState } from "react";

import { DataTable } from "@/components/table/data-table";
import { developmentColumns } from "@/components/table/developments/columns";
import { DevelopmentSchema } from "@/components/table/developments/schema";
import { useUser } from "@/context/user-context";
import { createClient } from "@/utils/supabase/client";

export function DevelopmentsTable() {
  const supabase = createClient();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  const [developmentsData, setDevelopmentsData] = useState<DevelopmentSchema[]>(
    [],
  );

  const getDevelopments = useCallback(async () => {
    try {
      const { data: developmentsData, error: developmentsDataError } =
        await supabase.rpc(`platform_developments`, {
          company_id: user?.companyID,
        });

      if (developmentsDataError) throw new Error(developmentsDataError.message);

      setDevelopmentsData(
        developmentsData.map((development: DevelopmentSchema) => ({
          ...development,
          occupancy_rate:
            Math.round(development.units_occupied / development.total_units) *
              100 || 0,
        })),
      );
    } catch (err) {
      console.error((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user?.companyID]);

  useEffect(() => {
    getDevelopments();
  }, [getDevelopments]);

  return (
    <div className="shadow-[0px_2px_10px_0px_#0000001A] rounded-[12px] overflow-x-hidden overflow-y-auto p-2">
      <DataTable<DevelopmentSchema, unknown>
        isLoading={isLoading}
        showTotal={false}
        showExport={true}
        showSearchFilter={true}
        columns={developmentColumns}
        data={developmentsData}
        searchPlaceholder={`Search for specific development`}
        title={
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium text-[#26045D]">
              All developments
            </h2>
            <div className="bg-[#F4F0FE] py-[2px] px-2 text-xs text-[#AE78F1] max-w-fit rounded-full">
              {developmentsData.length} live development
              {developmentsData.length > 1 ? "s" : ""}
            </div>
          </div>
        }
      />
    </div>
  );
}
