#!/usr/bin/env node

/**
 * Automated Accessibility Checker
 * 
 * This script performs basic contrast ratio checks on the design system colors
 * and validates that key accessibility requirements are met.
 */

const fs = require('fs');
const path = require('path');

// Utility function to convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Calculate relative luminance
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio between two colors
function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

// Test cases based on our design system
const contrastTests = [
  // Critical text contrast tests
  {
    name: "Sidebar Navigation Text",
    foreground: "#525252", // neutral-600
    background: "#FFFFFF", // white
    requirement: 4.5,
    type: "text"
  },
  {
    name: "Card Borders",
    foreground: "#737373", // neutral-500
    background: "#FFFFFF", // white
    requirement: 3.0,
    type: "border"
  },
  {
    name: "Input Field Borders",
    foreground: "#737373", // neutral-500
    background: "#FFFFFF", // white
    requirement: 3.0,
    type: "border"
  },
  {
    name: "Button Text (Ghost)",
    foreground: "#525252", // neutral-600
    background: "#FFFFFF", // white
    requirement: 4.5,
    type: "text"
  },
  {
    name: "Badge Text",
    foreground: "#FFFFFF", // white
    background: "#404040", // neutral-700
    requirement: 4.5,
    type: "text"
  },
  {
    name: "Focus Ring",
    foreground: "#0B5CFF", // primary blue
    background: "#FFFFFF", // white
    requirement: 3.0,
    type: "border"
  }
];

console.log("🔍 Running Accessibility Contrast Checks...\n");

let passed = 0;
let failed = 0;

contrastTests.forEach(test => {
  const ratio = getContrastRatio(test.foreground, test.background);
  const passes = ratio >= test.requirement;
  
  const status = passes ? "✅ PASS" : "❌ FAIL";
  const ratioText = `${ratio.toFixed(2)}:1`;
  const requiredText = `(requires ${test.requirement}:1)`;
  
  console.log(`${status} ${test.name}: ${ratioText} ${requiredText}`);
  
  if (passes) {
    passed++;
  } else {
    failed++;
    console.log(`   └── Fix: Adjust ${test.type === 'text' ? 'text' : 'border'} color for better contrast`);
  }
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.log("\n⚠️  Some accessibility tests failed. Please review the contrast ratios above.");
  process.exit(1);
} else {
  console.log("\n🎉 All accessibility contrast tests passed!");
}

// Additional checks
console.log("\n🔍 Additional Accessibility Checks:");

// Check if outline: none is disabled globally
const globalsPath = path.join(__dirname, '../src/app/globals.css');
if (fs.existsSync(globalsPath)) {
  const globalsContent = fs.readFileSync(globalsPath, 'utf8');
  
  if (globalsContent.includes('outline: none !important')) {
    console.log("❌ FAIL: Global outline disabling found in globals.css");
    failed++;
  } else {
    console.log("✅ PASS: No global outline disabling found");
  }
  
  if (globalsContent.includes('focus-visible') && globalsContent.includes('outline')) {
    console.log("✅ PASS: Focus-visible styles implemented");
  } else {
    console.log("❌ FAIL: Focus-visible styles not found");
    failed++;
  }
} else {
  console.log("⚠️  Could not find globals.css file");
}

console.log(`\n📊 Final Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.log("\n💡 Next Steps:");
  console.log("1. Review failed contrast ratios above");
  console.log("2. Update color values to meet WCAG AA requirements");
  console.log("3. Test with screen readers and keyboard navigation");
  console.log("4. Run this script again to verify fixes");
  process.exit(1);
} else {
  console.log("\n🎉 All accessibility checks passed!");
}
