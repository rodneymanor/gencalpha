"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";

interface AuthRedirectGuardProps {
  children: React.ReactNode;
}

export function AuthRedirectGuard({ children }: AuthRedirectGuardProps) {
  const { user, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initializing && user) {
      // Redirect to dashboard if already authenticated
      router.push("/dashboard/collections");
    }
  }, [user, initializing, router]);

  // Show loading state while checking authentication
  if (initializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary h-32 w-32 animate-spin rounded-full border-b-2"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing if authenticated (redirect will happen)
  if (user) {
    return null;
  }

  // Render auth pages if not authenticated
  return <>{children}</>;
}
