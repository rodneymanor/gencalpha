"use client";

// Add Content Modal with Link Input and Platform Detection

import React, { useState, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";
import {
  Link,
  Loader2,
  CheckCircle,
  Youtube,
  Music,
  Instagram,
  Twitter,
  Linkedin,
  Globe,
  Plus,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { detectPlatform, useAddContent } from "../hooks/use-content-inbox";
import { ContentCategory, Platform } from "../types";

interface AddContentModalProps {
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

export const AddContentModal: React.FC<AddContentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<ContentCategory>("inspiration");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [notes, setNotes] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [detectedPlatform, setDetectedPlatform] = useState<Platform>("unknown");
  const [pastedContent, setPastedContent] = useState("");

  const addContentMutation = useAddContent();

  // Detect platform when URL changes
  useEffect(() => {
    if (url) {
      const platform = detectPlatform(url);
      setDetectedPlatform(platform);

      // Validate URL format
      try {
        new URL(url);
        setValidationStatus("valid");
      } catch {
        setValidationStatus("invalid");
      }
    } else {
      setValidationStatus("idle");
      setDetectedPlatform("unknown");
    }
  }, [url]);

  // Handle paste event to detect URLs in clipboard
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!isOpen) return;

      const text = e.clipboardData?.getData("text");
      if (text) {
        // Try to extract URL from pasted text
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const matches = text.match(urlRegex);

        if (matches && matches.length > 0) {
          setUrl(matches[0]);
          setPastedContent(text);
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isOpen]);

  // Add tag
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url || validationStatus !== "valid") {
      toast.error("Please enter a valid URL");
      return;
    }

    try {
      await addContentMutation.mutateAsync({
        url,
        category,
        tags,
      });

      toast.success("Content added successfully!");

      // Reset form
      setUrl("");
      setCategory("inspiration");
      setTags([]);
      setNotes("");
      setPastedContent("");

      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Failed to add content. Please try again.");
    }
  };

  // Categories configuration
  const categories: { value: ContentCategory; label: string; description: string }[] = [
    { value: "inspiration", label: "Inspiration", description: "Creative ideas and concepts" },
    { value: "competitor", label: "Competitor", description: "Competitive analysis" },
    { value: "trending", label: "Trending", description: "Currently popular content" },
    { value: "educational", label: "Educational", description: "Learning resources" },
  ];

  const PlatformIconComponent = PlatformIcon[detectedPlatform];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary-600 h-5 w-5" />
            Add Content to Inbox
          </DialogTitle>
          <DialogDescription>Save a video or content link for later inspiration and analysis</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL Input with Platform Detection */}
          <div className="space-y-2">
            <Label htmlFor="url">Content URL</Label>
            <div className="relative">
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste a YouTube, TikTok, Instagram, or other link..."
                className={cn(
                  "pr-10 pl-10",
                  validationStatus === "valid" && "border-success-400",
                  validationStatus === "invalid" && "border-destructive-400",
                )}
              />
              <Link className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />

              {/* Platform indicator */}
              <AnimatePresence mode="wait">
                {detectedPlatform !== "unknown" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute top-1/2 right-3 -translate-y-1/2"
                  >
                    <PlatformIconComponent className="h-4 w-4 text-neutral-600" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Platform detection badge */}
            {detectedPlatform !== "unknown" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
                <Badge variant="outline" className="text-xs">
                  <PlatformIconComponent className="mr-1 h-3 w-3" />
                  {detectedPlatform} detected
                </Badge>
                {validationStatus === "valid" && <CheckCircle className="text-success-600 h-4 w-4" />}
              </motion.div>
            )}
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as ContentCategory)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div>
                      <div className="font-medium">{cat.label}</div>
                      <div className="text-xs text-neutral-500">{cat.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags Input */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tags..."
                className="flex-1"
              />
              <Button type="button" onClick={handleAddTag} variant="outline" size="sm" className="px-3">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Tags display */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="py-1 pr-1 pl-2 text-xs">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 rounded-full p-0.5 transition-colors hover:bg-neutral-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Notes (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this content..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Quick add suggestions */}
          <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-3">
            <p className="mb-2 text-xs text-neutral-600">Quick add tags:</p>
            <div className="flex flex-wrap gap-1">
              {["hook-ideas", "b-roll", "trending-audio", "competitor", "tutorial"].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    if (!tags.includes(suggestion)) {
                      setTags([...tags, suggestion]);
                    }
                  }}
                  className={cn(
                    "rounded-full px-2 py-1 text-xs transition-colors",
                    tags.includes(suggestion)
                      ? "bg-primary-200 text-primary-700"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
                  )}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={addContentMutation.isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!url || validationStatus !== "valid" || addContentMutation.isPending}
              className="bg-neutral-900 text-neutral-50 hover:bg-neutral-800"
            >
              {addContentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add to Inbox
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
