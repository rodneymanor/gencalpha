import { Metadata } from "next";

import { ManusPrompt } from "@/components/manus-prompt";

import CreatorVideosGrid, { mockVideoData } from "./_components/creator-videos-grid";

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

      {/* Creator Inspiration Section */}
      <div className="px-6 pb-8">
        <div className="mb-6">
          <h2 className="text-foreground text-2xl font-semibold">Creator Inspiration</h2>
        </div>
        <CreatorVideosGrid
          videos={mockVideoData}
          onVideoClick={(video) => {
            // Handle video click - could open modal/slideout
            console.log("Video clicked:", video);
          }}
        />
      </div>
    </div>
  );
}
