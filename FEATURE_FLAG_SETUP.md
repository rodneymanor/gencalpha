# PostHog Feature Flag Implementation - Creators Page

## Overview
This document describes the implementation of the `creators_page` feature flag that controls the visibility and accessibility of the Creators page in the application.

## Implementation Details

### 1. PostHog Setup
- **Dependencies**: `posthog-js` and `posthog-node` have been installed
- **Provider**: `PostHogProvider` wraps the entire application in `src/app/layout.tsx`
- **Configuration**: Environment variables in `.env.local`:
  - `NEXT_PUBLIC_POSTHOG_KEY`: Your PostHog project key
  - `NEXT_PUBLIC_POSTHOG_HOST`: PostHog host (default: https://app.posthog.com)

### 2. Feature Flag Hook
- **Location**: `src/hooks/use-feature-flag.ts`
- **Main Hook**: `useFeatureFlag(flagKey: string)` - generic hook for any feature flag
- **Specific Hooks**: 
  - `useCreatorsPageFlag()` - specifically for the creators page flag
  - `useGhostWriterFlag()` - specifically for the ghost writer feature flag
  - `useIdeaInboxFlag()` - specifically for the idea inbox feature flag

### 3. Sidebar Integration
- **Dynamic Items**: `src/navigation/sidebar/dynamic-sidebar-items.tsx` contains the logic that conditionally includes menu items based on feature flags
- **Hook Usage**: The `useDynamicSidebarItems()` hook checks all feature flags and includes/excludes menu items and entire sections accordingly
- **Smart Section Management**: The entire "Ideas" section is hidden if no idea-related features are enabled

### 4. Route Protection
- **Creators Page Protection**: The creators page (`src/app/(main)/dashboard/ideas/creators/page.tsx`)
- **Ghost Writer Page Protection**: The ghost writer page (`src/app/(main)/dashboard/ideas/ghostwriter/page.tsx`)
- **Idea Inbox Page Protection**: The idea inbox page (`src/app/(main)/dashboard/ideas/idea-inbox/page.tsx`)
- **All protected pages**:
  - Check their respective feature flags on component mount
  - Redirect to `/dashboard` if the flag is disabled
  - Return `null` if the flag is disabled (prevents rendering)

## Feature Flag Keys

### Creators Page Flag
- **Flag Name**: `creators_page`
- **Type**: Boolean
- **Default Behavior**: When disabled, the Creators page is hidden from sidebar, write page cards, slideout tabs, and not accessible via direct URL

### Ghost Writer Flag  
- **Flag Name**: `ghost_writer`
- **Type**: Boolean
- **Default Behavior**: When disabled, the Ghost Writer page is hidden from sidebar, write page cards, slideout tabs, and not accessible via direct URL

### Idea Inbox Flag
- **Flag Name**: `idea_inbox`
- **Type**: Boolean  
- **Default Behavior**: When disabled, the Idea Inbox page is hidden from sidebar, write page cards, slideout tabs, and not accessible via direct URL
- **Section Impact**: If all idea-related features are disabled, the entire "Ideas" sidebar section is hidden

## Usage Examples

### Checking Feature Flags in Components
```tsx
import { useCreatorsPageFlag, useGhostWriterFlag, useIdeaInboxFlag } from "@/hooks/use-feature-flag";

function MyComponent() {
  const isCreatorsEnabled = useCreatorsPageFlag();
  const isGhostWriterEnabled = useGhostWriterFlag();
  const isIdeaInboxEnabled = useIdeaInboxFlag();
  
  return (
    <div>
      {isCreatorsEnabled && <CreatorsLink />}
      {isGhostWriterEnabled && <GhostWriterLink />}
      {isIdeaInboxEnabled && <IdeaInboxLink />}
    </div>
  );
}
```

### Generic Feature Flag Usage
```tsx
import { useFeatureFlag } from "@/hooks/use-feature-flag";

function MyComponent() {
  const isNewFeatureEnabled = useFeatureFlag("new_feature_key");
  
  return isNewFeatureEnabled ? <NewFeature /> : <OldFeature />;
}
```

## Testing
1. Set `NEXT_PUBLIC_POSTHOG_KEY` in your `.env.local` file
2. Create the feature flags in your PostHog dashboard:
   - `creators_page` (boolean)
   - `ghost_writer` (boolean)
   - `idea_inbox` (boolean)
3. Toggle the flags on/off to see the menu items appear/disappear in the sidebar and write page
4. Test direct URL access:
   - `/dashboard/ideas/creators` should redirect to `/dashboard` when `creators_page` is disabled
   - `/dashboard/ideas/ghostwriter` should redirect to `/dashboard` when `ghost_writer` is disabled
   - `/dashboard/ideas/idea-inbox` should redirect to `/dashboard` when `idea_inbox` is disabled
5. Test write page cards and slideout tabs behavior with different flag combinations
6. Test sidebar section behavior: entire "Ideas" section should disappear when all idea-related flags are disabled

## Environment Setup
Make sure your `.env.local` contains:
```
NEXT_PUBLIC_POSTHOG_KEY=your_actual_posthog_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## Benefits
- **Gradual Rollout**: Enable the feature for specific users or percentages
- **A/B Testing**: Test different user experiences
- **Quick Rollback**: Instantly disable the feature if issues arise
- **No Deployment**: Toggle features without code changes