# System Patterns

This document describes architectural patterns and key decisions.

## API Architecture

- **Microservice-style routes:** Individual routes handle a single responsibility; orchestrator routes coordinate multi-step workflows.
- **Video ingestion:** Uses `UnifiedVideoScraper` for TikTok/Instagram metadata and direct URLs, with Bunny upload services for streaming.
- **Dual Authentication:** `authenticateApiKey(request)` first checks `x-api-key`/`Authorization: Bearer <API_KEY>`; if not present, falls back to Firebase ID Token in `Authorization: Bearer <ID_TOKEN>`.

## Chrome Extension API Consolidation

- All extension-facing routes live under `src/app/api/chrome-extension/` to avoid duplication and keep a stable surface for extension clients:
  - `collections` (GET/POST proxy to core)
  - `collections/add-video` (by URL + collection title)
  - `creators/add` (forwards to follow orchestrator)
  - `idea-inbox/text` and `idea-inbox/video` (notes via `notesService`, video validated/scraped by `UnifiedVideoScraper`)
- Responses follow `{ success: boolean, ... }` with friendly error messages.
- Extension v1 uses API key only; server remains dual-auth capable for future Firebase tokens.

## Background Processing

- Use `setTimeout` for non-blocking background tasks where applicable.
- Prefer `Promise.allSettled` for independent operations to increase resilience.

## Error Handling

- Return structured JSON with clear `error` messages and HTTP status codes.
- Log with emoji prefixes for quick scanning in logs.
