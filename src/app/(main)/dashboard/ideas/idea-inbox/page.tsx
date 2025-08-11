"use client";

import { DailyIdeaInboxSection } from "@/app/(main)/dashboard/daily/_components/daily-idea-inbox-section";

export default function IdeasIdeaInboxPage() {
  return (
    <div className="font-sans">
      <div className="px-6 pt-6 pb-8">
        <div className="space-y-2">
          <h1 className="text-foreground text-xl font-semibold md:text-2xl">Idea inbox</h1>
          <p className="text-muted-foreground text-sm md:text-base">Capture, organize, and refine your ideas.</p>
        </div>
        <div className="mt-6">
          <DailyIdeaInboxSection />
        </div>
      </div>
    </div>
  );
}
