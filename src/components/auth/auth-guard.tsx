"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initializing && !user) {
      // Redirect to login if not authenticated
      router.push("/auth/v2/login");
    }
  }, [user, initializing, router]);

  // Show loading state while checking authentication
  if (initializing) {
    return (
      fallback ?? (
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="border-primary h-32 w-32 animate-spin rounded-full border-b-2"></div>
            <p className="mt-4 text-lg">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // Show nothing if not authenticated (redirect will happen)
  if (!user) {
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
}
