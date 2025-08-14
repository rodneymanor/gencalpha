"use client";

import { useEffect, useMemo, useState } from "react";

import { Plus } from "lucide-react";

import { ChatHistoryList, ChatHistoryItem } from "@/components/library/chat-history-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useScriptsApi } from "@/hooks/use-scripts-api";

export default function LibraryPage() {
  const { scripts, loading, error, fetchScripts, deleteScript } = useScriptsApi();
  const [query, setQuery] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchScripts();
  }, [fetchScripts]);

  const items: ChatHistoryItem[] = useMemo(
    () =>
      scripts
        .filter((s) => {
          const q = query.trim().toLowerCase();
          if (!q) return true;
          const summary = s.summary ? s.summary.toLowerCase() : "";
          return s.title.toLowerCase().includes(q) || summary.includes(q);
        })
        .map((s) => ({
          id: s.id,
          title: s.title || "Untitled",
          href: "/app/(main)/dashboard/script-writing", // adjust if a per-script route exists
          lastMessageLabel: timeAgo(s.updatedAt || s.createdAt),
        })),
    [scripts, query],
  );

  const handleToggleSelectMode = () => {
    setSelectMode((s) => !s);
    setSelectedIds([]);
  };

  const handleToggleItem = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleToggleAll = (checked: boolean) => {
    setSelectedIds(checked ? items.map((i) => i.id) : []);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    await Promise.allSettled(selectedIds.map((id) => deleteScript(id)));
    setSelectedIds([]);
    setSelectMode(false);
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto flex min-h-screen flex-col overflow-auto p-6 md:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-3xl font-bold tracking-tight">Library</h1>
            <p className="text-muted-foreground">Browse and manage your scripts</p>
          </div>
          <div className="flex gap-3">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Script
            </Button>
          </div>
        </div>

        <Card className="order-0 border-0 bg-transparent shadow-none">
          <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
            <ChatHistoryList
              items={items}
              totalCount={scripts.length}
              query={query}
              onQueryChange={setQuery}
              onDelete={(id) => void deleteScript(id)}
              selectable={selectMode}
              selectedIds={selectedIds}
              onToggleItem={handleToggleItem}
              onToggleSelectMode={handleToggleSelectMode}
              onToggleAll={handleToggleAll}
              onBulkDelete={handleBulkDelete}
              fillParent
            />

            {loading && <div className="text-muted-foreground text-sm">Loading…</div>}
            {error && <div className="text-destructive text-sm">{error}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function timeAgo(isoDate?: string): string {
  if (!isoDate) return "";
  const then = new Date(isoDate).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (sec < 60) return `${sec} seconds ago`;
  if (min < 60) return `${min} minutes ago`;
  if (hr < 24) return `${hr} hours ago`;
  return `${day} days ago`;
}
