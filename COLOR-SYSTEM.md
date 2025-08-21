# Color System Documentation

## Base Colors

| Color | Value | Usage |
|-------|-------|-------|
| Neutral | #737373 | UI backgrounds, borders, text |
| Primary | #1A1A19 | Primary actions, emphasis |
| Brand | #FACC15 | Brand expression, highlights |
| Success | #22C55E | Success states, confirmations |
| Warning | #F59E0B | Warning states, cautions |
| Destructive | #EF4444 | Errors, destructive actions |

## Generated Scales

### Neutral Scale
```css
--neutral-50: #FAFAFA;
--neutral-100: #F5F5F5;
--neutral-200: #E8E8E8;
--neutral-300: #D6D6D6;
--neutral-400: #A3A3A3;
--neutral-500: #737373;
--neutral-600: #525252;
--neutral-700: #404040;
--neutral-800: #262626;
--neutral-900: #1A1A1A;
--neutral-950: #0A0A0A;
```

### Usage Patterns

#### Backgrounds
- **Subtle**: 50-100 (barely visible)
- **Light**: 100-200 (cards, sections)
- **Medium**: 200-300 (hover states)

#### Text
- **Primary**: 900-950 (high contrast)
- **Secondary**: 600-700 (medium contrast)
- **Muted**: 400-500 (low contrast)

#### Borders
- **Subtle**: 200 (default borders)
- **Visible**: 300 (hover borders)
- **Strong**: 400 (focus borders)

#### Interactive States
- **Default**: Base (500)
- **Hover**: +100 (e.g., 500 → 600)
- **Active**: +200 (e.g., 500 → 700)
- **Disabled**: 300 (muted appearance)
