"use client";

import { ChevronRight, FileText, PenTool, Users, BarChart3 } from "lucide-react";

export function PlaybookCards() {
  const handleCardClick = (cardType: "ideas" | "ghostwriter" | "creators") => {
    // Trigger slideout to open with the specific view
    const event = new CustomEvent("playbook:open-slideout", {
      detail: { view: cardType },
    });
    window.dispatchEvent(event);
  };

  const cards = [
    {
      title: "Idea inbox",
      type: "Notes",
      icon: <FileText className="h-4 w-4" />,
      description: "Capture and organize your creative ideas",
      view: "ideas" as const,
    },
    {
      title: "Ghost writer",
      type: "Ideas",
      icon: <PenTool className="h-4 w-4" />,
      description: "AI-powered content creation assistant",
      view: "ghostwriter" as const,
    },
    {
      title: "Follow Creators",
      type: "Videos",
      icon: <Users className="h-4 w-4" />,
      description: "Track and engage with content creators",
      view: "creators" as const,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl rounded-lg p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-base font-semibold">Endless Content Inspiration</h2>
          <p className="text-muted-foreground mt-1 text-sm">Turn ideas into viral scripts with AI-powered workflows</p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => handleCardClick(card.view)}
            className="hover:bg-muted/50 group flex h-36 cursor-pointer flex-col justify-between rounded-xl border-[0.5px] border-[var(--border-visible)] p-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[var(--border-hover)] hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
          >
            {/* Card Content */}
            <div className="flex flex-col gap-2">
              {/* Icon */}
              <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                <div className="text-muted-foreground">{card.icon}</div>
              </div>

              {/* Title */}
              <h3 className="text-foreground line-clamp-2 text-sm leading-5 font-medium">{card.title}</h3>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <BarChart3 className="text-muted-foreground h-3 w-3" />
                <span className="text-muted-foreground text-xs">{card.type}</span>
              </div>
              <ChevronRight className="text-foreground h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
