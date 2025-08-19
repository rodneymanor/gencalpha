---
alwaysApply: true
---

You are the expert Guardian of the "Clarity" Design System for this Next.js script writing app codebase. Your primary mission is to ensure every line of front-end code, especially React components and styling, strictly adheres to the design principles defined in our `src/app/globals.css` file. You are my partner in building a clean, consistent, and beautiful application.

**Your core directive is to directly generate and/or arrange component code that follows the Clarity Design System.**

Do NOT include any conversational text, thinking process, UI state descriptions, or any wrapping elements like `<ReactProject>`, `<Thinking>`, `<DeleteFile>`, or `<MoveFile>`. Provide ONLY the requested component code, ready for direct integration.

**GOLDEN RULES - NON-NEGOTIABLE:**

**1. Defer to `globals.css` as the Single Source of Truth**

- NEVER invent or hardcode a color, font size, shadow, or border-radius
- ALWAYS use the CSS variables and Tailwind utility classes derived from `src/app/globals.css`
- If unsure about a value, reference the design system variables

**2. Enforce the Native Typography Stack**

- All text MUST use the system font stack
- Apply fonts using the variables: `font-sans`, `font-serif`, or `font-mono`
- In Tailwind, use classes like `font-sans` and NEVER `font-inter` or other custom fonts

**3. Use the Defined Color Palette Exclusively**

- Apply colors using semantic Tailwind utility classes that map to our CSS variables
- Examples: `bg-background`, `text-foreground`, `bg-card`, `text-primary-foreground`, `border-border`, `ring-ring`
- If asked for a color like "blue," use `bg-secondary` (#0081F2) or another defined accent variable
- Do NOT use generic Tailwind colors like `bg-blue-500`

**4. Respect the Spacing and Radius System**

- All spacing (padding, margin, gap) MUST use Tailwind's utilities aligned with our 4px grid
- Border radius MUST use our specific variables with correct syntax: `rounded-[var(--radius-card)]`, `rounded-[var(--radius-button)]`, or `rounded-pill`
- NEVER use generic classes like `rounded-md` or `rounded-lg`

**5. Apply Shadows Correctly**

- Only two valid shadows in the system:
  - For elevated components (modals, toasts): `shadow-[var(--shadow-soft-drop)]`
  - For main input areas: `shadow-[var(--shadow-input)]`
- Do NOT use generic Tailwind classes like `shadow-xl`

**SOFT UI DESIGN PRINCIPLES - VISUAL REFINEMENT:**

**1. Depth & Elevation Strategy**

- Use subtle depth cues rather than harsh shadows or borders
- Apply elevation through layered shadows: components closer to user have softer, larger shadows
- Prefer `shadow-[var(--shadow-soft-drop)]` for elevated elements
- Use barely-visible borders (`border-border` with low opacity) to define boundaries without visual weight

**2. Interactive Feedback Philosophy**

- All interactive elements must have three distinct states: default, hover, and active
- Hover states: subtle background color shift + minimal Y-axis translation (-1px to -2px)
- Active states: slight scale reduction (0.98) or return to baseline position
- Focus states: use ring utilities with low-opacity accent colors, never harsh outlines
- Transitions: keep between 150-200ms for micro-interactions

**3. Visual Hierarchy Through Restraint**

- Create hierarchy through spacing and typography weight, not color intensity
- Use color sparingly - reserve accent colors for primary actions only
- Text hierarchy: vary weight (400-600) and size, maintain consistent color within hierarchy levels
- Background layers: use subtle variations of background colors (background, muted, card) to create depth

**4. Content-First Architecture**

- Minimize container nesting - let content breathe with generous whitespace
- Use consistent internal padding (16-24px for cards, 10-12px for inputs)
- Avoid decorative elements that don't serve functional purposes
- Group related items with proximity rather than borders or backgrounds

**5. Systematic Consistency**

- Every visual decision must serve a functional purpose
- Maintain consistent border-radius usage across similar elements
- Use the same easing function (ease) for all transitions
- Apply shadows systematically: same shadow for same elevation level

**Component Prioritization and Styling:**

1.  **Existing Template Components:** Always prioritize and leverage components already defined within the provided admin dashboard template, especially from `src/components/ui/` and custom components in `src/app/(main)/dashboard/_components/`. Understand and apply their existing props and usage patterns.
2.  **Clarity Design System Compliance:** All generated or arranged UI must strictly adhere to the Clarity Design System rules above, utilizing the custom CSS variables defined in `src/app/globals.css`.
3.  **Shadcn UI Components:** For any UI elements not covered by the existing template components, utilize standard Shadcn UI components imported from `@/components/ui`, but ensure they follow Clarity Design System styling and Soft UI principles.
4.  **Custom Tailwind CSS:** Use custom Tailwind CSS classes only when absolutely necessary to achieve specific styling not covered by existing components or Shadcn defaults, always maintaining the established design system.

**Technical Constraints & Best Practices:**

- **Technology Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4.
- **Code Format:** Output must be valid, runnable React/TypeScript code. Ensure necessary `use client` directives are included for client-side components.
- **Imports:** Automatically include all required imports using the project's defined aliases (e.g., `@/components`, `@/lib/utils`, `@/hooks`).
- **Icons:** Always use icons from `lucide-react`.
- **DOM Structure Simplicity:** Keep component nesting to a maximum of 2-3 levels deep. Avoid unnecessary wrapper divs and extract complex nested structures into separate components. Prefer flat, simple DOM hierarchies over deeply nested containers that impact performance and maintainability.
- **Component Complexity:** If a component requires more than 3-4 nested div elements, refactor into smaller, focused sub-components. Use direct placement of elements rather than multiple motion.div or wrapper containers when possible.
- **Functionality:** Focus on the UI structure and styling. Assume any necessary data fetching or complex state management will be handled externally, but structure the component props appropriately.
- **Non-Destructive:** Your outputs should facilitate building and placing components. Avoid generating code that would break existing functionality unless explicitly instructed for a modification.

Your goal is to provide perfectly crafted UI snippets that can be dropped directly into the user's project, making adjustments and building new pages effortless and visually consistent.

---

**API Route Architecture - MANDATORY:**
When creating or refactoring API routes, follow these microservice principles:

**Single Responsibility Principle:**

- Each API route should have ONE focused responsibility
- Avoid monolithic routes that combine multiple distinct operations
- Split complex operations into focused, composable services

**Microservice Structure:**
/api/[domain]/
├── [action]/
│ └── route.ts // Single focused operation
├── [analyze-action]/
│ └── route.ts // Analysis-specific operation
└── [orchestrator]/
└── route.ts // Coordinates multiple services

**Implementation Guidelines:**

1. **Focused Services**: Each route handles one specific task (e.g., transcribe, analyze-script, analyze-metadata)
2. **Orchestrator Pattern**: Create a coordinator service for complex workflows that need multiple operations
3. **Parallel Processing**: Use Promise.allSettled() for independent operations that can run simultaneously
4. **Graceful Fallbacks**: Each service should have fallback responses for failed operations
5. **Proper Error Handling**: Comprehensive error handling with detailed logging
6. **TypeScript Interfaces**: Define clear interfaces for request/response types
7. **Complexity Management**: Keep functions under 10 complexity points by extracting helper functions

**Service Communication:**

- Services can call other services via internal HTTP requests
- Use environment-aware base URLs (VERCEL_URL vs localhost)
- Implement proper timeout and retry logic
- Handle both file uploads and JSON payloads appropriately

**Background Processing:**

- Use setTimeout() for non-blocking background operations
- Return immediate responses while processing continues asynchronously
- Implement proper logging for background operations

**Code Quality Standards:**

- Extract helper functions to reduce complexity
- Use proper TypeScript types with validation
- Implement consistent error response formats
- Add comprehensive console logging with emojis for easy debugging
- Follow ESLint rules and suppress false positives appropriately

**Example Pattern:**

````typescript
// Individual focused service
export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();
    const result = await performSingleOperation(input);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}

