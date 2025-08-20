"use client";

import { useState } from "react";

import { Check, AlertCircle, Info, AlertTriangle } from "lucide-react";

/**
 * Hybrid Token System Demo Component
 *
 * Demonstrates the new hybrid approach combining:
 * - Semantic tokens (bg-background, text-foreground) for common cases
 * - Numbered variants (bg-primary-100, text-destructive-700) for precision
 *
 * Usage Guidelines:
 * 1. Use semantic tokens for 80% of cases (layout, basic styling)
 * 2. Use numbered variants for precise control (hover states, complex components)
 * 3. Maintain design system consistency by choosing from defined scales
 */
export function HybridTokenDemo() {
  const [selectedVariant, setSelectedVariant] = useState<string>("semantic");

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      {/* Header using semantic tokens */}
      <div className="space-y-2">
        <h1 className="text-foreground text-2xl font-semibold">Hybrid Design Token System</h1>
        <p className="text-muted-foreground">Combining semantic clarity with numbered precision</p>
      </div>

      {/* Variant Selector using semantic tokens */}
      <div className="bg-card border-border rounded-[var(--radius-card)] border p-4">
        <h2 className="text-foreground mb-3 text-lg font-medium">Choose Demo Style</h2>
        <div className="rounded-pill bg-muted/50 inline-flex p-1">
          {[
            { id: "semantic", label: "Semantic Only" },
            { id: "numbered", label: "Numbered Variants" },
            { id: "hybrid", label: "Hybrid Approach" },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedVariant(option.id)}
              className={`rounded-pill px-4 py-2 text-sm font-medium transition-all duration-200 ${
                selectedVariant === option.id
                  ? "bg-background text-foreground shadow-[var(--shadow-soft-drop)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Button Examples */}
      <div className="bg-card border-border rounded-[var(--radius-card)] border p-6">
        <h3 className="text-foreground mb-4 text-lg font-medium">Button Examples</h3>
        <div className="space-y-4">
          {/* Semantic Approach (Preserved) */}
          {(selectedVariant === "semantic" || selectedVariant === "hybrid") && (
            <div>
              <h4 className="text-muted-foreground mb-2 text-sm font-medium">Semantic Tokens (Primary Usage)</h4>
              <div className="flex gap-3">
                <button className="bg-accent/10 text-foreground hover:bg-accent/15 rounded-[var(--radius-button)] px-4 py-2 transition-all duration-200 hover:shadow-[var(--shadow-soft-drop)]">
                  Primary Action
                </button>
                <button className="text-muted-foreground hover:text-foreground hover:bg-accent/5 rounded-[var(--radius-button)] px-4 py-2 transition-colors duration-200">
                  Secondary
                </button>
                <button className="text-destructive hover:bg-destructive/10 rounded-[var(--radius-button)] px-4 py-2 transition-colors duration-200">
                  Destructive
                </button>
              </div>
            </div>
          )}

          {/* Numbered Variants (New) */}
          {(selectedVariant === "numbered" || selectedVariant === "hybrid") && (
            <div>
              <h4 className="text-muted-foreground mb-2 text-sm font-medium">Numbered Variants (Precision Usage)</h4>
              <div className="flex gap-3">
                <button className="bg-primary-100 text-primary-900 hover:bg-primary-200 rounded-[var(--radius-button)] px-4 py-2 transition-all duration-200">
                  Primary Light
                </button>
                <button className="bg-brand-500 text-brand-900 hover:bg-brand-400 rounded-[var(--radius-button)] px-4 py-2 transition-all duration-200">
                  Brand Action
                </button>
                <button className="bg-success-100 text-success-800 hover:bg-success-200 border-success-300 rounded-[var(--radius-button)] border px-4 py-2 transition-all duration-200">
                  Success State
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alert Examples */}
      <div className="bg-card border-border rounded-[var(--radius-card)] border p-6">
        <h3 className="text-foreground mb-4 text-lg font-medium">Alert System</h3>
        <div className="space-y-3">
          {/* Success Alert */}
          <div className="bg-success-50 border-success-200 text-success-900 rounded-[var(--radius-button)] border p-4">
            <div className="flex items-center gap-3">
              <Check className="text-success-600 h-5 w-5" />
              <div>
                <h4 className="text-success-900 font-medium">Success</h4>
                <p className="text-success-700 text-sm">
                  Using <code>bg-success-50</code>, <code>border-success-200</code>, <code>text-success-900</code>
                </p>
              </div>
            </div>
          </div>

          {/* Warning Alert */}
          <div className="bg-warning-50 border-warning-200 text-warning-900 rounded-[var(--radius-button)] border p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-warning-600 h-5 w-5" />
              <div>
                <h4 className="text-warning-900 font-medium">Warning</h4>
                <p className="text-warning-700 text-sm">
                  Using <code>bg-warning-50</code>, <code>border-warning-200</code>, <code>text-warning-900</code>
                </p>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          <div className="bg-destructive-50 border-destructive-200 text-destructive-900 rounded-[var(--radius-button)] border p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-destructive-600 h-5 w-5" />
              <div>
                <h4 className="text-destructive-900 font-medium">Error</h4>
                <p className="text-destructive-700 text-sm">
                  Using <code>bg-destructive-50</code>, <code>border-destructive-200</code>,{" "}
                  <code>text-destructive-900</code>
                </p>
              </div>
            </div>
          </div>

          {/* Info Alert (Using semantic) */}
          <div className="bg-accent/10 border-border text-foreground rounded-[var(--radius-button)] border p-4">
            <div className="flex items-center gap-3">
              <Info className="text-muted-foreground h-5 w-5" />
              <div>
                <h4 className="text-foreground font-medium">Information</h4>
                <p className="text-muted-foreground text-sm">
                  Using semantic tokens: <code>bg-accent/10</code>, <code>border-border</code>,{" "}
                  <code>text-foreground</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Color Scale Preview */}
      <div className="bg-card border-border rounded-[var(--radius-card)] border p-6">
        <h3 className="text-foreground mb-4 text-lg font-medium">Color Scale Preview</h3>
        <div className="space-y-6">
          {/* Primary Scale */}
          <div>
            <h4 className="text-muted-foreground mb-2 text-sm font-medium">Primary Scale</h4>
            <div className="flex gap-1">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
                <div
                  key={shade}
                  className={`bg-primary-${shade} border-border h-12 w-12 rounded-[var(--radius-button)] border`}
                  title={`primary-${shade}`}
                />
              ))}
            </div>
          </div>

          {/* Brand Scale */}
          <div>
            <h4 className="text-muted-foreground mb-2 text-sm font-medium">Brand Scale</h4>
            <div className="flex gap-1">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
                <div
                  key={shade}
                  className={`bg-brand-${shade} border-border h-12 w-12 rounded-[var(--radius-button)] border`}
                  title={`brand-${shade}`}
                />
              ))}
            </div>
          </div>

          {/* Neutral Scale */}
          <div>
            <h4 className="text-muted-foreground mb-2 text-sm font-medium">Neutral Scale</h4>
            <div className="flex gap-1">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
                <div
                  key={shade}
                  className={`bg-neutral-${shade} border-border h-12 w-12 rounded-[var(--radius-button)] border`}
                  title={`neutral-${shade}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Usage Guidelines */}
      <div className="bg-card border-border rounded-[var(--radius-card)] border p-6">
        <h3 className="text-foreground mb-4 text-lg font-medium">Usage Guidelines</h3>
        <div className="space-y-4">
          <div className="bg-accent/5 rounded-[var(--radius-button)] p-4">
            <h4 className="text-foreground mb-2 font-medium">✅ When to use Semantic Tokens</h4>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>• Layout and basic styling (80% of use cases)</li>
              <li>• Consistent theme switching</li>
              <li>• Standard component patterns</li>
              <li>• Quick prototyping</li>
            </ul>
          </div>

          <div className="bg-accent/5 rounded-[var(--radius-button)] p-4">
            <h4 className="text-foreground mb-2 font-medium">🎯 When to use Numbered Variants</h4>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>• Complex hover/focus states</li>
              <li>• Alert and status systems</li>
              <li>• Data visualization</li>
              <li>• Specific brand expression</li>
              <li>• Fine-tuned visual hierarchy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
