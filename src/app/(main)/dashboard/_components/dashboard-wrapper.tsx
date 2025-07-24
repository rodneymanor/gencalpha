"use client";

import { ReactNode } from "react";

import { AuthGuard } from "@/components/auth/auth-guard";

interface DashboardWrapperProps {
  children: ReactNode;
}

export function DashboardWrapper({ children }: DashboardWrapperProps) {
  return <AuthGuard>{children}</AuthGuard>;
}
