/**
 * Color System Utilities
 *
 * Generates systematic color scales from base colors
 * Enables easy theme testing by changing base values
 */

import Color from "color";

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface BaseColors {
  neutral: string;
  primary: string;
  brand: string;
  success: string;
  warning: string;
  destructive: string;
}

export interface ThemeColors extends BaseColors {
  // Additional computed colors
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  border: string;
  input: string;
  muted: string;
  mutedForeground: string;
}

/**
 * Generates a 50-950 color scale from a base color
 * Uses perceptual lightness adjustments for even visual steps
 */
export function generateColorScale(baseColor: string): ColorScale {
  const color = Color(baseColor);

  // For light colors (L > 50), we need to darken for higher numbers
  // For dark colors (L < 50), we need to lighten for lower numbers
  const lightness = color.lightness();
  const isLightBase = lightness > 50;

  if (isLightBase) {
    // Light base color - progressively darken
    return {
      50: color.lightness(95).hex(),
      100: color.lightness(90).hex(),
      200: color.lightness(80).hex(),
      300: color.lightness(70).hex(),
      400: color.lightness(60).hex(),
      500: baseColor,
      600: color.lightness(40).hex(),
      700: color.lightness(30).hex(),
      800: color.lightness(20).hex(),
      900: color.lightness(10).hex(),
      950: color.lightness(5).hex(),
    };
  } else {
    // Dark base color - progressively lighten for lower numbers
    return {
      50: color.lightness(95).hex(),
      100: color.lightness(90).hex(),
      200: color.lightness(80).hex(),
      300: color.lightness(65).hex(),
      400: color.lightness(45).hex(),
      500: baseColor,
      600: color.lightness(lightness - 10).hex(),
      700: color.lightness(lightness - 20).hex(),
      800: color.lightness(lightness - 30).hex(),
      900: color.lightness(Math.max(5, lightness - 40)).hex(),
      950: color.lightness(Math.max(2, lightness - 45)).hex(),
    };
  }
}

/**
 * Generates a neutral scale optimized for UI use
 * Maintains consistent contrast ratios for text/background combinations
 */
export function generateNeutralScale(baseColor: string): ColorScale {
  const color = Color(baseColor);

  return {
    50: color.lightness(98).saturate(0.05).hex(),
    100: color.lightness(96).saturate(0.05).hex(),
    200: color.lightness(91).saturate(0.05).hex(),
    300: color.lightness(84).saturate(0.07).hex(),
    400: color.lightness(64).saturate(0.08).hex(),
    500: color.lightness(45).saturate(0.1).hex(),
    600: color.lightness(32).saturate(0.1).hex(),
    700: color.lightness(25).saturate(0.12).hex(),
    800: color.lightness(15).saturate(0.15).hex(),
    900: color.lightness(10).saturate(0.2).hex(),
    950: color.lightness(4).saturate(0.25).hex(),
  };
}

/**
 * Default base colors for the Clarity Design System
 */
export const defaultBaseColors: BaseColors = {
  neutral: "#737373",
  primary: "#1A1A19",
  brand: "#FACC15",
  success: "#22C55E",
  warning: "#F59E0B",
  destructive: "#EF4444",
};

/**
 * Generates all color scales from base colors
 */
export function generateColorScales(baseColors: BaseColors) {
  return {
    neutral: generateNeutralScale(baseColors.neutral),
    primary: generateColorScale(baseColors.primary),
    brand: generateColorScale(baseColors.brand),
    success: generateColorScale(baseColors.success),
    warning: generateColorScale(baseColors.warning),
    destructive: generateColorScale(baseColors.destructive),
  };
}

/**
 * Maps semantic color tokens to numbered variants
 * This provides the bridge between semantic usage and numbered precision
 */
export function mapSemanticColors(scales: ReturnType<typeof generateColorScales>, isDark: boolean = false) {
  if (isDark) {
    return {
      // Dark theme mappings
      background: scales.neutral[900],
      foreground: scales.neutral[100],
      card: scales.neutral[800],
      cardForeground: scales.neutral[100],
      border: scales.neutral[700],
      input: scales.neutral[700],
      muted: scales.neutral[800],
      mutedForeground: scales.neutral[400],

      // Status colors remain vibrant
      destructive: scales.destructive[500],
      success: scales.success[500],
      warning: scales.warning[500],

      // Brand colors
      primary: scales.primary[100], // Inverted for dark theme
      brand: scales.brand[500],
    };
  } else {
    return {
      // Light theme mappings
      background: scales.neutral[100],
      foreground: scales.neutral[900],
      card: scales.neutral[50],
      cardForeground: scales.neutral[900],
      border: scales.neutral[200],
      input: scales.neutral[200],
      muted: scales.neutral[100],
      mutedForeground: scales.neutral[500],

      // Status colors
      destructive: scales.destructive[500],
      success: scales.success[500],
      warning: scales.warning[500],

      // Brand colors
      primary: scales.primary[500],
      brand: scales.brand[500],
    };
  }
}

/**
 * Generates CSS custom properties from color scales
 * Returns a string that can be injected into a style tag
 */
export function generateCSSVariables(baseColors: BaseColors, isDark: boolean = false): string {
  const scales = generateColorScales(baseColors);
  const semantic = mapSemanticColors(scales, isDark);

  let css = "";

  // Generate numbered scale variables
  Object.entries(scales).forEach(([name, scale]) => {
    Object.entries(scale).forEach(([number, color]) => {
      css += `  --${name}-${number}: ${color};\n`;
    });
  });

  // Generate semantic mappings
  css += "\n  /* Semantic Mappings */\n";
  Object.entries(semantic).forEach(([name, color]) => {
    const kebabName = name.replace(/([A-Z])/g, "-$1").toLowerCase();
    css += `  --${kebabName}: ${color};\n`;
  });

  return css;
}

/**
 * Theme presets with different base color combinations
 */
export const themePresets = {
  default: {
    name: "Default",
    colors: defaultBaseColors,
  },
  ocean: {
    name: "Ocean",
    colors: {
      neutral: "#64748B",
      primary: "#0F172A",
      brand: "#0EA5E9",
      success: "#10B981",
      warning: "#F59E0B",
      destructive: "#EF4444",
    },
  },
  forest: {
    name: "Forest",
    colors: {
      neutral: "#57534E",
      primary: "#1C1917",
      brand: "#16A34A",
      success: "#22C55E",
      warning: "#EAB308",
      destructive: "#DC2626",
    },
  },
  sunset: {
    name: "Sunset",
    colors: {
      neutral: "#78716C",
      primary: "#451A03",
      brand: "#F97316",
      success: "#16A34A",
      warning: "#FCD34D",
      destructive: "#E11D48",
    },
  },
  monochrome: {
    name: "Monochrome",
    colors: {
      neutral: "#6B7280",
      primary: "#111827",
      brand: "#374151",
      success: "#4B5563",
      warning: "#6B7280",
      destructive: "#1F2937",
    },
  },
};

/**
 * Utility to preview how colors will look in both themes
 */
export function previewTheme(baseColors: BaseColors) {
  const scales = generateColorScales(baseColors);
  const lightSemantic = mapSemanticColors(scales, false);
  const darkSemantic = mapSemanticColors(scales, true);

  return {
    scales,
    light: {
      semantic: lightSemantic,
      css: generateCSSVariables(baseColors, false),
    },
    dark: {
      semantic: darkSemantic,
      css: generateCSSVariables(baseColors, true),
    },
  };
}
