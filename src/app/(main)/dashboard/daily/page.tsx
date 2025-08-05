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
      {/* Manus Prompt positioned higher on page with fixed spacing to prevent shifting */}
      <div className="pt-32 pb-48">
        <ManusPrompt
          greeting="Hello"
          subtitle="What will you script today?"
          placeholder="Give Gen.C a topic to script..."
          className=""
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
