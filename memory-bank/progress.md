# Project Progress

This document provides a high-level overview of the project's status, tracking what is complete, what is in progress, and what remains to be done.

_Last Updated: 2025-08-13_

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
- **UI/Navigation:**
  - Added Ideas group to sidebar with routes for Creators, Idea Inbox, and Ghostwriter under `dashboard/ideas/`.
  - Write Chat: idea mode hides assistant buttons, removes focus ring; submit buttons use `ArrowUp` icon and `size-8`.
  - New event-driven routing for structured AI results to the slideout BlockNote editor; conversational text remains in chat.
  - Refactor Phase 1: safe extraction of helpers/constants/types for `write-chat` to reduce complexity and duplication.
  - Refactor Phase 2: extracted presentational components for loader, video actions, and emulate input panel.
- **Assistant System Migration:**
  - Complete migration from "Personas" to "Assistants" terminology
  - Updated all TypeScript types, component names, API parameters, and user-facing text
  - Maintained backwards compatibility with legacy `persona` URL parameter
  - Five AI assistants available: Scribo, MiniBuddy, StoryBuddy, HookBuddy, and Value Bomb (MVBB)

## 2. In Progress / Needs Validation

- **End-to-End Extension Calls:** Validate each endpoint from a background script using API key on dev (`http://localhost:3000`).
- **Add Video to Collection (By Title):** Confirm auto-create of collection if title doesn’t exist, then forwarding to `add-video-to-collection` succeeds.
- **Ideas Pages & Slideout QA:** Verify Ideas pages and the new chat→editor routing for spacing, accessibility (focus states), and responsive behavior.

## 3. To-Do / Not Started

- **Chrome Extension Sub-App:**
  - Scaffold `chrome-extension/` using WXT.
  - Implement options page (store API key + base URL).
  - Implement background client utilities and popup quick actions.
  - Implement context menu to auto-capture tab title/URL into idea inbox.
  - Add README and build scripts.
- **Optional Auth:** Add Firebase sign-in to extension later (Google, Email/Password).
- **Feature Flags:** Introduce gating for Ideas pages in a later release if needed.

## 4. Known Issues / Blockers

- None specific to the new extension endpoints. Continue observing creator follow Firestore permissions if encountered.
