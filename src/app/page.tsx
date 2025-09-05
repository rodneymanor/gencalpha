"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";

export default function RootPage() {
  const router = useRouter();
  const { user, initializing } = useAuth();

  useEffect(() => {
    // After auth initialization completes, redirect based on auth state
    if (!initializing) {
      if (user) {
        router.replace("/collections");
      } else {
        router.replace("/auth/v2/login");
      }
    }
  }, [initializing, user, router]);

  // Show loading state while determining where to redirect
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-neutral-900"></div>
        <p className="text-neutral-600">Loading...</p>
      </div>
    </div>
  );
}
