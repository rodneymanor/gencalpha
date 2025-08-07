import { Metadata } from "next";

import { ManusPrompt } from "@/components/manus-prompt";

import { CreatorVideosGrid } from "./_components/creator-videos-grid";

export const metadata: Metadata = {
  title: "Daily | Studio Admin",
  description: "Daily content inspiration and ideas",
};

export default function DailyPage() {
  return (
    <div className="min-h-screen">
      {/* Manus Prompt positioned higher on page with fixed spacing to prevent shifting */}
      <div className="pt-8 pb-8">
        <ManusPrompt
          greeting="Hello"
          subtitle="What will you script today?"
          placeholder="Give Gen.C a topic to script..."
          className=""
        />
      </div>

      {/* Creator Videos Grid */}
      <div className="px-6 pb-8">
        <CreatorVideosGrid />
      </div>
    </div>
  );
}
