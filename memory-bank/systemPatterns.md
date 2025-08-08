# System Patterns

This document outlines the key architectural and design patterns employed in the Gen C Alpha codebase. Adhering to these patterns is crucial for maintaining a clean, scalable, and consistent application.

## 1. API Route Architecture: Microservices & Orchestrators

The backend API, located in `src/app/api/`, follows a microservice-inspired pattern.

- **Single Responsibility:** Each API route is designed to perform one specific, focused task (e.g., `fetch-videos`, `transcribe-video`, `resolve-instagram-id`).
- **Orchestrator Pattern:** For complex, multi-step workflows, an "orchestrator" route is created. This route does not contain business logic itself but instead calls the smaller, single-responsibility services in the correct order to fulfill the request.
  - **Example:** The `/api/creators/follow` route acts as an orchestrator. It calls services to resolve the user ID, fetch videos, process them, and store them in the database.
- **Directory Structure:** Services are organized by domain (e.g., `/api/creators/`, `/api/video/`). A complex action like `follow` has its logic broken down into files within its own directory (`/api/creators/follow/*.ts`).

## 2. Frontend Design: The "Clarity" Design System

All frontend components must strictly adhere to the "Clarity" Design System, which is enforced through a combination of CSS variables, Tailwind utility classes, and component composition.

- **Source of Truth:** `src/app/globals.css` contains all the core design tokens (colors, fonts, radii, shadows) as CSS variables.
- **Component Hierarchy:**
  1.  **Prioritize Existing Custom Components:** Always reuse components from `src/components/` and `src/app/(main)/dashboard/_components/`.
  2.  **Use Shadcn UI:** For new UI elements, use standard components from `@/components/ui`.
  3.  **Style with System Variables:** ALL styling (whether on custom or Shadcn components) MUST use the variables and utility classes derived from the design system (e.g., `bg-background`, `text-primary`, `rounded-[var(--radius-card)]`).
  4.  **Avoid Hardcoded Values:** Never use arbitrary values like `bg-blue-500` or `rounded-lg`.

## 3. Global Rate Limiting

To manage requests to external services (primarily RapidAPI), a global, queue-based rate limiter is implemented in `src/lib/global-rate-limiter.ts`.

- **Shared Queue:** A single instance, `rapidApiGlobalRateLimiter`, manages a queue for all outgoing RapidAPI calls, regardless of their origin (Instagram, TikTok, etc.).
- **Enforced Limit:** The queue processes requests at a rate of **1 request per second** to stay within RapidAPI's limits.
- **Wrapper Functions:** All external API calls must be wrapped in a helper function (e.g., `withGlobalInstagramRateLimit`, `withGlobalTikTokRateLimit`) which adds the operation to the global queue. This ensures compliance across the entire application.

## 4. Video Processing Pipeline

Video processing is a multi-step pipeline that leverages several key services.

1.  **Scraping (`UnifiedVideoScraper`):** `src/lib/unified-video-scraper.ts` is the single point of entry for fetching video metadata and stable CDN URLs from Instagram or TikTok.
2.  **Downloading & CDN Upload (`Bunny.net`):** Scraped video URLs are then passed to services that stream the content to Bunny.net CDN for reliable storage and playback.
3.  **Transcription (`Gemini`):** The video is transcribed asynchronously.
4.  **Analysis:** The resulting transcript is analyzed for script components (hook, etc.).
