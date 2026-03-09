import { useCallback, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import Image from "next/image";

import { TableFormData } from "./table-form";
import { DataTable } from "@/components/table/data-table";
import { useUser } from "@/context/user-context";
import { applyFiltersToSupabase, Filter } from "@/utils/db";
import { createClient } from "@/utils/supabase/client";

export default function TableFormStep4() {
  const supabase = createClient();

  const form = useFormContext<TableFormData>();

  const { user } = useUser();
  const [tableData, setTableData] = useState<
    Record<string, string | number | boolean | null>[]
  >([]);
  const [tableColumns, setTableColumns] = useState<
    { field: string; label: string; type: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatLabel = (name: string) =>
    name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const getTableColumns = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_table_columns", {
      target_table: user?.dataTable,
    });

    if (error) throw new Error(error.message);

    const fields =
      data?.map(
        ({
          column_name,
          data_type,
        }: {
          column_name: string;
          data_type: string;
        }) => {
          const type = data_type.toLowerCase();
          let category: "date" | "number" | "string" | "boolean" | "array" =
            "string";

          if (type.includes("date") || type.includes("time")) category = "date";
          else if (
            ["int", "bigint", "decimal", "numeric", "real", "double"].some(
              (t) => type.includes(t),
            )
          )
            category = "number";
          else if (type.includes("bool")) category = "boolean";
          else if (type.includes("array")) category = "array";

          return {
            field: column_name,
            label: formatLabel(column_name),
            type: category,
          };
        },
      ) || [];

    setTableColumns(fields);
  }, [supabase, user?.dataTable]);

  const getTableData = useCallback(async () => {
    let query = supabase.from(user!.dataTable!).select("*");
    query = applyFiltersToSupabase(
      query,
      form.watch("step_2.filters") as Filter[],
    );

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    setTableData(data);
  }, [user, form, supabase]);

  const initializeData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([getTableColumns(), getTableData()]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [getTableColumns, getTableData]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  return (
    <div>
      <div className="flex items-center justify-end mb-[50px]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <p className="text-sm text-[#26045D]">{tableData.length}</p>
            <Image
              src="/images/user-circle-mini.png"
              width={20}
              height={20}
              alt="user circle"
            />
          </div>
          <div className="bg-[#E5DAFB] h-[28px] rounded-full text-[#7114E2] px-3 py-1">
            {form.watch("step_1.name")}
          </div>
        </div>
      </div>
      <div className="h-[300px] shadow-[0px_2px_10px_0px_#0000001A] rounded-[12px] overflow-x-hidden overflow-y-auto p-2 max-w-[98%] mx-auto">
        <div className="overflow-auto">
          <DataTable
            showHeader={false}
            columns={
              tableColumns.map((column) => ({
                accessorKey: column.field,
                header: column.label,
                enableSorting: true,
                /*eslint-disable @typescript-eslint/no-explicit-any*/
                cell: ({ row }: any) => {
                  const data = row.original as any;

                  if (column.type === "date") {
                    return (
                      <p className="text-center">
                        {new Date(data[column.field])
                          .toLocaleDateString("en-GB")
                          .replaceAll("/", "-")}
                      </p>
                    );
                  }

                  return <p className="text-center">{data[column.field]}</p>;
                },
              })) as any
            }
            data={tableData}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
