"use client";

import { StreamlinedScriptWriter } from "@/components/script-generation/streamlined-script-writer";

export default function StreamlinedScriptWriterPage() {
  const handleScriptComplete = (script: string) => {
    console.log("Script completed:", script.substring(0, 100) + "...");
  };

  return (
    <StreamlinedScriptWriter
      onScriptComplete={handleScriptComplete}
      className="from-background to-background-muted bg-gradient-to-b"
    />
  );
}
