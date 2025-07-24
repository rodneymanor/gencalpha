"use client";

import React, { useState, useEffect } from "react";

import { Plus, Search, Import, Mic, MicOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { IdeaDetailDialog } from "./_components/idea-detail-dialog";
import { IdeaTable } from "./_components/idea-table";
import { ImportDialog } from "./_components/import-dialog";
import type { Idea } from "./_components/types";

export default function IdeaInboxPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Import/Creation states
  const [importSource, setImportSource] = useState<string>("");
  const [importUrl, setImportUrl] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualContent, setManualContent] = useState("");

  // Load ideas from localStorage on mount
  useEffect(() => {
    const savedIdeas = localStorage.getItem("idea-inbox-ideas");
    if (savedIdeas) {
      const parsedIdeas = JSON.parse(savedIdeas);
      setIdeas(parsedIdeas);
      setFilteredIdeas(parsedIdeas);
    }
  }, []);

  // Filter ideas based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = ideas.filter(
        (idea) =>
          idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          idea.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          idea.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      );
      setFilteredIdeas(filtered);
    } else {
      setFilteredIdeas(ideas);
    }
  }, [ideas, searchQuery]);

  const generateExcerpt = (content: string): string => {
    return content.replace(/\n/g, " ").substring(0, 150).trim() + (content.length > 150 ? "..." : "");
  };

  const getWordCount = (content: string): number => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  };

  const saveIdeas = (updatedIdeas: Idea[]) => {
    localStorage.setItem("idea-inbox-ideas", JSON.stringify(updatedIdeas));
    setIdeas(updatedIdeas);
  };

  const handleViewIdea = (idea: Idea) => {
    setSelectedIdea(idea);
    setIsDetailOpen(true);
  };

  const handleImportFromUrl = () => {
    if (!importUrl.trim() || !importSource) return;

    const mockContent = `This is imported content from ${importSource}. In a real implementation, this would be the actual content extracted from the ${importSource} URL: ${importUrl}

The content would be processed and cleaned up for easier reading and conversion to scripts.`;

    const newIdea: Idea = {
      id: `idea-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: `Imported from ${importSource.charAt(0).toUpperCase() + importSource.slice(1)}`,
      content: mockContent,
      source: importSource as Idea["source"],
      sourceUrl: importUrl,
      excerpt: generateExcerpt(mockContent),
      createdAt: new Date().toISOString(),
      wordCount: getWordCount(mockContent),
      tags: [importSource],
    };

    saveIdeas([newIdea, ...ideas]);
    setImportUrl("");
    setImportSource("");
    setIsImportOpen(false);
  };

  const handleCreateManualIdea = () => {
    if (!manualContent.trim()) return;

    const title = manualTitle.trim() || manualContent.split("\n")[0].substring(0, 50).trim() || "Manual Note";

    const newIdea: Idea = {
      id: `idea-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      content: manualContent,
      source: "manual",
      excerpt: generateExcerpt(manualContent),
      createdAt: new Date().toISOString(),
      wordCount: getWordCount(manualContent),
      tags: ["manual"],
    };

    saveIdeas([newIdea, ...ideas]);
    setManualTitle("");
    setManualContent("");
    setIsImportOpen(false);
  };

  const handleVoiceRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleGenerateHooks = () => {
    if (!selectedIdea) return;

    const params = new URLSearchParams({
      ideaId: selectedIdea.id,
      content: selectedIdea.content,
      title: selectedIdea.title,
    });

    window.open(`/dashboard/hooks-generator?${params.toString()}`, "_blank");
    setIsDetailOpen(false);
  };

  const handleConvertToScript = () => {
    if (!selectedIdea) return;

    const params = new URLSearchParams({
      ideaId: selectedIdea.id,
      content: selectedIdea.content,
      title: selectedIdea.title,
      mode: "convert",
    });

    window.location.href = `/dashboard/script-editor?${params.toString()}`;
  };

  return (
    <div className="container mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 p-3">
            <Import className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Idea Inbox</h1>
            <p className="text-muted-foreground">Import and manage content ideas from multiple sources</p>
          </div>
        </div>

        {/* Actions and Search */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search ideas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10"
              />
            </div>
            <div className="text-muted-foreground text-sm">
              {filteredIdeas.length} {filteredIdeas.length === 1 ? "idea" : "ideas"}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleVoiceRecording} className="gap-2">
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isRecording ? "Stop Recording" : "Voice Note"}
            </Button>
            <Button onClick={() => setIsImportOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Idea
            </Button>
          </div>
        </div>
      </div>

      {/* Ideas Table */}
      {filteredIdeas.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Import className="h-5 w-5" />
              Content Ideas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <IdeaTable ideas={filteredIdeas} onViewIdea={handleViewIdea} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Import className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">{searchQuery ? "No ideas found" : "No ideas yet"}</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try adjusting your search terms to find what you're looking for."
                : "Start importing content from Instagram, TikTok, YouTube, blogs, or create manual notes."}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsImportOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Import Your First Idea
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <ImportDialog
        isOpen={isImportOpen}
        onOpenChange={setIsImportOpen}
        importSource={importSource}
        onImportSourceChange={setImportSource}
        importUrl={importUrl}
        onImportUrlChange={setImportUrl}
        manualTitle={manualTitle}
        onManualTitleChange={setManualTitle}
        manualContent={manualContent}
        onManualContentChange={setManualContent}
        onImportFromUrl={handleImportFromUrl}
        onCreateManualIdea={handleCreateManualIdea}
      />

      <IdeaDetailDialog
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        idea={selectedIdea}
        onGenerateHooks={handleGenerateHooks}
        onConvertToScript={handleConvertToScript}
      />
    </div>
  );
}
