"use client";

import { ThinkingIndicator } from "@/components/ui/skeleton-screens";

export function AckLoader() {
  return (
    <div className="pt-1 pl-1">
      <ThinkingIndicator message="Analyzing" />
    </div>
  );
}

export default AckLoader;
