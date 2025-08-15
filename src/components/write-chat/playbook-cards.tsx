"use client";

import { ChevronRight, FileText, PenTool, Users, BarChart3 } from "lucide-react";

export function PlaybookCards() {
  const handleCardClick = (cardType: 'ideas' | 'ghostwriter' | 'creators') => {
    // Trigger slideout to open with the specific view
    const event = new CustomEvent('playbook:open-slideout', {
      detail: { view: cardType }
    });
    window.dispatchEvent(event);
  };

  const cards = [
    {
      title: "Idea inbox",
      type: "Notes",
      icon: <FileText className="w-4 h-4" />,
      description: "Capture and organize your creative ideas",
      view: 'ideas' as const,
    },
    {
      title: "Ghost writer",
      type: "Ideas", 
      icon: <PenTool className="w-4 h-4" />,
      description: "AI-powered content creation assistant",
      view: 'ghostwriter' as const,
    },
    {
      title: "Follow Creators",
      type: "Videos",
      icon: <Users className="w-4 h-4" />,
      description: "Track and engage with content creators",
      view: 'creators' as const,
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Endless Content Inspiration</h2>
          <p className="text-sm text-muted-foreground mt-1">Turn ideas into viral scripts with AI-powered workflows</p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => handleCardClick(card.view)}
            className="border-[0.5px] border-[var(--border-visible)] rounded-xl p-4 h-36 flex flex-col justify-between cursor-pointer hover:bg-muted/50 transition-all duration-300 ease-out group hover:shadow-lg hover:border-[var(--border-hover)] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0"
          >
            {/* Card Content */}
            <div className="flex flex-col gap-2">
              {/* Icon */}
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <div className="text-muted-foreground">{card.icon}</div>
              </div>

              {/* Title */}
              <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-5">{card.title}</h3>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-1.5">
                <BarChart3 className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{card.type}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-foreground group-hover:translate-x-0.5 transition-transform duration-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}