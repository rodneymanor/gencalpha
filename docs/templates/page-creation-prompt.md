# Centered Page Template Creation Prompt

Use this prompt to create new pages that follow the **Collections page design pattern** with perfect centering, responsive behavior, and side panel integration.

## Basic Prompt Template

```
Create a new [PAGE_NAME] page using the CenteredPageTemplate component. The page should:

1. **Header Section:**
   - Title: "[PAGE_TITLE]"
   - Subtitle: "[PAGE_SUBTITLE]" 
   - Actions: [DESCRIBE_ACTIONS - e.g. "Add button, filter dropdown"]

2. **Content Section:**
   - [DESCRIBE_MAIN_CONTENT - e.g. "Grid of cards", "List with filters", "Tabs with different views"]

3. **Additional Requirements:**
   - [ANY_SPECIAL_BEHAVIOR - e.g. "Search functionality", "Keyboard navigation", "Real-time updates"]

Use the numbered variant system (neutral-100, primary-500, etc.) and follow the 4px spacing grid.
```

## Example Usage Prompts

### Example 1: Analytics Dashboard
```
Create a new Analytics page using the CenteredPageTemplate component. The page should:

1. **Header Section:**
   - Title: "Analytics Dashboard"
   - Subtitle: "Track your content performance and engagement metrics"
   - Actions: Date range picker, export button

2. **Content Section:**
   - Tabs for "Overview", "Videos", "Collections"  
   - Grid of metric cards showing views, likes, shares
   - Chart components for trends

3. **Additional Requirements:**
   - Real-time data updates every 30 seconds
   - Keyboard shortcuts for tab navigation
   - Responsive grid that adjusts from 1-4 columns

Use the numbered variant system (neutral-100, primary-500, etc.) and follow the 4px spacing grid.
```

### Example 2: Settings Page
```
Create a new Settings page using the CenteredPageTemplate component. The page should:

1. **Header Section:**
   - Title: "Settings"
   - Subtitle: "Manage your account preferences and app configuration"
   - Actions: Save button, reset to defaults button

2. **Content Section:**
   - Tabs for "Profile", "Preferences", "Billing", "Advanced"
   - Form sections with grouped inputs
   - Toggle switches and dropdowns

3. **Additional Requirements:**
   - Auto-save after 2 seconds of no changes
   - Validation with inline error states
   - Success/error toast notifications

Use the numbered variant system (neutral-100, primary-500, etc.) and follow the 4px spacing grid.
```

## Template Import Structure

Always start your new page with:

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  CenteredPageTemplate, 
  PageHeader, 
  ContentSection 
} from "@/components/page-templates/centered-page-template";
import { Button } from "@/components/ui/button";
// ... other imports

export default function YourPageName() {
  return (
    <CenteredPageTemplate
      header={
        <PageHeader
          title="Your Page Title"
          subtitle="Your page description"
          actions={
            <>
              <Button variant="soft" className="gap-2">
                Action Button
              </Button>
            </>
          }
        />
      }
    >
      <ContentSection>
        {/* Your main content here */}
      </ContentSection>
    </CenteredPageTemplate>
  );
}
```

## Design System Reminders

When using this template, always ensure:

- **Colors:** Use numbered variants (bg-neutral-100, text-primary-600, border-neutral-200)
- **Spacing:** Follow 4px grid (space-1, space-2, space-3...)  
- **Buttons:** Prioritize ghost > soft > solid (max 1 solid per view)
- **Interactive states:** +100 progression (neutral-200 → neutral-300 on hover)
- **Typography:** System fonts only (font-sans, font-serif, font-mono)
- **Borders:** Only use --radius-card, --radius-button, rounded-pill
- **Shadows:** Only --shadow-soft-drop or --shadow-input

## Layout Variations

The template supports these max-width options:
- `maxWidth="3xl"` - Narrow content (768px) - good for forms, text-heavy pages
- `maxWidth="4xl"` - **Default** (896px) - optimal for mixed content 
- `maxWidth="5xl"` - Wide content (1024px) - good for dashboards
- `maxWidth="6xl"` - Very wide (1152px) - good for data tables
- `maxWidth="7xl"` - Maximum (1280px) - good for complex layouts

## File Structure

Place your new pages in:
```
src/app/(main)/[your-page]/
├── page.tsx              # Main page component
├── layout.tsx            # Uses existing dashboard layout
└── _components/          # Page-specific components
    ├── [feature]-dialog.tsx
    ├── [feature]-grid.tsx
    └── [feature]-tabs.tsx
```

The template automatically integrates with:
- Sidebar state management and responsive behavior
- Theme system and color variables
- Mobile responsive patterns
- Keyboard navigation standards
- Loading states and error handling patterns

## Quick Validation Checklist

✓ Using CenteredPageTemplate component?
✓ PageHeader with proper title/subtitle/actions?
✓ ContentSection wrappers for main areas?
✓ Numbered color variants (not generic blues/grays)?
✓ 4px spacing grid followed?
✓ Interactive states use +100 progressions?
✓ Max 1 solid button per view?
✓ Responsive breakpoints handled?
✓ Keyboard navigation considered?
✓ Loading/error states included?