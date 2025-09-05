"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";

interface AuthGuardProps {
  children: React.ReactNode;
  /** Optional fallback component while auth state is initializing */
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, initializing, isBackgroundVerifying } = useAuth();
  const router = useRouter();

  // Only redirect AFTER the auth system has finished initializing and background verification.
  useEffect(() => {
    const ready = !initializing && !isBackgroundVerifying;
    if (ready && !user) {
      router.push("/auth/v1/login");
    }
  }, [initializing, isBackgroundVerifying, user, router]);

  // While Firebase / auth context is bootstrapping or verifying cache, show the fallback (or nothing)
  if (initializing || isBackgroundVerifying) {
    return fallback ? <>{fallback}</> : null;
  }

  // If initialization finished and there is still no user, render nothing – redirect already triggered.
  if (!user) {
    return null;
  }

  // Authenticated – render protected content.
  return <>{children}</>;
}
