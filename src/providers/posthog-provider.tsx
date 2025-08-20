"use client";

import { useEffect } from "react";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize PostHog only on the client side
    if (typeof window !== "undefined") {
      const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
      const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

      if (posthogKey) {
        posthog.init(posthogKey, {
          api_host: posthogHost,
          loaded: (posthog) => {
            if (process.env.NODE_ENV === "development") {
              console.log("🔍 [PostHog] Initialized successfully");
            }
          },
        });
      } else {
        console.warn("⚠️ [PostHog] Missing NEXT_PUBLIC_POSTHOG_KEY environment variable");
      }
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
