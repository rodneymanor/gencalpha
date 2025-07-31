"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";

interface AuthRedirectGuardProps {
  children: React.ReactNode;
  /** Optional fallback component while auth state is initializing */
  fallback?: React.ReactNode;
}

// Used on auth pages – sends authenticated users away but waits until auth finished bootstrapping.
export function AuthRedirectGuard({ children, fallback }: AuthRedirectGuardProps) {
  const { user, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initializing && user) {
      router.push("/dashboard/daily");
    }
  }, [initializing, user, router]);

  if (initializing) {
    return fallback ? <>{fallback}</> : null;
  }

  if (user) {
    return null;
  }

  return <>{children}</>;
}
