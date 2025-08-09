# Active Context

This document tracks the current focus of development, recent changes, and immediate next steps. It is the most frequently updated file in the Memory Bank.

_Last Updated: 2025-08-09_

## 1. Current Focus

- Building a minimal, low-debt Chrome extension that integrates with our backend via dedicated endpoints under `src/app/api/chrome-extension/`.
- Initial authentication strategy for the extension is API key only (dual auth supported server-side for future Firebase tokens).

## 2. Recent Changes

- Added consolidated Chrome extension endpoints:
  - `api/chrome-extension/collections` (GET/POST proxy to core collections)
  - `api/chrome-extension/collections/add-video` (POST: add video by URL + collection title)
  - `api/chrome-extension/creators/add` (POST: full follow + video fetch via existing orchestrator)
  - `api/chrome-extension/idea-inbox/text` (POST: create note with `type: "idea_inbox"`, `source: "inbox"`)
  - `api/chrome-extension/idea-inbox/video` (POST: validate/scrape TikTok/Instagram with `UnifiedVideoScraper`, store original URL + metadata as idea note)
- All endpoints support API key and Firebase ID token, but extension v1 will use API key only.

## 3. Immediate Next Steps

- Scaffold `chrome-extension/` sub-app in this repo using WXT (MV3 + TS):
  - Options page to store API key and base URL (dev: `http://localhost:3000`, prod: `https://gencpro.app`).
  - Background service with small API client calling the new endpoints.
  - Popup with quick actions: add text idea, add video idea, add creator, list/create collections, add video to collection.
  - Context menu: auto-capture current tab title/URL and save to idea inbox.
- Document usage in a `chrome-extension/README.md` and add scripts for dev/build.

## 4. Open Questions / Known Issues

- None for the extension v1; Firebase sign-in can be added later without changing the server endpoints (already dual-auth capable).
- Continue to monitor creator follow flow for Firestore permissions if surfaced during extension usage.
