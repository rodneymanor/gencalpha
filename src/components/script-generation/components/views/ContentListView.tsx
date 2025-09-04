"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check, Edit2, Trash2 } from "lucide-react";

interface ContentItem {
  id: number;
  content: string;
  expanded?: boolean;
}

interface ContentListViewProps {
  contentType: "hooks" | "ideas" | "tips";
  content: string;
  onContentUpdate: (updatedContent: string) => void;
}

export function ContentListView({ contentType, content, onContentUpdate }: ContentListViewProps) {
  console.log("📋 [ContentListView] Received:", {
    contentType,
    contentLength: content?.length,
    contentPreview: content?.substring(0, 200),
    hasContent: !!content
  });
  
  // Parse the content into individual items
  const parseContent = (rawContent: string): ContentItem[] => {
    const lines = rawContent.split("\n").filter(line => line.trim());
    const items: ContentItem[] = [];
    let currentItem = "";
    let itemId = 1;

    for (const line of lines) {
      // Skip headers and tips
      if (line.startsWith("##") || line.startsWith("> **")) {
        continue;
      }
      
      // Check if this is a numbered item (e.g., "1. ", "2. ", etc.)
      const numberedMatch = line.match(/^(\d+)\.\s+(.+)/);
      if (numberedMatch) {
        if (currentItem) {
          items.push({ id: itemId++, content: currentItem.trim() });
        }
        currentItem = numberedMatch[2];
      } else if (line.startsWith("---")) {
        // End of content
        if (currentItem) {
          items.push({ id: itemId++, content: currentItem.trim() });
        }
        break;
      } else if (currentItem) {
        // Continue current item (only if we already have a current item)
        currentItem += " " + line;
      }
    }

    // Add last item if exists
    if (currentItem) {
      items.push({ id: itemId++, content: currentItem.trim() });
    }

    // If no numbered items found, try to split by double newlines or just create items from paragraphs
    if (items.length === 0) {
      const paragraphs = rawContent
        .split(/\n\n+/)
        .filter(p => p.trim() && !p.startsWith("##") && !p.startsWith("> **") && !p.includes("---"));
      
      // Return all found paragraphs, not limited to 10 - system should be flexible
      return paragraphs.map((p, index) => ({
        id: index + 1,
        content: p.trim(),
      }));
    }

    console.log("🎯 [ContentListView] Parsed items:", {
      itemCount: items.length,
      firstItem: items[0]?.content?.substring(0, 50),
      allItemsPreview: items.slice(0, 3).map(item => item.content.substring(0, 30))
    });
    
    return items;
  };

  const [items, setItems] = useState<ContentItem[]>(() => parseContent(content));
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const getTitle = () => {
    const itemCount = items.length;
    switch (contentType) {
      case "hooks":
        return itemCount > 0 ? `${itemCount} Hooks for Your Content` : "Hooks for Your Content";
      case "ideas":
        return itemCount > 0 ? `${itemCount} Content Ideas` : "Content Ideas";
      case "tips":
        return itemCount > 0 ? `${itemCount} Value Tips` : "Value Tips";
      default:
        return "Generated Content";
    }
  };

  const getItemLabel = (index: number) => {
    switch (contentType) {
      case "hooks":
        return `Hook ${index}`;
      case "ideas":
        return `Idea ${index}`;
      case "tips":
        return `Tip ${index}`;
      default:
        return `Item ${index}`;
    }
  };

  const handleEdit = (item: ContentItem) => {
    setEditingId(item.id);
    setEditText(item.content);
  };

  const handleSaveEdit = () => {
    if (editingId !== null) {
      const updatedItems = items.map(item =>
        item.id === editingId ? { ...item, content: editText } : item
      );
      setItems(updatedItems);
      setEditingId(null);
      setEditText("");
      
      // Update the parent with the new content
      const newContent = formatItemsAsContent(updatedItems);
      onContentUpdate(newContent);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleDelete = (id: number) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    
    // Update the parent with the new content
    const newContent = formatItemsAsContent(updatedItems);
    onContentUpdate(newContent);
  };

  const handleCopy = async (item: ContentItem) => {
    try {
      await navigator.clipboard.writeText(item.content);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatItemsAsContent = (items: ContentItem[]): string => {
    const title = `## ${getTitle()}\n\n`;
    const itemsList = items.map((item, index) => `${index + 1}. ${item.content}`).join("\n\n");
    const tip = `\n\n---\n\n> **💡 Tip:** ${getTip()}`;
    return title + itemsList + tip;
  };

  const getTip = () => {
    switch (contentType) {
      case "hooks":
        return "Each hook is designed to grab attention immediately. Pick the ones that resonate with your style and adapt them to your voice!";
      case "ideas":
        return "These ideas are starting points. Expand on the ones that excite you most and make them your own!";
      case "tips":
        return "These are actionable tips your audience can implement immediately. Use them as standalone posts or combine them into comprehensive content!";
      default:
        return "Use these as inspiration for your content!";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-4">
        <h2 className="text-2xl font-bold text-neutral-900">{getTitle()}</h2>
        <p className="mt-2 text-sm text-neutral-600">
          {items.length} {contentType} generated • Click to edit, copy, or remove
        </p>
      </div>

      {/* Content Items */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="group relative rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-4 transition-all hover:border-neutral-300 hover:bg-white hover:shadow-[var(--shadow-soft-drop)]"
          >
            {/* Item Header */}
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500">
                {getItemLabel(index + 1)}
              </span>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => handleCopy(item)}
                  className="rounded p-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                  title="Copy"
                >
                  {copiedId === item.id ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  onClick={() => handleEdit(item)}
                  className="rounded p-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                  title="Edit"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="rounded p-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Item Content */}
            {editingId === item.id ? (
              <div className="space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full rounded-[var(--radius-button)] border border-neutral-300 bg-white p-2 text-sm text-neutral-900 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                  rows={3}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="rounded-[var(--radius-button)] px-3 py-1 text-sm text-neutral-600 hover:bg-neutral-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="rounded-[var(--radius-button)] bg-neutral-900 px-3 py-1 text-sm text-neutral-50 hover:bg-neutral-800"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-neutral-700">{item.content}</p>
            )}
          </div>
        ))}
      </div>

      {/* Tips Section */}
      <div className="mt-6 rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-4">
        <p className="text-sm text-neutral-600">
          <span className="font-medium">💡 Tip:</span> {getTip()}
        </p>
      </div>
    </div>
  );
}