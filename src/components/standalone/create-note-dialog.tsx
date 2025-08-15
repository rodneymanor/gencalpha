"use client";

import { useState } from "react";

import { Lightbulb, Plus, X, Tag, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { clientNotesService, type CreateNoteData } from "@/lib/services/client-notes-service";

interface CreateNoteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onNoteCreated?: () => void;
  initialData?: {
    title?: string;
    content?: string;
    tags?: string[];
    source?: string;
  };
}

export function CreateNoteDialog({ isOpen, onOpenChange, onNoteCreated, initialData }: CreateNoteDialogProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [starred, setStarred] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    setIsCreating(true);

    try {
      const noteData: CreateNoteData = {
        title: title.trim(),
        content: content.trim(),
        tags,
        type: "idea_inbox",
        source: (initialData?.source as "manual" | "inbox" | "import") || "manual",
        starred,
      };

      await clientNotesService.createNote(noteData);

      // Reset form
      setTitle("");
      setContent("");
      setTags([]);
      setNewTag("");
      setStarred(false);

      onOpenChange(false);
      onNoteCreated?.();
    } catch (error) {
      console.error("Failed to create note:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setTitle(initialData?.title || "");
    setContent(initialData?.content || "");
    setTags(initialData?.tags || []);
    setNewTag("");
    setStarred(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="text-primary h-5 w-5" />
            Create New Idea
          </DialogTitle>
          <DialogDescription>Capture your thoughts and ideas for future reference.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title..."
              className="rounded-[var(--radius-button)]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write down your idea, inspiration, or thoughts..."
              className="min-h-24 resize-none rounded-[var(--radius-button)]"
              rows={4}
            />
          </div>

          <div className="space-y-3">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a tag..."
                className="flex-1 rounded-[var(--radius-button)]"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={!newTag.trim() || tags.includes(newTag.trim())}
                className="rounded-[var(--radius-button)]"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 rounded-[var(--radius-button)] text-xs">
                    <Tag className="h-3 w-3" />
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto w-auto p-0 hover:bg-transparent"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={starred ? "default" : "outline"}
              size="sm"
              onClick={() => setStarred(!starred)}
              className="gap-2 rounded-[var(--radius-button)]"
            >
              <Star className={`h-4 w-4 ${starred ? "fill-current" : ""}`} />
              {starred ? "Starred" : "Star this idea"}
            </Button>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
              className="rounded-[var(--radius-button)]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || isCreating}
              className="gap-2 rounded-[var(--radius-button)]"
            >
              {isCreating ? (
                <>
                  <div className="border-background h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <Lightbulb className="h-4 w-4" />
                  Create Idea
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
