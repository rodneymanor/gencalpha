# Active Context

This document tracks the current focus of development, recent changes, and immediate next steps. It is the most frequently updated file in the Memory Bank.

_Last Updated: 2023-10-27_

## 1. Current Focus

The primary focus is on **refining and stabilizing the backend services**, particularly those related to content ingestion from social media platforms. We are moving from monolithic, complex API routes to a more modular, microservice-style architecture.

## 2. Recent Changes

- **Refactored `/api/creators/follow`:**
  - The large, complex `route.ts` file was broken down into smaller, single-responsibility modules located in the `/api/creators/follow/` directory.
  - New modules include `platform-detection.ts`, `instagram.ts`, `fetch-videos.ts`, and `process-videos.ts`.
  - The main `route.ts` now acts as an orchestrator, calling these modules in sequence.
- **Integrated `UnifiedVideoScraper`:**
  - The `process-videos.ts` module was updated to use the `UnifiedVideoScraper` to fetch stable CDN URLs and rich metadata, replacing the previous manual extraction logic.
- **Implemented Global RapidAPI Rate Limiting:**
  - A global, queue-based rate limiter was implemented in `src/lib/global-rate-limiter.ts`.
  - All Instagram and TikTok RapidAPI calls are now routed through a single queue, enforced at 1 request per second across the entire application to prevent `429 Too Many Requests` errors.
- **Fixed `extractLowestQualityFromDashManifest` Reference Error:**
  - The `processInstagramVideosWithImmediateDownload` function in `process-videos.ts` was calling a function that hadn't been imported. This has been fixed by re-importing `extractLowestQualityFromDashManifest` from `./dash-parser`.

## 3. Immediate Next Steps

- **Full Memory Bank Initialization:** Complete the creation of all core Memory Bank files (`techContext.md`, `progress.md`).
- **Validate Rate Limiting:** Although the code is in place, we need to monitor the logs to ensure the global rate limiter is effectively preventing API errors during heavy use.
- **Address `rate-limiting.ts` Linter Errors:** The file `src/lib/rate-limiting.ts` has several TypeScript errors (missing type definitions, implicit `any`). These need to be resolved or the file should be removed if it's deprecated.

## 4. Open Questions / Known Issues

- The purpose of `src/lib/rate-limiting.ts` is unclear. It seems to be a separate, more complex, Firestore-based rate limiting system that is not currently in use and has linter errors. We need to decide whether to fix it, integrate it, or delete it in favor of the simpler, in-memory `src/lib/global-rate-limiter.ts`.
- The `follow` workflow still has a separate `processInstagramVideosWithImmediateDownload` path. We should evaluate if this can be fully merged into the `processVideosWithBunnyUpload` path that uses the `UnifiedVideoScraper`, simplifying the logic further.
