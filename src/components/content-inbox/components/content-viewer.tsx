"use client";

import React, { useState, useEffect } from "react";

import { BlockNoteEditor, BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { formatDistanceToNow } from "date-fns";
import { X, ExternalLink, Copy, Edit, Trash2, Eye, Heart, MessageCircle, Clock, Calendar } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { ContentItem } from "../types";

interface ContentViewerProps {
  item: ContentItem | null;
  onClose: () => void;
  onEdit?: (item: ContentItem) => void;
  onDelete?: (id: string) => void;
  onCopyTranscript?: (text: string) => void;
}

// Format count for display
const formatCount = (count?: number) => {
  if (!count) return "0";
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

// Notion-style editor component for text notes
interface NotionStyleEditorProps {
  content: string;
  readOnly?: boolean;
  onChange?: (content: string) => void;
}

const NotionStyleEditor: React.FC<NotionStyleEditorProps> = ({ content, readOnly = false, onChange }) => {
  const [editor, setEditor] = useState<BlockNoteEditor | null>(null);

  // Parse content to BlockNote format
  const parseContent = (text: string) => {
    try {
      // Try to parse as JSON first (if it's already BlockNote format)
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Not JSON, convert plain text to BlockNote format
    }

    // Convert plain text to BlockNote blocks
    const lines = text.split("\n");
    return lines.map((line, index) => ({
      id: `block-${index}`,
      type: "paragraph",
      props: {
        textColor: "default",
        backgroundColor: "default",
        textAlignment: "left",
      },
      content: line ? [{ type: "text", text: line, styles: {} }] : [],
      children: [],
    }));
  };

  useEffect(() => {
    // Create schema with rich text blocks
    const schema = BlockNoteSchema.create({
      blockSpecs: {
        paragraph: defaultBlockSpecs.paragraph,
        heading: defaultBlockSpecs.heading,
        bulletListItem: defaultBlockSpecs.bulletListItem,
        numberedListItem: defaultBlockSpecs.numberedListItem,
        checkListItem: defaultBlockSpecs.checkListItem,
        codeBlock: defaultBlockSpecs.codeBlock,
      },
    });

    // Initialize editor
    const newEditor = BlockNoteEditor.create({
      schema,
      initialContent: parseContent(content),
      editable: !readOnly,
    });

    setEditor(newEditor);

    // Handle changes if not readonly
    if (!readOnly && onChange) {
      const unsubscribe = newEditor.onChange(() => {
        const blocks = newEditor.document;
        onChange(JSON.stringify(blocks));
      });

      return () => {
        unsubscribe();
      };
    }
  }, [content, readOnly, onChange]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-8">
        <div className="text-sm text-neutral-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="notion-style-editor rounded-[var(--radius-card)] border border-neutral-200 bg-white">
      <BlockNoteView editor={editor} theme="light" className="min-h-[200px]" data-theming-css-variables-theme="light" />
      <style jsx global>{`
        .notion-style-editor .bn-container {
          background: white;
          border-radius: var(--radius-card);
        }
        .notion-style-editor .bn-editor {
          padding: 24px;
          font-family: var(--font-sans);
        }
        .notion-style-editor .bn-block-outer {
          margin-bottom: 2px;
        }
        .notion-style-editor .bn-block-content {
          font-size: 14px;
          line-height: 1.7;
          color: hsl(var(--neutral-900));
        }
        .notion-style-editor .bn-editor[contenteditable="false"] {
          background: hsl(var(--neutral-50));
        }
        .notion-style-editor .ProseMirror-selectednode {
          outline: none;
        }
        .notion-style-editor .bn-side-menu,
        .notion-style-editor .bn-drag-handle,
        .notion-style-editor .bn-slash-menu,
        .notion-style-editor .bn-formatting-toolbar {
          display: ${readOnly ? "none" : "block"};
        }
        .notion-style-editor .bn-formatting-toolbar-dropdown {
          display: ${readOnly ? "none" : "flex"};
        }
        .notion-style-editor h1.bn-block-content {
          font-size: 28px;
          font-weight: 600;
          margin-top: 12px;
          margin-bottom: 4px;
          letter-spacing: -0.02em;
        }
        .notion-style-editor h2.bn-block-content {
          font-size: 22px;
          font-weight: 600;
          margin-top: 10px;
          margin-bottom: 3px;
          letter-spacing: -0.01em;
        }
        .notion-style-editor h3.bn-block-content {
          font-size: 18px;
          font-weight: 600;
          margin-top: 8px;
          margin-bottom: 2px;
        }
        .notion-style-editor .bn-inline-content code {
          background: hsl(var(--neutral-100));
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 13px;
          font-family: var(--font-mono);
          color: hsl(var(--primary-700));
        }
        .notion-style-editor pre.bn-block-content {
          background: hsl(var(--neutral-50));
          border: 1px solid hsl(var(--neutral-200));
          border-radius: var(--radius-card);
          padding: 16px;
          overflow-x: auto;
          font-family: var(--font-mono);
          font-size: 13px;
        }
        .notion-style-editor ul.bn-block-group,
        .notion-style-editor ol.bn-block-group {
          padding-left: 28px;
        }
        .notion-style-editor .bn-block-group li {
          margin-bottom: 4px;
        }
        .notion-style-editor strong {
          font-weight: 600;
          color: hsl(var(--neutral-950));
        }
        .notion-style-editor em {
          font-style: italic;
        }
        .notion-style-editor u {
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .notion-style-editor a {
          color: hsl(var(--primary-600));
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .notion-style-editor a:hover {
          color: hsl(var(--primary-700));
        }
        .notion-style-editor blockquote.bn-block-content {
          border-left: 3px solid hsl(var(--neutral-300));
          padding-left: 16px;
          margin-left: 0;
          color: hsl(var(--neutral-700));
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

// eslint-disable-next-line complexity
export const ContentViewer: React.FC<ContentViewerProps> = ({ item, onClose, onEdit, onDelete, onCopyTranscript }) => {
  if (!item) return null;

  const handleCopyTranscript = () => {
    const textToCopy = item.content ?? item.transcription?.text ?? "";
    if (textToCopy && onCopyTranscript) {
      onCopyTranscript(textToCopy);
      navigator.clipboard.writeText(textToCopy);
    }
  };

  const handleOpenExternal = () => {
    if (item.url) {
      window.open(item.url, "_blank");
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-neutral-900">Content Details</h2>
        <button
          onClick={onClose}
          className="rounded-[var(--radius-button)] p-1.5 transition-colors hover:bg-neutral-100"
        >
          <X className="h-5 w-5 text-neutral-600" />
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="space-y-6 p-6">
          {/* Title and Description */}
          <div>
            <h3 className="mb-2 text-xl font-semibold text-neutral-900">{item.title ?? "Untitled Content"}</h3>
            {item.description && <p className="text-neutral-600">{item.description}</p>}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <span className="text-xs font-medium tracking-wider text-neutral-500 uppercase">Platform</span>
                <div className="mt-1">
                  <Badge className="capitalize">{item.platform}</Badge>
                </div>
              </div>

              {item.category && (
                <div>
                  <span className="text-xs font-medium tracking-wider text-neutral-500 uppercase">Category</span>
                  <div className="mt-1">
                    <Badge variant="outline" className="capitalize">
                      {item.category}
                    </Badge>
                  </div>
                </div>
              )}

              {item.creator && (
                <div>
                  <span className="text-xs font-medium tracking-wider text-neutral-500 uppercase">Creator</span>
                  <p className="mt-1 text-sm text-neutral-900">{item.creator.name}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-medium tracking-wider text-neutral-500 uppercase">Saved</span>
                <div className="mt-1 flex items-center gap-1 text-sm text-neutral-600">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(item.savedAt), { addSuffix: true })}
                </div>
              </div>

              {item.duration && (
                <div>
                  <span className="text-xs font-medium tracking-wider text-neutral-500 uppercase">Duration</span>
                  <div className="mt-1 flex items-center gap-1 text-sm text-neutral-600">
                    <Clock className="h-3 w-3" />
                    {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, "0")}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metrics */}
          {}
          {(item.viewCount !== undefined || item.likeCount !== undefined || item.commentCount !== undefined) && (
            <>
              <Separator />
              <div>
                <h4 className="mb-3 text-sm font-medium text-neutral-900">Engagement Metrics</h4>
                <div className="grid grid-cols-3 gap-4">
                  {item.viewCount !== undefined && (
                    <div className="text-center">
                      <div className="mb-1 flex items-center justify-center gap-1 text-neutral-500">
                        <Eye className="h-4 w-4" />
                      </div>
                      <p className="text-lg font-semibold text-neutral-900">{formatCount(item.viewCount)}</p>
                      <p className="text-xs text-neutral-500">Views</p>
                    </div>
                  )}
                  {item.likeCount !== undefined && (
                    <div className="text-center">
                      <div className="mb-1 flex items-center justify-center gap-1 text-neutral-500">
                        <Heart className="h-4 w-4" />
                      </div>
                      <p className="text-lg font-semibold text-neutral-900">{formatCount(item.likeCount)}</p>
                      <p className="text-xs text-neutral-500">Likes</p>
                    </div>
                  )}
                  {item.commentCount !== undefined && (
                    <div className="text-center">
                      <div className="mb-1 flex items-center justify-center gap-1 text-neutral-500">
                        <MessageCircle className="h-4 w-4" />
                      </div>
                      <p className="text-lg font-semibold text-neutral-900">{formatCount(item.commentCount)}</p>
                      <p className="text-xs text-neutral-500">Comments</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Tags - TODO: Implement tag functionality in future */}
          {/*
            TODO: Future Tags Implementation
            - Display tags associated with content item
            - Allow inline tag editing
            - Show tag colors/categories
            - Enable tag filtering from this view
          */}

          {/* Transcript/Content */}
          {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
          {(item.content || item.transcription?.text) && (
            <>
              <Separator />
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-medium text-neutral-900">
                    {item.isSystemContent ? "Content" : "Transcript"}
                  </h4>
                  <Button size="sm" variant="ghost" onClick={handleCopyTranscript} className="gap-2">
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
                {item.platform === "note" ? (
                  <NotionStyleEditor content={item.content ?? item.transcription?.text ?? ""} readOnly />
                ) : (
                  <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-4">
                    <p className="text-sm whitespace-pre-wrap text-neutral-700">
                      {item.content ?? item.transcription?.text}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Thumbnail */}
          {item.thumbnailUrl && (
            <>
              <Separator />
              <div>
                <h4 className="mb-3 text-sm font-medium text-neutral-900">Preview</h4>
                <div className="overflow-hidden rounded-[var(--radius-card)] border border-neutral-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.thumbnailUrl} alt={item.title ?? "Content thumbnail"} className="h-auto w-full" />
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="border-t border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleOpenExternal} className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Open Original
          </Button>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(item)} className="gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
            {onDelete && !item.isSystemContent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(item.id)}
                className="text-destructive-600 hover:text-destructive-700 gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
