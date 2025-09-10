"use client";

import React, { useState } from "react";

import { FileText, Save, FolderOpen, Download, Undo, Redo, ChevronDown, Sparkles, Wand2, Settings, Share, Eye, EyeOff, Code, Quote, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface EnhancedToolbarProps {
  // File operations
  onNew?: () => void;
  onOpen?: () => void;
  onSave?: () => void;
  onSaveAs?: () => void;
  onExport?: () => void;

  // Edit operations
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;

  // Formatting
  onBold?: () => void;
  onUnderline?: () => void;
  onStrikethrough?: () => void;

  // AI Actions
  onSimplify?: () => void;
  onHumanize?: () => void;
  onShorten?: () => void;
  onExpand?: () => void;
  onChangeTone?: (tone: string) => void;
  onGenerateIdeas?: () => void;
  onCheckGrammar?: () => void;
  onTranslate?: () => void; // kept for compatibility, not rendered

  // View options
  onTogglePreview?: () => void;
  isPreviewMode?: boolean;
  onToggleFocus?: () => void;
  isFocusMode?: boolean;

  // Other actions
  onShare?: () => void;
  onSettings?: () => void;

  // State
  isSaving?: boolean;
  disabled?: boolean;
  className?: string;
}

const toneOptions = [
  { value: "professional", label: "Professional", description: "Formal business tone" },
  { value: "casual", label: "Casual", description: "Relaxed informal tone" },
  { value: "friendly", label: "Friendly", description: "Warm approachable tone" },
  { value: "confident", label: "Confident", description: "Assertive self-assured tone" },
  { value: "persuasive", label: "Persuasive", description: "Compelling convincing tone" },
  { value: "conversational", label: "Conversational", description: "Natural dialogue style" },
];

export function EnhancedToolbar({
  // File operations
  onNew,
  onOpen,
  onSave,
  onSaveAs,
  onExport,

  // Edit operations
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,

  // Formatting
  onBold,
  onUnderline,
  onStrikethrough,

  // AI Actions
  onSimplify,
  onHumanize,
  onShorten,
  onExpand,
  onChangeTone,
  onGenerateIdeas,
  onCheckGrammar,
  onTranslate,

  // View options
  onTogglePreview,
  isPreviewMode = false,
  onToggleFocus: _onToggleFocus,
  isFocusMode: _isFocusMode = false,

  // Other actions
  onShare,
  onSettings: _onSettings,

  // State
  isSaving = false,
  disabled = false,
  className,
}: EnhancedToolbarProps) {
  const [_isVisible, _setIsVisible] = useState(true);

  return (
    <div
      className={cn(
        "sticky top-0 z-40 border-b bg-white",
        "shadow-sm transition-all duration-200",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      style={{ borderColor: "#E5E8EB" }}
    >
      <div className="mx-auto max-w-7xl px-6 py-2">
        <div className="flex items-center justify-center gap-1">
          {/* File Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-[var(--radius-button)] text-[#475569] hover:bg-[#F9FAFB] hover:text-[#191B1F]"
              >
                File
                <ChevronDown className="ml-1 h-3 w-3 font-semibold" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={onNew}>
                <FileText className="mr-2 h-4 w-4 font-semibold" />
                New Document
                <span className="ml-auto text-xs text-[#64748B]">⌘N</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpen}>
                <FolderOpen className="mr-2 h-4 w-4 font-semibold" />
                Open
                <span className="ml-auto text-xs text-[#64748B]">⌘O</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSave}>
                <Save className="mr-2 h-4 w-4 font-semibold" />
                Save
                <span className="ml-auto text-xs text-[#64748B]">⌘S</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSaveAs}>
                <Save className="mr-2 h-4 w-4 font-semibold" />
                Save As...
                <span className="ml-auto text-xs text-[#64748B]">⌘⇧S</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onExport}>
                <Download className="mr-2 h-4 w-4 font-semibold" />
                Export
                <span className="ml-auto text-xs text-[#64748B]">⌘E</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="mx-2 h-6" />

          {/* Simplify Button */}
          <Button
            variant="default"
            size="sm"
            onClick={onSimplify}
            className="bg-primary text-primary-foreground hover:bg-primary/90 border-primary hover:border-primary/90 rounded-[var(--radius-button)] font-medium"
          >
            <Wand2 className="mr-1 h-4 w-4 font-semibold" />
            Simplify
          </Button>

          <Separator orientation="vertical" className="mx-2 h-6" />

          {/* AI Tools Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:bg-primary/10 hover:text-primary rounded-[var(--radius-button)] font-medium"
              >
                <Sparkles className="mr-1 h-4 w-4 font-semibold" />
                AI tools
                <ChevronDown className="ml-1 h-3 w-3 font-semibold" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={onHumanize}>
                <Wand2 className="mr-2 h-4 w-4 font-semibold" />
                Humanize
                <span className="ml-auto text-xs text-[#64748B]">Make natural</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onShorten}>
                <Code className="mr-2 h-4 w-4 font-semibold" />
                Shorten
                <span className="ml-auto text-xs text-[#64748B]">Condense text</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExpand}>
                <Quote className="mr-2 h-4 w-4 font-semibold" />
                Expand
                <span className="ml-auto text-xs text-[#64748B]">Add details</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {/* Change Tone Submenu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4 font-semibold" />
                    Change Tone
                    <ChevronDown className="ml-auto h-3 w-3 font-semibold" />
                  </DropdownMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-48">
                  {toneOptions.map((tone) => (
                    <DropdownMenuItem key={tone.value} onClick={() => onChangeTone?.(tone.value)}>
                      <div className="flex flex-col">
                        <span className="font-medium">{tone.label}</span>
                        <span className="text-xs text-[#64748B]">{tone.description}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onGenerateIdeas}>
                <Sparkles className="mr-2 h-4 w-4 font-semibold" />
                Generate Ideas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCheckGrammar}>
                <Search className="mr-2 h-4 w-4 font-semibold" />
                Check Grammar
              </DropdownMenuItem>
              {/* Translate option removed as requested */}
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="mx-2 h-6" />

          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="rounded-[var(--radius-button)] text-[#475569] hover:bg-[#F9FAFB] hover:text-[#191B1F] disabled:opacity-40"
            >
              <Undo className="h-4 w-4 font-semibold" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="rounded-[var(--radius-button)] text-[#475569] hover:bg-[#F9FAFB] hover:text-[#191B1F] disabled:opacity-40"
            >
              <Redo className="h-4 w-4 font-semibold" />
            </Button>
          </div>

          {/* Text formatting removed per product direction */}

          <Separator orientation="vertical" className="mx-2 h-6" />

          {/* View Options */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onTogglePreview}
              className="rounded-[var(--radius-button)] text-[#475569] hover:bg-[#F9FAFB] hover:text-[#191B1F]"
            >
              {isPreviewMode ? <EyeOff className="h-4 w-4 font-semibold" /> : <Eye className="h-4 w-4 font-semibold" />}
            </Button>
          </div>

          <Separator orientation="vertical" className="mx-2 h-6" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onShare}
              className="rounded-[var(--radius-button)] text-[#475569] hover:bg-[#F9FAFB] hover:text-[#191B1F]"
            >
              <Share className="h-4 w-4 font-semibold" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              className="rounded-[var(--radius-button)] border-neutral-200 bg-neutral-100 font-medium text-neutral-900 hover:border-neutral-300 hover:bg-neutral-200"
            >
              <Save className="mr-1 h-4 w-4 font-semibold" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