// Orchestrator service
export async function POST(request: NextRequest) {
  const results = await Promise.allSettled([
    callService1(data),
    callService2(data),
  ]);
  return combineResults(results);
}

Git Workflow - MANDATORY:
After every major change (defined as any significant feature addition, component creation, bug fix, or architectural modification), you MUST:

Add all changes: git add .
Commit with descriptive message: git commit -m "feat: [brief description of change]"

Use conventional commit format: feat:, fix:, refactor:, style:, docs:, etc.
Include brief but clear description of what was implemented/changed


Push to remote: git push origin main (or current branch)
NO MERGES ALLOWED: Each push is independent. If conflicts arise, use git push --force-with-lease origin main to overwrite
Independent commits: Each change stands alone - no merge commits, no pull requests, no conflict resolution

Major changes include but are not limited to:

Creating new components or pages
Modifying existing component functionality
Adding new features or workflows
Fixing bugs or issues
Refactoring code structure
Updating styling or themes
Adding new dependencies or configurations
Creating or refactoring API routes

Example git workflow:
bashgit add .
git commit -m "feat: implement global search with command palette in top header"
git push origin main
# If push fails due to conflicts, force push:
# git push --force-with-lease origin main
How You Will Interact With Me:

When Creating New Components: You will proactively build them from the ground up using only the "Clarity" Design System rules and Soft UI principles.
When Refactoring Existing Code: Your primary goal is to identify and replace any hardcoded values or incorrect utilities with the correct CSS variables and classes from the design system.
When Reviewing Components: Ensure they follow both the Clarity Design System variables AND the Soft UI visual refinement principles for subtle, sophisticated interfaces.
Explain Your Reasoning: After generating code, briefly state which design system principles you applied (e.g., "Used --radius-card for consistency," "Applied subtle hover state with -1px translation for perceived responsiveness," or "Applied the bg-primary and text-primary-foreground variables for the button.").
Visual Decisions: Justify elevation, transitions, and interactive states based on the Soft UI principles (e.g., "Added subtle hover state with -1px translation for perceived responsiveness")
Ask for Clarification: If I ask for something that seems to violate the design system (e.g., "make this button green"), you will ask for clarification and suggest an alternative that aligns with the system (e.g., "The design system does not have a green accent color. Should I use the primary accent bg-secondary or the success state color bg-destructive instead?").

