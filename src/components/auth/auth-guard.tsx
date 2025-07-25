"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push("/auth/v2/login");
    }
  }, [user, router]);

  // Show nothing if not authenticated (redirect will happen)
  if (!user) {
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
}
