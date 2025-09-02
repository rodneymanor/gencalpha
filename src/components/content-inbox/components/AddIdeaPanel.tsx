"use client";

// Notion-style Add Idea Panel using UnifiedSlideout

import React, { useState, useEffect, useRef } from "react";

import { BlockNoteEditor, BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { Globe, Youtube, Music, Instagram, Twitter, Linkedin } from "lucide-react";
import { toast } from "sonner";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

import { SlideoutHeader } from "@/components/ui/slideout-header";
import { UnifiedSlideout, ClaudeArtifactConfig } from "@/components/ui/unified-slideout";
import { cn } from "@/lib/utils";

import { detectPlatform, useAddContent } from "../hooks/use-content-inbox";
import { Platform } from "../types";

interface AddIdeaPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Platform icon mapping
const PlatformIcon: Record<Platform, React.ElementType> = {
  youtube: Youtube,
  tiktok: Music,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  unknown: Globe,
};

export const AddIdeaPanel: React.FC<AddIdeaPanelProps> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [detectedPlatform, setDetectedPlatform] = useState<Platform>("unknown");
  const [editor, setEditor] = useState<BlockNoteEditor | null>(null);
  const [_editorContent, _setEditorContent] = useState("");
  const [isUrlFocused, setIsUrlFocused] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const addContentMutation = useAddContent();

  // Initialize BlockNote editor
  useEffect(() => {
    if (!isOpen) return; // Only initialize when panel opens

    const schema = BlockNoteSchema.create({
      blockSpecs: {
        paragraph: defaultBlockSpecs.paragraph,
        heading: defaultBlockSpecs.heading,
        bulletListItem: defaultBlockSpecs.bulletListItem,
        numberedListItem: defaultBlockSpecs.numberedListItem,
        checkListItem: defaultBlockSpecs.checkListItem,
      },
    });

    const editorInstance = BlockNoteEditor.create({
      schema,
      initialContent: [
        {
          type: "paragraph",
          content: "",
        },
      ],
    });

    setEditor(editorInstance);

    // BlockNote doesn't have a destroy method, cleanup happens automatically
    return () => {
      // Editor will be garbage collected when component unmounts
      setEditor(null);
    };
  }, [isOpen]);

  // Auto-focus title when panel opens
  useEffect(() => {
    if (isOpen && titleRef.current) {
      setTimeout(() => {
        titleRef.current?.focus();
      }, 400); // Wait for slide animation
    }
  }, [isOpen]);

  // Detect platform when URL changes
  useEffect(() => {
    if (url) {
      const platform = detectPlatform(url);
      setDetectedPlatform(platform);
    } else {
      setDetectedPlatform("unknown");
    }
  }, [url]);

  // Handle keyboard navigation
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      urlRef.current?.focus();
    }
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Focus the BlockNote editor
      setTimeout(() => {
        const editableElement = editorContainerRef.current?.querySelector('[contenteditable="true"]') as HTMLElement;
        editableElement?.focus();
      }, 100);
    } else if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      titleRef.current?.focus();
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title for your idea");
      titleRef.current?.focus();
      return;
    }

    try {
      // Get editor content as JSON
      const blocks = editor?.document ?? [];
      const noteContent = JSON.stringify(blocks);

      await addContentMutation.mutateAsync({
        url: url || undefined,
        title: title,
        description: undefined, // Can be added if needed
        category: "inspiration", // Default category
        tags: [], // Can be extended later
        notes: {
          content: noteContent,
          format: "json", // BlockNote uses JSON format
        },
      });

      toast.success("Idea saved successfully!");

      // Reset form
      setTitle("");
      setUrl("");
      _setEditorContent("");
      if (editor) {
        editor.replaceBlocks(editor.document, [
          {
            type: "paragraph",
            content: "",
          },
        ]);
      }

      onSuccess?.();
      onClose();
    } catch (_error) {
      toast.error("Failed to save idea. Please try again.");
    }
  };

  const PlatformIconComponent = detectedPlatform !== "unknown" ? PlatformIcon[detectedPlatform] : null;

  return (
    <UnifiedSlideout
      isOpen={isOpen}
      onClose={onClose}
      config={{
        ...ClaudeArtifactConfig,
        width: "lg", // 600px width to match content viewer
        showHeader: false, // Disable default header completely
        showCloseButton: false,
        animationType: "claude", // Claude-style smooth animation
        responsive: {
          mobile: "takeover",
          tablet: "overlay",
          desktop: "sidebar",
        },
        variant: "artifact",
      }}
      contentClassName="p-0"
    >
      {/* Standardized Header - 52px height */}
      <SlideoutHeader
        onClose={onClose}
        rightActions={
          <button
            onClick={handleSave}
            disabled={!title.trim() || addContentMutation.isPending}
            className={cn(
              "rounded-[var(--radius-button)] px-3 py-1.5 text-sm font-medium transition-all",
              title.trim()
                ? "bg-neutral-900 text-white hover:bg-neutral-800"
                : "cursor-not-allowed bg-neutral-100 text-neutral-400",
            )}
          >
            {addContentMutation.isPending ? "Saving..." : "Save"}
          </button>
        }
      />

      {/* Main Content */}
      <div className="mx-auto max-w-2xl space-y-4 px-8 pb-6">
        {/* Title Field - Notion Style */}
        <div>
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            placeholder="New Idea"
            className="w-full border-none bg-transparent text-4xl font-bold text-neutral-900 placeholder:text-neutral-300 focus:outline-none"
          />
        </div>

        {/* URL Field - Notion Style */}
        <div className="relative flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-500">URL</span>
          <div className="relative flex-1">
            <input
              ref={urlRef}
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleUrlKeyDown}
              onFocus={() => setIsUrlFocused(true)}
              onBlur={() => setIsUrlFocused(false)}
              placeholder="empty"
              className={cn(
                "w-full border-none bg-transparent text-base text-neutral-700 placeholder:text-neutral-400 focus:outline-none",
                isUrlFocused && "placeholder:text-neutral-500",
              )}
            />
            {PlatformIconComponent && url && (
              <span className="absolute top-1/2 right-0 -translate-y-1/2">
                <PlatformIconComponent className="h-4 w-4 text-neutral-400" />
              </span>
            )}
          </div>
        </div>

        {/* Helper Text */}
        <p className="text-sm text-neutral-400">Press Enter to continue typing your note</p>

        {/* Divider */}
        <div className="h-px bg-neutral-100" />

        {/* BlockNote Editor */}
        <div ref={editorContainerRef} className="min-h-[400px]">
          {editor && (
            <BlockNoteView
              editor={editor}
              theme="light"
              onChange={() => {
                const blocks = editor.document;
                _setEditorContent(JSON.stringify(blocks));
              }}
              className="blocknote-minimal"
            />
          )}
        </div>
      </div>
    </UnifiedSlideout>
  );
};

// Add custom styles for minimal BlockNote appearance
if (typeof document !== "undefined") {
  const styleId = "add-idea-panel-styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .blocknote-minimal .bn-editor {
        padding: 0;
      }
      
      .blocknote-minimal .bn-block-content {
        padding: 0;
      }
      
      .blocknote-minimal .bn-editor [contenteditable] {
        padding: 0;
        font-size: 16px;
        line-height: 1.6;
      }
      
      .blocknote-minimal .bn-side-menu {
        opacity: 0;
        transition: opacity 0.2s;
      }
      
      .blocknote-minimal:hover .bn-side-menu {
        opacity: 1;
      }

      /* Ensure proper focus styles */
      .blocknote-minimal .ProseMirror:focus {
        outline: none;
      }

      /* Remove header border from slideout */
      .slideout-header {
        border-bottom: none !important;
      }

      /* Responsive adjustments for mobile */
      @media (max-width: 640px) {
        .blocknote-minimal .bn-editor [contenteditable] {
          font-size: 14px;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
