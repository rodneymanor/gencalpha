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

## Frontend Navigation & Layout Patterns

- Ideas features are split into dedicated routes under `src/app/(main)/dashboard/ideas/` to reduce cognitive load:
  - `creators/` → discovery via `CreatorVideosGrid` with floating player
  - `idea-inbox/` → capture/organize via `DailyIdeaInboxSection`
  - `ghostwriter/` → script generation reusing `AIGhostwriterPage`
- Sidebar includes a distinct “Ideas” group linking to each page, using `lucide-react` icons.
- Write page remains focused (no combined Ideas section).

## Chat → Editor Routing Pattern (New)

- Structured AI outputs (scripts, analysis, hooks) are not appended to the chat thread.
- Instead, the chat dispatches a DOM CustomEvent `write:editor-set-content` with `{ markdown?: string, blocks?: PartialBlock[] }`.
- `SlideoutWrapper` listens for this event to open the slideout; `MinimalSlideoutEditor` listens to replace content.
- The editor supports two input modes: serialized BlockNote blocks or a small markdown subset mapped to headings/paragraphs/bullets.
- Conversational text and errors remain in the main chat for readability.

## Write Chat Refactor Pattern (Phase 1)

- Replace magic control tokens with constants in `src/components/write-chat/constants.ts`:
  - `ACK_LOADING`, `VIDEO_ACTIONS`, `EMULATE_INPUT`
- Centralize timing constants `ACK_BEFORE_SLIDE_MS`, `SLIDE_DURATION_MS` in the same module.
- Co-locate UI-agnostic helpers:
  - `sendToSlideout`, `delay`, `removeAckLoader` in `utils.ts`
  - `startAckWithLoader`, `finishAndRemoveLoader` in `ack-helpers.ts`
  - HTTP helpers under `src/lib/http/` and video resolver under `src/lib/video/`
- Keep stateful logic in the main component; extracted modules remain pure and side-effect free.

## Clarity Design System Enforcement

- Remove ad-hoc focus rings in contexts like idea mode; rely on `ring-ring` tokens only when needed.
- Hide persona buttons when idea mode is active to prevent mode conflicts; restore when off.
- Use semantic classes and variables for spacing, radius, and shadows; submit buttons standardized to `size-8` and `ArrowUp` icon.

## Background Processing

- Use `setTimeout` for non-blocking background tasks where applicable.
- Prefer `Promise.allSettled` for independent operations to increase resilience.

## Error Handling

- Return structured JSON with clear `error` messages and HTTP status codes.
- Log with emoji prefixes for quick scanning in logs.
