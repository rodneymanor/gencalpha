"use client";

import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Plus } from "lucide-react";

import { ChatHistoryList, ChatHistoryItem } from "@/components/library/chat-history-list";
import { Button } from "@/components/ui/button";
import { listConversations, type ChatConversation } from "@/components/write-chat/services/chat-service";

export default function LibraryPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);
      setError(null);
      try {
        const chats = await listConversations();
        setConversations(chats);
      } catch (err) {
        setError("Failed to load conversations");
        console.error("Failed to load conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    loadConversations();
  }, []);

  const items: ChatHistoryItem[] = useMemo(
    () =>
      conversations
        .filter((conv) => {
          const q = query.trim().toLowerCase();
          if (!q) return true;
          const title = (conv.title ?? "Untitled Chat").toLowerCase();
          return title.includes(q);
        })
        .map((conv) => ({
          id: conv.id,
          title: conv.title ?? "Untitled Chat",
          href: `/write?chatId=${conv.id}`, // Link to chat page with conversation ID
          lastMessageLabel: formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true }),
        })),
    [conversations, query],
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

  const handleDelete = async (id: string) => {
    // TODO: Implement delete conversation API
    console.log("Delete conversation:", id);
    // For now, just remove from local state
    setConversations((prev) => prev.filter((conv) => conv.id !== id));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    // TODO: Implement bulk delete
    console.log("Bulk delete:", selectedIds);
    setConversations((prev) => prev.filter((conv) => !selectedIds.includes(conv.id)));
    setSelectedIds([]);
    setSelectMode(false);
  };

  const handleNewChat = () => {
    router.push("/write");
  };

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="container mx-auto flex min-h-screen flex-col overflow-auto p-6 md:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-neutral-900 text-3xl font-bold tracking-tight">Chat History</h1>
            <p className="text-neutral-600">Browse and continue your saved conversations</p>
          </div>
          <div className="flex gap-3">
            <Button
              className="gap-2 rounded-[var(--radius-button)] bg-neutral-900 text-neutral-50 hover:bg-neutral-800"
              onClick={handleNewChat}
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </div>
        </div>

        <div className="order-0">
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            {conversations.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="mb-4 h-12 w-12 text-neutral-400" />
                <h3 className="mb-2 text-lg font-medium text-neutral-900">No conversations yet</h3>
                <p className="mb-6 text-sm text-neutral-600">Start a new chat to begin your conversation history</p>
                <Button
                  onClick={handleNewChat}
                  className="rounded-[var(--radius-button)] bg-neutral-900 text-neutral-50 hover:bg-neutral-800"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Start Your First Chat
                </Button>
              </div>
            )}

            {conversations.length > 0 && (
              <ChatHistoryList
                items={items}
                totalCount={conversations.length}
                query={query}
                onQueryChange={setQuery}
                onDelete={handleDelete}
                selectable={selectMode}
                selectedIds={selectedIds}
                onToggleItem={handleToggleItem}
                onToggleSelectMode={handleToggleSelectMode}
                onToggleAll={handleToggleAll}
                onBulkDelete={handleBulkDelete}
                fillParent
              />
            )}

            {loading && <div className="text-neutral-600 text-sm">Loading…</div>}
            {error && <div className="text-destructive-600 text-sm">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
