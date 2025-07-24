"use client";

import { ReactNode } from "react";

import { AuthProvider } from "@/contexts/auth-context";

export default function MainLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <AuthProvider>{children}</AuthProvider>;
}
