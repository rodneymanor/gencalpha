"use client";

import React, { useState } from "react";

import { Plus, FolderPlus, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";

import type { PageProperty } from "@/components/panels/notion/NotionPanelProperties";
import NotionPanelWrapper from "@/components/panels/notion/NotionPanelWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { CollectionsService, COLLECTION_LIMITS } from "@/lib/collections";

interface CollectionManagementPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCollectionCreated?: (collectionId: string) => void;
}

export function CollectionManagementPanel({ isOpen, onClose, onCollectionCreated }: CollectionManagementPanelProps) {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  // Panel state
  const [panelWidth, setPanelWidth] = useState(600);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Validation
  const validateTitle = (value: string): string => {
    if (!value.trim()) return "Collection title is required";
    if (value.length > COLLECTION_LIMITS.MAX_TITLE_LENGTH) {
      return `Title must be ${COLLECTION_LIMITS.MAX_TITLE_LENGTH} characters or less`;
    }
    return "";
  };

  const validateDescription = (value: string): string => {
    if (value.length > COLLECTION_LIMITS.MAX_DESCRIPTION_LENGTH) {
      return `Description must be ${COLLECTION_LIMITS.MAX_DESCRIPTION_LENGTH} characters or less`;
    }
    return "";
  };

  // Handle form submission
  const handleCreateCollection = async () => {
    if (!user?.uid) {
      toast.error("You must be logged in to create a collection");
      return;
    }

    // Validate form
    const titleErr = validateTitle(title);
    const descErr = validateDescription(description);

    setTitleError(titleErr);
    setDescriptionError(descErr);

    if (titleErr || descErr) {
      return;
    }

    setIsCreating(true);

    try {
      const collectionId = await CollectionsService.createCollection(user.uid, title.trim(), description.trim());

      toast.success("Collection created successfully");

      // Reset form
      setTitle("");
      setDescription("");
      setTitleError("");
      setDescriptionError("");

      // Callback for parent component
      onCollectionCreated?.(collectionId);

      // Close panel
      onClose();
    } catch (error) {
      console.error("Failed to create collection:", error);
      toast.error("Failed to create collection. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  // Handle input changes with validation
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (titleError) setTitleError(validateTitle(value));
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    if (descriptionError) setDescriptionError(validateDescription(value));
  };

  // Panel properties
  const properties: PageProperty[] = [
    {
      id: "status",
      type: "status" as const,
      name: "Status",
      value: isCreating ? { label: "Creating...", color: "warning" } : { label: "Draft", color: "default" },
      icon: "burst",
    },
  ];

  // Handle panel close
  const handleClose = () => {
    if (isCreating) return; // Prevent closing while creating

    // Reset form state
    setTitle("");
    setDescription("");
    setTitleError("");
    setDescriptionError("");

    onClose();
  };

  return (
    <NotionPanelWrapper
      isOpen={isOpen}
      isFullScreen={isFullScreen}
      onClose={handleClose}
      onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
      title={title || "New Collection"}
      onTitleChange={handleTitleChange}
      properties={properties}
      width={panelWidth}
      onWidthChange={setPanelWidth}
      minWidth={500}
      maxWidth={800}
      isNewIdea={true}
      placeholder="Enter collection details..."
      showHeaderControls={true}
      footer={
        <div className="flex items-center justify-between border-t border-neutral-200 bg-white px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <FolderPlus className="h-4 w-4" />
            <span>Creating a new collection</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button
              variant="soft"
              size="sm"
              onClick={handleCreateCollection}
              disabled={isCreating || !title.trim()}
              className="gap-2"
            >
              {isCreating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Collection
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      {/* Form Content */}
      <div className="space-y-6 p-6">
        {/* Collection Title */}
        <div className="space-y-2">
          <Label htmlFor="collection-title" className="text-sm font-medium">
            Collection Title *
          </Label>
          <div className="space-y-1">
            <Input
              id="collection-title"
              placeholder="Enter collection title..."
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className={`${titleError ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""}`}
              disabled={isCreating}
              maxLength={COLLECTION_LIMITS.MAX_TITLE_LENGTH}
            />
            <div className="flex items-center justify-between">
              {titleError ? (
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {titleError}
                </div>
              ) : (
                <div className="text-xs text-neutral-400">Give your collection a descriptive name</div>
              )}
              <div className="text-xs text-neutral-400">
                {title.length}/{COLLECTION_LIMITS.MAX_TITLE_LENGTH}
              </div>
            </div>
          </div>
        </div>

        {/* Collection Description */}
        <div className="space-y-2">
          <Label htmlFor="collection-description" className="text-sm font-medium">
            Description (Optional)
          </Label>
          <div className="space-y-1">
            <Textarea
              id="collection-description"
              placeholder="Add a description to help organize your content..."
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              className={`min-h-[80px] resize-none ${descriptionError ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""}`}
              disabled={isCreating}
              maxLength={COLLECTION_LIMITS.MAX_DESCRIPTION_LENGTH}
            />
            <div className="flex items-center justify-between">
              {descriptionError ? (
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {descriptionError}
                </div>
              ) : (
                <div className="text-xs text-neutral-400">
                  Describe what type of content this collection will contain
                </div>
              )}
              <div className="text-xs text-neutral-400">
                {description.length}/{COLLECTION_LIMITS.MAX_DESCRIPTION_LENGTH}
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        {title.trim() && (
          <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Check className="text-success-600 h-4 w-4" />
              <span className="text-sm font-medium text-neutral-900">Preview</span>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-neutral-900">{title.trim()}</h4>
              {description.trim() && <p className="text-sm text-neutral-600">{description.trim()}</p>}
              <div className="text-xs text-neutral-400">0 videos • Created just now</div>
            </div>
          </div>
        )}
      </div>
    </NotionPanelWrapper>
  );
}
