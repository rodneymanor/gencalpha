"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react";

import { applyTheme } from "@/lib/themes";

interface ThemeContextType {
  theme: string;
  isDark: boolean;
  setTheme: (theme: string) => void;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState("default");
  const [isDark, setIsDark] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme") ?? "default";
    const savedMode = localStorage.getItem("theme-mode") === "dark";

    setThemeState(savedTheme);
    setIsDark(savedMode);

    // Apply the theme
    applyTheme(savedTheme, savedMode);

    // Update body class for dark mode
    if (savedMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, []);

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
    if (isClient) {
      localStorage.setItem("theme", newTheme);
      applyTheme(newTheme, isDark);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);

    if (isClient) {
      localStorage.setItem("theme-mode", newMode ? "dark" : "light");
      applyTheme(theme, newMode);

      // Update body class
      if (newMode) {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }
    }
  };

  const contextValue = useMemo(
    () => ({
      theme,
      isDark,
      setTheme,
      toggleDarkMode,
    }),
    [theme, isDark],
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}
