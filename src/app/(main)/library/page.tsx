"use client";

// Library Page - Modern library management using DataTableTemplate
// Unified library with chat history, captured content, and resources

import React, { useMemo, useState, useEffect } from "react";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";

import { ChevronsRight, Maximize, Minimize, Copy, Download, PenTool, Lightbulb, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ContentIdea } from "@/app/api/content/ideas/route";
import { Hook } from "@/app/api/hooks/route";
import { useContentItems, useDeleteContent } from "@/components/content-inbox/hooks/use-content-inbox";
import { type ContentItem } from "@/components/content-inbox/types";
import { NotionPanel } from "@/components/panels/notion";
import type { PageProperty, TabData } from "@/components/panels/notion";
import { DataTableTemplate } from "@/components/templates/data-table-template";
import { Button } from "@/components/ui/button";
import { listConversations, type ChatConversation } from "@/components/write-chat/services/chat-service";
import { useAuth } from "@/contexts/auth-context";
import { useScriptsApi } from "@/hooks/use-scripts-api";

import { combineAllDataSources } from "./content-adapter";
import { getLibraryConfig } from "./library-config";
import { generateMockData } from "./types";
import { clientNotesService, type Note } from "@/lib/services/client-notes-service";
import { NoteType } from "@/app/(main)/dashboard/idea-inbox/_components/types";

// Dynamically import BlockNote to avoid SSR issues
const BlockNoteEditor = dynamic(() => import("@/components/editor/block-note-editor"), {
  ssr: false,
  loading: () => <div className="h-20 animate-pulse rounded bg-neutral-100" />,
});

