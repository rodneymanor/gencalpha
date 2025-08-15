"use client";

import { useEffect, useState } from "react";

import { Check, Palette } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { themes, applyTheme } from "@/lib/themes";

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState("default");
  const [isDark, setIsDark] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme") ?? "default";
    const savedMode = localStorage.getItem("theme-mode") === "dark";

    setCurrentTheme(savedTheme);
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

  const handleThemeChange = (themeName: string) => {
    setCurrentTheme(themeName);
    if (isClient) {
      localStorage.setItem("theme", themeName);
      applyTheme(themeName, isDark);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);

    if (isClient) {
      localStorage.setItem("theme-mode", newMode ? "dark" : "light");
      applyTheme(currentTheme, newMode);

      // Update body class
      if (newMode) {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }
    }
  };

  const currentThemeObj = themes.find((theme) => theme.name === currentTheme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">{currentThemeObj?.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Color Themes</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.name}
            onClick={() => handleThemeChange(theme.name)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div
                className="border-border h-4 w-4 rounded-full border"
                style={{ backgroundColor: isDark ? theme.dark.primary : theme.light.primary }}
              />
              <span>{theme.label}</span>
            </div>
            {currentTheme === theme.name && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={toggleDarkMode} className="flex items-center justify-between">
          <span>Dark Mode</span>
          <div className={`h-4 w-8 rounded-full transition-colors ${isDark ? "bg-primary" : "bg-muted"}`}>
            <div
              className={`mt-0.5 h-3 w-3 rounded-full bg-white transition-transform ${isDark ? "translate-x-4" : "translate-x-0.5"}`}
            />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
