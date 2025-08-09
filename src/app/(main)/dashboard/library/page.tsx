"use client";

import { useEffect, useMemo, useState } from "react";

import { Plus } from "lucide-react";

import { ChatHistoryList, ChatHistoryItem } from "@/components/library/chat-history-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useScriptsApi } from "@/hooks/use-scripts-api";

export default function LibraryPage() {
  const { scripts, loading, error, fetchScripts, deleteScript } = useScriptsApi();
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchScripts();
  }, [fetchScripts]);

  const items: ChatHistoryItem[] = useMemo(
    () =>
      scripts
        .filter((s) => {
          const q = query.trim().toLowerCase();
          if (!q) return true;
          return s.title.toLowerCase().includes(q) || (s.summary?.toLowerCase() ?? "").includes(q);
        })
        .map((s) => ({
          id: s.id,
          title: s.title || "Untitled",
          href: "/app/(main)/dashboard/script-writing", // adjust if a per-script route exists
          lastMessageLabel: timeAgo(s.updatedAt || s.createdAt),
        })),
    [scripts, query],
  );

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto p-8">
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

        <Card className="shadow-[var(--shadow-input)]">
          <CardHeader>
            <CardTitle>Scripts</CardTitle>
            <CardDescription>Your saved and generated scripts</CardDescription>
          </CardHeader>
          <CardContent className="flex size-full flex-col gap-4">
            <ChatHistoryList
              items={items}
              totalCount={scripts.length}
              query={query}
              onQueryChange={setQuery}
              onDelete={(id) => void deleteScript(id)}
              selectable
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
