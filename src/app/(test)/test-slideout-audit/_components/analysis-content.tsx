import { Code, Grid3X3 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AnalysisContent() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Implementation Patterns
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-foreground mb-2 font-semibold">Sheet-based (3 components)</h4>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>• Uses shadcn Sheet component</li>
              <li>• Built-in responsive behavior</li>
              <li>• Consistent backdrop and animations</li>
              <li>• Less customization control</li>
            </ul>
          </div>
          <div>
            <h4 className="text-foreground mb-2 font-semibold">Transform-based (2 components)</h4>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>• Custom transform animations</li>
              <li>• Full control over styling</li>
              <li>• Custom easing curves</li>
              <li>• More implementation overhead</li>
            </ul>
          </div>
          <div>
            <h4 className="text-foreground mb-2 font-semibold">Fixed Position (1 component)</h4>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>• Not a true slideout panel</li>
              <li>• Fixed/sticky positioning</li>
              <li>• Specialized for video content</li>
              <li>• Different interaction model</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            Consolidation Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-foreground mb-2 font-semibold">Single Source of Truth</h4>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>• Unified slideout component API</li>
              <li>• Consistent animation system</li>
              <li>• Standardized responsive behavior</li>
              <li>• Common styling patterns</li>
            </ul>
          </div>
          <div>
            <h4 className="text-foreground mb-2 font-semibold">Recommended Architecture</h4>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>• Base SlideoutPanel component</li>
              <li>• Configurable animation types</li>
              <li>• Pluggable content system</li>
              <li>• Consistent design system integration</li>
            </ul>
          </div>
          <div>
            <h4 className="text-foreground mb-2 font-semibold">Migration Strategy</h4>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>• Create unified component</li>
              <li>• Migrate Sheet-based first</li>
              <li>• Update transform-based</li>
              <li>• Preserve specialized components</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
