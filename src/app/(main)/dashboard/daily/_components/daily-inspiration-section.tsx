"use client";

import { ViralVideosMasonry } from "./viral-videos-masonry";

export function DailyInspirationSection() {
  console.log("📋 DailyInspirationSection: Component initialized");

  return (
    <div className="space-y-4">
      <h2 className="text-primary text-lg font-semibold md:text-xl">Explore Viral Content</h2>

      {/* Viral Videos Grid */}
      <ViralVideosMasonry />
    </div>
  );
}
