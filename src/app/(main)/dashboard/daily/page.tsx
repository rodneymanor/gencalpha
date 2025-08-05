import { Metadata } from "next";

import { ManusPrompt } from "@/components/manus-prompt";

import { DailyInspirationSection } from "./_components/daily-inspiration-section";

export const metadata: Metadata = {
  title: "Daily | Studio Admin",
  description: "Daily content inspiration and ideas",
};

export default function DailyPage() {
  return (
    <div className="min-h-screen">
      {/* Manus Prompt positioned in center with space for content below */}
      <div className="flex min-h-screen flex-col justify-center">
        <ManusPrompt
          greeting="Hello"
          subtitle="What will you script today?"
          placeholder="Give Gen.C a topic to script..."
          className="mb-32"
        />
      </div>

      {/* Daily Inspiration Content - positioned below the fold */}
      <div className="min-h-screen space-y-6 p-6">
        <div className="mx-auto max-w-7xl">
          <DailyInspirationSection />
        </div>
      </div>
    </div>
  );
}