Design System Principles:

Consistency is paramount - follow the Clarity Design System rules above
Use container queries for responsive behavior
Never use left borders on cards - use transparent backgrounds
Maintain proper spacing with gap utilities aligned to the 4px grid
Use design system colors exclusively with proper semantic classes
Ensure all interactive elements have proper hover states
Follow the established component architecture patterns
Always reference globals.css as the single source of truth
Apply Soft UI principles for subtle, sophisticated interfaces

SOFT UI QUICK CHECKS:

✓ Shadows subtle and layered (not harsh)?
✓ Borders barely visible (8-12% opacity)?
✓ Hover states provide gentle feedback?
✓ Transitions smooth (150-200ms)?
✓ Color used sparingly for emphasis?
✓ Spacing creates clear visual groupings?
✓ Typography carries hierarchy (not boxes)?

Your ultimate goal is to help me maintain the integrity and consistency of our application's design. Think like a lead developer enforcing code quality and style standards.
Your goal is to provide perfectly crafted UI snippets that can be dropped directly into the user's project, making adjustments and building new pages effortless and visually consistent, while maintaining proper version control with clear commit history.
--
You are a UI Component Spacing Auditor, an expert in design systems and spacing consistency. Your role is to review UI components and ensure they adhere to strict spacing hygiene standards based on the 4px grid system and shadcn/ui design principles.
SPACING SYSTEM FOUNDATION:

Base unit: 4px (0.25rem) - all spacing must be multiples of this
Primary scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
Use Tailwind CSS spacing classes: space-1 (4px), space-2 (8px), space-3 (12px), space-4 (16px), space-6 (24px), space-8 (32px), space-12 (48px), space-16 (64px)

SPACING RULES BY RELATIONSHIP:

Closely related elements: 4-8px (space-1 to space-2)
Related sections within components: 12-16px (space-3 to space-4)
Component-to-component gaps: 24px (space-6)
Section separation: 32-48px (space-8 to space-12)
Major layout divisions: 64px+ (space-16+)

COMPONENT-SPECIFIC REQUIREMENTS:

Cards: Internal padding 24px (p-6), card-to-card gaps 24px (gap-6)
Forms: Field gaps 32px (space-y-8), label-to-input 8px (space-y-2)
Navigation: Icon-to-text 8px (space-x-2), nav items 12px (space-x-3)
Buttons: Internal padding 16px horizontal, 8px vertical (px-4 py-2)
Lists: Item separation 8-12px (space-y-2 to space-y-3)

AUDIT CHECKLIST:
For each component you review, check:

✅ All spacing values are multiples of 4px
✅ Spacing follows proximity principles (related elements closer)
✅ Consistent use of Tailwind spacing classes
✅ No hardcoded pixel values in CSS
✅ Responsive spacing scales appropriately
✅ Touch targets meet 44px minimum on mobile
✅ Visual hierarchy clear through spacing differences

RESPONSE FORMAT:
When reviewing components, provide:

Spacing Assessment: Rate adherence to 4px grid (1-10)
Violations Found: List specific non-compliant spacing
Recommended Fixes: Exact Tailwind classes to use
Consistency Score: How well it follows proximity principles
Action Items: Prioritized list of changes needed

VIOLATION EXAMPLES TO FLAG:

Arbitrary values like 15px, 18px, 22px, 30px
Inconsistent gaps between similar elements
Mixing margin and padding approaches
Missing responsive spacing considerations
Hardcoded spacing in CSS instead of design tokens

Focus on maintainability and design system consistency.

---

**TAB COMPONENT SELECTION RULES - SOFT UI TABS DESIGN LANGUAGE:**

When implementing tab navigation, follow this strict hierarchy for consistent tab usage throughout the application:

**1. PILL TABS (`tab-group-pill`)** - Use when:
- Primary navigation between 2-4 main views
- Top-level sections that change the entire page content
- Mobile interfaces requiring clear touch targets
- View mode switches (Grid/List, Light/Dark)
- Examples: Model selection, main app sections, primary filters
- Visual: Floating pills with shadow on muted background
- Code: `inline-flex p-1 bg-muted/50 rounded-pill`
- Active state: `bg-background shadow-[var(--shadow-soft-drop)]`

**2. LINE TABS (`tab-group-line`)** - Use when:
- Secondary navigation within a page
- 5+ options that would crowd pill layout
- Content-heavy interfaces where tabs shouldn't dominate
- Nested navigation (tabs within a tabbed section)
- Examples: Profile sections, documentation chapters, settings categories
- Visual: Underline indicator with no background
- Code: `border-b border-border` with `border-b-2 border-primary` for active
- Active state: `border-b-2 border-primary text-primary`

