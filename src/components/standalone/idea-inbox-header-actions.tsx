"use client";

import { useState } from "react";

import { Lightbulb, PenTool, Share, Star, Archive, Trash2, Copy, BookOpen, Zap } from "lucide-react";

import { CreateNoteDialog } from "@/components/standalone/create-note-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface IdeaInboxHeaderActionsProps {
  onNoteCreated?: () => void;
}

export function IdeaInboxHeaderActions({ onNoteCreated }: IdeaInboxHeaderActionsProps = {}) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Handle idea actions
  const handleGenerateScript = () => {
    console.log("Generate script from idea");
    // TODO: Implement script generation
  };

  const handleGenerateHooks = () => {
    console.log("Generate hooks from idea");
    // TODO: Implement hook generation
  };

  const handleSaveAsDraft = () => {
    console.log("Save idea as draft");
    // TODO: Implement save as draft
  };

  const handleArchiveIdea = () => {
    console.log("Archive idea");
    // TODO: Implement archive functionality
  };

  const handleDeleteIdea = () => {
    console.log("Delete idea");
    // TODO: Implement delete functionality
  };

  const handleCopyIdea = () => {
    console.log("Copy idea to clipboard");
    // TODO: Implement copy functionality
  };

  const handleShareIdea = () => {
    console.log("Share idea");
    // TODO: Implement share functionality
  };

  const handleCreateNewIdea = () => {
    setIsCreateDialogOpen(true);
  };

  const handleNoteCreated = () => {
    onNoteCreated?.();
  };

  return (
    <>
      {/* Quick Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5 rounded-[var(--radius-button)] px-3">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleGenerateScript}>
            <PenTool className="mr-2 h-4 w-4" />
            Generate Script
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleGenerateHooks}>
            <BookOpen className="mr-2 h-4 w-4" />
            Generate Hooks
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSaveAsDraft}>
            <Star className="mr-2 h-4 w-4" />
            Save as Draft
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyIdea}>
            <Copy className="mr-2 h-4 w-4" />
            Copy to Clipboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShareIdea}>
            <Share className="mr-2 h-4 w-4" />
            Share Idea
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleArchiveIdea}>
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDeleteIdea} className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* New Idea Button */}
      <Button
        variant="default"
        size="sm"
        className="gap-1.5 rounded-[var(--radius-button)] px-3"
        onClick={handleCreateNewIdea}
      >
        <Lightbulb className="h-4 w-4" />
        <span className="hidden sm:inline">New</span>
      </Button>

      {/* Create Note Dialog */}
      <CreateNoteDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onNoteCreated={handleNoteCreated}
      />
    </>
  );
}
