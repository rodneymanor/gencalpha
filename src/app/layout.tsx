import { ReactNode } from "react";

import type { Metadata } from "next";
import { Lato, Roboto } from "next/font/google";

import ErrorBoundary from "@/components/error-boundary";
import { LoadingProvider } from "@/components/ui/loading";
import { Toaster } from "@/components/ui/sonner";
import { APP_CONFIG } from "@/config/app-config";
import { PostHogProvider } from "@/contexts/posthog-provider";
import { QueryProvider } from "@/contexts/query-client-provider";
import { PreferencesStoreProvider } from "@/lib/stores/preferences/preferences-provider";
import { getPreference } from "@/server/server-actions";
import { THEME_MODE_VALUES, THEME_PRESET_VALUES, type ThemePreset, type ThemeMode } from "@/types/preferences/theme";

import "./globals.css";

// Zoom Design System Typography
// Primary: Lato for excellent readability and professional look
const lato = Lato({ 
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-lato",
  display: "swap"
});

// Fallback: Roboto for natural reading rhythm  
const roboto = Roboto({ 
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto", 
  display: "swap"
});

export const metadata: Metadata = {
  title: APP_CONFIG.meta.title,
  description: APP_CONFIG.meta.description,
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const themeMode = await getPreference<ThemeMode>("theme_mode", THEME_MODE_VALUES, "light");
  const themePreset = await getPreference<ThemePreset>("theme_preset", THEME_PRESET_VALUES, "default");

  return (
    <html
      lang="en"
      className={themeMode === "dark" ? "dark" : ""}
      data-theme-preset="default"
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect and DNS-prefetch to speed up Firebase connections */}
        <link rel="preconnect" href="https://firebaseapp.com" />
        <link rel="preconnect" href="https://firebaseio.com" />
        <link rel="dns-prefetch" href="https://firebaseapp.com" />
        <link rel="dns-prefetch" href="https://firebaseio.com" />
      </head>
      <body className={`${lato.variable} ${roboto.variable} font-sans min-h-screen antialiased`}>
        <ErrorBoundary>
          <PostHogProvider>
            <QueryProvider>
              <LoadingProvider>
                <PreferencesStoreProvider themeMode={themeMode} themePreset={themePreset}>
                  {children}
                  <Toaster />
                </PreferencesStoreProvider>
              </LoadingProvider>
            </QueryProvider>
          </PostHogProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
