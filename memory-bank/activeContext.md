# Active Context

This document tracks the current focus of development, recent changes, and immediate next steps. It is the most frequently updated file in the Memory Bank.

_Last Updated: 2025-01-14_

## 1. Current Focus

- Completed migration from "Personas" to "Assistants" terminology throughout the application
- Maintaining strict adherence to the Clarity Design System across new routes and interactions (spacing, radii, rings, shadows).

## 2. Recent Changes

- **Complete Persona to Assistant Migration:**
  - Renamed `PersonaType` to `AssistantType` across all TypeScript interfaces
  - Updated `PersonaSelector` component to `AssistantSelector` with all internal references
  - Migrated API routes from `persona` parameter to `assistant` parameter
  - Updated `PERSONA_PROMPTS` to `ASSISTANT_PROMPTS` in backend
  - ~~Maintained backwards compatibility by supporting legacy `persona` URL parameter~~ **REMOVED**
  - Updated all user-facing text and variable names from "persona" to "assistant"
  - **Removed backwards compatibility** to free up "Personas" term for new feature

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

- **Critical Auth Flow Simplification for Production Stability:**
  - **Removed global loading gate** that was blocking entire app during auth initialization
  - **Eliminated forced page reloads** that could cause infinite loops in production
  - **Simplified version checking** to clear cache without reloading page
  - **Made auth initialization resilient** to API failures and network issues
  - **Created `useAuthLoading` hook** for components needing individual loading states
  - **Fixed Vercel deployment issues** by ensuring auth flow never gets stuck

## 3. Immediate Next Steps

- Test the simplified authentication flow in production deployment
- Verify environment variables are properly set in Vercel
- Monitor auth initialization performance and error rates
- Add optional toolbar actions on slideout editor: Copy/Publish pipeline and status toasts.

## 4. Open Questions / Known Issues

- Simple markdown mapper is minimal; may need richer list/blockquote/code support.
