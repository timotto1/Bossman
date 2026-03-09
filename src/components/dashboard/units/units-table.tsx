"use client";

import { useCallback, useEffect, useState } from "react";

import { DataTable } from "@/components/table/data-table";
import { unitColumns } from "@/components/table/units/columns";
import { UnitSchema } from "@/components/table/units/schema";
import { useUser } from "@/context/user-context";
import { createClient } from "@/utils/supabase/client";

export function UnitsTable() {
  const supabase = createClient();
  const { user } = useUser();
  const [units, setUnits] = useState<UnitSchema[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const getAllUnits = useCallback(async () => {
    try {
      const { data: allUnits, error: allUnitsError } = await supabase.rpc(
        `platform_units`,
        {
          company_id: user?.companyID,
        },
      );

      if (allUnitsError) throw new Error(allUnitsError.message);

      setUnits(allUnits);
    } catch (err) {
      console.error((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user?.companyID]);

  useEffect(() => {
    getAllUnits();
  }, [getAllUnits]);

  return (
    <div className="shadow-[0px_2px_10px_0px_#0000001A] rounded-[12px] overflow-x-hidden overflow-y-auto p-2">
      <DataTable
        isLoading={isLoading}
        showTotal={false}
        showExport={true}
        showSearchFilter={true}
        columns={unitColumns}
        data={units}
        searchPlaceholder={`Search for specific unit`}
        title={
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium text-[#26045D]">All units</h2>
            <div className="bg-[#F4F0FE] py-[2px] px-2 text-xs text-[#AE78F1] max-w-fit rounded-full">
              {units.length} active unit
              {units.length > 1 ? "s" : ""}
            </div>
          </div>
        }
      />
    </div>
  );
}
