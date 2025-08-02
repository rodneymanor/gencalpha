"use server";

import { Metadata } from "next";

import { DailyInspirationSection } from "@/app/(main)/dashboard/daily/_components/daily-inspiration-section";
import { ManusPrompt } from "@/components/manus-prompt";

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
