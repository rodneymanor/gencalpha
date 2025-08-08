# Project Brief: Gen C Alpha - AI Script Writing App

This document outlines the core mission, features, and technical foundations for the Gen C Alpha project. It serves as the foundational guide for all development and decision-making.

## 1. Core Mission

To create a best-in-class, AI-powered script writing application that helps content creators streamline their workflow, from idea generation to final script. The application must provide a beautiful, consistent, and intuitive user experience, guided by the "Clarity" Design System.

## 2. Key Features

- **AI Ghostwriter:** Core feature for generating and refining script content.
- **Content Sourcing:**
  - Follow creators on Instagram and TikTok to import their latest videos.
  - Scrape video content from URLs (TikTok, Instagram).
  - Unified video scraper for consistent data extraction.
- **Video Processing & Management:**
  - Download and transcode videos from various platforms.
  - Upload and stream videos via Bunny.net CDN.
  - Transcription services (Gemini).
  - AI-driven script analysis (hook, bridge, nugget, etc.).
- **Creator CRM:** Manage followed creators and their content.
- **Dashboard & UI:**
  - A comprehensive dashboard for managing all features.
  - UI must strictly adhere to the "Clarity" Design System defined in `src/app/globals.css`.
  - Component-based architecture using Next.js and Shadcn UI.

## 3. Technical Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 with a custom "Clarity" Design System.
- **UI Components:** Shadcn UI, Lucide Icons.
- **Backend:** Next.js API Routes, Firebase (Auth, Firestore).
- **Video:** Bunny.net (Streaming, CDN), Gemini (Transcription).
- **Scraping:** Apify, RapidAPI (for Instagram).

## 4. Architectural Principles

- **API Design:** Microservice-oriented architecture for API routes. Each route should have a single responsibility (e.g., `follow-creator`, `fetch-videos`). Orchestrator patterns should be used for complex workflows.
- **Frontend Design:** Strict adherence to the "Clarity" Design System. Prioritize existing components, then Shadcn UI, then custom Tailwind, always using design system variables (`globals.css`).
- **Rate Limiting:** A global, queue-based rate limiter must be used for all external API calls (especially RapidAPI) to prevent hitting rate limits.
- **Git Workflow:** Independent, descriptive commits for each major change, pushed directly to the main branch.

This brief is the source of truth for the project's scope and goals. All other Memory Bank documents build upon this foundation.
