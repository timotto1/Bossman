"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { PostgrestError } from "@supabase/supabase-js";

import { TableFormData } from "@/components/dashboard/tables/table-form";
import { useUser } from "@/context/user-context";
import { applyFiltersToSupabase, Filter } from "@/utils/db";
import { createClient } from "@/utils/supabase/client";

export type TableQuery = {
  id: string;
  company_id: string;
  created_by: string;
  name: string;
  description: string;
  filters: Filter[];
  view_permission_type: "all" | "none" | "user";
  view_permission_user_id: string;
  edit_permission_type: "all" | "none" | "user";
  edit_permission_user_id: string;
  created_at: string;
  updated_at: string;
  case_managers: {
    first_name: string;
    last_name: string;
  };
} & { resident_count: number };

type TableContextValue = {
  tables: TableQuery[];
  tableData: Record<string, string | number | boolean | null>[];
  tableColumns: { field: string; label: string; type: string }[];
  selectedTable: string;
  initializing: boolean;
  loading: boolean;
  contentLoading: boolean;
  error: PostgrestError | null;
  setSelectedTable: (id: string) => void;
  getTables: () => Promise<void>;
  getTableData: (table: TableQuery) => Promise<void>;
  getTableColumns: () => Promise<void>;
  createTable: (
    data: TableFormData,
  ) => Promise<{ data: TableQuery | null; error: PostgrestError | null }>;
  updateTable: (
    id: string,
    data: Partial<TableFormData>,
  ) => Promise<{ data: TableQuery | null; error: PostgrestError | null }>;
  deleteTable: (id: string) => Promise<{ error: PostgrestError | null }>;
  refreshTables: () => Promise<void>;
};

const TableContext = createContext<TableContextValue | undefined>(undefined);

export function TableProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const supabase = createClient();

  const [tables, setTables] = useState<TableQuery[]>([]);
  const [tableData, setTableData] = useState<
    Record<string, string | number | boolean | null>[]
  >([]);
  const [tableColumns, setTableColumns] = useState<
    { field: string; label: string; type: string }[]
  >([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const [error, setError] = useState<PostgrestError | null>(null);

  const formatLabel = (name: string) =>
    name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const getTableResidentsCount = useCallback(
    async (filter: Filter[]) => {
      let query = supabase
        .from(user!.dataTable!)
        .select("*", { count: "exact" });
      query = applyFiltersToSupabase(query, filter);
      const { count, error } = await query;
      if (error) throw new Error(error.message);
      return count;
    },
    [supabase, user],
  );

  const getTableData = useCallback(
    async (tableQuery: TableQuery) => {
      setContentLoading(true);
      try {
        let query = supabase.from(user!.dataTable!).select("*");
        query = applyFiltersToSupabase(query, tableQuery.filters as Filter[]);
        const { data, error } = await query;
        if (error) throw new Error(error.message);
        setTableData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setContentLoading(false);
      }
    },
    [supabase, user],
  );

  const getTables = useCallback(async () => {
    if (!user?.companyID) return;
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("table_queries")
      .select(
        `
        *,
        case_managers!created_by (
          first_name,
          last_name
        )
      `,
      )
      .eq("company_id", user.companyID)
      .or(
        `created_by.eq.${user.id},` +
          `view_permission_type.eq.all,` +
          `and(view_permission_type.eq.user,view_permission_user_id.eq.${user.id})`,
      )
      .order("created_at", { ascending: false });

    if (error) {
      setError(error);
      setLoading(false);
      return;
    }

    const queries = (data ?? []) as TableQuery[];
    const withCounts = await Promise.all(
      queries.map(async (query) => {
        const resident_count = await getTableResidentsCount(
          query.filters as Filter[],
        );
        return { ...query, resident_count };
      }),
    );

    setTables([...withCounts] as TableQuery[]);
    if (withCounts[0]) {
      setSelectedTable(withCounts[0].id);
      getTableData(withCounts[0] as TableQuery);
    }

    setLoading(false);
  }, [supabase, user, getTableData, getTableResidentsCount]);

  const getTableColumns = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_table_columns", {
      target_table: user?.dataTable,
    });
    if (error) throw new Error(error.message);

    const fields = [{ field: "select", type: "checkbox", label: "" }];
    fields.push(
      ...data?.map(
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
      ),
    );
    fields.push({ field: "actions", label: "View", type: "actions" });
    setTableColumns(fields);
  }, [supabase, user?.dataTable]);

  const createTable = async (data: TableFormData) => {
    setLoading(true);
    setError(null);

    const { data: result, error } = await supabase
      .from("table_queries")
      .insert({
        company_id: user?.companyID,
        created_by: user?.id,
        name: data.step_1.name,
        description: data.step_1.description,
        filters: data.step_2.filters,
        view_permission_type: data.step_3.view.type,
        view_permission_user_id: data.step_3.view.userId,
        edit_permission_type: data.step_3.edit.type,
        edit_permission_user_id: data.step_3.edit.userId,
      })
      .select()
      .single();

    if (!error) {
      await getTables(); // refresh after create
    } else {
      setError(error);
    }

    setLoading(false);
    return { data: result as TableQuery | null, error };
  };

  const updateTable = async (id: string, data: Partial<TableFormData>) => {
    setLoading(true);
    setError(null);

    const { data: result, error } = await supabase
      .from("table_queries")
      .update({
        company_id: user?.companyID,
        created_by: user?.id,
        name: data?.step_1?.name,
        description: data?.step_1?.description,
        filters: data?.step_2?.filters,
        view_permission_type: data?.step_3?.view.type,
        view_permission_user_id: data?.step_3?.view.userId,
        edit_permission_type: data?.step_3?.edit.type,
        edit_permission_user_id: data?.step_3?.edit.userId,
      })
      .eq("id", id)
      .select()
      .single();

    if (!error) {
      await getTables(); // refresh after update
    } else {
      setError(error);
    }

    setLoading(false);
    return { data: result as TableQuery | null, error };
  };

  const deleteTable = async (id: string) => {
    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from("table_queries")
      .delete()
      .eq("id", id);

    if (!error) {
      await getTables(); // refresh after delete
    } else {
      setError(error);
    }

    setLoading(false);
    return { error };
  };

  useEffect(() => {
    if (!user?.companyID) return;
    const initializeData = async () => {
      setInitializing(true);
      await Promise.all([getTables(), getTableColumns()]);
      setInitializing(false);
    };
    initializeData();
  }, [user?.companyID, user?.id, getTables, getTableColumns]);

  return (
    <TableContext.Provider
      value={{
        tables,
        tableData,
        tableColumns,
        selectedTable,
        initializing,
        loading,
        contentLoading,
        error,
        setSelectedTable,
        getTables,
        getTableData,
        getTableColumns,
        createTable,
        updateTable,
        deleteTable,
        refreshTables: getTables,
      }}
    >
      {children}
    </TableContext.Provider>
  );
}

export function useTable() {
  const ctx = useContext(TableContext);
  if (!ctx) {
    throw new Error("useTable must be used inside a TableProvider");
  }
  return ctx;
}