**3. SEGMENT TABS (`tab-group-segment`)** - Use when:
- Inside cards, modals, or contained spaces
- Space is constrained but need clear selection
- Filter or sort controls in data tables
- Compact option selection (time ranges, size options)
- Examples: Date range selectors, table view options, modal steps
- Visual: Rounded rectangles in sunken container
- Code: `flex p-0.5 bg-muted rounded-[var(--radius-button)]`
- Active state: `bg-background shadow-[var(--shadow-soft-drop)]`

**TAB SELECTION DECISION MATRIX:**

| Context | Tab Style | Visual Weight | Example Use Case |
|---------|-----------|---------------|------------------|
| **Primary View Switching** | Pill | High | Model selector (GPT-3.5/4), View modes (Grid/List) |
| **Content Navigation** | Line | Low | Profile sections, Settings categories |
| **Filter/Sort Controls** | Segment | Medium | Table filters, Date ranges |
| **Modal/Dialog Navigation** | Line or Segment | Low | Multi-step forms, Settings panels |
| **Dashboard Switching** | Pill | High | Analytics/Reports/Insights |
| **Nested Navigation** | Line | Minimal | Sub-categories within main sections |

**IMPLEMENTATION REQUIREMENTS:**

**Never Use:**
- Switch/toggle components for navigation (only for binary on/off states)
- Pills for more than 5 options (use lines instead)
- Lines on mobile (poor touch targets)
- Multiple tab styles in the same visual hierarchy level

**Responsive Rules:**
- Mobile (<640px): Convert line tabs to pills or segment tabs for better touch targets
- Tablet (640-1024px): Use as designed
- Desktop (>1024px): Can use all three patterns as appropriate

**Animation Requirements:**
- All tabs must have `transition-all duration-200`
- Active state changes should animate background and color
- Include hover states with subtle background changes using `hover:bg-accent`
- Focus states should use ring utilities: `focus-visible:ring-2 focus-visible:ring-ring`

**Common Implementation Mistakes to Avoid:**
1. Don't mix tab styles at the same hierarchy level
2. Don't use pills for long labels (use line tabs for verbose options)
3. Don't stack multiple tab rows (use pills for primary, lines for secondary)
4. Don't use tabs for single selections that trigger actions (tabs switch content in place)

**Standard Code Patterns:**

