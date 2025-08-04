"use client";

import { useState } from "react";

import { RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

import { PersonalizedVideoFeed } from "./personalized-video-feed";

export function DailyInspirationSection() {
  console.log("📋 DailyInspirationSection: Component initialized");
  
  const [trigger, setTrigger] = useState<number | null>(null);

  console.log("📋 DailyInspirationSection: Rendering with trigger:", trigger);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-primary text-lg font-semibold md:text-xl">Short form Inspiration For You!</h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            console.log("🔄 DailyInspirationSection: Refresh button clicked");
            setTrigger(Date.now());
          }}
          className="flex items-center gap-2"
        >
          <RefreshCcw className="h-4 w-4" /> Fetch
        </Button>
      </div>

      {/* Feed */}
      <PersonalizedVideoFeed trigger={trigger} />
    </div>
  );
}
