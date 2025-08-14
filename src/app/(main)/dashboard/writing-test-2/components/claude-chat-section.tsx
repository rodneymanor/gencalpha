"use client";

import ClaudeChatComponent from "@/components/write-chat/claude-chat";

interface ClaudeChatSectionProps {
  onChatStateChange?: (isActive: boolean) => void;
  className?: string;
}

export function ClaudeChat({ onChatStateChange, className }: ClaudeChatSectionProps) {
  return (
    <div className={className}>
      <ClaudeChatComponent
        placeholder="What will you script today?"
        onHeroStateChange={(isHero) => onChatStateChange?.(!isHero)}
        className="h-full"
      />
    </div>
  );
}
