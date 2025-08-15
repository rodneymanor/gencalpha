"use client";

import { useMemo } from "react";

import Link from "next/link";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchField } from "@/components/ui/search-field";

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
  onToggleAll?: (checked: boolean) => void;
  onBulkDelete?: () => void;
  showMore?: boolean;
  onShowMore?: () => void;
  className?: string;
  fillParent?: boolean;
};

export function ChatHistoryList(props: ChatHistoryListProps) {
  const {
    items,
    totalCount,
    query,
    onQueryChange,
    onDelete,
    selectable = false,
    selectedIds = [],
    onToggleItem,
    onToggleSelectMode,
    onToggleAll,
    onBulkDelete,
    showMore = false,
    onShowMore,
    className,
    fillParent = false,
  } = props;

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  return (
    <main
      className={[
        "bg-background text-foreground font-sans",
        "mx-auto w-full max-w-4xl",
        "px-4 sm:px-6",
        fillParent ? "flex h-full flex-col overflow-hidden" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <h1 className="sr-only">Your chat history</h1>

      <SearchInput query={query} onQueryChange={onQueryChange} />

      <HeaderLine totalCount={totalCount} selectable={selectable} onToggleSelectMode={onToggleSelectMode} />

      <div
        className={[
          fillParent ? "flex-1 overflow-auto" : "max-h-[28rem] min-h-[300px] overflow-auto",
          "-mx-2 px-2 pb-20",
        ].join(" ")}
      >
        <ul className="m-0 flex list-none flex-col space-y-3 p-0">
          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              isSelected={selectedSet.has(item.id)}
              selectable={selectable}
              onToggleItem={onToggleItem}
              onDelete={onDelete}
            />
          ))}

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

      {selectable && selectedIds.length > 0 && (
        <BulkActionsBar
          total={items.length}
          selectedCount={selectedIds.length}
          onToggleAll={onToggleAll}
          onBulkDelete={onBulkDelete}
        />
      )}
    </main>
  );
}

function SearchInput({ query, onQueryChange }: { query?: string; onQueryChange?: (v: string) => void }) {
  return <SearchField value={query ?? ""} onChange={(v) => onQueryChange?.(v)} placeholder="Search your chats..." />;
}

function HeaderLine({
  totalCount,
  selectable,
  onToggleSelectMode,
}: {
  totalCount?: number;
  selectable: boolean;
  onToggleSelectMode?: () => void;
}) {
  if (typeof totalCount !== "number") return null;
  return (
    <div className={["flex h-12 items-center gap-2", "-mx-4 px-4 sm:-mx-6 sm:px-6", "mt-2"].join(" ")}>
      <p className="text-muted-foreground text-sm">
        You have {totalCount} previous chats with Gen.C
        <Button
          type="button"
          variant="ghost"
          className="text-secondary hover:text-secondary ml-2 h-auto px-0 underline-offset-4 hover:bg-transparent hover:underline focus-visible:bg-transparent active:bg-transparent active:underline"
          onClick={onToggleSelectMode}
        >
          {selectable ? "Done" : "Select"}
        </Button>
      </p>
    </div>
  );
}

function ItemRow({
  item,
  isSelected,
  selectable,
  onToggleItem,
  onDelete,
}: {
  item: ChatHistoryItem;
  isSelected: boolean;
  selectable: boolean;
  onToggleItem?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <li>
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
            onClick={selectable ? (e) => (e.preventDefault(), onToggleItem?.(item.id)) : undefined}
            className={[
              "flex flex-col",
              "bg-transparent",
              "border-[0.5px] border-[var(--border-visible)]", // High visibility border
              "rounded-xl",
              "no-underline",
              "px-4 py-4",
              "hover:bg-card hover:border-[var(--border-hover)] hover:shadow-sm", // Use border-hover for better contrast
              "transition-all duration-300 ease-out",
              "active:scale-[0.98]",
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
}

function BulkActionsBar({
  total,
  selectedCount,
  onToggleAll,
  onBulkDelete,
}: {
  total: number;
  selectedCount: number;
  onToggleAll?: (checked: boolean) => void;
  onBulkDelete?: () => void;
}) {
  return (
    <div
      className={[
        "sticky bottom-0 z-20",
        "-mx-4 px-4 sm:-mx-6 sm:px-6",
        "bg-background/95 backdrop-blur",
        "border border-t",
        "shadow-[var(--shadow-soft-drop)]",
      ].join(" ")}
    >
      <div className="flex h-14 items-center justify-between">
        <div className="flex items-center gap-3">
          {typeof onToggleAll === "function" && (
            <Checkbox
              checked={selectedCount > 0 && selectedCount === total}
              onCheckedChange={(checked) => onToggleAll(!!checked)}
              aria-label="Select all"
              className="size-4"
            />
          )}
          <span className="text-muted-foreground text-sm">{selectedCount} selected</span>
        </div>
        {typeof onBulkDelete === "function" && (
          <Button
            type="button"
            variant="destructive"
            onClick={onBulkDelete}
            className="h-10 rounded-[var(--radius-button)] px-4"
          >
            <Trash2 className="mr-2 size-4" /> Delete selected
          </Button>
        )}
      </div>
    </div>
  );
}
