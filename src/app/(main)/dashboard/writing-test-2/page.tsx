"use client";

import { useState, useEffect } from "react";

import { useSearchParams } from "next/navigation";

import { Lightbulb, Wand2, Users } from "lucide-react";

import { HeaderTitle } from "@/app/(main)/dashboard/_components/header-title";
import { SlideoutWrapper } from "@/components/standalone/slideout-wrapper";
import { cn } from "@/lib/utils";

import { ClaudeChat } from "./components/claude-chat-section";
import { CreatorFollowingSection } from "./components/creator-following-section";
import { GhostWriterSection } from "./components/ghost-writer-section";
import { IdeaInboxSection } from "./components/idea-inbox-section";
import { WritingWorkspaceSlideout } from "./components/writing-workspace-slideout";

type ActiveFeature = "chat" | "ideas" | "ghostwriter" | "creators" | null;

export default function WritingTest2Page() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chatId");
  const [activeFeature, setActiveFeature] = useState<ActiveFeature>(null);
  const [isChatActive, setIsChatActive] = useState(false);
  const [conversationIdToLoad, setConversationIdToLoad] = useState<string | null>(null);

  // Set conversation ID when URL param changes
  useEffect(() => {
    if (chatId) {
      setConversationIdToLoad(chatId);
      // Clear after component reads it
      setTimeout(() => setConversationIdToLoad(null), 100);
    }
  }, [chatId]);

  const handleFeatureSelect = (feature: ActiveFeature) => {
    setActiveFeature(feature);
    setIsChatActive(feature === "chat");
  };

  const handleChatStateChange = (isActive: boolean) => {
    setIsChatActive(isActive);
  };

  return (
    <SlideoutWrapper
      slideout={
        <WritingWorkspaceSlideout
          activeFeature={activeFeature}
          isChatActive={isChatActive}
          onFeatureSelect={handleFeatureSelect}
          onChatStateChange={handleChatStateChange}
        />
      }
      className="h-full"
    >
      <div className="flex h-full w-full flex-col">
        {/* Header */}
        <div className="border-border bg-background/95 flex h-16 items-center justify-between border-b px-6 backdrop-blur-sm">
          <HeaderTitle
            title="Writing Test 2"
            description="Unified writing workspace with chat, ideas, ghost writer, and creator following"
          />
          <div className="flex items-center gap-2">{/* Header actions can be added here if needed */}</div>
        </div>

        {/* Main Chat Interface */}
        <div className="flex-1 overflow-hidden">
          <ClaudeChat
            onChatStateChange={handleChatStateChange}
            className="h-full"
            conversationIdToLoad={conversationIdToLoad}
          />
        </div>

        {/* Mobile Features - only show when chat is not active */}
        {!isChatActive && (
          <div className="border-border bg-background block border-t p-6 lg:hidden">
            <div className="mx-auto max-w-2xl">
              <h3 className="text-foreground mb-4 text-lg font-semibold">Writing Tools</h3>
              <div className="grid gap-4">
                <MobileFeatureCard
                  icon={<Lightbulb className="h-5 w-5" />}
                  title="Idea Inbox"
                  description="Capture and organize your content ideas"
                  onClick={() => setActiveFeature("ideas")}
                />
                <MobileFeatureCard
                  icon={<Wand2 className="h-5 w-5" />}
                  title="Ghost Writer"
                  description="AI-powered writing assistance and templates"
                  onClick={() => setActiveFeature("ghostwriter")}
                />
                <MobileFeatureCard
                  icon={<Users className="h-5 w-5" />}
                  title="Creator Following"
                  description="Follow creators and discover their latest content"
                  onClick={() => setActiveFeature("creators")}
                />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Feature Sections */}
        <div className="lg:hidden">
          {activeFeature === "ideas" && (
            <div className="border-border bg-card border-t p-6">
              <IdeaInboxSection onClose={() => setActiveFeature(null)} />
            </div>
          )}
          {activeFeature === "ghostwriter" && (
            <div className="border-border bg-card border-t p-6">
              <GhostWriterSection onClose={() => setActiveFeature(null)} />
            </div>
          )}
          {activeFeature === "creators" && (
            <div className="border-border bg-card border-t p-6">
              <CreatorFollowingSection onClose={() => setActiveFeature(null)} />
            </div>
          )}
        </div>
      </div>
    </SlideoutWrapper>
  );
}

interface MobileFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

function MobileFeatureCard({ icon, title, description, onClick }: MobileFeatureCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "bg-card hover:bg-accent border-border flex w-full items-start gap-3 rounded-[var(--radius-card)] border p-4 text-left transition-colors",
      )}
    >
      <div className="text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-button)]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-foreground font-medium">{title}</h4>
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      </div>
    </button>
  );
}
