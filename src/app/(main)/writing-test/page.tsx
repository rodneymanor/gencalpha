"use client";

import React from "react";

import AIGhostwriterPage from "@/app/(main)/dashboard/ai-ghostwriter/page";
import { CreatorVideosGrid } from "@/app/(main)/dashboard/daily/_components/creator-videos-grid";
import DailyIdeaInboxSection from "@/app/(main)/dashboard/daily/_components/daily-idea-inbox-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClaudeChat } from "@/components/write-chat/claude-chat";

export default function WritingTestPage() {
  return (
    <div className="font-sans">
      <div className="mx-auto max-w-[1400px] px-6 py-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Chat Column */}
          <div className="xl:col-span-2">
            <div className="bg-card border-border relative rounded-[var(--radius-card)] border shadow-[var(--shadow-soft-drop)]">
              <ClaudeChat />
            </div>
          </div>

          {/* Side Utilities: Ideas / Ghostwriter / Creators */}
          <div className="space-y-4">
            <Tabs defaultValue="ideas" className="w-full">
              <TabsList className="bg-muted text-foreground grid w-full grid-cols-3 rounded-[var(--radius-button)]">
                <TabsTrigger value="ideas">Ideas</TabsTrigger>
                <TabsTrigger value="ghost">Ghostwriter</TabsTrigger>
                <TabsTrigger value="creators">Creators</TabsTrigger>
              </TabsList>

              <TabsContent value="ideas" className="mt-4">
                <DailyIdeaInboxSection />
              </TabsContent>

              <TabsContent value="ghost" className="mt-4">
                <AIGhostwriterPage />
              </TabsContent>

              <TabsContent value="creators" className="mt-4">
                <CreatorVideosGrid columns={3} showFollowButton={true} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
