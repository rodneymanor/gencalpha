# Project Progress

This document provides a high-level overview of the project's status, tracking what is complete, what is in progress, and what remains to be done.

_Last Updated: 2023-10-27_

## 1. What Works / Completed

- **User Authentication:** Core user sign-up and login flow is functional via Firebase.
- **Creator Following Workflow:**
  - The `/api/creators/follow` endpoint successfully follows a creator.
  - It correctly detects the platform (Instagram/TikTok).
  - It resolves the Instagram username to a user ID.
  - It fetches the 10 most recent videos for the creator.
- **Video Processing (Core):**
  - `UnifiedVideoScraper` can successfully scrape video metadata and stable CDN URLs from Instagram and TikTok.
  - Videos are successfully uploaded to Bunny.net for streaming.
  - Thumbnails are extracted and uploaded.
- **Global Rate Limiting:** A robust, queue-based rate limiter is in place for all RapidAPI calls, preventing `429` errors by enforcing a 1 req/sec limit across all routes.
- **Modular API Architecture:** The `follow` creator workflow has been successfully refactored into a microservice-style architecture with an orchestrator, serving as a pattern for future backend development.

## 2. In Progress / Needs Validation

- **End-to-End Follow Workflow:** While the individual pieces of the follow workflow are complete, the entire flow needs to be tested end-to-end to ensure there are no broken links in the chain, especially after the recent refactoring. The `permission-denied` error from Firestore when creating a creator profile needs to be investigated.
- **Rate Limiter Efficacy:** The new global rate limiter needs to be monitored under load to confirm it behaves as expected and completely eliminates API-side rate limit errors.

## 3. To-Do / Not Started

- **Fix `rate-limiting.ts`:** The file `src/lib/rate-limiting.ts` is currently unused and has multiple linter errors. A decision needs to be made:
  - **Option A:** Fix the TypeScript errors and integrate this Firestore-based limiter.
  - **Option B:** Delete the file and commit to using the simpler, in-memory `global-rate-limiter.ts`.
- **UI for Creator Management:** Build the frontend components to display followed creators and their videos.
- **Full Scraper Integration:** Ensure all video ingestion paths (e.g., from a pasted URL, not just the follow workflow) exclusively use the `UnifiedVideoScraper`.
- **Error Handling & UI Feedback:** Improve error handling across the application, providing clear, user-friendly feedback in the UI when backend operations fail.
- **Dashboard Widgets:** Develop the various widgets and pages for the main dashboard (AI Ghostwriter, CRM, etc.).

## 4. Known Issues / Blockers

- **Firestore Permissions Error:** The logs show a `Missing or insufficient permissions` error when `CreatorService.createOrUpdateCreator` is called. This is a critical blocker for the creator following feature and needs to be investigated. It likely points to a misconfiguration in Firestore security rules.
- **`processInstagramVideosWithImmediateDownload` Redundancy:** This function still exists in `process-videos.ts` and represents a slightly different logic path than the main `processVideosWithBunnyUpload` flow. This creates complexity and should be consolidated.
