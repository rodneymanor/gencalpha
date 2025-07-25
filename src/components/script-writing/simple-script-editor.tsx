"use client";

import { PanelRight, Sparkles, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useSimpleScript } from "@/contexts/simple-script-context";
import { cn } from "@/lib/utils";

import { SimpleScriptPanel } from "./simple-script-panel";

interface SimpleScriptEditorProps {
  initialValue?: string;
  onSave?: (content: string) => void;
  className?: string;
}

export function SimpleScriptEditor({ initialValue = "", onSave, className }: SimpleScriptEditorProps) {
  const { isPanelOpen, openPanel, editorContent, setEditorContent, scriptComponents } = useSimpleScript();

  // Initialize editor content
  if (initialValue && !editorContent) {
    setEditorContent(initialValue);
  }

  const handleSave = () => {
    if (onSave) {
      onSave(editorContent);
    }
  };

  const wordCount = editorContent.trim() ? editorContent.trim().split(/\s+/).length : 0;

  return (
    <div className={cn("flex h-full", className)}>
      <div className={cn("flex flex-1 flex-col", isPanelOpen && "mr-96")}>
        {/* Header */}
        <div className="bg-background/95 sticky top-0 z-40 border-b backdrop-blur">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="text-primary h-5 w-5" />
                <h1 className="font-semibold">Script Editor</h1>
              </div>
              <div className="text-muted-foreground text-sm">{wordCount} words</div>
              {scriptComponents.length > 0 && (
                <div className="text-muted-foreground text-sm">
                  {scriptComponents.length} component{scriptComponents.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onSave && (
                <Button size="sm" onClick={handleSave} disabled={!editorContent.trim()}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              )}
              <Button variant={isPanelOpen ? "default" : "outline"} size="sm" onClick={openPanel}>
                <PanelRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 p-4">
          <Card className="h-full">
            <div className="h-full p-6">
              <Textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                placeholder="Start writing your script here... Use the side panel to generate content and add components."
                className="h-full resize-none border-none text-base shadow-none focus-visible:ring-0"
              />
            </div>
          </Card>
        </div>
      </div>

      <SimpleScriptPanel />
    </div>
  );
}
