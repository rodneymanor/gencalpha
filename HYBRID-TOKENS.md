# Clarity Design System - Hybrid Token Approach

## Overview

The Clarity Design System now supports a **hybrid approach** that combines the clarity of semantic naming with the precision of numbered scales. This gives you the best of both worlds: semantic tokens for common use cases and numbered variants for fine-grained control.

## Philosophy

- **80% Semantic**: Use semantic tokens (`bg-background`, `text-foreground`) for layout and standard patterns
- **20% Numbered**: Use numbered variants (`bg-primary-200`, `text-destructive-700`) for precision and complex states
- **Backward Compatible**: All existing semantic tokens are preserved and continue to work

## Token Structure

### Semantic Tokens (Primary Usage)

Use these for most UI elements - they provide clear intent and automatic theme switching:

```css
/* Layout & Structure */
bg-background          /* Main page background */
bg-card                /* Card/container backgrounds */
text-foreground        /* Primary text */
text-muted-foreground  /* Secondary text */
border-border          /* Standard borders */

/* Interactive Elements */
bg-accent/10           /* Subtle button backgrounds */
hover:bg-accent/15     /* Hover states */
text-destructive       /* Error text */
bg-primary             /* High contrast elements */
```

### Numbered Variants (Precision Usage)

Use these when you need specific tones or complex state management:

```css
/* State Systems */
bg-success-50          /* Light success background */
text-success-700       /* Dark success text */
border-destructive-200 /* Light error border */

/* Complex Interactions */
bg-brand-100           /* Light brand tint */
hover:bg-brand-200     /* Brand hover state */
text-warning-800       /* Strong warning text */

/* Data Visualization */
bg-neutral-100         /* Precise gray tones */
bg-primary-700         /* Specific darkness level */
```

## Available Scales

### Primary Scale

Based on your main foreground color:

- **Light Theme**: `--primary` = `#1A1A19` (dark)
- **Dark Theme**: `--primary` = `#FFFFFF` (light)
- **Usage**: UI structure, high contrast elements

```css
bg-primary-50    /* Lightest */
bg-primary-100
bg-primary-200
bg-primary-300
bg-primary-400
bg-primary-500   /* Base semantic equivalent */
bg-primary-600
bg-primary-700
bg-primary-800
bg-primary-900
bg-primary-950   /* Darkest */
```

### Brand Scale

Based on your brand color (`#FACC15`):

- **Usage**: Brand expression, CTAs, highlights

```css
bg-brand-50     /* Very light brand tint */
bg-brand-500    /* Base brand color */
bg-brand-700    /* Darker brand shade */
```

### Neutral Scale

Systematic grays for precise control:

- **Usage**: Subtle backgrounds, precise text hierarchy

```css
bg-neutral-50   /* Almost white */
bg-neutral-500  /* Mid gray */
bg-neutral-900  /* Almost black */
```

### Status Scales

For alerts, confirmations, and feedback:

```css
/* Success (Green) */
bg-success-50   /* Light success background */
text-success-700 /* Success text */

/* Destructive (Red) */
bg-destructive-100 /* Light error background */
text-destructive-800 /* Strong error text */

/* Warning (Orange) */
bg-warning-50   /* Light warning background */
border-warning-300 /* Warning borders */
```

## Usage Guidelines

### 1. Start with Semantic

Always try semantic tokens first:

```tsx
// ✅ Good - Start semantic
<button className="bg-accent/10 text-foreground hover:bg-accent/15">
  Save Changes
</button>

// Only move to numbered if you need precision
<button className="bg-primary-100 text-primary-800 hover:bg-primary-200">
  Subtle Primary Action
</button>
```

### 2. State Management

Use numbered variants for complex state systems:

```tsx
// ✅ Complex alert system
<div className="bg-destructive-50 border-destructive-200 text-destructive-900">
  <AlertCircle className="text-destructive-600" />
  <span className="text-destructive-800">Error message</span>
</div>

// ✅ Simple error text
<span className="text-destructive">Simple error</span>
```

