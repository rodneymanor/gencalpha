/* eslint-disable max-lines */
export interface ThemeColors {
  // Core Colors
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  brand: string;
  brandForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;

  // Enhanced Border System
  borderSubtle: string;
  borderHover: string;
  borderFocus: string;

  // Soft UI Background Layers
  backgroundElevated: string;
  backgroundOverlay: string;
  backgroundHover: string;
  contentBg: string;

  // Chart Colors
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;

  // Sidebar Colors
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
}

export interface Theme {
  name: string;
  label: string;
  light: ThemeColors;
  dark: ThemeColors;
}

export const themes: Theme[] = [
  {
    name: "default",
    label: "Default",
    light: {
      background: "#F8F8F7",
      foreground: "#34322D",
      card: "#FFFFFF",
      cardForeground: "#34322D",
      popover: "#FFFFFF",
      popoverForeground: "#34322D",
      primary: "#1A1A19",
      primaryForeground: "#FFFFFF",
      secondary: "transparent",
      secondaryForeground: "#34322D",
      brand: "#FACC15",
      brandForeground: "#1A1A19",
      muted: "#F8F8F7",
      mutedForeground: "#858481",
      accent: "rgba(55,53,47,0.06)",
      accentForeground: "#5E5E5B",
      destructive: "#EF4444",
      destructiveForeground: "#FFFFFF",
      border: "rgba(0,0,0,0.06)",
      input: "rgba(0,0,0,0.06)",
      ring: "#1d293f",
      borderSubtle: "rgba(0,0,0,0.04)",
      borderHover: "rgba(0,0,0,0.12)",
      borderFocus: "rgba(29, 41, 63, 0.3)",
      backgroundElevated: "rgba(255, 255, 255, 0.5)",
      backgroundOverlay: "rgba(248, 248, 247, 0.8)",
      backgroundHover: "rgba(0, 0, 0, 0.02)",
      contentBg: "#EDEDEC",
      chart1: "#1d293f",
      chart2: "#5E5E5B",
      chart3: "#858481",
      chart4: "#34322D",
      chart5: "#1A1A19",
      sidebar: "#F8F8F7",
      sidebarForeground: "#34322D",
      sidebarPrimary: "#1A1A19",
      sidebarPrimaryForeground: "#FFFFFF",
      sidebarAccent: "rgba(55,53,47,0.06)",
      sidebarAccentForeground: "#5E5E5B",
      sidebarBorder: "rgba(0,0,0,0.06)",
      sidebarRing: "#1d293f",
    },
    dark: {
      background: "#1A1A19",
      foreground: "#EAEAE9",
      card: "#262625",
      cardForeground: "#EAEAE9",
      popover: "#262625",
      popoverForeground: "#EAEAE9",
      primary: "#FFFFFF",
      primaryForeground: "#1A1A19",
      secondary: "rgba(255,255,255,0.1)",
      secondaryForeground: "#EAEAE9",
      brand: "#FACC15",
      brandForeground: "#1A1A19",
      muted: "#1A1A19",
      mutedForeground: "#858481",
      accent: "rgba(255,255,255,0.1)",
      accentForeground: "#EAEAE9",
      destructive: "#EF4444",
      destructiveForeground: "#FFFFFF",
      border: "rgba(255,255,255,0.1)",
      input: "rgba(255,255,255,0.1)",
      ring: "#262625",
      borderSubtle: "rgba(255,255,255,0.06)",
      borderHover: "rgba(255,255,255,0.15)",
      borderFocus: "rgba(38, 38, 37, 0.4)",
      backgroundElevated: "rgba(38, 38, 37, 0.5)",
      backgroundOverlay: "rgba(26, 26, 25, 0.8)",
      backgroundHover: "rgba(255, 255, 255, 0.02)",
      contentBg: "#262625",
      chart1: "#FFFFFF",
      chart2: "#858481",
      chart3: "#EAEAE9",
      chart4: "#34322D",
      chart5: "#1A1A19",
      sidebar: "#1A1A19",
      sidebarForeground: "#EAEAE9",
      sidebarPrimary: "#FFFFFF",
      sidebarPrimaryForeground: "#1A1A19",
      sidebarAccent: "rgba(255,255,255,0.1)",
      sidebarAccentForeground: "#EAEAE9",
      sidebarBorder: "rgba(255,255,255,0.1)",
      sidebarRing: "#262625",
    },
  },
  {
    name: "neutral",
    label: "Neutral",
    light: {
      background: "#f7f8fa",
      foreground: "#1a1f36",
      card: "#ffffff",
      cardForeground: "#1a1f36",
      popover: "#ffffff",
      popoverForeground: "#1a1f36",
      primary: "#1a1f36",
      primaryForeground: "#ffffff",
      secondary: "#f3f4f6",
      secondaryForeground: "#374151",
      brand: "#10b981",
      brandForeground: "#ffffff",
      muted: "#fafbfc",
      mutedForeground: "#6b7280",
      accent: "#f9fafb",
      accentForeground: "#374151",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      border: "#e5e7eb",
      input: "#e5e7eb",
      ring: "#1a1f36",
      borderSubtle: "rgba(0,0,0,0.05)",
      borderHover: "#d1d5db",
      borderFocus: "rgba(26, 31, 54, 0.3)",
      backgroundElevated: "#ffffff",
      backgroundOverlay: "rgba(247, 248, 250, 0.95)",
      backgroundHover: "#f9fafb",
      contentBg: "#fafbfc",
      chart1: "#1a1f36",
      chart2: "#10b981",
      chart3: "#6b7280",
      chart4: "#9ca3af",
      chart5: "#374151",
      sidebar: "#f7f8fa",
      sidebarForeground: "#1a1f36",
      sidebarPrimary: "#1a1f36",
      sidebarPrimaryForeground: "#ffffff",
      sidebarAccent: "#f3f4f6",
      sidebarAccentForeground: "#374151",
      sidebarBorder: "#e5e7eb",
      sidebarRing: "#1a1f36",
    },
    dark: {
      background: "#0f1114",
      foreground: "#e5e7eb",
      card: "#1a1f36",
      cardForeground: "#e5e7eb",
      popover: "#1a1f36",
      popoverForeground: "#e5e7eb",
      primary: "#f9fafb",
      primaryForeground: "#0f1114",
      secondary: "#374151",
      secondaryForeground: "#e5e7eb",
      brand: "#10b981",
      brandForeground: "#ffffff",
      muted: "#1f2937",
      mutedForeground: "#9ca3af",
      accent: "#374151",
      accentForeground: "#e5e7eb",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      border: "rgba(229, 231, 235, 0.1)",
      input: "rgba(229, 231, 235, 0.1)",
      ring: "#374151",
      borderSubtle: "rgba(229, 231, 235, 0.06)",
      borderHover: "rgba(229, 231, 235, 0.15)",
      borderFocus: "rgba(249, 250, 251, 0.3)",
      backgroundElevated: "#1a1f36",
      backgroundOverlay: "rgba(15, 17, 20, 0.95)",
      backgroundHover: "rgba(229, 231, 235, 0.05)",
      contentBg: "#1f2937",
      chart1: "#f9fafb",
      chart2: "#10b981",
      chart3: "#9ca3af",
      chart4: "#6b7280",
      chart5: "#e5e7eb",
      sidebar: "#0f1114",
      sidebarForeground: "#e5e7eb",
      sidebarPrimary: "#f9fafb",
      sidebarPrimaryForeground: "#0f1114",
      sidebarAccent: "#374151",
      sidebarAccentForeground: "#e5e7eb",
      sidebarBorder: "rgba(229, 231, 235, 0.1)",
      sidebarRing: "#374151",
    },
  },
  {
    name: "forest",
    label: "Forest",
    light: {
      background: "#F8F8F7",
      foreground: "#34322D",
      card: "#FFFFFF",
      cardForeground: "#34322D",
      popover: "#FFFFFF",
      popoverForeground: "#34322D",
      primary: "#3A4F41",
      primaryForeground: "#FFFFFF",
      secondary: "#B46A4B",
      secondaryForeground: "#FFFFFF",
      brand: "#FACC15",
      brandForeground: "#1A1A19",
      muted: "#F8F8F7",
      mutedForeground: "#858481",
      accent: "rgba(55,53,47,0.06)",
      accentForeground: "#5E5E5B",
      destructive: "#EF4444",
      destructiveForeground: "#FFFFFF",
      border: "rgba(0,0,0,0.06)",
      input: "rgba(0,0,0,0.06)",
      ring: "#3A4F41",
      borderSubtle: "rgba(0,0,0,0.04)",
      borderHover: "rgba(0,0,0,0.12)",
      borderFocus: "rgba(58, 79, 65, 0.3)",
      backgroundElevated: "rgba(255, 255, 255, 0.5)",
      backgroundOverlay: "rgba(248, 248, 247, 0.8)",
      backgroundHover: "rgba(0, 0, 0, 0.02)",
      contentBg: "#EDEDEC",
      chart1: "#3A4F41",
      chart2: "#5E5E5B",
      chart3: "#858481",
      chart4: "#B46A4B",
      chart5: "#34322D",
      sidebar: "#F8F8F7",
      sidebarForeground: "#34322D",
      sidebarPrimary: "#3A4F41",
      sidebarPrimaryForeground: "#FFFFFF",
      sidebarAccent: "rgba(55,53,47,0.06)",
      sidebarAccentForeground: "#5E5E5B",
      sidebarBorder: "rgba(0,0,0,0.06)",
      sidebarRing: "#3A4F41",
    },
    dark: {
      background: "#1A1A19",
      foreground: "#EAEAE9",
      card: "#262625",
      cardForeground: "#EAEAE9",
      popover: "#262625",
      popoverForeground: "#EAEAE9",
      primary: "#C8D5C8",
      primaryForeground: "#1A1A19",
      secondary: "#B46A4B",
      secondaryForeground: "#FFFFFF",
      brand: "#FACC15",
      brandForeground: "#1A1A19",
      muted: "#1A1A19",
      mutedForeground: "#858481",
      accent: "rgba(255,255,255,0.1)",
      accentForeground: "#EAEAE9",
      destructive: "#EF4444",
      destructiveForeground: "#FFFFFF",
      border: "rgba(255,255,255,0.1)",
      input: "rgba(255,255,255,0.1)",
      ring: "#C8D5C8",
      borderSubtle: "rgba(255,255,255,0.06)",
      borderHover: "rgba(255,255,255,0.15)",
      borderFocus: "rgba(200, 213, 200, 0.4)",
      backgroundElevated: "rgba(38, 38, 37, 0.5)",
      backgroundOverlay: "rgba(26, 26, 25, 0.8)",
      backgroundHover: "rgba(255, 255, 255, 0.02)",
      contentBg: "#262625",
      chart1: "#C8D5C8",
      chart2: "#858481",
      chart3: "#EAEAE9",
      chart4: "#B46A4B",
      chart5: "#FFFFFF",
      sidebar: "#1A1A19",
      sidebarForeground: "#EAEAE9",
      sidebarPrimary: "#C8D5C8",
      sidebarPrimaryForeground: "#1A1A19",
      sidebarAccent: "rgba(255,255,255,0.1)",
      sidebarAccentForeground: "#EAEAE9",
      sidebarBorder: "rgba(255,255,255,0.1)",
      sidebarRing: "#C8D5C8",
    },
  },
];

export function getTheme(themeName: string): Theme {
  return themes.find((theme) => theme.name === themeName) ?? themes[0];
}

export function applyTheme(themeName: string, isDark: boolean = false) {
  const theme = getTheme(themeName);
  const colors = isDark ? theme.dark : theme.light;

  const root = document.documentElement;

  // Apply CSS custom properties
  Object.entries(colors).forEach(([key, value]) => {
    const cssVar = key.replace(/([A-Z])/g, "-$1").toLowerCase();
    root.style.setProperty(`--${cssVar}`, value);
  });
}
