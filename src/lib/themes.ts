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
    label: "Zoom Design System",
    light: {
      // Zoom Design System - Light Theme
      background: "#FFFFFF", // White - preserved
      foreground: "#00053D", // Midnight - dark text
      card: "#FFFFFF", // White - preserved
      cardForeground: "#00053D", // Midnight - dark text
      popover: "#FFFFFF", // White - preserved
      popoverForeground: "#00053D", // Midnight - dark text
      primary: "#0B5CFF", // Bloom - primary brand blue
      primaryForeground: "#FFFFFF", // White on blue
      secondary: "transparent",
      secondaryForeground: "#00053D", // Midnight - dark text
      brand: "#0B5CFF", // Bloom - primary brand blue
      brandForeground: "#FFFFFF", // White on blue
      muted: "#F7F2E3", // Noon - neutral background
      mutedForeground: "#00053D", // Midnight - readable text
      accent: "#B4D0F8", // Dawn - light background, subtle elements
      accentForeground: "#00053D", // Midnight - dark text
      destructive: "#FB327E", // Rose - error states, alerts
      destructiveForeground: "#FFFFFF",
      border: "#B4D0F8", // Dawn - subtle borders
      input: "#F7F2E3", // Noon - input backgrounds
      ring: "#0B5CFF", // Bloom - focus rings
      borderSubtle: "rgba(180, 208, 248, 0.5)", // Dawn with opacity
      borderHover: "rgba(180, 208, 248, 0.8)", // Dawn with more opacity
      borderFocus: "rgba(11, 92, 255, 0.3)", // Bloom with opacity
      backgroundElevated: "#FFFFFF", // White - preserved
      backgroundOverlay: "rgba(247, 242, 227, 0.8)", // Noon with opacity
      backgroundHover: "rgba(180, 208, 248, 0.1)", // Dawn with low opacity
      contentBg: "#F7F2E3", // Noon - content areas
      chart1: "#0B5CFF", // Bloom
      chart2: "#00DEEF", // Agave
      chart3: "#00EF9D", // Spearmint
      chart4: "#FFCD00", // Gold
      chart5: "#9A67FB", // Lavender
      sidebar: "#FFFFFF", // White - preserved
      sidebarForeground: "#00053D", // Midnight - dark text
      sidebarPrimary: "#0B5CFF", // Bloom - primary actions
      sidebarPrimaryForeground: "#FFFFFF", // White on blue
      sidebarAccent: "#B4D0F8", // Dawn - light hover
      sidebarAccentForeground: "#00053D", // Midnight - dark text
      sidebarBorder: "#B4D0F8", // Dawn - subtle borders
      sidebarRing: "#0B5CFF", // Bloom - focus rings
    },
    dark: {
      // Zoom Design System - Dark Theme
      background: "#00053D", // Midnight - dark backgrounds
      foreground: "#FFFFFF", // White - light text
      card: "rgba(180, 208, 248, 0.1)", // Dawn with opacity - subtle cards
      cardForeground: "#FFFFFF", // White - light text
      popover: "rgba(180, 208, 248, 0.1)", // Dawn with opacity - subtle popovers
      popoverForeground: "#FFFFFF", // White - light text
      primary: "#0B5CFF", // Bloom - primary brand blue (same in dark)
      primaryForeground: "#FFFFFF", // White on blue
      secondary: "transparent",
      secondaryForeground: "#FFFFFF", // White - light text
      brand: "#0B5CFF", // Bloom - primary brand blue (same in dark)
      brandForeground: "#FFFFFF", // White on blue
      muted: "rgba(247, 242, 227, 0.1)", // Noon with opacity
      mutedForeground: "rgba(255, 255, 255, 0.7)", // Semi-transparent white
      accent: "rgba(180, 208, 248, 0.15)", // Dawn with opacity - hover states
      accentForeground: "#FFFFFF", // White - light text
      destructive: "#FB327E", // Rose - error states (same in dark)
      destructiveForeground: "#FFFFFF", // White on rose
      border: "rgba(180, 208, 248, 0.2)", // Dawn with opacity - borders
      input: "rgba(247, 242, 227, 0.1)", // Noon with opacity - inputs
      ring: "#0B5CFF", // Bloom - focus rings
      borderSubtle: "rgba(180, 208, 248, 0.1)", // Dawn with low opacity
      borderHover: "rgba(180, 208, 248, 0.25)", // Dawn with more opacity
      borderFocus: "rgba(11, 92, 255, 0.4)", // Bloom with opacity
      backgroundElevated: "rgba(180, 208, 248, 0.05)", // Dawn with very low opacity
      backgroundOverlay: "rgba(0, 5, 61, 0.9)", // Midnight with opacity
      backgroundHover: "rgba(180, 208, 248, 0.05)", // Dawn with very low opacity
      contentBg: "rgba(247, 242, 227, 0.05)", // Noon with very low opacity
      chart1: "#0B5CFF", // Bloom
      chart2: "#00DEEF", // Agave
      chart3: "#00EF9D", // Spearmint
      chart4: "#FFCD00", // Gold
      chart5: "#9A67FB", // Lavender
      sidebar: "#00053D", // Midnight - dark sidebar
      sidebarForeground: "#FFFFFF", // White - light text
      sidebarPrimary: "#0B5CFF", // Bloom - primary actions (same in dark)
      sidebarPrimaryForeground: "#FFFFFF", // White on blue
      sidebarAccent: "rgba(180, 208, 248, 0.15)", // Dawn with opacity - hover
      sidebarAccentForeground: "#FFFFFF", // White - light text
      sidebarBorder: "rgba(180, 208, 248, 0.2)", // Dawn with opacity - borders
      sidebarRing: "#0B5CFF", // Bloom - focus rings
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
  {
    name: "custom",
    label: "Custom",
    light: {
      background: "#FFFFFF", // Pure white app background
      foreground: "#191B1F", // Headlines
      card: "#FFFFFF",
      cardForeground: "#19283A", // Body text
      popover: "#FFFFFF",
      popoverForeground: "#19283A", // Body text
      primary: "#313131", // Submit buttons
      primaryForeground: "#FFFFFF", // Button text
      secondary: "transparent",
      secondaryForeground: "#19283A", // Body text
      brand: "#F0F209", // Yellow accent color
      brandForeground: "#191B1F", // Headlines
      muted: "#F8F8F8",
      mutedForeground: "#737373",
      accent: "#EEEEEE", // Hover for sidebar
      accentForeground: "#19283A", // Body text
      destructive: "#EF4444",
      destructiveForeground: "#FFFFFF",
      border: "#E5E5E5",
      input: "#F8F8F8",
      ring: "#313131", // Submit buttons
      borderSubtle: "#F5F5F5",
      borderHover: "#D4D4D4",
      borderFocus: "#A3A3A3",
      backgroundElevated: "#FFFFFF",
      backgroundOverlay: "rgba(255, 255, 255, 0.9)",
      backgroundHover: "#FAFAFA",
      contentBg: "#F8F8F8",
      chart1: "#313131",
      chart2: "#19283A",
      chart3: "#737373",
      chart4: "#A3A3A3",
      chart5: "#D4D4D4",
      sidebar: "#FFFFFF",
      sidebarForeground: "#19283A", // Body text
      sidebarPrimary: "#823EFC", // Special buttons (purple)
      sidebarPrimaryForeground: "#FFFFFF", // Button text
      sidebarAccent: "#EEEEEE", // Hover for sidebar
      sidebarAccentForeground: "#19283A", // Body text
      sidebarBorder: "#D4D4D4",
      sidebarRing: "#823EFC", // Special buttons
    },
    dark: {
      background: "#0A0A0A",
      foreground: "#EEEEEE",
      card: "#171717",
      cardForeground: "#EEEEEE",
      popover: "#171717",
      popoverForeground: "#EEEEEE",
      primary: "#525252", // Lighter submit buttons for dark
      primaryForeground: "#FFFFFF",
      secondary: "#262626",
      secondaryForeground: "#EEEEEE",
      brand: "#F0F209", // Yellow accent color (same)
      brandForeground: "#0A0A0A",
      muted: "#171717",
      mutedForeground: "#737373",
      accent: "#262626",
      accentForeground: "#EEEEEE",
      destructive: "#EF4444",
      destructiveForeground: "#FFFFFF",
      border: "#404040",
      input: "#262626",
      ring: "#525252",
      borderSubtle: "#171717",
      borderHover: "#525252",
      borderFocus: "#737373",
      backgroundElevated: "#262626",
      backgroundOverlay: "rgba(10, 10, 10, 0.9)",
      backgroundHover: "#171717",
      contentBg: "#171717",
      chart1: "#EEEEEE",
      chart2: "#A3A3A3",
      chart3: "#737373",
      chart4: "#525252",
      chart5: "#404040",
      sidebar: "#0A0A0A",
      sidebarForeground: "#EEEEEE",
      sidebarPrimary: "#9B70FF", // Lighter purple for dark mode
      sidebarPrimaryForeground: "#0A0A0A",
      sidebarAccent: "#262626",
      sidebarAccentForeground: "#EEEEEE",
      sidebarBorder: "#404040",
      sidebarRing: "#9B70FF",
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
