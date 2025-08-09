"use client";

import { useMemo } from "react";

import Link from "next/link";

import { Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export type ChatHistoryItem = {
  id: string;
  title: string;
  href: string;
  lastMessageLabel: string; // e.g., "8 minutes ago"
};

export type ChatHistoryListProps = {
  items: ChatHistoryItem[];
  totalCount?: number;
  query?: string;
  onQueryChange?: (value: string) => void;
  onDelete?: (id: string) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onToggleItem?: (id: string) => void;
  onToggleSelectMode?: () => void;
  showMore?: boolean;
  onShowMore?: () => void;
  className?: string;
};

export function ChatHistoryList({
  items,
  totalCount,
  query,
  onQueryChange,
  onDelete,
  selectable = false,
  selectedIds = [],
  onToggleItem,
  onToggleSelectMode,
  showMore = false,
  onShowMore,
  className,
}: ChatHistoryListProps) {
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  return (
    <main
      className={["bg-background text-foreground font-sans", "mx-auto w-full max-w-4xl", "px-4 sm:px-6", className]
        .filter(Boolean)
        .join(" ")}
    >
      <h1 className="sr-only">Your chat history</h1>

      <div
        className={[
          "inline-flex h-11 w-full cursor-text items-center gap-2",
          "bg-card border-border border",
          "rounded-[var(--radius-button)] px-3",
          "shadow-[var(--shadow-input)]",
          "transition-colors",
        ].join(" ")}
      >
        <Search className="text-muted-foreground size-4" aria-hidden="true" />
        <Input
          value={query ?? ""}
          onChange={(e) => onQueryChange?.(e.target.value)}
          placeholder="Search your chats..."
          className={[
            "h-11",
            "border-0 bg-transparent shadow-none",
            "placeholder:text-muted-foreground/70",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
          ].join(" ")}
        />
      </div>

      <div className={["flex h-12 items-center gap-2", "-mx-4 px-4 sm:-mx-6 sm:px-6", "mt-2"].join(" ")}>
        {typeof totalCount === "number" && (
          <p className="text-muted-foreground text-sm">
            You have {totalCount} previous chats with Claude
            <Button
              type="button"
              variant="ghost"
              className="text-secondary hover:text-secondary ml-2 h-auto px-0"
              onClick={onToggleSelectMode}
            >
              Select
            </Button>
          </p>
        )}
      </div>

      <div className={["max-h-[28rem] min-h-[300px] overflow-auto", "-mx-2 px-2 pb-20"].join(" ")}>
        <ul className="m-0 flex list-none flex-col space-y-3 p-0">
          {items.map((item) => {
            const isSelected = selectedSet.has(item.id);
            return (
              <li key={item.id}>
                <div
                  className={[
                    "group relative",
                    "border border-transparent",
                    "rounded-[var(--radius-card)]",
                    "transition-colors",
                  ].join(" ")}
                >
                  {selectable && (
                    <label className="absolute top-3 left-3 z-10 p-1">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleItem?.(item.id)}
                        aria-label="Select chat"
                        className="size-4"
                      />
                    </label>
                  )}

                  <div className="relative">
                    <Link
                      href={item.href}
                      className={[
                        "flex flex-col",
                        "bg-card",
                        "border-border border",
                        "rounded-[var(--radius-card)]",
                        "no-underline",
                        "px-4 py-4",
                        "hover:bg-accent",
                        "transition-colors",
                        selectable ? "pl-12" : "",
                      ].join(" ")}
                    >
                      <div className="truncate text-base font-medium">{item.title}</div>
                      <div className="mt-1 flex min-h-5 items-center gap-1.5">
                        <div className="text-muted-foreground truncate text-xs">
                          Last message <span className="text-muted-foreground">{item.lastMessageLabel}</span>
                        </div>
                      </div>
                    </Link>

                    {!!onDelete && (
                      <Button
                        type="button"
                        variant="ghost"
                        aria-label="Delete conversation"
                        onClick={() => onDelete(item.id)}
                        className={[
                          "absolute top-2 right-2",
                          "opacity-0 group-hover:opacity-100",
                          "transition-opacity",
                          "h-11 w-11",
                          "rounded-[var(--radius-button)]",
                          "text-muted-foreground hover:text-foreground",
                        ].join(" ")}
                      >
                        <Trash2 className="size-5" aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}

          {showMore && (
            <li>
              <div className="flex w-full justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onShowMore}
                  className={[
                    "h-9 w-full",
                    "border-border border",
                    "rounded-[var(--radius-button)]",
                    "text-sm font-medium",
                  ].join(" ")}
                >
                  Show more
                </Button>
              </div>
            </li>
          )}
        </ul>
      </div>
    </main>
  );
}
