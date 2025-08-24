Migrate to cleaner app

App Reorganization Plan - Safe Stages

  Current Issues Identified:

  - Duplicate script components (3 different script
  panel implementations)
  - Test pages mixed with main app (test-* pages in
  app directory)
  - Overlapping functionality (video analysis in
  multiple places)
  - Inconsistent naming (standalone, write-chat,
  script-writing)
  - Deep nesting without clear domain boundaries

  Stage 1: Clean Up Test Pages (Low Risk)

  1. Create /src/app/(test)/ route group
  2. Move all test-* pages into (test) group
  3. This isolates test routes without breaking 
  anything

  Stage 2: Consolidate Script Features (Medium Risk)

  Current duplicates:
  - script-panel/ (display scripts)
  - script-writing/ (edit scripts)
  - editor/ (multiple editors)

  Plan:
  1. Create /src/features/script/ directory
  2. Merge into unified components:
     - ScriptDisplay (from script-panel)
     - ScriptEditor (best from editor/)
     - ScriptChat (from enhanced-panel)
  3. Keep old components temporarily with deprecation
   notices

  Stage 3: Feature-Based Architecture (Medium Risk)

  /src/features/
  ├── video/
  │   ├── components/
  │   ├── hooks/
  │   └── services/
  ├── script/
  │   ├── components/
  │   ├── hooks/
  │   └── services/
  ├── chat/
  │   ├── components/
  │   ├── hooks/
  │   └── services/
  └── analytics/
      ├── components/
      └── hooks/

  Stage 4: Consolidate Video Features (High Risk)

  Current duplicates:
  - video-insights/
  - video-insights-panel/
  - standalone/social-media-video-analyzer/
  - video/

  Plan:
  1. Create /src/features/video/
  2. Merge analyzer components
  3. Single video context provider
  4. Deprecate old components

  Stage 5: Clean Component Library (Low Risk)

  /src/components/
  ├── ui/          (keep - design system)
  ├── layout/      (new - headers, sidebars)
  └── shared/      (new - cross-feature components)

  Move feature-specific components to /features/

  Stage 6: Consolidate State Management (High Risk)

  Current contexts scattered - consolidate to:
  /src/stores/
  ├── video-store.ts
  ├── script-store.ts
  ├── auth-store.ts
  └── ui-store.ts

  Use Zustand or similar for cleaner state

  Safe Migration Strategy:

  1. Create parallel structure - Don't delete
  anything initially
  2. Add deprecation comments - Mark old components
  3. Update imports gradually - One feature at a time
  4. Test each stage - Ensure nothing breaks
  5. Remove old code - Only after new structure is
  stable

  Priority Order:

  1. Stage 1 - Quick win, no risk
  2. Stage 5 - Clean up obvious shared components
  3. Stage 2 - Fix script duplication (biggest pain
  point)
  4. Stage 3 - Establish feature pattern
  5. Stage 4 - Video consolidation
  6. Stage 6 - State management (optional)

⏺ Update Todos
  ⎿  ☒ Analyze current app structure and features
     ☒ Create reorganization plan

⏺ This staged approach lets you reorganize
  incrementally without breaking the app. Start with
  Stage 1 (test pages) - it's risk-free and cleans up
   your app structure immediately.

KK8WcRfMDk2VbgcFKk5zRTUNsMKfs6J7