# Project Progress

This document provides a high-level overview of the project's status, tracking what is complete, what is in progress, and what remains to be done.

_Last Updated: 2025-08-09_

## 1. What Works / Completed

- **User Authentication:** Core user sign-up and login flow is functional via Firebase. Server endpoints also support API key auth.
- **Creator Following Workflow:**
  - The `/api/creators/follow` endpoint performs full follow orchestration and video ingestion.
- **Video Processing (Core):**
  - `UnifiedVideoScraper` scrapes video metadata and CDN URLs from Instagram and TikTok.
  - Videos upload to Bunny.net for streaming.
- **Chrome Extension API Surface:**
  - `api/chrome-extension/collections` (GET/POST)
  - `api/chrome-extension/collections/add-video` (POST)
  - `api/chrome-extension/creators/add` (POST)
  - `api/chrome-extension/idea-inbox/text` (POST)
  - `api/chrome-extension/idea-inbox/video` (POST)

## 2. In Progress / Needs Validation

- **End-to-End Extension Calls:** Validate each endpoint from a background script using API key on dev (`http://localhost:3000`).
- **Add Video to Collection (By Title):** Confirm auto-create of collection if title doesn’t exist, then forwarding to `add-video-to-collection` succeeds.

## 3. To-Do / Not Started

- **Chrome Extension Sub-App:**
  - Scaffold `chrome-extension/` using WXT.
  - Implement options page (store API key + base URL).
  - Implement background client utilities and popup quick actions.
  - Implement context menu to auto-capture tab title/URL into idea inbox.
  - Add README and build scripts.
- **Optional Auth:** Add Firebase sign-in to extension later (Google, Email/Password).

## 4. Known Issues / Blockers

- None specific to the new extension endpoints. Continue observing creator follow Firestore permissions if encountered.
