# Theme System Guide

This guide explains how to add new color themes to the Gen.C application using the Clarity Design System.

## Overview

The theme system allows you to easily create and test different color palettes while maintaining consistency across light and dark modes. All themes automatically support the full design system including borders, shadows, and component variants.

## Quick Start

1. **Access Theme Switcher**: Look for the palette icon (🎨) in the sidebar footer
2. **Switch Themes**: Click to see available themes (Default, Forest)
3. **Toggle Dark Mode**: Use the toggle switch in the dropdown
4. **Themes Persist**: Your selection is saved automatically

## Adding New Themes

### Step 1: Define Your Theme

Open `/src/lib/themes.ts` and add a new theme object to the `themes` array:

```typescript
{
  name: "ocean",           // Unique identifier (no spaces)
  label: "Ocean Blue",     // Display name in the UI
  light: {
    // Light mode colors
    primary: "#2563EB",
    secondary: "#0EA5E9",
    // ... other color properties
  },
  dark: {
    // Dark mode colors  
    primary: "#60A5FA",
    secondary: "#38BDF8",
    // ... other color properties
  }
}
```

### Step 2: Color Properties

Each theme requires these color properties for both light and dark modes:

#### Core Colors
- `background` - Main page background
- `foreground` - Primary text color
- `card` - Card backgrounds
- `cardForeground` - Text on cards
- `primary` - Primary button/accent color
- `primaryForeground` - Text on primary elements
- `secondary` - Secondary accent color
- `secondaryForeground` - Text on secondary elements
- `brand` - Brand color (usually consistent across themes)
- `muted` - Subtle background color
- `mutedForeground` - Muted text color

#### Interactive States
- `accent` - Hover/focus background
- `accentForeground` - Text on accent backgrounds
- `border` - Default border color
- `input` - Input field background
- `ring` - Focus ring color

#### Enhanced Borders
- `borderSubtle` - Very light borders
- `borderHover` - Hover state borders
- `borderFocus` - Focus state borders

#### Background Layers
- `backgroundElevated` - Elevated surfaces
- `backgroundOverlay` - Modal/overlay backgrounds
- `backgroundHover` - Hover state backgrounds
- `contentBg` - Content area background

#### Sidebar Colors
- `sidebar` - Sidebar background
- `sidebarForeground` - Sidebar text
- `sidebarPrimary` - Sidebar accent
- `sidebarPrimaryForeground` - Text on sidebar accent

### Step 3: Color Guidelines

#### Light Mode
- Use darker colors for text (`#34322D`)
- Light backgrounds (`#F8F8F7`, `#FFFFFF`)
- Subtle borders with low opacity (`rgba(0,0,0,0.06)`)

#### Dark Mode  
- Use lighter colors for text (`#EAEAE9`)
- Dark backgrounds (`#1A1A19`, `#262625`)
- Light borders with low opacity (`rgba(255,255,255,0.1)`)

#### Accessibility
- Ensure sufficient contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Test readability in both light and dark modes
- Consider color-blind users when choosing accent colors

### Step 4: Example Theme

Here's a complete example for an "Ocean" theme:

