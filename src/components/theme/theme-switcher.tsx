"use client";

import { useEffect, useState } from "react";

import { Check, Palette, Paintbrush } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { themes, applyTheme } from "@/lib/themes";

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState("default");
  const [isDark, setIsDark] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customColors, setCustomColors] = useState({
    primary: "#1A1A19",
    secondary: "#0081F2",
    accent: "#10b981",
    background: "#F8F8F7",
    foreground: "#34322D",
  });

  useEffect(() => {
    setIsClient(true);

    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme") ?? "default";
    const savedMode = localStorage.getItem("theme-mode") === "dark";

    setCurrentTheme(savedTheme);
    setIsDark(savedMode);

    // Apply the theme - handle custom themes
    if (savedTheme === "custom") {
      const savedCustomColors = localStorage.getItem("custom-colors");
      if (savedCustomColors) {
        const colors = JSON.parse(savedCustomColors);
        setCustomColors(colors);

        // Apply custom colors immediately
        const root = document.documentElement;
        Object.entries(colors).forEach(([key, value]) => {
          root.style.setProperty(`--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`, value as string);
        });
      }
    } else {
      applyTheme(savedTheme, savedMode);
    }

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

  const applyCustomTheme = () => {
    if (!isClient) return;

    const root = document.documentElement;

    // Apply custom colors to CSS variables
    root.style.setProperty("--primary", customColors.primary);
    root.style.setProperty("--secondary", customColors.secondary);
    root.style.setProperty("--accent", customColors.accent);
    root.style.setProperty("--background", customColors.background);
    root.style.setProperty("--foreground", customColors.foreground);

    // Save custom theme
    localStorage.setItem("theme", "custom");
    localStorage.setItem("custom-colors", JSON.stringify(customColors));
    setCurrentTheme("custom");
  };

  const handleCustomColorChange = (colorKey: string, value: string) => {
    const newColors = { ...customColors, [colorKey]: value };
    setCustomColors(newColors);

    // Apply immediately for live preview
    if (isClient && currentTheme === "custom") {
      const root = document.documentElement;
      root.style.setProperty(`--${colorKey.replace(/([A-Z])/g, "-$1").toLowerCase()}`, value);
    }
  };

  // Load custom colors from localStorage
  useEffect(() => {
    if (isClient) {
      const savedCustomColors = localStorage.getItem("custom-colors");
      if (savedCustomColors) {
        setCustomColors(JSON.parse(savedCustomColors));
      }
    }
  }, [isClient]);

  const currentThemeObj =
    currentTheme === "custom"
      ? { name: "custom", label: "Custom" }
      : themes.find((theme) => theme.name === currentTheme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">{currentThemeObj?.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
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

        <DropdownMenuItem
          onClick={() => setShowCustomPicker(!showCustomPicker)}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="border-border flex h-4 w-4 items-center justify-center rounded-full border">
              <Paintbrush className="h-2.5 w-2.5" />
            </div>
            <span>Custom</span>
          </div>
          {currentTheme === "custom" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>

        {showCustomPicker && (
          <div className="border-border mt-2 space-y-3 border-t p-3">
            <div className="text-muted-foreground text-xs font-medium">Customize Colors</div>

            {Object.entries(customColors).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <Label htmlFor={key} className="text-muted-foreground w-16 text-xs capitalize">
                  {key}
                </Label>
                <Input
                  id={key}
                  type="color"
                  value={value}
                  onChange={(e) => handleCustomColorChange(key, e.target.value)}
                  className="h-6 w-12 cursor-pointer rounded border-none p-0"
                />
                <Input
                  type="text"
                  value={value}
                  onChange={(e) => handleCustomColorChange(key, e.target.value)}
                  className="h-6 flex-1 px-2 py-1 text-xs"
                  placeholder="#000000"
                />
              </div>
            ))}

            <Button
              onClick={applyCustomTheme}
              size="sm"
              className="bg-accent/10 text-foreground hover:bg-accent/15 w-full rounded-[var(--radius-button)] text-xs transition-all duration-200"
            >
              Apply Custom Theme
            </Button>
          </div>
        )}

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
