"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { createClient } from "@/utils/supabase/client";

interface User {
  id: string;
  name: string;
  initials: string;
  email: string;
  providerID: number;
  companyID: string;
  companyName: string;
  dataTable: string;
  role: string;
  permissions: string[];
}

interface UserContextType {
  loading: boolean;
  user: User | null;
  showMyCases: boolean;
  setShowMyCases: (value: boolean) => void;
}

const UserContext = createContext<UserContextType>({
  loading: false,
  user: null,
  showMyCases: false,
  setShowMyCases: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMyCases, setShowMyCases] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const supabase = createClient();

        const { data: sessionUser } = await supabase.auth.getUser();
        if (!sessionUser?.user) throw new Error("No user session found");

        const {
          id,
          email,
          user_metadata: { company, firstName, lastName },
        } = sessionUser.user;

        const { data: companyData, error: companyErr } = await supabase
          .from("company")
          .select("provider_id, name, data_table")
          .eq("id", company)
          .single();
        if (companyErr) throw companyErr;

        const { data: roleData, error: roleErr } = await supabase
          .from("user_roles")
          .select("role_id")
          .eq("user_id", id)
          .maybeSingle();
        if (roleErr) throw roleErr;

        const { data: roleDetail, error: permsErr } = await supabase
          .from("roles")
          .select(`name, role_permissions(permissions(key))`)
          .eq("id", roleData?.role_id)
          .maybeSingle();
        if (permsErr) throw permsErr;

        const permissions =
          roleDetail?.role_permissions?.map(
            (rp) =>
              (rp as unknown as { permissions: { key: string } }).permissions
                ?.key,
          ) ?? [];

        setUser({
          id,
          email: email!,
          name: `${firstName} ${lastName}`,
          initials:
            (firstName?.[0] ?? "").toUpperCase() +
            (lastName?.[0] ?? "").toUpperCase(),
          companyID: company,
          companyName: companyData?.name,
          providerID: companyData?.provider_id,
          role: roleDetail?.name ?? "user",
          dataTable: companyData?.data_table,
          permissions,
        });
      } catch (err) {
        console.error("UserProvider error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) return null;

  return (
    <UserContext.Provider
      value={{ loading, user, showMyCases, setShowMyCases }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