### 3. Hover State Patterns

```tsx
// ✅ Semantic hover (most cases)
hover:bg-accent/15

// ✅ Numbered hover (precise control)
hover:bg-success-200

// ✅ Numbered progression
bg-brand-500 hover:bg-brand-600 active:bg-brand-700
```

### 4. Theme Consistency

Both approaches work across light/dark themes automatically:

```tsx
// ✅ Both adapt to theme changes
<div className="bg-background text-foreground">         {/* Semantic */}
<div className="bg-neutral-100 text-neutral-800">      {/* Numbered */}
```

## Component Patterns

### Button Hierarchy with Hybrid Approach

```tsx
// Primary Action (Semantic)
<button className="bg-accent/10 text-foreground hover:bg-accent/15">
  Primary
</button>

// Secondary Action (Semantic)
<button className="text-muted-foreground hover:text-foreground hover:bg-accent/5">
  Secondary
</button>

// Brand CTA (Numbered for brand expression)
<button className="bg-brand-500 text-brand-900 hover:bg-brand-400">
  Get Started
</button>

// Success State (Numbered for specific feedback)
<button className="bg-success-100 text-success-800 border-success-300 hover:bg-success-200">
  ✓ Saved
</button>
```

### Alert System

```tsx
// Success Alert
<div className="bg-success-50 border-success-200 text-success-900 border rounded-[var(--radius-button)] p-4">
  <Check className="text-success-600" />
  <span className="text-success-800">Operation successful</span>
</div>

// Warning Alert
<div className="bg-warning-50 border-warning-200 text-warning-900 border rounded-[var(--radius-button)] p-4">
  <AlertTriangle className="text-warning-600" />
  <span className="text-warning-800">Proceed with caution</span>
</div>
```

### Data Visualization

```tsx
// Progress Bar
<div className="bg-neutral-200 rounded-pill h-2">
  <div className="bg-brand-500 h-full rounded-pill" style={{width: '60%'}} />
</div>

// Status Badges
<span className="bg-success-100 text-success-700 rounded-pill px-2 py-1">Active</span>
<span className="bg-warning-100 text-warning-700 rounded-pill px-2 py-1">Pending</span>
<span className="bg-neutral-100 text-neutral-700 rounded-pill px-2 py-1">Inactive</span>
```

## Migration Strategy

### Existing Code

All existing semantic usage continues to work unchanged:

```tsx
// ✅ This still works perfectly
<div className="bg-background text-foreground border-border">
  <button className="bg-accent/10 hover:bg-accent/15">Action</button>
</div>
```

### Enhancement Opportunities

Look for these patterns to enhance with numbered variants:

```tsx
// Before: Limited options
<div className="text-destructive">Error</div>

// After: Precise control when needed
<div className="text-destructive-700">Light error</div>
<div className="text-destructive-900">Strong error</div>
```

## Best Practices

### ✅ Do

- Use semantic tokens for 80% of styling
- Use numbered variants for alerts, status systems, and complex states
- Maintain design system consistency
- Test across light/dark themes
- Use numbered variants for data visualization
- Combine approaches when it makes sense

### ❌ Don't

- Replace all semantic tokens with numbered ones
- Use numbered variants for basic layout
- Mix different numbering systems arbitrarily
- Hardcode colors outside the design system
- Use numbered variants without considering theme switching

## Code Examples

View the complete demo component:

```bash
src/components/examples/hybrid-token-demo.tsx
```

This component demonstrates all patterns and provides interactive examples of both approaches.

## Summary

The hybrid approach gives you:

- **Clarity**: Semantic tokens express intent clearly
- **Precision**: Numbered variants provide fine control
- **Flexibility**: Choose the right tool for each use case
- **Consistency**: Both approaches follow the same design principles
- **Future-proof**: Easy to extend and maintain

Start with semantic tokens, reach for numbered variants when you need precision. This approach scales from simple prototypes to complex design systems.
