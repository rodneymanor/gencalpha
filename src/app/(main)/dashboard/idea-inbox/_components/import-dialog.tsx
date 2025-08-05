import React from "react";

import { Import, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  importSource: string;
  onImportSourceChange: (source: string) => void;
  importUrl: string;
  onImportUrlChange: (url: string) => void;
  manualTitle: string;
  onManualTitleChange: (title: string) => void;
  manualContent: string;
  onManualContentChange: (content: string) => void;
  onImportFromUrl: () => void;
  onCreateManualIdea: () => void;
}

export function ImportDialog({
  isOpen,
  onOpenChange,
  importSource,
  onImportSourceChange,
  importUrl,
  onImportUrlChange,
  manualTitle,
  onManualTitleChange,
  manualContent,
  onManualContentChange,
  onImportFromUrl,
  onCreateManualIdea,
}: ImportDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Idea</DialogTitle>
          <DialogDescription>
            Import content from social media or create a manual note for your idea inbox
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* Import from URL */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Import from URL</h3>
            <div className="grid grid-cols-2 gap-4">
              <Select value={importSource} onValueChange={onImportSourceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="blog">Blog Post</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Paste URL here..."
                value={importUrl}
                onChange={(e) => onImportUrlChange(e.target.value)}
              />
            </div>
            <Button onClick={onImportFromUrl} disabled={!importSource || !importUrl.trim()} className="w-full gap-2">
              <Import className="h-4 w-4" />
              Import Content
            </Button>
          </div>

          <div className="border-t pt-8">
            <h3 className="mb-4 text-lg font-semibold">Create Manual Note</h3>
            <div className="space-y-4">
              <Input
                placeholder="Note title (optional)"
                value={manualTitle}
                onChange={(e) => onManualTitleChange(e.target.value)}
              />
              <Textarea
                placeholder="Write your idea or paste content here..."
                value={manualContent}
                onChange={(e) => onManualContentChange(e.target.value)}
                rows={6}
              />
              <Button onClick={onCreateManualIdea} disabled={!manualContent.trim()} className="w-full gap-2">
                <FileText className="h-4 w-4" />
                Create Note
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
