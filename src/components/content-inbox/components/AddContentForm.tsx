"use client";

import React, { useState } from "react";

import { Loader2, X, Link, Tag, Folder, AlertCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { detectPlatform } from "../hooks/use-content-inbox";
import { ContentCategory, Platform } from "../types";

interface AddContentFormProps {
  onClose: () => void;
  onSubmit: (data: {
    url: string;
    category?: ContentCategory;
    tags?: string[];
    title?: string;
    description?: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

// Categories configuration
const categories: { value: ContentCategory; label: string; description: string }[] = [
  { value: "inspiration", label: "Inspiration", description: "Creative ideas and concepts" },
  { value: "competitor", label: "Competitor", description: "Competitive analysis" },
  { value: "trending", label: "Trending", description: "Currently popular content" },
  { value: "educational", label: "Educational", description: "Learning resources" },
];

export const AddContentForm: React.FC<AddContentFormProps> = ({
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ContentCategory>("inspiration");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [detectedPlatform, setDetectedPlatform] = useState<Platform>("unknown");

  // Detect platform when URL changes
  React.useEffect(() => {
    if (url) {
      const platform = detectPlatform(url);
      setDetectedPlatform(platform);
    } else {
      setDetectedPlatform("unknown");
    }
  }, [url]);

  // Handle adding a tag
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    try {
      await onSubmit({
        url: url.trim(),
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        category,
        tags: tags.length > 0 ? tags : undefined,
      });
      
      // Reset form on success
      setUrl("");
      setTitle("");
      setDescription("");
      setCategory("inspiration");
      setTags([]);
      setTagInput("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add content");
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-neutral-900">Add Content</h2>
        <button
          onClick={onClose}
          className="rounded-[var(--radius-button)] p-1.5 transition-colors hover:bg-neutral-100"
        >
          <X className="h-5 w-5 text-neutral-600" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Content URL
              <span className="text-destructive-600">*</span>
            </Label>
            <Input
              id="url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="font-mono text-sm"
              required
            />
            {detectedPlatform !== "unknown" && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">Detected platform:</span>
                <Badge variant="outline" className="text-xs capitalize">
                  {detectedPlatform}
                </Badge>
              </div>
            )}
          </div>

          {/* Title (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title (Optional)
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter a custom title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <p className="text-xs text-neutral-500">
              Leave blank to auto-detect from the content
            </p>
          </div>

          {/* Description (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Add notes or description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Category
            </Label>
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

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                type="text"
                placeholder="Add a tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 rounded-full p-0.5 hover:bg-neutral-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-[var(--radius-button)] border border-destructive-200 bg-destructive-50 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive-600 mt-0.5" />
                <p className="text-sm text-destructive-700">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-neutral-200 px-6 py-4">
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !url.trim()}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Content"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};