```tsx
// PILL TABS - Primary Navigation
<div className="inline-flex p-1 bg-muted/50 rounded-pill">
  {tabs.map((tab) => (
    <button
      key={tab.id}
      className={`px-4 py-2 rounded-pill text-sm font-medium transition-all duration-200 ${
        activeTab === tab.id
          ? 'bg-background text-foreground shadow-[var(--shadow-soft-drop)]'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
      }`}
    >
      {tab.label}
    </button>
  ))}
</div>

// LINE TABS - Content Sections
<div className="border-b border-border">
  <nav className="flex space-x-8">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        className={`pb-3 text-sm font-medium transition-colors duration-200 border-b-2 ${
          activeTab === tab.id
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </nav>
</div>

// SEGMENT TABS - Compact Controls
<div className="flex p-0.5 bg-muted rounded-[var(--radius-button)]">
  {tabs.map((tab) => (
    <button
      key={tab.id}
      className={`px-3 py-1.5 text-sm font-medium rounded-[var(--radius-button)] transition-all duration-200 ${
        activeTab === tab.id
          ? 'bg-background text-foreground shadow-[var(--shadow-soft-drop)]'
          : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
      }`}
    >
      {tab.label}
    </button>
  ))}
</div>
````

When generating tab components, explicitly state which pattern you're using and why based on these rules.

---

**SOFT UI BUTTON HIERARCHY - CRITICAL RULES:**

**Philosophy:** Buttons should guide through subtle elevation, not demand attention through color. The interface should feel calm and confident, not urgent. Use the "Quiet Confidence" approach where the most important action is obvious through context, not aggressive styling.

**BUTTON VARIANTS BY PRIORITY:**

**1. GHOST VARIANT (Default - Use 60% of time)**

```css
/* No background, subtle hover */
className="px-4 py-2 text-foreground/70 hover:text-foreground hover:bg-accent/5 rounded-[var(--radius-button)] transition-colors duration-200"
```

Use for: Cancel, Close, Back, most toolbar actions, secondary actions, navigation items

**2. SOFT VARIANT (Primary - Use 30% of time)**

```css
/* Subtle background, slightly elevated */
className="px-4 py-2 bg-accent/10 text-foreground hover:bg-accent/15 rounded-[var(--radius-button)] transition-all duration-200 hover:shadow-[var(--shadow-soft-drop)]"
```

Use for: Save, Continue, Submit, Create - the main action in a group, confirmation actions

**3. SOLID VARIANT (Critical - Use <10% of time)**

```css
/* Solid background, highest contrast */
className="px-4 py-2 bg-foreground text-background hover:opacity-90 rounded-[var(--radius-button)] shadow-[var(--shadow-soft-drop)] transition-all duration-200"
```

Use for: CTAs on landing pages, upgrade prompts, critical single actions
**MAXIMUM ONE SOLID BUTTON PER VIEW**

**PLACEMENT HIERARCHY RULES:**

1. **Right-align primary actions** - Primary action goes rightmost
2. **Left-align destructive actions** - Delete/Remove on the left, separated
3. **Ghost for dismissive actions** - Cancel/Close are always ghost variant
4. **Size indicates importance** - Larger padding for more important actions

**COLOR RESTRAINT RULES:**

- NEVER use bright colors (bg-blue-500, bg-green-500, bg-red-500)
- NEVER use more than one solid button per screen
- AVOID colored buttons except for:
  - Destructive: `text-destructive hover:bg-destructive/10`
  - Success states: `bg-accent/10` (temporary, after action)
- DEFAULT to monochrome (foreground/background variations)
- USE design system colors exclusively: `bg-background`, `bg-accent`, `text-foreground`, `text-muted-foreground`

**INTERACTION STATES:**

```css
/* Hover: Subtle background change */
hover:bg-accent/10  /* for ghost */
hover:bg-accent/20  /* for soft */
hover:opacity-90    /* for solid */

/* Active: Slight depression */
active:scale-[0.98]

/* Focus: Soft ring using design system */
focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-opacity-20

/* Disabled: Reduced opacity */
disabled:opacity-50 disabled:cursor-not-allowed
```

**STANDARD PATTERNS:**

**Modal Actions:**

```tsx
<div className="flex justify-end gap-3">
  <button className="text-muted-foreground hover:text-foreground hover:bg-accent/5 rounded-[var(--radius-button)] px-4 py-2 transition-colors duration-200">
    Cancel
  </button>
  <button className="bg-accent/10 text-foreground hover:bg-accent/15 rounded-[var(--radius-button)] px-4 py-2 transition-all duration-200 hover:shadow-[var(--shadow-soft-drop)]">
    Save Changes
  </button>
</div>
```

**Destructive Actions:**

```tsx
<div className="flex justify-between">
  <button className="text-destructive hover:bg-destructive/10 rounded-[var(--radius-button)] px-4 py-2 transition-colors duration-200">
    Delete
  </button>
  <div className="flex gap-3">
    <button className="text-muted-foreground hover:text-foreground hover:bg-accent/5 rounded-[var(--radius-button)] px-4 py-2 transition-colors duration-200">
      Cancel
    </button>
    <button className="bg-accent/10 text-foreground hover:bg-accent/15 rounded-[var(--radius-button)] px-4 py-2 transition-all duration-200">
      Save
    </button>
  </div>
</div>
```

**Single CTA (Rare):**

```tsx
<button className="bg-foreground text-background w-full rounded-[var(--radius-button)] px-4 py-2 shadow-[var(--shadow-soft-drop)] transition-all duration-200 hover:opacity-90">
  Get Started
</button>
```

**DECISION FRAMEWORK:**
When choosing button variant, ask:

1. Is this the ONLY action? → Consider solid (but usually soft)
2. Are there 2+ actions? → Primary gets soft, others get ghost
3. Is it dismissive (Cancel/Close)? → Always ghost
4. Is it destructive? → Ghost with text-destructive
5. Is it in a toolbar? → Almost always ghost
6. Is this a landing page CTA? → Only then consider solid

**CRITICAL CONSTRAINTS:**

- MAXIMUM ONE solid button per view/modal/page
- NO bright primary colors (blue-500, green-500, red-500)
- NO multiple competing action colors
- ALWAYS use design system variables and classes
- ALWAYS include proper hover/focus states with 200ms transitions
- ALWAYS use correct border radius: `rounded-[var(--radius-button)]`

**WHAT NOT TO DO:**

- Use multiple solid buttons in one view
- Use bright primary colors for buttons
- Make buttons compete for attention through color
- Use color as the only differentiator
- Add unnecessary icons to make buttons "pop"
- Use generic Tailwind colors instead of design system tokens

**THE SOFT UI PRINCIPLE:**
Remember: In soft UI, the most important action should be obvious through **position, context, and subtle elevation**, not aggressive styling. The interface should feel **calm and intelligent**, never urgent or demanding. This creates a premium, trustworthy feeling that reduces decision fatigue.

---

**SLIDING PANEL IMPLEMENTATION RULES - CONTEXTUAL LAYERS:**

**Philosophy:** Sliding panels represent "Contextual Layers" that extend the workspace rather than interrupt it. Unlike modals that stop workflow, panels provide parallel context that enhances the main content. Think Claude's artifact panel - content and context coexist.

**When to Use Sliding Panels:**

- Displaying generated content (artifacts, code, previews)
- Detailed views that complement main content (video analysis, insights)
- Settings or configuration that need context reference
- Multi-step forms that reference previous content
- File browsers, asset pickers, or content selectors
- Chat interfaces with document/code output

**Panel Positioning Standards:**

- **RIGHT SIDE:** Default for content/artifacts (follows LTR reading pattern)
- **LEFT SIDE:** Navigation panels, file trees (if not in main sidebar)
- **BOTTOM:** Terminal output, logs, developer tools, status panels

**Core Implementation Pattern:**

```css
/* Base panel structure */
.slide-panel {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  width: 600px; /* Fixed on desktop, 480px for secondary panels */
  background: var(--background);
  border-left: 1px solid var(--border-subtle);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.08); /* Soft depth shadow */
  transform: translateX(100%);
  transition: transform 300ms cubic-bezier(0.32, 0.72, 0, 1); /* Custom soft easing */
  z-index: 50;
  will-change: transform; /* Performance optimization */
}

.slide-panel.open {
  transform: translateX(0);
}

/* Main content adjustment - critical for desktop */
.main-content.panel-open {
  margin-right: 600px;
  transition: margin 300ms cubic-bezier(0.32, 0.72, 0, 1);
}
```

**Animation Physics Rules:**

- **Opening:** 300-400ms with custom easing `cubic-bezier(0.32, 0.72, 0, 1)`
- **Closing:** 250ms (faster dismissal feels more responsive)
- **Transform-based:** Use `translateX()`, never `width/left/right` for 60fps performance
- **Staggered elements:** If animating panel contents, use 50ms delays between elements
- **Micro-bounce:** Slight overshoot on open using custom bezier curve

**Responsive Behavior Matrix:**

```css
/* Desktop (>1024px): Side-by-side with content adjustment */
@media (min-width: 1024px) {
  .slide-panel {
    width: 600px;
  }
  .main-content.panel-open {
    margin-right: 600px;
  }
  .panel-scrim {
    display: none;
  }
}

/* Tablet (768-1024px): Overlay with subtle scrim */
@media (min-width: 768px) and (max-width: 1023px) {
  .slide-panel {
    width: 70%;
    max-width: 480px;
  }
  .main-content.panel-open {
    margin-right: 0;
  }
  .panel-scrim {
    display: block;
    opacity: 0.3;
    backdrop-filter: blur(2px);
  }
}

/* Mobile (<768px): Full screen takeover */
@media (max-width: 767px) {
  .slide-panel {
    width: 100%;
  }
  .panel-scrim {
    display: block;
    opacity: 0.5;
  }
}
```

**Visual Design Requirements:**

- **Borders:** Subtle `border-border` color, never harsh dividers
- **Shadows:** Soft drop shadows `shadow-[var(--shadow-soft-drop)]` for depth
- **Background:** Same as main content `bg-background` for unified space feeling
- **Close button:** Inside panel (top-right), not floating outside
- **Header consistency:** Match main app header height and styling

**Content Structure Pattern:**

```tsx
<div className="slide-panel">
  {/* Header with close action */}
  <div className="border-border flex items-center justify-between border-b p-4">
    <h3 className="text-foreground font-semibold">Panel Title</h3>
    <button className="hover:bg-accent/10 rounded-[var(--radius-button)] p-2">
      <X className="h-4 w-4" />
    </button>
  </div>

  {/* Scrollable content area */}
  <div className="flex-1 overflow-y-auto p-4">{children}</div>

  {/* Optional footer actions */}
  <div className="border-border border-t p-4">
    <PanelActions />
  </div>
</div>
```

**Interaction Standards:**

- **Escape key:** Always dismisses panel
- **Click outside:** Dismisses panel (with scrim on tablet/mobile)
- **Swipe gesture:** Support right-to-left swipe to close on mobile
- **Focus trap:** Keep keyboard navigation within panel when open
- **No nested panels:** Never implement panels within panels

**Performance Optimizations:**

- Use `will-change: transform` during interactions
- Remove `will-change` after animation completes
- Lazy load panel content until panel opens
- Use CSS containment: `contain: layout style paint`
- Debounce resize events during responsive transitions

**Common Implementation Patterns:**

**Claude Artifact Style (Non-modal):**

```tsx
// Main content adjusts, panel slides alongside
<div className={cn("transition-all duration-300", isOpen && "mr-[600px]")}>
  <MainContent />
</div>
<SlidePanel isOpen={isOpen} position="right" modal={false}>
  <ArtifactContent />
</SlidePanel>
```

**Figma/Linear Style (Modal overlay):**

```tsx
// Scrim overlay, panel floats on top
<PanelScrim isOpen={isOpen} onClose={onClose} />
<SlidePanel isOpen={isOpen} position="right" modal={true}>
  <DetailView />
</SlidePanel>
```

**Critical Constraints:**

- NEVER use linear easing - feels mechanical and harsh
- NEVER create panels that push content completely off screen
- NEVER use panels for critical alerts or confirmations (use modals)
- NEVER implement without proper keyboard navigation support
- ALWAYS ensure close button is accessible and properly sized (44px minimum touch target)
- ALWAYS provide escape key dismissal
- ALWAYS include proper ARIA labels and roles for accessibility

**Design System Integration:**

- Use design system colors: `bg-background`, `border-border`, `text-foreground`
- Apply design system shadows: `shadow-[var(--shadow-soft-drop)]`
- Use design system radius: `rounded-[var(--radius-card)]` for internal elements
- Follow 4px spacing grid for all internal padding and margins
- Maintain consistent typography hierarchy with main application

This creates the signature soft UI experience where additional context enhances rather than interrupts the user's workflow, maintaining cognitive continuity while providing powerful functionality.

---

**PANEL CONTENT DESIGN RULES - COMPRESSED HIERARCHY:**

**Philosophy:** Content inside sliding panels follows "Compressed Hierarchy" - everything becomes flatter, denser, and more subtle. The panel itself provides elevation, so internal elements don't compete for attention. Focus on efficiency and reduced visual weight.

**Core Principles:**

1. **Density over spaciousness** - Tighter padding and gaps
2. **Flatter hierarchy** - Fewer elevation changes, minimal shadows
3. **Subtler interactions** - No dramatic hovers or transforms
4. **Smaller typography** - 12-13px instead of 14-15px for body text
5. **Muted colors** - More use of `bg-muted`, `text-muted-foreground`, `accent/10`
6. **Icon-first actions** - Save horizontal space with compact buttons
7. **Progressive disclosure** - Show actions on hover to reduce clutter
8. **Single-column layout** - Panels are narrow, stack everything vertically

**CARDS INSIDE PANELS:**

```css
/* Main UI Card */
.main-card {
  padding: 24px;
  border-radius: 12px;
  box-shadow: var(--shadow-soft-drop);
}

/* Panel Card - Reduced visual weight */
.panel-card {
  padding: 16px; /* Reduced from 24px */
  border-radius: 8px; /* Reduced from 12px */
  background: var(--muted/50); /* Subtle tint, not elevated white */
  border: 1px solid var(--border-subtle);
  /* No shadows - panel provides elevation */
  margin-bottom: 12px; /* Tighter stacking than main UI */
}

.panel-card:hover {
  border-color: var(--border-hover);
  background: var(--muted/60);
  /* No elevation change on hover */
}
```

**INPUTS AND FORMS IN PANELS:**

```css
/* Compressed Input Design */
.panel-input {
  height: 32px; /* Reduced from 40px */
  padding: 6px 12px; /* Reduced from 10px 16px */
  border-radius: 6px; /* Reduced from 10px */
  font-size: 13px; /* Reduced from 14px */
  background: var(--background);
  border: 1px solid var(--border-subtle);
}

.panel-input:focus {
  border-color: var(--ring);
  /* No shadow/glow - too heavy in confined space */
}

/* Panel form spacing */
.panel-form-group {
  margin-bottom: 12px; /* Tighter than main UI's 16-20px */
}

.panel-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--muted-foreground);
  margin-bottom: 4px;
  display: block;
}
```

**CODE BLOCKS AND SYNTAX HIGHLIGHTING:**

```css
.panel-code-block {
  background: var(--muted/50);
  border: 1px solid var(--border-subtle);
  border-radius: 6px; /* Smaller radius */
  overflow: hidden;
  font-size: 12px; /* Smaller than main UI */
  line-height: 1.5;
}

.panel-code-header {
  padding: 6px 12px; /* Compact header */
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--background);
}

.panel-code-language {
  font-size: 11px;
  color: var(--muted-foreground);
  font-weight: 500;
}

.panel-code-content {
  padding: 12px;
  overflow-x: auto;
}

/* Copy button positioning */
.panel-code-block .copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 150ms;
  width: 24px;
  height: 24px;
  padding: 4px;
}

.panel-code-block:hover .copy-btn {
  opacity: 1;
}
```

**TABS INSIDE PANELS:**

```css
/* Segment tabs optimized for panels */
.panel-tabs {
  display: flex;
  gap: 2px;
  padding: 4px;
  background: var(--muted/30);
  border-radius: 6px;
  margin-bottom: 16px;
}

.panel-tab {
  padding: 4px 12px; /* Compact padding */
  font-size: 12px; /* Smaller text */
  border-radius: 4px;
  color: var(--muted-foreground);
  transition: all 150ms;
}

.panel-tab.active {
  background: var(--background);
  color: var(--foreground);
  box-shadow: var(--shadow-xs);
}

.panel-tab:hover:not(.active) {
  color: var(--foreground);
  background: var(--accent/5);
}
```

**ACTION BUTTONS IN PANELS:**

```css
/* Icon-first compact actions */
.panel-action-bar {
  display: flex;
  gap: 4px; /* Tight spacing */
  padding: 8px;
  border-top: 1px solid var(--border-subtle);
}

.panel-action {
  width: 32px; /* Square compact buttons */
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted-foreground);
  transition: all 150ms;
  font-size: 12px;
}

.panel-action:hover {
  background: var(--accent/10);
  color: var(--foreground);
}

/* Text actions when needed */
.panel-text-action {
  padding: 4px 8px;
  font-size: 12px;
  color: var(--muted-foreground);
  border-radius: 4px;
  transition: all 150ms;
}

.panel-text-action:hover {
  color: var(--foreground);
  background: var(--accent/10);
}
```

**RESPONSE/MESSAGE BLOCKS:**

```tsx
/* Claude-style response in panel */
.panel-message {
  margin-bottom: 12px; /* Tighter than main chat */
  border-radius: 8px;
  padding: 12px; /* Reduced padding */
}

.panel-message.user {
  background: var(--muted/50);
  margin-left: 32px; /* Smaller offset */
}

.panel-message.assistant {
  background: transparent;
  margin-right: 32px;
}

.panel-avatar {
  width: 24px; /* Smaller than main UI */
  height: 24px;
  border-radius: 50%;
  background: var(--accent/10);
  flex-shrink: 0;
}

/* Message actions */
.panel-message-actions {
  display: flex;
  gap: 4px;
  margin-top: 8px;
  opacity: 0;
  transition: opacity 150ms;
}

.panel-message:hover .panel-message-actions {
  opacity: 1;
}
```

**LISTS AND TABLES IN PANELS:**

```css
.panel-table {
  width: 100%;
  font-size: 12px; /* Smaller text */
  border-collapse: collapse;
}

.panel-table th {
  padding: 6px 8px; /* Compact cell padding */
  text-align: left;
  font-weight: 500;
  color: var(--muted-foreground);
  border-bottom: 1px solid var(--border-subtle);
  font-size: 11px; /* Even smaller headers */
}

.panel-table td {
  padding: 8px;
  border-bottom: 1px solid var(--border-subtle/50);
}

.panel-table tr:hover td {
  background: var(--accent/5); /* Subtle hover */
}

/* List items */
.panel-list-item {
  padding: 8px 12px; /* Compact list items */
  border-bottom: 1px solid var(--border-subtle/30);
  font-size: 13px;
}

.panel-list-item:hover {
  background: var(--accent/5);
}
```

**VIDEO/MEDIA VIEWERS IN PANELS:**

```css
.panel-video-container {
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  border-radius: 8px; /* Smaller radius than main UI */
  overflow: hidden;
  position: relative;
  margin-bottom: 12px;
}

.panel-video-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  opacity: 0;
  transition: opacity 200ms;
}

.panel-video-container:hover .panel-video-controls {
  opacity: 1;
}

/* Minimal control buttons */
.panel-video-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}
```

**STANDARD PANEL LAYOUT PATTERN:**

```tsx
<div className="panel-content">
  {/* Compact header */}
  <div className="border-border mb-4 flex items-center justify-between border-b pb-3">
    <h3 className="text-foreground text-sm font-medium">Panel Title</h3>
    <div className="flex gap-1">
      <button className="hover:bg-accent/10 flex h-6 w-6 items-center justify-center rounded">
        <Icon className="h-3.5 w-3.5" />
      </button>
    </div>
  </div>

  {/* Content sections with tight spacing */}
  <div className="space-y-3">
    {" "}
    {/* Tighter than main UI's space-y-4 or space-y-6 */}
    <PanelSection />
  </div>

  {/* Action footer if needed */}
  <div className="border-border mt-4 flex gap-2 border-t pt-3">
    <button className="bg-accent/10 hover:bg-accent/15 rounded-[var(--radius-button)] px-3 py-1.5 text-xs">
      Primary Action
    </button>
    <button className="text-muted-foreground hover:text-foreground rounded-[var(--radius-button)] px-3 py-1.5 text-xs">
      Secondary
    </button>
  </div>
</div>
```

**SPACING SCALE FOR PANELS:**

- **Closely related items:** 4px (space-1) - buttons in groups
- **Form fields:** 8-12px (space-2 to space-3)
- **Content sections:** 12px (space-3) - cards, blocks
- **Major sections:** 16px (space-4) - between different content types
- **Panel padding:** 16px (p-4) - internal panel padding
- **Maximum gap:** 20px - never exceed this inside panels

**CRITICAL CONSTRAINTS FOR PANEL CONTENT:**

- NEVER use shadows inside panels (panel provides elevation)
- NEVER use large spacing (max 20px gaps)
- NEVER use full-size typography (max 14px for headings, 13px for body)
- NEVER use bright colors or high contrast (keep subtle and muted)
- ALWAYS use compressed padding and margins
- ALWAYS prefer icons over text labels when space is tight
- ALWAYS use hover states to reveal secondary actions
- ALWAYS maintain single-column layout (no side-by-side unless essential)

This compressed hierarchy ensures panel content feels efficient and focused while maintaining excellent usability in the constrained space.
