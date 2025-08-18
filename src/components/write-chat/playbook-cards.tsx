"use client";

import { FileText, PenTool, Users, ArrowUpRight } from "lucide-react";

import { CardBorderless } from "@/components/ui/card";
import { useCreatorsPageFlag, useGhostWriterFlag, useIdeaInboxFlag } from "@/hooks/use-feature-flag";

export function PlaybookCards() {
  const isCreatorsPageEnabled = useCreatorsPageFlag();
  const isGhostWriterEnabled = useGhostWriterFlag();
  const isIdeaInboxEnabled = useIdeaInboxFlag();
  
  const handleCardClick = (cardType: "ideas" | "ghostwriter" | "creators") => {
    // Trigger slideout to open with the specific view
    const event = new CustomEvent("playbook:open-slideout", {
      detail: { view: cardType },
    });
    window.dispatchEvent(event);
  };

  const baseCards = [];

  const ideaInboxCard = {
    title: "Idea inbox",
    type: "Notes",
    icon: <FileText className="h-4 w-4" />,
    description: "Capture and organize your creative ideas",
    view: "ideas" as const,
  };

  const ghostWriterCard = {
    title: "Ghost writer",
    type: "Ideas",
    icon: <PenTool className="h-4 w-4" />,
    description: "AI-powered content creation assistant",
    view: "ghostwriter" as const,
  };

  const creatorsCard = {
    title: "Follow Creators",
    type: "Videos",
    icon: <Users className="h-4 w-4" />,
    description: "Track and engage with content creators",
    view: "creators" as const,
  };

  // Build cards array based on feature flags
  let cards = [...baseCards];
  
  // Add idea inbox card if enabled
  if (isIdeaInboxEnabled) {
    cards.push(ideaInboxCard);
  }
  
  // Add ghost writer card if enabled
  if (isGhostWriterEnabled) {
    cards.push(ghostWriterCard);
  }
  
  // Add creators card if enabled
  if (isCreatorsPageEnabled) {
    cards.push(creatorsCard);
  }

  // Don't render the section if no cards are available
  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-4xl rounded-lg p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-base font-semibold">Endless Content Inspiration</h2>
          <p className="text-muted-foreground mt-1 text-sm">Turn ideas into viral scripts with AI-powered workflows</p>
        </div>
      </div>

      {/* Cards Grid - Adapts to number of cards */}
      <div className={`grid grid-cols-1 gap-6 ${cards.length === 3 ? 'md:grid-cols-3' : cards.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
        {cards.map((card) => (
          <CardBorderless
            key={card.view}
            onClick={() => handleCardClick(card.view)}
            className="group border-border relative h-36 cursor-pointer justify-between border bg-transparent hover:shadow-none"
          >
            {/* Card Content */}
            <div className="flex flex-col gap-3">
              {/* Icon - Subtle, borderless approach */}
              <div className="flex h-8 w-8 items-center justify-center">
                <div className="text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                  {card.icon}
                </div>
              </div>

              {/* Title and Description */}
              <div>
                <h3 className="text-foreground text-sm leading-5 font-medium">{card.title}</h3>
                <p className="text-muted-foreground mt-1 text-xs leading-4">{card.description}</p>
              </div>
            </div>

            {/* Action Button - appears on hover */}
            <div className="invisible absolute right-4 bottom-4 left-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
              <div className="bg-background text-foreground flex items-center justify-center gap-2 rounded-[var(--radius-button)] px-4 py-2 text-sm font-medium transition-all duration-200 hover:shadow-[var(--shadow-soft-drop)]">
                <ArrowUpRight className="h-4 w-4" />
                <span>View Now</span>
              </div>
            </div>
          </CardBorderless>
        ))}
      </div>
    </div>
  );
}
