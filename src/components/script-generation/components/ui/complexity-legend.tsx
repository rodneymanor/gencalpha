import React from "react";

interface ComplexityLegendProps {
  show: boolean;
}

/**
 * Complexity legend component for readability analysis
 * Extracted from lines 674-701 of the original component
 */
export function ComplexityLegend({ show }: ComplexityLegendProps) {
  if (!show) return null;

  return (
    <div className="border-border mt-8 border-t pt-6">
      <h4 className="text-foreground mb-3 text-sm font-medium">Readability Analysis</h4>
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center space-x-2">
          <div 
            className="h-3 w-4 rounded-sm" 
            style={{ backgroundColor: "rgba(59, 130, 246, 0.08)" }} 
          />
          <span className="text-muted-foreground text-xs">Middle School</span>
        </div>
        <div className="flex items-center space-x-2">
          <div 
            className="h-3 w-4 rounded-sm" 
            style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }} 
          />
          <span className="text-muted-foreground text-xs">High School</span>
        </div>
        <div className="flex items-center space-x-2">
          <div 
            className="h-3 w-4 rounded-sm" 
            style={{ backgroundColor: "rgba(249, 115, 22, 0.1)" }} 
          />
          <span className="text-muted-foreground text-xs">College</span>
        </div>
        <div className="flex items-center space-x-2">
          <div 
            className="h-3 w-4 rounded-sm" 
            style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }} 
          />
          <span className="text-muted-foreground text-xs">Graduate</span>
        </div>
      </div>
      <div className="mt-2">
        <span className="text-muted-foreground text-xs">
          5th grade and below are not highlighted (optimal readability)
        </span>
      </div>
    </div>
  );
}
