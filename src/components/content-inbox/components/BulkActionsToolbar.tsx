"use client";

// Bulk Actions Toolbar Component

import React, { useState } from "react";

import { motion } from "framer-motion";
import { Trash2, Tag, CheckCircle, FolderPlus, X, ChevronDown, Archive, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { BulkAction, ContentCategory } from "../types";

interface BulkActionsToolbarProps {
  selectedCount: number;
  onDelete: () => void;
  onAction: (action: BulkAction) => void;
  onClearSelection: () => void;
}

export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedCount,
  onDelete,
  onAction,
  onClearSelection,
}) => {
  const [showCategorizeDialog, setShowCategorizeDialog] = useState(false);
  const [showTagsDialog, setShowTagsDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory>("inspiration");
  const [tagsToAdd, setTagsToAdd] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Handle categorize
  const handleCategorize = () => {
    onAction({
      type: "categorize",
      payload: { category: selectedCategory },
    });
    setShowCategorizeDialog(false);
  };

  // Handle add tags
  const handleAddTags = () => {
    onAction({
      type: "addTags",
      payload: { tags: tagsToAdd },
    });
    setTagsToAdd([]);
    setTagInput("");
    setShowTagsDialog(false);
  };

  // Add tag to list
  const addTag = () => {
    if (tagInput.trim() && !tagsToAdd.includes(tagInput.trim())) {
      setTagsToAdd([...tagsToAdd, tagInput.trim()]);
      setTagInput("");
    }
  };

  // Remove tag from list
  const removeTag = (tag: string) => {
    setTagsToAdd(tagsToAdd.filter((t) => t !== tag));
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-primary-50 border-primary-200 sticky top-0 z-10 border-b px-6 py-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Selection count */}
            <Badge className="bg-primary-600 text-white">{selectedCount} selected</Badge>

            {/* Quick actions */}
            <div className="flex items-center gap-2">
              {/* Delete */}
              <Button
                onClick={onDelete}
                variant="ghost"
                size="sm"
                className="text-destructive-600 hover:text-destructive-700 hover:bg-destructive-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>

              {/* Mark as used */}
              <Button onClick={() => onAction({ type: "markUsed" })} variant="ghost" size="sm">
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Used
              </Button>

              {/* Categorize */}
              <Button onClick={() => setShowCategorizeDialog(true)} variant="ghost" size="sm">
                <FolderPlus className="mr-2 h-4 w-4" />
                Categorize
              </Button>

              {/* Add tags */}
              <Button onClick={() => setShowTagsDialog(true)} variant="ghost" size="sm">
                <Tag className="mr-2 h-4 w-4" />
                Add Tags
              </Button>

              {/* More actions dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    More
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => onAction({ type: "removeTags" })}>
                    <Tag className="mr-2 h-4 w-4" />
                    Remove Tags
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => console.log("Archive selected")}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => console.log("Star selected")}>
                    <Star className="mr-2 h-4 w-4" />
                    Add to Favorites
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => console.log("Export selected")}>Export Selected</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Clear selection */}
          <Button onClick={onClearSelection} variant="ghost" size="sm" className="text-neutral-600">
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        </div>
      </motion.div>

      {/* Categorize dialog */}
      <Dialog open={showCategorizeDialog} onOpenChange={setShowCategorizeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Categorize Selected Items</DialogTitle>
            <DialogDescription>Choose a category to apply to all {selectedCount} selected items.</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="category">Category</Label>
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as ContentCategory)}>
              <SelectTrigger id="category" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inspiration">Inspiration</SelectItem>
                <SelectItem value="competitor">Competitor</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="evergreen">Evergreen</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategorizeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCategorize} className="bg-neutral-900 text-neutral-50 hover:bg-neutral-800">
              Apply Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add tags dialog */}
      <Dialog open={showTagsDialog} onOpenChange={setShowTagsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tags to Selected Items</DialogTitle>
            <DialogDescription>Add tags to all {selectedCount} selected items.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Enter tag..."
                />
                <Button type="button" onClick={addTag} variant="outline" size="sm">
                  Add
                </Button>
              </div>
            </div>

            {/* Tags to add */}
            {tagsToAdd.length > 0 && (
              <div>
                <Label>Tags to add:</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tagsToAdd.map((tag) => (
                    <Badge key={tag} variant="outline" className="py-1 pr-1 pl-2">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 rounded-full p-0.5 transition-colors hover:bg-neutral-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTagsDialog(false);
                setTagsToAdd([]);
                setTagInput("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTags}
              disabled={tagsToAdd.length === 0}
              className="bg-neutral-900 text-neutral-50 hover:bg-neutral-800"
            >
              Add Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
