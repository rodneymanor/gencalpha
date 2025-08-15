"use client";

import { useState, useEffect } from "react";

import { Edit3, Plus, X, Tag, Star, Save } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { clientNotesService, type UpdateNoteData } from "@/lib/services/client-notes-service";

interface EditNoteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onNoteUpdated?: () => void;
  note: {
    id: string;
    title: string;
    content: string;
    tags?: string[];
    starred?: boolean;
  } | null;
}

export function EditNoteDialog({ isOpen, onOpenChange, onNoteUpdated, note }: EditNoteDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [starred, setStarred] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Initialize form when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setTags(note.tags || []);
      setStarred(note.starred || false);
    }
  }, [note]);

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

    if (!title.trim() || !note) {
      return;
    }

    setIsUpdating(true);

    try {
      const updateData: UpdateNoteData = {
        title: title.trim(),
        content: content.trim(),
        tags,
        starred,
      };

      await clientNotesService.updateNote(note.id, updateData);

      onOpenChange(false);
      onNoteUpdated?.();
    } catch (error) {
      console.error("Failed to update note:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setTags(note.tags || []);
      setStarred(note.starred || false);
    }
    setNewTag("");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="text-primary h-5 w-5" />
            Edit Idea
          </DialogTitle>
          <DialogDescription>Update your idea details and content.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title..."
              className="rounded-[var(--radius-button)]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-content">Content</Label>
            <Textarea
              id="edit-content"
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
              disabled={isUpdating}
              className="rounded-[var(--radius-button)]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || isUpdating}
              className="gap-2 rounded-[var(--radius-button)]"
            >
              {isUpdating ? (
                <>
                  <div className="border-background h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
