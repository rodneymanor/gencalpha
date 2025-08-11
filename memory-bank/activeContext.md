# Active Context

This document tracks the current focus of development, recent changes, and immediate next steps. It is the most frequently updated file in the Memory Bank.

_Last Updated: 2025-08-11_

## 1. Current Focus

- Simplifying the Write experience and reducing cognitive load by splitting Ideas features into dedicated pages under `dashboard/ideas/` using the dashboard layout.
- Maintaining strict adherence to the Clarity Design System across new routes and interactions (spacing, radii, rings, shadows).

## 2. Recent Changes

- Created separate Ideas routes under `dashboard/ideas/`:
  - `creators` (uses `CreatorVideosGrid` with floating player)
  - `idea-inbox` (uses `DailyIdeaInboxSection`)
  - `ghostwriter` (reuses `AIGhostwriterPage`)
- Added a new “Ideas” group to the sidebar with links to the above pages.
- Removed the combined Ideas section from `write/page.tsx` to keep the Write page focused.
- In Write Chat, removed the focus ring in idea mode and hid persona buttons during idea mode; updated submit icon to `ArrowUp` and set buttons to `size-8`.

## 3. Immediate Next Steps

- Add route-level docs or help text sections for each Ideas page to clarify purpose.
- Evaluate if the existing Ghostwriter page should be moved fully under `ideas/` in the future for consistency (currently reused in-place).
- Plan feature flags for gating Ideas pages in a later release.

## 4. Open Questions / Known Issues

- None specific to the new Ideas routes. Monitor navigation discoverability and spacing consistency across pages.
