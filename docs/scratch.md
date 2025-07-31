Action Items (priority order)
Refactor SlideOutPanel into Shadcn Sheet component; remove inline styles and custom red border.
Extract shared PanelHeader, PanelBody, PanelFooter primitives; adopt in both components.
Normalise backdrop opacity & animation tokens across all overlay components.
Replace hardcoded colours/gradients with CSS variables or brand-mapping util.
Unify internal padding (p-6) and standard gap utilities (space-y-6, gap-3).
Split VideoInsightsDialog into smaller sub-files (<300 lines) to reduce complexity and facilitate consistent styling.
Run a quick dark-mode sweep to verify both surfaces inherit palette automatically.