"use client";

import React, { useEffect, useState } from "react";

import { Plus, Search, Import, Mic, MicOff } from "lucide-react";

import { IdeaDetailDialog } from "@/app/(main)/dashboard/idea-inbox/_components/idea-detail-dialog";
import { IdeaTable } from "@/app/(main)/dashboard/idea-inbox/_components/idea-table";
import { ImportDialog } from "@/app/(main)/dashboard/idea-inbox/_components/import-dialog";
import { mapNotesToIdeas } from "@/app/(main)/dashboard/idea-inbox/_components/note-mapper";
import type { Idea, DatabaseNote } from "@/app/(main)/dashboard/idea-inbox/_components/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/firebase";
import { clientNotesService } from "@/lib/services/client-notes-service";

export function DailyIdeaInboxSection() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Import/Creation states
  const [importSource, setImportSource] = useState<string>("");
  const [importUrl, setImportUrl] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualContent, setManualContent] = useState("");

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
      if (user) {
        loadIdeasFromDatabase();
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadIdeasFromDatabase = async () => {
    try {
      setIsLoading(true);
      // Align with Idea Inbox page behavior: fetch notes with optional limit
      const response = await clientNotesService.getNotes({ limit: 100 });
      const mapped = mapNotesToIdeas(response.notes as DatabaseNote[]);
      setIdeas(mapped);
      setFilteredIdeas(mapped);
    } catch (error) {
      console.error("⚠️ Failed to load ideas", error);
      setIdeas([]);
      setFilteredIdeas([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery) {
      setFilteredIdeas(ideas);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredIdeas(
        ideas.filter(
          (idea) => idea.title.toLowerCase().includes(query) || idea.description.toLowerCase().includes(query),
        ),
      );
    }
  }, [searchQuery, ideas]);

  const handleViewIdea = (idea: Idea) => {
    setSelectedIdea(idea);
    setIsDetailOpen(true);
  };

  const handleImportFromUrl = async () => {
    await clientNotesService.importFromUrl(importUrl, importSource);
    setIsImportOpen(false);
    loadIdeasFromDatabase();
  };

  const handleCreateManualIdea = async () => {
    await clientNotesService.createManualIdea({ title: manualTitle, content: manualContent });
    setIsImportOpen(false);
    setManualTitle("");
    setManualContent("");
    loadIdeasFromDatabase();
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ideas..."
              className="pl-9"
            />
          </div>

          <Button variant="ghost" className="gap-2" onClick={() => setIsRecording((s) => !s)}>
            {isRecording ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            {isRecording ? "Stop" : "Dictate"}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button className="gap-2" onClick={() => setIsImportOpen(true)}>
            <Import className="size-4" /> Import
          </Button>
          <Button variant="secondary" className="gap-2" onClick={() => setIsDetailOpen(true)}>
            <Plus className="size-4" /> New idea
          </Button>
        </div>
      </div>

      {/* Ideas Table / Empty state */}
      {filteredIdeas.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Import className="size-5" /> Content Ideas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <IdeaTable ideas={filteredIdeas} onViewIdea={handleViewIdea} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Import className="text-muted-foreground mx-auto mb-4 size-12" />
            <h3 className="mb-2 text-lg font-medium">{searchQuery ? "No ideas found" : "No ideas yet"}</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try adjusting your search terms to find what you're looking for."
                : "Start importing content from Instagram, TikTok, YouTube, blogs, or create manual notes."}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsImportOpen(true)} className="gap-2">
                <Plus className="size-4" /> Import Your First Idea
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

      <IdeaDetailDialog isOpen={isDetailOpen} onOpenChange={setIsDetailOpen} idea={selectedIdea} />
    </div>
  );
}

export default DailyIdeaInboxSection;
