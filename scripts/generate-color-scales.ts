#!/usr/bin/env node

/**
 * Generate Color Scales Script
 * 
 * Generates CSS variables for all color scales from base colors
 * Run: npm run generate:colors
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import { 
  generateColorScales, 
  generateCSSVariables, 
  defaultBaseColors,
  themePresets 
} from '../lib/color-system';

// Generate color scales for all theme presets
function generateAllThemes() {
  let cssContent = `/* Generated Color Scales - DO NOT EDIT MANUALLY */
/* Generated on ${new Date().toISOString()} */
/* Edit base colors in src/lib/color-system.ts instead */

`;

  // Generate default theme (light)
  cssContent += `:root {\n`;
  cssContent += `  /* ========================================
     GENERATED COLOR SCALES (Light Theme)
     ======================================== */\n\n`;
  cssContent += generateCSSVariables(defaultBaseColors, false);
  cssContent += `}\n\n`;

  // Generate dark theme
  cssContent += `.dark {\n`;
  cssContent += `  /* ========================================
     GENERATED COLOR SCALES (Dark Theme)
     ======================================== */\n\n`;
  cssContent += generateCSSVariables(defaultBaseColors, true);
  cssContent += `}\n\n`;

  // Generate theme preset classes
  Object.entries(themePresets).forEach(([key, preset]) => {
    if (key === 'default') return; // Skip default as it's already in :root
    
    cssContent += `/* Theme: ${preset.name} */\n`;
    cssContent += `.theme-${key} {\n`;
    cssContent += generateCSSVariables(preset.colors, false);
    cssContent += `}\n\n`;
    
    cssContent += `.theme-${key}.dark {\n`;
    cssContent += generateCSSVariables(preset.colors, true);
    cssContent += `}\n\n`;
  });

  return cssContent;
}

// Generate color documentation
function generateColorDocs() {
  const scales = generateColorScales(defaultBaseColors);
  let docs = `# Color System Documentation

## Base Colors

| Color | Value | Usage |
|-------|-------|-------|
| Neutral | ${defaultBaseColors.neutral} | UI backgrounds, borders, text |
| Primary | ${defaultBaseColors.primary} | Primary actions, emphasis |
| Brand | ${defaultBaseColors.brand} | Brand expression, highlights |
| Success | ${defaultBaseColors.success} | Success states, confirmations |
| Warning | ${defaultBaseColors.warning} | Warning states, cautions |
| Destructive | ${defaultBaseColors.destructive} | Errors, destructive actions |

## Generated Scales

### Neutral Scale
\`\`\`css
`;

  Object.entries(scales.neutral).forEach(([num, color]) => {
    docs += `--neutral-${num}: ${color};\n`;
  });

  docs += `\`\`\`

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
`;

  return docs;
}

// Main execution
async function main() {
  try {
    // Generate CSS file
    const cssContent = generateAllThemes();
    const cssPath = join(process.cwd(), 'src', 'styles', 'generated-colors.css');
    writeFileSync(cssPath, cssContent);
    console.log('✅ Generated color scales CSS:', cssPath);

    // Generate documentation
    const docsContent = generateColorDocs();
    const docsPath = join(process.cwd(), 'COLOR-SYSTEM.md');
    writeFileSync(docsPath, docsContent);
    console.log('✅ Generated color documentation:', docsPath);

    // Log preview of scales
    console.log('\n📊 Color Scale Preview:');
    const scales = generateColorScales(defaultBaseColors);
    console.log('Neutral Scale:', Object.values(scales.neutral).slice(0, 5).join(' → '), '...');
    console.log('Brand Scale:', Object.values(scales.brand).slice(0, 5).join(' → '), '...');
    console.log('Primary Scale:', Object.values(scales.primary).slice(0, 5).join(' → '), '...');

  } catch (error) {
    console.error('❌ Error generating color scales:', error);
    process.exit(1);
  }
}

main();