export default function LibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add ContentInbox data
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);

  // Add generated content data
  const { scripts, fetchScripts, loading: scriptsLoading, deleteScript } = useScriptsApi();
  const deleteContentMutation = useDeleteContent();
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([]);
  const [hooksLoading, setHooksLoading] = useState(false);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [userNotes, setUserNotes] = useState<Note[]>([]);

  // NotionPanel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(600);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [panelMode, setPanelMode] = useState<"view" | "notes">("view");
  const [notes, setNotes] = useState("");

  // Properties for the selected item
  const [properties, setProperties] = useState<PageProperty[]>([
    {
      id: "1",
      type: "status" as const,
      name: "Generation",
      value: { label: "Pending", color: "default" },
      icon: "burst",
    },
  ]);

  // Handler functions for new buttons
  const handleNewScript = () => {
    router.push("/write");
  };

  const handleNewIdea = () => {
    // Reset properties to default without URL field
    setProperties([
      {
        id: "1",
        type: "status" as const,
        name: "Generation",
        value: { label: "Pending", color: "default" },
        icon: "burst",
      },
    ]);

    // Clear any existing notes and set to new idea mode
    setNotes("");
    setPanelMode("notes");
    setSelectedItem(null);

    // Open the panel
    setIsPanelOpen(true);
  };

  // Parse URL parameters for default filters
  const urlSource = searchParams.get("source");
  const urlType = searchParams.get("type");
  const urlPlatform = searchParams.get("platform");

  // Build initial filters from URL parameters
  const initialFilters = useMemo(() => {
    const filters: Record<string, string[]> = {};

    if (urlSource) {
      filters.contentSource = [urlSource];
    }

    if (urlType) {
      filters.type = [urlType];
    }

    if (urlPlatform) {
      filters.platform = [urlPlatform];
    }

    return filters;
  }, [urlSource, urlType, urlPlatform]);

  // Load ContentInbox data using the existing hook
  const {
    data: contentData,
    isLoading: contentLoading,
    isError: contentError,
    refetch: refetchContent,
  } = useContentItems({}, { field: "savedAt", direction: "desc" });

  // Load all data on mount
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError(null);

      // Load conversations
      try {
        const chats = await listConversations();
        setConversations(chats);
      } catch (err) {
        console.error("Failed to load conversations:", err);
        toast.error("Failed to load chat conversations");
      }

      // Load scripts
      try {
        await fetchScripts();
      } catch (err) {
        console.error("Failed to load scripts:", err);
        toast.error("Failed to load scripts");
      }

      // Load hooks
      if (user) {
        setHooksLoading(true);
        try {
          const idToken = await user.getIdToken();
          const response = await fetch("/api/hooks", {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });
          const data = await response.json();
          if (data.success) {
            setHooks(data.hooks);
          }
        } catch (err) {
          console.error("Failed to load hooks:", err);
        } finally {
          setHooksLoading(false);
        }

        // Load content ideas
        setIdeasLoading(true);
        try {
          const idToken = await user.getIdToken();
          const response = await fetch("/api/content/ideas", {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });
          const data = await response.json();
          if (data.success) {
            setContentIdeas(data.ideas);
          }
        } catch (err) {
          console.error("Failed to load content ideas:", err);
        } finally {
          setIdeasLoading(false);
        }

        // Load idea inbox notes (from Chrome extension/iOS shortcut)
        try {
          const res = await clientNotesService.getNotes({
            noteType: NoteType.NOTE,
            type: "idea_inbox",
          });
          setUserNotes(res.notes);
        } catch (err) {
          console.error("Failed to load notes:", err);
        }
      }

      setLoading(false);
    };

    loadAllData();
  }, [user, fetchScripts]);

  // Extract content items from paginated data
  useEffect(() => {
    if (contentData?.pages) {
      const allContent = contentData.pages.flatMap((page) => page.items ?? []);
      setContentItems(allContent);
    }
  }, [contentData]);

  // Generate mock data for demo (other library items)
  const mockData = useMemo(() => generateMockData(), []);

  // Combine all data sources: chats + content + scripts + hooks + ideas + mock data
  const combinedData = useMemo(
    () => combineAllDataSources(conversations, contentItems, scripts, hooks, contentIdeas, userNotes, mockData),
    [conversations, contentItems, scripts, hooks, contentIdeas, userNotes, mockData],
  );

  // State for active filters
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(initialFilters);

  // Helper function to apply filters
  const applyFilters = (data: any[], filters: Record<string, string[]>) => {
    let filtered = [...data];

    // Filter by content source
    if (filters.contentSource?.length > 0) {
      const selected = new Set(filters.contentSource);
      filtered = filtered.filter((item) => {
        const sources = ["chat", "captured", "notes"];
        return sources.some((s) => selected.has(s) && item.tags.includes(s));
      });
    }

    // Filter by category
    if (filters.category?.length > 0) {
      filtered = filtered.filter((item) => filters.category.includes(item.category));
    }

    // Filter by platform
    if (filters.platform?.length > 0) {
      filtered = filtered.filter((item) => item.tags.some((tag: string) => filters.platform.includes(tag)));
    }

    return filtered;
  };

  // Apply filters to combined data
  const filteredData = useMemo(() => applyFilters(combinedData, activeFilters), [combinedData, activeFilters]);

  // Helper function to render markdown content
  const renderMarkdownContent = (content: string) => {
    if (!content) return content;

    // Simple markdown-like rendering
    return (
      <>
        {content.split("\n").map((line, index) => {
          // Empty lines for spacing
          if (line.trim() === "") {
            return <br key={index} />;
          }

          // Handle headers
          if (line.startsWith("### ")) {
            return (
              <h3 key={index} className="mt-4 mb-2 text-lg font-semibold text-neutral-900">
                {line.replace("### ", "")}
              </h3>
            );
          }
          if (line.startsWith("## ")) {
            return (
              <h2 key={index} className="mt-4 mb-2 text-xl font-semibold text-neutral-900">
                {line.replace("## ", "")}
              </h2>
            );
          }
          if (line.startsWith("# ")) {
            return (
              <h1 key={index} className="mt-4 mb-2 text-2xl font-bold text-neutral-900">
                {line.replace("# ", "")}
              </h1>
            );
          }

          // Handle bullet lists
          if (line.startsWith("- ") || line.startsWith("* ")) {
            return (
              <li key={index} className="ml-4 text-neutral-700">
                {line.replace(/^[*-] /, "")}
              </li>
            );
          }

          // Handle numbered lists
          if (/^\d+\. /.test(line)) {
            return (
              <li key={index} className="ml-4 text-neutral-700">
                {line.replace(/^\d+\. /, "")}
              </li>
            );
          }

          // Handle bold text
          const boldText = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

          // Handle italic text
          const italicText = boldText.replace(/\*(.*?)\*/g, "<em>$1</em>");

          // Handle code spans
          const codeText = italicText.replace(
            /`(.*?)`/g,
            '<code class="bg-neutral-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>',
          );

          // Regular paragraphs
          return <p key={index} className="mb-2 text-neutral-700" dangerouslySetInnerHTML={{ __html: codeText }} />;
        })}
      </>
    );
  };

  // Helper to refresh all loaded data
  const refreshAll = async () => {
    try {
      const chats = await listConversations();
      setConversations(chats);
      await refetchContent();
      await fetchScripts();
      if (user) {
        const idToken = await user.getIdToken();
        const [hooksRes, ideasRes] = await Promise.all([
          fetch("/api/hooks", { headers: { Authorization: `Bearer ${idToken}` } }),
          fetch("/api/content/ideas", { headers: { Authorization: `Bearer ${idToken}` } }),
        ]);
        const [hooksData, ideasData] = await Promise.all([hooksRes.json(), ideasRes.json()]);
        if (hooksData.success) setHooks(hooksData.hooks);
        if (ideasData.success) setContentIdeas(ideasData.ideas);
      }
    } catch (err) {
      console.error("Failed to refresh data:", err);
    }
  };

  // Delete a single library item (per source)
  const deleteLibraryItem = async (item: any) => {
    // Content Inbox items
    if (item.tags?.includes("captured")) {
      await deleteContentMutation.mutateAsync([item.id]);
      toast.success("Content deleted");
      return;
    }
    // Generated scripts
    if (item.category === "script") {
      // script items are prefixed as "script-<id>"
      const scriptId = typeof item.id === "string" && item.id.startsWith("script-") ? item.id.slice(7) : item.id;
      const ok = await deleteScript(scriptId);
      if (ok) toast.success("Script deleted");
      else toast.error("Failed to delete script");
      return;
    }
    // Chats (delete conversation)
    if (item.tags?.includes("chat")) {
      if (!user) throw new Error("Not authenticated");
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/chat/conversations/${item.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error("Failed to delete chat");
      toast.success("Chat deleted");
      return;
    }
    // Hooks (generated)
    if (item.category === "hooks") {
      if (!user) throw new Error("Not authenticated");
      const hookId = typeof item.id === "string" && item.id.startsWith("hook-") ? item.id.slice(5) : item.id;
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/hooks/${hookId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error("Failed to delete hooks");
      toast.success("Hooks deleted");
      return;
    }
    // Ideas (generated)
    if (item.category === "idea") {
      if (!user) throw new Error("Not authenticated");
      const ideaId = typeof item.id === "string" && item.id.startsWith("idea-") ? item.id.slice(5) : item.id;
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/content/ideas/${ideaId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error("Failed to delete idea");
      toast.success("Idea deleted");
      return;
    }
    toast.info("This item type cannot be deleted");
  };

  // Bulk delete
  const deleteLibraryItems = async (items: any[]) => {
    const contentIds: string[] = [];
    const scriptIds: string[] = [];
    const chatIds: string[] = [];
    const hookIds: string[] = [];
    const ideaIds: string[] = [];

    for (const item of items) {
      if (item.tags?.includes("captured")) contentIds.push(item.id);
      else if (item.category === "script") {
        const sid = typeof item.id === "string" && item.id.startsWith("script-") ? item.id.slice(7) : item.id;
        scriptIds.push(sid);
      } else if (item.tags?.includes("chat")) chatIds.push(item.id);
      else if (item.category === "hooks") {
        const hid = typeof item.id === "string" && item.id.startsWith("hook-") ? item.id.slice(5) : item.id;
        hookIds.push(hid);
      } else if (item.category === "idea") {
        const iid = typeof item.id === "string" && item.id.startsWith("idea-") ? item.id.slice(5) : item.id;
        ideaIds.push(iid);
      }
    }

    if (contentIds.length) {
      await deleteContentMutation.mutateAsync(contentIds);
    }
    for (const id of scriptIds) {
      await deleteScript(id);
    }
    if (user) {
      const idToken = await user.getIdToken();
      for (const cid of chatIds) {
        await fetch(`/api/chat/conversations/${cid}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${idToken}` },
        });
      }
      for (const hid of hookIds) {
        await fetch(`/api/hooks/${hid}`, { method: "DELETE", headers: { Authorization: `Bearer ${idToken}` } });
      }
      for (const iid of ideaIds) {
        await fetch(`/api/content/ideas/${iid}`, { method: "DELETE", headers: { Authorization: `Bearer ${idToken}` } });
      }
    }

    const skipped =
      items.length - contentIds.length - scriptIds.length - chatIds.length - hookIds.length - ideaIds.length;
    if (skipped > 0) {
      toast.info(`${skipped} item(s) could not be deleted yet`);
    }
    const deletedCount = contentIds.length + scriptIds.length + chatIds.length + hookIds.length + ideaIds.length;
    if (deletedCount > 0) toast.success(`Deleted ${deletedCount} item(s)`);
  };

  // Handle item selection for the panel
  const handleItemSelect = (item: any) => {
    // Route generated content (scripts, hooks, ideas) to script editor
    if (item.category === "script" || item.category === "hooks" || item.category === "idea") {
      // Store the content in localStorage for the script editor to use
      let content = item.description || "";

      // For hooks, get the actual content from metadata or content field
      if (item.category === "hooks") {
        // Try to get content from metadata first (where script content is stored), then content field, then description
        // The editor will format it properly from metadata.items or metadata.hooks
        content = item.metadata?.scriptContent || item.content || item.description || "";
      }
      // For scripts, try to get the actual script content if available
      else if (item.category === "script") {
        // First try to get actual script content from metadata, then fallback to description
        content = item.metadata?.scriptContent || item.content || item.description || "";
      }
      // For ideas, get the actual content from metadata or content field
      else if (item.category === "idea") {
        // Try to get content from metadata first (where structured items are), then content field, then description
        content = item.metadata?.scriptContent || item.content || item.description || "";
      }

      const contentData = {
        title: item.title,
        content: content,
        category: item.category,
        metadata: item.metadata || {},
      };

      console.log("📦 [Library] Storing content for editor:", contentData);
      localStorage.setItem("libraryContent", JSON.stringify(contentData));

      // Navigate to script editor
      router.push("/write?from=library");
      return;
    }

    // For other items (notes, etc.), open in NotionPanel
    setSelectedItem(item);

    // Update properties without URL field
    const newProperties: PageProperty[] = [];

    // Add generation status for appropriate items
    if (item.tags?.includes("captured") || item.tags?.includes("chat")) {
      newProperties.push({
        id: "1",
        type: "status" as const,
        name: "Generation",
        value: { label: "Pending", color: "default" },
        icon: "burst",
      });
    }

    setProperties(newProperties);
    setPanelMode("view");
    setIsPanelOpen(true);
  };

  const handlePropertyChange = async (id: string, value: string | { label: string; color: string }) => {
    setProperties((prev) => prev.map((prop) => (prop.id === id ? { ...prop, value } : prop)));
  };

  // Generate tab data based on selected item
  const generateTabData = (item: any): TabData | undefined => {
    if (!item) return undefined;

    const tabData: TabData = {};

    // Add video tab if item has video content
    if (item.tags?.includes("tiktok") || item.tags?.includes("instagram") || item.type === "video") {
      tabData.video = (
        <div className="space-y-4">
          <div className="flex aspect-video items-center justify-center rounded-[var(--radius-card)] bg-neutral-900">
            <span className="text-neutral-400">Video Player Placeholder</span>
          </div>
          <div className="text-sm text-neutral-600">{item.description || "Video content would be displayed here."}</div>
        </div>
      );
    }

    // Add transcript tab if item has transcript content
    if (item.content || item.tags?.includes("chat")) {
      tabData.transcript = (
        <div className="prose prose-neutral max-w-none">
          <h3>Content</h3>
          <div className="markdown-content whitespace-pre-wrap text-neutral-600">
            {renderMarkdownContent(item.content || item.description || "Content would appear here...")}
          </div>
        </div>
      );
    }

    // Add components tab for structured content
    if (item.tags?.includes("chat") && item.content) {
      tabData.components = (
        <div className="space-y-3">
          <div className="rounded-[var(--radius-card)] bg-neutral-100 p-3">
            <div className="mb-1 text-sm font-medium">Content Structure</div>
            <div className="text-xs text-neutral-600">
              {item.content.length > 100 ? "Long-form content" : "Short-form content"}
            </div>
          </div>
          <div className="rounded-[var(--radius-card)] bg-neutral-100 p-3">
            <div className="mb-1 text-sm font-medium">Key Elements</div>
            <div className="text-xs text-neutral-600">Content analysis would appear here</div>
          </div>
        </div>
      );
    }

    // Add suggestions tab for video content
    if (item.tags?.includes("tiktok") || item.tags?.includes("instagram")) {
      tabData.suggestions = (
        <div className="space-y-3">
          <div className="bg-success-50 border-success-200 rounded-[var(--radius-card)] border p-3">
            <div className="text-success-900 mb-1 text-sm font-medium">✓ Engaging content</div>
            <div className="text-success-700 text-xs">This content has strong engagement potential</div>
          </div>
          <div className="bg-primary-50 border-primary-200 rounded-[var(--radius-card)] border p-3">
            <div className="text-primary-900 mb-1 text-sm font-medium">💡 Adaptation ideas</div>
            <div className="text-primary-700 text-xs">Consider adapting for different platforms</div>
          </div>
        </div>
      );
    }

    // Add analysis tab for content with rich data
    if (item.tags?.includes("captured") || item.content) {
      tabData.analysis = (
        <div className="space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-medium">Content Metrics</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 rounded-full bg-neutral-200">
                  <div className="bg-primary-500 h-2 rounded-full" style={{ width: "75%" }} />
                </div>
                <span className="text-xs text-neutral-600">75% Relevance</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-medium">Content Score</h4>
            <div className="text-success-600 text-2xl font-bold">7.5/10</div>
            <div className="text-xs text-neutral-600">Based on engagement potential</div>
          </div>
        </div>
      );
    }

    // Add metadata tab
    tabData.metadata = (
      <div className="space-y-2">
        <div className="flex justify-between border-b border-neutral-200 py-2">
          <span className="text-sm text-neutral-600">Type</span>
          <span className="text-sm font-medium">{item.type || "Unknown"}</span>
        </div>
        <div className="flex justify-between border-b border-neutral-200 py-2">
          <span className="text-sm text-neutral-600">Category</span>
          <span className="text-sm font-medium">{item.category || "General"}</span>
        </div>
        {item.platform && (
          <div className="flex justify-between border-b border-neutral-200 py-2">
            <span className="text-sm text-neutral-600">Platform</span>
            <span className="text-sm font-medium">{item.platform}</span>
          </div>
        )}
        <div className="flex justify-between py-2">
          <span className="text-sm text-neutral-600">Created</span>
          <span className="text-sm font-medium">
            {item.date ? new Date(item.date).toLocaleDateString() : "Unknown"}
          </span>
        </div>
      </div>
    );

    return tabData;
  };

  // Get configuration with custom handlers for chats
  const config = useMemo(() => {
    const baseConfig = getLibraryConfig();

    // Override item click and edit actions for chats
    return {
      ...baseConfig,
      // Remove the default addAction to replace it with custom buttons
      addAction: undefined,
      // Add custom header content that replaces the add button area
      customHeaderActions: (
        <div className="flex items-center gap-3">
          <Button
            onClick={handleNewScript}
            variant="outline"
            size="sm"
            className="border border-neutral-200 bg-neutral-100 text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.04)] hover:-translate-y-px hover:border-neutral-300 hover:bg-neutral-200 hover:shadow-[var(--shadow-soft-drop)]"
          >
            <PenTool className="mr-2 h-4 w-4" />
            New Script
          </Button>
          <Button
            onClick={handleNewIdea}
            variant="outline"
            size="sm"
            className="border border-neutral-200 bg-neutral-100 text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.04)] hover:-translate-y-px hover:border-neutral-300 hover:bg-neutral-200 hover:shadow-[var(--shadow-soft-drop)]"
          >
            <Lightbulb className="mr-2 h-4 w-4" />
            New Idea
          </Button>
        </div>
      ),
      onItemClick: (item: any) => {
        // Open in panel for detailed view
        handleItemSelect(item);
      },
      bulkActions: (baseConfig.bulkActions ?? []).map((action) =>
        action.key === "delete"
          ? {
              ...action,
              handler: async (items: any[]) => {
                if (!items || items.length === 0) return;
                try {
                  await deleteLibraryItems(items);
                  await refreshAll();
                } catch (err) {
                  console.error("Bulk delete failed:", err);
                  toast.error("Failed to delete selected items");
                }
              },
            }
          : action,
      ),
      itemActions: [
        ...(baseConfig.itemActions ?? []).map((action) => {
          if (action.key === "edit") {
            return {
              ...action,
              handler: (item: any) => {
                if (item.url?.startsWith("/write")) {
                  // For chats, open in edit mode
                  router.push(item.url);
                } else if (item.tags.includes("captured")) {
                  toast.info(`Content items can be viewed but not directly edited`);
                } else {
                  toast.info(`Editing ${item.title}`);
                }
              },
            };
          }
          return action;
        }),
        // Append Delete per-item action
        {
          key: "delete",
          label: "Delete",
          icon: <Trash2 className="mr-2 h-4 w-4" />,
          handler: async (item: any) => {
            const confirmed = window.confirm(`Delete "${item.title}"? This cannot be undone.`);
            if (!confirmed) return;
            try {
              await deleteLibraryItem(item);
              await refreshAll();
            } catch (err) {
              console.error("Failed to delete item:", err);
              toast.error("Failed to delete item");
            }
          },
        },
      ],
    };
  }, [router, handleNewScript, handleNewIdea]);

  // Data result for the template
  const dataResult = {
    items: filteredData,
    isLoading: loading || contentLoading || scriptsLoading || hooksLoading || ideasLoading,
    isError: !!error || contentError,
    hasMore: false,
    totalCount: filteredData.length,
    refetch: async () => {
      setLoading(true);
      try {
        // Reload all data sources
        const chats = await listConversations();
        setConversations(chats);
        await refetchContent();
        await fetchScripts();

        // Reload hooks
        if (user) {
          const idToken = await user.getIdToken();
          const [hooksRes, ideasRes] = await Promise.all([
            fetch("/api/hooks", { headers: { Authorization: `Bearer ${idToken}` } }),
            fetch("/api/content/ideas", { headers: { Authorization: `Bearer ${idToken}` } }),
          ]);

          const [hooksData, ideasData] = await Promise.all([hooksRes.json(), ideasRes.json()]);

          if (hooksData.success) setHooks(hooksData.hooks);
          if (ideasData.success) setContentIdeas(ideasData.ideas);
        }
      } catch (err) {
        console.error("Failed to reload data:", err);
        toast.error("Failed to reload data");
      } finally {
        setLoading(false);
      }
    },
  };

  return (
    <div className="relative h-full">
      {/* Main Content Area - Responsive to panel */}
      <div
        className="h-full transition-all duration-300"
        style={{
          marginRight: isPanelOpen && !isFullScreen ? `${panelWidth}px` : "0",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <DataTableTemplate
          config={config}
          data={dataResult}
          events={{
            onFilterChange: (filters) => {
              console.log("Filters changed:", filters);
              // Update active filters state
              setActiveFilters(filters);

              // Update URL to reflect current filters
              const params = new URLSearchParams();
              if (filters.contentSource?.length) {
                params.set("source", filters.contentSource[0]);
              }
              if (filters.type?.length) {
                params.set("type", filters.type[0]);
              }
              if (filters.platform?.length) {
                params.set("platform", filters.platform[0]);
              }
              const newUrl = params.toString() ? `/library?${params.toString()}` : "/library";
              window.history.replaceState({}, "", newUrl);
            },
            onSortChange: (sort) => {
              console.log("Sort changed:", sort);
            },
            onSearchChange: (query) => {
              console.log("Search query:", query);
            },
            onViewModeChange: (mode) => {
              console.log("View mode changed:", mode);
            },
            onSelectionChange: (selectedIds) => {
              const selected = filteredData.filter((item) => selectedIds.has(item.id));
              console.log("Selection changed:", selected);

              // Track different types of selected content
              const selectedChats = selected.filter((item) => item.url?.startsWith("/write"));
              const selectedContent = selected.filter((item) => item.tags.includes("captured"));

              if (selectedChats.length > 0) {
                console.log(`${selectedChats.length} chat(s) selected`);
              }
              if (selectedContent.length > 0) {
                console.log(`${selectedContent.length} content item(s) selected`);
              }
            },
          }}
        />
      </div>

      {/* Slide-out Panel Container */}
      <div
        className={`fixed top-0 right-0 h-full transition-all duration-300 ${isPanelOpen ? "visible" : "invisible delay-300"} `}
        style={{
          width: isFullScreen ? "100vw" : `${panelWidth}px`,
          zIndex: 1000,
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Panel Content with slide animation */}
        <div
          className={`h-full transform bg-white shadow-[var(--shadow-soft-drop)] transition-transform duration-300 ${isPanelOpen ? "translate-x-0" : "translate-x-full"} `}
          style={{
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPanelOpen(false)}
                className="rounded-[var(--radius-button)] p-1.5 transition-colors duration-150 hover:bg-neutral-100"
              >
                <ChevronsRight className="h-4 w-4 text-neutral-600" />
              </button>
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="rounded-[var(--radius-button)] p-1.5 transition-colors duration-150 hover:bg-neutral-100"
              >
                {isFullScreen ? (
                  <Minimize className="h-4 w-4 text-neutral-600" />
                ) : (
                  <Maximize className="h-4 w-4 text-neutral-600" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-2">
              {/* Mode Toggle */}
              <div className="flex items-center overflow-hidden rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50">
                <button
                  onClick={() => setPanelMode("view")}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                    panelMode === "view" ? "bg-neutral-200 text-neutral-900" : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  View
                </button>
                <button
                  onClick={() => setPanelMode("notes")}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                    panelMode === "notes" ? "bg-neutral-200 text-neutral-900" : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  Notes
                </button>
              </div>

              {/* Copy and Download buttons */}
              <div className="flex items-center overflow-hidden rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50">
                <button
                  onClick={() => {
                    // Copy functionality would go here
                    console.log("Copy clicked");
                    toast.info("Copy functionality coming soon");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors duration-150 hover:bg-neutral-100"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </button>
                <div className="h-5 w-px bg-neutral-200" />
                <button
                  onClick={() => {
                    // Download functionality would go here
                    console.log("Download clicked");
                    toast.info("Download functionality coming soon");
                  }}
                  className="px-2 py-1.5 text-neutral-700 transition-colors duration-150 hover:bg-neutral-100"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* NotionPanel Component */}
          <div className="h-[calc(100%-57px)] overflow-hidden">
            <NotionPanel
              title={selectedItem?.title || "Untitled"}
              onTitleChange={(title) => {
                if (selectedItem) {
                  setSelectedItem({ ...selectedItem, title });
                }
              }}
              properties={properties}
              onPropertyChange={handlePropertyChange}
              showPageControls={false}
              width={isFullScreen ? undefined : panelWidth}
              onWidthChange={isFullScreen ? undefined : setPanelWidth}
              minWidth={400}
              maxWidth={900}
              isOpen={isPanelOpen}
              isNewIdea={panelMode === "notes"}
              placeholder="Add your notes here..."
              tabData={panelMode === "view" ? generateTabData(selectedItem) : undefined}
              defaultTab="video"
            >
              {panelMode === "notes" && (
                <div className="h-full">
                  <BlockNoteEditor content={notes} onChange={setNotes} placeholder="Add your notes here..." />
                </div>
              )}
            </NotionPanel>
          </div>
        </div>
      </div>
    </div>
  );
}
