# Active Context

This document tracks the current focus of development, recent changes, and immediate next steps. It is the most frequently updated file in the Memory Bank.

_Last Updated: 2025-08-13_

## 1. Current Focus

- Streamlining the Write Chat experience by routing structured AI outputs (scripts, analysis, hooks) into the slideout BlockNote editor, while keeping conversational text in the chat thread.
- Maintaining strict adherence to the Clarity Design System across new routes and interactions (spacing, radii, rings, shadows).

## 2. Recent Changes

- Implemented event-driven chat-to-editor architecture:
  - Global event `write:editor-set-content` carries `{ markdown?, blocks? }`.
  - `MinimalSlideoutEditor` listens to the event and replaces content; adds minimal markdown→blocks mapping.
  - `SlideoutWrapper` opens the slideout when the event is received.
  - `ClaudeChat` dispatches structured results (script/analysis/hooks) to the editor instead of posting to chat.
- Minor spacing/class refinements to comply with Clarity and spacing grid.

- Phase 1 refactor for `write-chat`:
  - Extracted constants, types, and helpers to reduce `claude-chat.tsx` size and duplication:
    - `src/components/write-chat/constants.ts` — ACK tokens and timing constants
    - `src/components/write-chat/types.ts` — `ChatMessage` and token types
    - `src/components/write-chat/utils.ts` — `sendToSlideout`, `delay`, `removeAckLoader`
    - `src/components/write-chat/ack-helpers.ts` — `startAckWithLoader`, `finishAndRemoveLoader`
    - `src/lib/http/auth-headers.ts` — `buildAuthHeaders`
    - `src/lib/http/post-json.ts` — `postJson<T>`
    - `src/lib/video/ensure-resolved.ts` — `ensureResolved`
  - Replaced magic strings with constants for system message tokens
  - Removed dead code and normalized repeated filters

- Phase 2 refactor for `write-chat` (presentational extraction):
  - Added `messages/AckLoader.tsx`, `messages/VideoActionsPanel.tsx`, `messages/EmulateInputPanel.tsx`
  - Replaced inline JSX branches in `claude-chat.tsx` with these components, passing callbacks via props

## 3. Immediate Next Steps

- Add optional toolbar actions on slideout editor: Copy/Publish pipeline and status toasts.
- Consider persisting slideout editor state to notes or drafts.
- Evaluate mobile spacing for the slideout editor (`px-11` → `px-6 md:px-11`).
- Phase 2: extract presentational components (`VideoActionsPanel`, `AckLoader`, `EmulateInputPanel`) and optional hooks (`useUrlDetection`).

## 4. Open Questions / Known Issues

- Simple markdown mapper is minimal; may need richer list/blockquote/code support.