```typescript
{
  name: "ocean",
  label: "Ocean Blue",
  light: {
    background: "#F8FAFC",
    foreground: "#1E293B",
    card: "#FFFFFF",
    cardForeground: "#1E293B",
    popover: "#FFFFFF",
    popoverForeground: "#1E293B",
    primary: "#2563EB",
    primaryForeground: "#FFFFFF",
    secondary: "#0EA5E9",
    secondaryForeground: "#FFFFFF",
    brand: "#FACC15",
    brandForeground: "#1A1A19",
    muted: "#F1F5F9",
    mutedForeground: "#64748B",
    accent: "rgba(37, 99, 235, 0.1)",
    accentForeground: "#1E293B",
    destructive: "#EF4444",
    destructiveForeground: "#FFFFFF",
    border: "rgba(0,0,0,0.08)",
    input: "rgba(0,0,0,0.08)",
    ring: "#2563EB",
    borderSubtle: "rgba(0,0,0,0.04)",
    borderHover: "rgba(0,0,0,0.12)",
    borderFocus: "rgba(37, 99, 235, 0.3)",
    backgroundElevated: "rgba(255, 255, 255, 0.6)",
    backgroundOverlay: "rgba(248, 250, 252, 0.8)",
    backgroundHover: "rgba(0, 0, 0, 0.02)",
    contentBg: "#F1F5F9",
    chart1: "#2563EB",
    chart2: "#0EA5E9",
    chart3: "#64748B",
    chart4: "#1E293B",
    chart5: "#0F172A",
    sidebar: "#F8FAFC",
    sidebarForeground: "#1E293B",
    sidebarPrimary: "#2563EB",
    sidebarPrimaryForeground: "#FFFFFF",
    sidebarAccent: "rgba(37, 99, 235, 0.1)",
    sidebarAccentForeground: "#1E293B",
    sidebarBorder: "rgba(0,0,0,0.08)",
    sidebarRing: "#2563EB",
  },
  dark: {
    background: "#0F172A",
    foreground: "#F8FAFC",
    card: "#1E293B",
    cardForeground: "#F8FAFC",
    popover: "#1E293B",
    popoverForeground: "#F8FAFC",
    primary: "#60A5FA",
    primaryForeground: "#0F172A",
    secondary: "#38BDF8",
    secondaryForeground: "#0F172A",
    brand: "#FACC15",
    brandForeground: "#1A1A19",
    muted: "#0F172A",
    mutedForeground: "#64748B",
    accent: "rgba(96, 165, 250, 0.15)",
    accentForeground: "#F8FAFC",
    destructive: "#EF4444",
    destructiveForeground: "#FFFFFF",
    border: "rgba(255,255,255,0.1)",
    input: "rgba(255,255,255,0.1)",
    ring: "#60A5FA",
    borderSubtle: "rgba(255,255,255,0.06)",
    borderHover: "rgba(255,255,255,0.15)",
    borderFocus: "rgba(96, 165, 250, 0.4)",
    backgroundElevated: "rgba(30, 41, 59, 0.5)",
    backgroundOverlay: "rgba(15, 23, 42, 0.8)",
    backgroundHover: "rgba(255, 255, 255, 0.02)",
    contentBg: "#1E293B",
    chart1: "#60A5FA",
    chart2: "#38BDF8",
    chart3: "#64748B",
    chart4: "#F8FAFC",
    chart5: "#FFFFFF",
    sidebar: "#0F172A",
    sidebarForeground: "#F8FAFC",
    sidebarPrimary: "#60A5FA",
    sidebarPrimaryForeground: "#0F172A",
    sidebarAccent: "rgba(96, 165, 250, 0.15)",
    sidebarAccentForeground: "#F8FAFC",
    sidebarBorder: "rgba(255,255,255,0.1)",
    sidebarRing: "#60A5FA",
  }
}
```

## Testing Your Theme

1. **Save the file** - Your new theme will be available immediately
2. **Open the theme switcher** - Click the palette icon in the sidebar
3. **Select your theme** - It should appear in the dropdown list
4. **Test both modes** - Toggle between light and dark mode
5. **Check all components** - Navigate through different pages to see how your theme looks

## Best Practices

### Color Harmony
- Choose colors that work well together
- Consider using color tools like Adobe Color or Coolors.co
- Test with various content types (text, images, charts)

### Consistency
- Maintain consistent saturation levels across related colors
- Use the same color temperature (warm/cool) throughout
- Keep brand colors consistent across themes when possible

### Accessibility
- Use tools like WebAIM's contrast checker
- Test with users who have color vision differences
- Ensure interactive elements are clearly distinguishable

### Performance
- All themes are loaded once and cached
- Switching themes only updates CSS variables
- No performance impact on the application

## Troubleshooting

### Theme Not Appearing
- Check for syntax errors in the theme object
- Ensure the `name` property is unique
- Verify all required color properties are present

### Colors Not Updating
- Hard refresh the browser (Cmd/Ctrl + Shift + R)
- Check browser developer tools for CSS variable updates
- Ensure localStorage is working (check Application tab)

### Dark Mode Issues
- Verify both light and dark color objects are complete
- Check that dark mode colors have sufficient contrast
- Test the dark mode toggle functionality

## File Structure

```
src/
├── lib/
│   └── themes.ts              # Theme definitions
├── components/
│   └── theme/
│       └── theme-switcher.tsx # Theme switcher component
└── contexts/
    └── theme-context.tsx      # Theme context (optional)
```

## Advanced Usage

### Dynamic Theme Loading
Themes can be loaded dynamically from an API or configuration file by modifying the themes array at runtime.

### Custom CSS Variables
You can add custom CSS variables to themes for specialized components by extending the `ThemeColors` interface.

### Theme Validation
Consider adding runtime validation to ensure all required colors are present in each theme definition.

---

For questions or issues with the theme system, check the existing themes in `themes.ts` for reference examples.