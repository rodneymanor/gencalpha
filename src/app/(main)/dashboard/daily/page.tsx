import { Metadata } from "next";

import { ManusPrompt } from "@/components/manus-prompt";

import { PersonalizedVideoFeed } from "./_components/personalized-video-feed";

export const metadata: Metadata = {
  title: "Daily | Studio Admin",
  description: "Daily content inspiration and ideas",
};

export default function DailyPage() {
  return (
    <div className="space-y-8">
      {/* Manus Prompt */}
      <ManusPrompt />

      {/* Header Section */}
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-primary text-lg font-semibold md:text-xl">Short form Inspiration For You!</h2>
        </div>
      </div>

      {/* Personalized Inspiration Feed */}
      <div className="mx-auto max-w-7xl">
        <PersonalizedVideoFeed />
      </div>
    </div>
  );
}
