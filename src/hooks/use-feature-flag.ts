"use client";

import { useFeatureFlagEnabled } from "posthog-js/react";

/**
 * Custom hook to check if a feature flag is enabled
 * @param flagKey - The feature flag key from PostHog
 * @returns boolean indicating if the flag is enabled
 */
export function useFeatureFlag(flagKey: string): boolean {
  const isEnabled = useFeatureFlagEnabled(flagKey);

  // Default to false if PostHog is not initialized or flag is undefined
  return isEnabled ?? false;
}

/**
 * Specific feature flag hooks for type safety and better developer experience
 */
export const useCreatorsPageFlag = () => useFeatureFlag("creators_page");
export const useGhostWriterFlag = () => useFeatureFlag("ghost_writer");
export const useIdeaInboxFlag = () => useFeatureFlag("idea_inbox");
export const useBrandToolbarFlag = () => useFeatureFlag("brand_toolbar");
export const useBrandSettingsFlag = () => useFeatureFlag("brand_settings");
export const useThemeChooserFlag = () => useFeatureFlag("theme_chooser");

// Add more feature flag hooks as needed
// export const useOtherFeatureFlag = () => useFeatureFlag("other_feature");
