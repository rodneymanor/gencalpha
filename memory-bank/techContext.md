# Tech Context: Gen C Alpha

This document provides an overview of the technologies, tools, and configurations used in the project.

## 1. Core Technologies

- **Next.js 15 (App Router):** The foundation of the application. We utilize the App Router for server components, API routes, and file-based routing.
- **TypeScript:** All code is written in TypeScript to ensure type safety and maintainability. Strict mode is enabled.
- **React:** For building the user interface.
- **Tailwind CSS v4:** For all styling, used in conjunction with the "Clarity" Design System.
- **Firebase:**
  - **Authentication:** Manages user sign-up, sign-in, and session management.
  - **Firestore:** Used as the primary database for storing application data like user profiles, followed creators, and video metadata.
  - **Admin SDK:** Used in backend services for privileged database operations.

## 2. Key Libraries & Services

- **Shadcn UI:** The base component library, providing accessible and unstyled components that we style according to our design system. Located in `@/components/ui`.
- **Lucide React:** The exclusive icon library for the project.
- **Bunny.net:**
  - **Stream:** Used for hosting, transcoding, and streaming video content.
  - **CDN:** Provides fast, global delivery of video assets.
- **RapidAPI:** Used as a gateway to the "Instagram API Fast and Reliable Data Scraper" for fetching Instagram user and video data.
- **Apify:** Used for more complex scraping tasks, particularly for TikTok.
- **Gemini (Google AI):** The engine used for video transcription.
- **`ts-node`:** Used for running TypeScript scripts, such as theme generation.
- **`husky` & `lint-staged`:** Enforce code quality via pre-commit hooks, running ESLint and Prettier.
- **Chrome Extension Tooling (Planned):**
  - **WXT** for MV3 extension scaffolding and build (`chrome-extension/` sub-app).

## 3. Development Environment

- **Package Manager:** `npm` is the standard for managing dependencies.
- **Linting:** ESLint is configured with a strict ruleset, including rules for import order and complexity.
- **Formatting:** Prettier is used for automatic code formatting.
- **Environment Variables:** All sensitive keys (Firebase credentials, RapidAPI keys, etc.) are managed through a `.env.local` file. The application is designed to run on Vercel, which uses its own environment variable management system.
- **Extension Environments:**
  - **Dev Base URL:** `http://localhost:3000`
  - **Prod Base URL:** `https://gencpro.app`
  - Auth from extension v1 uses API key stored in `chrome.storage.sync`.

## 4. Code Structure & Conventions

- **`src/app/`:** Contains all pages and API routes.
  - **`(main)/`:** Groups all authenticated application pages.
  - **`api/`:** Contains all backend API routes, structured by domain.
- **`src/components/`:** Contains all shared React components.
  - **`ui/`:** Houses the base Shadcn UI components.
- **`src/lib/`:** Contains shared utilities, services, and libraries (e.g., `firebase-admin.ts`, `unified-video-scraper.ts`, `global-rate-limiter.ts`).
- **`src/styles/`:** Contains global styles and design system definitions.
- **`memory-bank/`:** The location for all project documentation and context files.
- **Path Aliases:** The project uses path aliases (e.g., `@/components`, `@/lib`) configured in `tsconfig.json` for cleaner import statements.
