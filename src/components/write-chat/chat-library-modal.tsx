"use client";

import { useEffect, useState } from "react";

import { formatDistanceToNow } from "date-fns";
import { Edit2, Loader2, MessageSquare, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  type ChatConversation,
  listConversations,
  loadConversation,
  updateTitle,
} from "@/components/write-chat/services/chat-service";

interface ChatLibraryModalProps {
  trigger?: React.ReactNode;
  onLoadChat?: (conversation: {
    id: string;
    title: string | null;
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    persona: string | null;
  }) => void;
  className?: string;
}

export function ChatLibraryModal({ trigger, onLoadChat, className }: ChatLibraryModalProps) {
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [loadingConversationId, setLoadingConversationId] = useState<string | null>(null);

  // Load conversations when modal opens
  useEffect(() => {
    if (open) {
      loadConversations();
    }
  }, [open]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const chats = await listConversations();
      setConversations(chats);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadChat = async (conversationId: string) => {
    setLoadingConversationId(conversationId);
    try {
      const conversation = await loadConversation(conversationId);
      if (conversation && onLoadChat) {
        onLoadChat({
          id: conversation.id,
          title: conversation.title,
          messages: conversation.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          persona: conversation.persona,
        });
        setOpen(false);
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    } finally {
      setLoadingConversationId(null);
    }
  };

  const handleSaveTitle = async (conversationId: string) => {
    if (!editingTitle.trim()) return;

    try {
      const success = await updateTitle(conversationId, editingTitle);
      if (success) {
        setConversations((prev) =>
          prev.map((conv) => (conv.id === conversationId ? { ...conv, title: editingTitle } : conv)),
        );
        setEditingId(null);
        setEditingTitle("");
      }
    } catch (error) {
      console.error("Failed to update title:", error);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const title = conv.title ?? "Untitled Chat";
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const defaultTrigger = (
    <Button variant="ghost" className="rounded-[var(--radius-button)]">
      <MessageSquare className="mr-2 h-4 w-4" />
      Chat History
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
      <DialogContent className={`max-w-2xl ${className ?? ""}`}>
        <DialogHeader>
          <DialogTitle>Your Chat History</DialogTitle>
          <DialogDescription>Select a previous conversation to continue or review</DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="focus:border-primary-400 border-neutral-200 bg-neutral-50 pl-10"
          />
        </div>

        {/* Conversations List */}
        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="py-8 text-center text-neutral-600">
              {searchQuery ? "No conversations found matching your search" : "No saved conversations yet"}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className="group relative flex items-center justify-between rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-4 transition-all hover:border-neutral-300 hover:bg-neutral-100"
                >
                  {editingId === conv.id ? (
                    <div className="flex flex-1 items-center gap-2">
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSaveTitle(conv.id);
                          } else if (e.key === "Escape") {
                            setEditingId(null);
                            setEditingTitle("");
                          }
                        }}
                        className="flex-1 bg-white"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSaveTitle(conv.id)}
                        className="bg-neutral-900 text-neutral-50 hover:bg-neutral-800"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(null);
                          setEditingTitle("");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleLoadChat(conv.id)}
                        disabled={loadingConversationId === conv.id}
                        className="flex flex-1 flex-col items-start text-left"
                      >
                        <div className="font-medium text-neutral-900">{conv.title ?? "Untitled Chat"}</div>
                        <div className="text-sm text-neutral-600">
                          {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })} •{" "}
                          {conv.messagesCount} messages
                        </div>
                      </button>
                      <div className="flex items-center gap-2">
                        {loadingConversationId === conv.id && (
                          <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(conv.id);
                            setEditingTitle(conv.title ?? "Untitled Chat");
                          }}
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
