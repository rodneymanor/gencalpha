"use client";

import { Loader2 } from "lucide-react";

export function AckLoader() {
  return (
    <div className="flex items-center gap-2 pt-1 pl-1">
      <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      <span className="sr-only">Analyzing…</span>
    </div>
  );
}

export default AckLoader;
