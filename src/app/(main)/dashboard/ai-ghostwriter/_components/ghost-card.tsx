import { TrendingUp, Bookmark, ArrowUpRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { GhostWritingCard } from "./types";

interface GhostCardProps {
  card: GhostWritingCard;
  onGenerateScript: (card: GhostWritingCard) => void;
  onSave: (card: GhostWritingCard) => void;
  isSaved?: boolean;
}

export function GhostCard({ card, onGenerateScript, onSave, isSaved = false }: GhostCardProps) {
  return (
    <Card className="group relative transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft-drop)]">
      {/* Bookmark Icon */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSave(card);
        }}
        className="hover:bg-muted absolute top-3 right-3 z-10 rounded-[var(--radius-button)] p-1 transition-colors"
      >
        <Bookmark
          className={cn(
            "h-3 w-3 transition-colors",
            isSaved ? "fill-primary text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        />
      </button>

      {/* Trending Badge */}
      {card.trending && (
        <div className="absolute top-2 left-3">
          <div className="bg-secondary text-secondary-foreground flex items-center gap-1 rounded-[var(--radius-button)] px-2 py-1 text-xs font-medium">
            <TrendingUp className="h-3 w-3" />
            Trending
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 pt-6">
        {/* Title */}
        <h3 className="text-foreground mb-2 line-clamp-2 text-sm font-semibold">{card.title}</h3>

        {/* Hook Preview */}
        <p className="text-muted-foreground mb-3 line-clamp-2 text-xs">{card.hook}</p>

        {/* Metadata - disappears on hover */}
        <div className="text-muted-foreground mb-3 flex items-center justify-between text-xs transition-all duration-300 group-hover:invisible group-hover:opacity-0">
          <span>{card.category}</span>
          <span>2h ago</span>
        </div>

        {/* Hover Action Button - appears on hover */}
        <div className="invisible absolute right-4 bottom-4 left-4 opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100">
          <button
            onClick={() => onGenerateScript(card)}
            className="border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200"
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>Generate Script</span>
          </button>
        </div>
      </div>
    </Card>
  );
}
