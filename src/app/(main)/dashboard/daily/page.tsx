import { Metadata } from "next";

import { ManusPrompt } from "@/components/manus-prompt";

import { DailyInspirationSection } from "./_components/daily-inspiration-section";

export const metadata: Metadata = {
  title: "Daily | Studio Admin",
  description: "Daily content inspiration and ideas",
};

export default function DailyPage() {
  return (
    <div className="space-y-8">
      {/* Manus Prompt */}
      <ManusPrompt />

      {/* Personalized Inspiration Section */}
      <div className="mx-auto max-w-7xl space-y-4">
        <DailyInspirationSection />
      </div>
    </div>
  );
}
