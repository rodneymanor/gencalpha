import React, { useState } from "react";

import { Zap, FileText, Instagram, Youtube, Globe, MessageSquare, Mic, Copy, Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import type { Idea } from "./types";

interface IdeaDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  idea: Idea | null;
  onGenerateHooks: () => void;
  onConvertToScript: () => void;
}

const getSourceIcon = (source: string) => {
  const iconMap = {
    instagram: <Instagram className="h-4 w-4" />,
    tiktok: <MessageSquare className="h-4 w-4" />,
    youtube: <Youtube className="h-4 w-4" />,
    blog: <Globe className="h-4 w-4" />,
    voice: <Mic className="h-4 w-4" />,
  };
  return iconMap[source as keyof typeof iconMap] ?? <FileText className="h-4 w-4" />;
};

const getSourceColor = (source: string) => {
  const colorMap = {
    instagram: "bg-accent text-accent-foreground",
    tiktok: "bg-primary text-primary-foreground",
    youtube: "bg-destructive text-destructive-foreground",
    blog: "bg-secondary text-secondary-foreground",
    voice: "bg-muted text-muted-foreground",
  };
  return colorMap[source as keyof typeof colorMap] || "bg-muted text-muted-foreground";
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
  return date.toLocaleDateString();
};

export function IdeaDetailDialog({
  isOpen,
  onOpenChange,
  idea,
  onGenerateHooks,
  onConvertToScript,
}: IdeaDetailDialogProps) {
  const [isCopied, setIsCopied] = useState(false);

  if (!idea) return null;

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(idea.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-4xl flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <Badge className={`gap-1 ${getSourceColor(idea.source)}`}>
                {getSourceIcon(idea.source)}
                {idea.source}
              </Badge>
              {idea.title}
            </DialogTitle>
            <div className="text-muted-foreground text-sm">
              {idea.wordCount} words • {formatDate(idea.createdAt)}
            </div>
          </div>
          <DialogDescription className="sr-only">
            View and manage idea details, generate hooks, or convert to script
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content Area */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="relative">
            <div
              className="prose bg-muted/20 hover:bg-muted/30 group max-w-none cursor-pointer rounded-[var(--radius-card)] p-6 transition-colors"
              onClick={handleCopyContent}
              title="Click to copy content"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="flex-1 text-sm leading-relaxed whitespace-pre-wrap">{idea.content}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 flex-shrink-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyContent();
                  }}
                >
                  {isCopied ? <Check className="text-secondary h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {isCopied && (
              <div className="bg-secondary text-secondary-foreground absolute top-2 right-2 rounded-[var(--radius-button)] px-2 py-1 text-xs">
                Copied!
              </div>
            )}
          </div>

          {idea.sourceUrl && (
            <div className="bg-accent mt-6 rounded-[var(--radius-card)] p-4">
              <p className="text-accent-foreground text-sm">
                <strong>Source:</strong>{" "}
                <a
                  href={idea.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary underline hover:no-underline"
                >
                  {idea.sourceUrl}
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Fixed Footer with Buttons */}
        <div className="flex flex-shrink-0 justify-between border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <div className="flex gap-3">
            <Button onClick={onGenerateHooks} className="gap-2">
              <Zap className="h-4 w-4" />
              Generate Hooks
            </Button>
            <Button onClick={onConvertToScript} variant="default" className="gap-2">
              <FileText className="h-4 w-4" />
              Convert to Script
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
