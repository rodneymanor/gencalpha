import React from "react";

import { Zap, FileText, Instagram, Youtube, Globe, MessageSquare, Mic } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  return iconMap[source as keyof typeof iconMap] || <FileText className="h-4 w-4" />;
};

const getSourceColor = (source: string) => {
  const colorMap = {
    instagram: "bg-pink-100 text-pink-800",
    tiktok: "bg-black text-white",
    youtube: "bg-red-100 text-red-800",
    blog: "bg-blue-100 text-blue-800",
    voice: "bg-purple-100 text-purple-800",
  };
  return colorMap[source as keyof typeof colorMap] || "bg-gray-100 text-gray-800";
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
  if (!idea) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl">
        <DialogHeader>
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
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="prose bg-muted/20 max-w-none rounded-lg p-4">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{idea.content}</p>
          </div>

          {idea.sourceUrl && (
            <div className="mt-4 rounded-lg bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                <strong>Source:</strong>{" "}
                <a
                  href={idea.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  {idea.sourceUrl}
                </a>
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between border-t pt-6">
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
