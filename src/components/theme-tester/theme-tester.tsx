"use client";

import { useState, useEffect } from "react";
import { 
  generateColorScales, 
  generateCSSVariables,
  themePresets,
  type BaseColors 
} from "@/lib/color-system";
import { Palette, Copy, Check, Download, RefreshCw } from "lucide-react";

/**
 * Theme Testing Interface
 * 
 * Allows rapid experimentation with different color combinations
 * Live preview of generated color scales
 * Export functionality for theme configurations
 */
export function ThemeTester() {
  const [baseColors, setBaseColors] = useState<BaseColors>(themePresets.default.colors);
  const [isDark, setIsDark] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState('default');

  // Apply generated CSS variables to preview container
  useEffect(() => {
    const css = generateCSSVariables(baseColors, isDark);
    const styleId = 'theme-tester-styles';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    
    styleEl.textContent = `.theme-preview { ${css} }`;
    
    return () => {
      const el = document.getElementById(styleId);
      if (el) {
        el.remove();
      }
    };
  }, [baseColors, isDark]);

  // Handle color input changes
  const handleColorChange = (key: keyof BaseColors, value: string) => {
    setBaseColors(prev => ({
      ...prev,
      [key]: value
    }));
    setActivePreset('custom');
  };

  // Apply preset theme
  const applyPreset = (presetKey: string) => {
    const preset = themePresets[presetKey as keyof typeof themePresets];
    if (preset) {
      setBaseColors(preset.colors);
      setActivePreset(presetKey);
    }
  };

  // Copy color value to clipboard
  const copyToClipboard = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  // Export current configuration
  const exportConfig = () => {
    const config = {
      name: 'custom-theme',
      baseColors,
      generatedAt: new Date().toISOString(),
      scales: generateColorScales(baseColors),
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theme-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate color scales for preview
  const scales = generateColorScales(baseColors);

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Palette className="h-6 w-6 text-brand-500" />
          <h1 className="text-2xl font-semibold">Theme Color Tester</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className="rounded-[var(--radius-button)] bg-neutral-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-300"
          >
            {isDark ? '🌙 Dark' : '☀️ Light'} Mode
          </button>
          <button
            onClick={exportConfig}
            className="flex items-center gap-2 rounded-[var(--radius-button)] bg-primary text-primary-foreground px-4 py-2 text-sm font-medium transition-all hover:opacity-90"
          >
            <Download className="h-4 w-4" />
            Export Config
          </button>
        </div>
      </div>

      {/* Base Color Controls */}
      <div className="rounded-[var(--radius-card)] border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-medium">Base Colors</h2>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
          {Object.entries(baseColors).map(([key, value]) => (
            <div key={key}>
              <label className="mb-2 block text-sm font-medium capitalize text-muted-foreground">
                {key}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => handleColorChange(key as keyof BaseColors, e.target.value)}
                  className="h-10 w-20 cursor-pointer rounded border border-border"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleColorChange(key as keyof BaseColors, e.target.value)}
                  className="flex-1 rounded-[var(--radius-button)] border border-border bg-background px-3 py-2 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(value, key)}
                  className="rounded-[var(--radius-button)] p-2 transition-colors hover:bg-accent"
                >
                  {copied === key ? <Check className="h-4 w-4 text-success-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preset Themes */}
      <div className="rounded-[var(--radius-card)] border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-medium">Theme Presets</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(themePresets).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className={`rounded-[var(--radius-button)] px-4 py-2 text-sm font-medium transition-all ${
                activePreset === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-neutral-100 hover:bg-neutral-200'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Color Scale Preview */}
      <div className="rounded-[var(--radius-card)] border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-medium">Generated Color Scales</h2>
        <div className="space-y-6">
          {Object.entries(scales).map(([scaleName, scale]) => (
            <div key={scaleName}>
              <h3 className="mb-2 text-sm font-medium capitalize text-muted-foreground">
                {scaleName} Scale
              </h3>
              <div className="flex gap-1">
                {Object.entries(scale).map(([number, color]) => (
                  <button
                    key={number}
                    onClick={() => copyToClipboard(color, `${scaleName}-${number}`)}
                    className="group relative flex-1"
                    title={`${scaleName}-${number}: ${color}`}
                  >
                    <div
                      className="h-12 w-full rounded-[var(--radius-button)] border border-border transition-transform hover:scale-105"
                      style={{ backgroundColor: color }}
                    />
                    <span className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded bg-foreground px-2 py-1 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100">
                      {number}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Preview */}
      <div className="theme-preview rounded-[var(--radius-card)] border border-border p-6" style={{ background: 'var(--background)' }}>
        <h2 className="mb-4 text-lg font-medium" style={{ color: 'var(--foreground)' }}>
          Live Preview
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Sample Card */}
          <div 
            className="rounded-[var(--radius-card)] p-4"
            style={{ 
              background: 'var(--card)',
              border: '1px solid var(--border)'
            }}
          >
            <h3 style={{ color: 'var(--card-foreground)' }} className="mb-2 font-medium">
              Sample Card
            </h3>
            <p style={{ color: 'var(--muted-foreground)' }} className="mb-3 text-sm">
              This card demonstrates the color relationships in your theme.
            </p>
            <div className="flex gap-2">
              <button
                className="rounded-[var(--radius-button)] px-3 py-1.5 text-sm"
                style={{
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground)'
                }}
              >
                Primary
              </button>
              <button
                className="rounded-[var(--radius-button)] px-3 py-1.5 text-sm"
                style={{
                  background: 'var(--brand)',
                  color: 'var(--brand-foreground)'
                }}
              >
                Brand
              </button>
            </div>
          </div>

          {/* Status Examples */}
          <div className="space-y-2">
            <div 
              className="rounded-[var(--radius-button)] p-3 text-sm"
              style={{ 
                background: `${scales.success[100]}`,
                color: scales.success[900],
                border: `1px solid ${scales.success[200]}`
              }}
            >
              ✓ Success message with numbered variants
            </div>
            <div 
              className="rounded-[var(--radius-button)] p-3 text-sm"
              style={{ 
                background: `${scales.warning[100]}`,
                color: scales.warning[900],
                border: `1px solid ${scales.warning[200]}`
              }}
            >
              ⚠️ Warning message example
            </div>
            <div 
              className="rounded-[var(--radius-button)] p-3 text-sm"
              style={{ 
                background: `${scales.destructive[100]}`,
                color: scales.destructive[900],
                border: `1px solid ${scales.destructive[200]}`
              }}
            >
              ✕ Error message display
            </div>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="rounded-[var(--radius-card)] border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-medium">How to Use</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>1. <strong>Adjust base colors</strong> using the color pickers or hex inputs</p>
          <p>2. <strong>Try presets</strong> for quick theme exploration</p>
          <p>3. <strong>Preview scales</strong> to see all generated variants</p>
          <p>4. <strong>Test in context</strong> with the live preview section</p>
          <p>5. <strong>Export config</strong> when you find a combination you like</p>
          <p className="mt-4 rounded-[var(--radius-button)] bg-accent p-3">
            💡 <strong>Tip:</strong> Changing one base color automatically generates a full 50-950 scale with consistent relationships
          </p>
        </div>
      </div>
    </div>
  );
}