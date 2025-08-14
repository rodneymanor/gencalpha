"use client";

import { MessageSquare, Lightbulb, Wand2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { CreatorFollowingSection } from "./creator-following-section";
import { GhostWriterSection } from "./ghost-writer-section";
import { IdeaInboxSection } from "./idea-inbox-section";

type ActiveFeature = "chat" | "ideas" | "ghostwriter" | "creators" | null;

interface WritingWorkspaceSlideoutProps {
  activeFeature: ActiveFeature;
  isChatActive: boolean;
  onFeatureSelect: (feature: ActiveFeature) => void;
  onChatStateChange: (isActive: boolean) => void;
}

const FEATURES = [
  {
    id: "ideas" as const,
    label: "Ideas",
    icon: <Lightbulb className="h-4 w-4" />,
    description: "Idea Inbox",
  },
  {
    id: "ghostwriter" as const,
    label: "Ghost Writer",
    icon: <Wand2 className="h-4 w-4" />,
    description: "AI Templates",
  },
  {
    id: "creators" as const,
    label: "Creators",
    icon: <Users className="h-4 w-4" />,
    description: "Following",
  },
  {
    id: "chat" as const,
    label: "Chat Results",
    icon: <MessageSquare className="h-4 w-4" />,
    description: "Claude Output",
  },
];

export function WritingWorkspaceSlideout({
  activeFeature,
  isChatActive,
  onFeatureSelect,
}: WritingWorkspaceSlideoutProps) {
  // When chat is active, don't show feature tabs - only show chat results
  if (isChatActive) {
    return null; // Let the existing slideout editor handle chat results
  }

  return (
    <div className="flex h-full flex-col">
      {/* Feature Tabs */}
      <div className="border-border bg-background border-b">
        <div className="flex">
          {FEATURES.filter((f) => f.id !== "chat").map((feature) => (
            <button
              key={feature.id}
              onClick={() => onFeatureSelect(activeFeature === feature.id ? null : feature.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                activeFeature === feature.id
                  ? "border-primary text-primary bg-accent/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/30 border-transparent",
              )}
            >
              {feature.icon}
              <span className="hidden sm:inline">{feature.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feature Content */}
      <div className="flex-1 overflow-hidden">
        {activeFeature === "ideas" && <IdeaInboxSection />}
        {activeFeature === "ghostwriter" && <GhostWriterSection />}
        {activeFeature === "creators" && <CreatorFollowingSection />}
        {!activeFeature && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="text-muted-foreground mb-4 text-lg">Choose a writing tool</div>
              <div className="flex gap-3">
                {FEATURES.filter((f) => f.id !== "chat").map((feature) => (
                  <Button
                    key={feature.id}
                    variant="outline"
                    onClick={() => onFeatureSelect(feature.id)}
                    className="flex h-auto min-w-[120px] flex-col gap-2 p-6"
                  >
                    <div className="text-primary">{feature.icon}</div>
                    <div>
                      <div className="font-medium">{feature.label}</div>
                      <div className="text-muted-foreground text-xs">{feature.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
