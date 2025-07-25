"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";

interface AuthRedirectGuardProps {
  children: React.ReactNode;
}

export function AuthRedirectGuard({ children }: AuthRedirectGuardProps) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Redirect to dashboard if already authenticated
      router.push("/dashboard/daily");
    }
  }, [user, router]);

  // Show nothing if authenticated (redirect will happen)
  if (user) {
    return null;
  }

  // Render auth pages if not authenticated
  return <>{children}</>;
}
