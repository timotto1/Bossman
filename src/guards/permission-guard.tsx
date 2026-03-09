"use client";

import { useUser } from "@/context/user-context";

interface PermissionGuardProps {
  permissions: string[];
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard = ({
  permissions,
  fallback = null,
  loadingFallback = null,
  children,
}: PermissionGuardProps) => {
  const { user, loading } = useUser();

  if (loading) return loadingFallback;
  if (!permissions.length) return children;
  if (!user?.permissions.some((p) => permissions.includes(p))) return fallback;

  return <>{children}</>;
};
