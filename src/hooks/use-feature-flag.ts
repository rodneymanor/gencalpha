"use client";

/**
 * Custom hook to check if a feature flag is enabled
 * PostHog disabled - all feature flags return false
 * @param flagKey - The feature flag key (unused)
 * @returns always false since PostHog is disabled
 */
export function useFeatureFlag(flagKey: string): boolean {
  // PostHog disabled - return false for all feature flags
  return false;
}

/**
 * Specific feature flag hooks for type safety and better developer experience
 */
export const useCreatorsPageFlag = () => useFeatureFlag("creators_page");
export const useGhostWriterFlag = () => useFeatureFlag("ghost_writer");
export const useIdeaInboxFlag = () => useFeatureFlag("idea_inbox");
export const useBrandToolbarFlag = () => useFeatureFlag("brand_toolbar");
export const useBrandSettingsFlag = () => true; // Enabled for brand settings modal
export const useThemeChooserFlag = () => useFeatureFlag("theme_chooser");

// Add more feature flag hooks as needed
// export const useOtherFeatureFlag = () => useFeatureFlag("other_feature");
