"use client";

import { useEffect, useState, useCallback } from "react";

import { Plus, Search } from "lucide-react";

import { IdeaDetailDialog } from "@/app/(main)/dashboard/idea-inbox/_components/idea-detail-dialog";
import { mapNotesToIdeas } from "@/app/(main)/dashboard/idea-inbox/_components/note-mapper";
import type { Idea, DatabaseNote } from "@/app/(main)/dashboard/idea-inbox/_components/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/firebase";
import { clientNotesService } from "@/lib/services/client-notes-service";

export default function IdeasIdeaInboxPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
    if (!searchQuery.trim()) {
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

  const handleNewNote = () => {
    setSelectedIdea(null);
    setIsDetailOpen(true);
  };

  const handleNoteClick = useCallback((idea: Idea) => {
    setSelectedIdea(idea);
    setIsDetailOpen(true);
  }, []);

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInDays === 1) {
      return "1 day ago";
    } else if (diffInDays < 30) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="bg-background min-h-screen font-sans">
      <div className="px-6 pt-6 pb-8">
        {/* Header Section */}
        <div className="mb-6 flex items-start justify-between">
          <h1 className="text-foreground text-2xl font-semibold md:text-3xl">Your idea inbox</h1>
          <Button onClick={handleNewNote} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New note
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search your notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-[var(--radius-input)] pl-10"
            />
          </div>
        </div>

        {/* Subheading */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            You have {filteredIdeas.length} note{filteredIdeas.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Notes List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-muted-foreground py-12 text-center">Loading your notes...</div>
          ) : filteredIdeas.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-muted-foreground mb-4">
                {searchQuery ? "No notes found matching your search." : "No notes yet. Create your first note!"}
              </div>
              {!searchQuery && (
                <Button onClick={handleNewNote} variant="secondary" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create your first note
                </Button>
              )}
            </div>
          ) : (
            filteredIdeas.map((idea) => (
              <div
                key={idea.id}
                onClick={() => handleNoteClick(idea)}
                className="bg-card border-border hover:bg-accent cursor-pointer rounded-[var(--radius-card)] border p-4 transition-colors"
              >
                <div className="flex flex-col space-y-2">
                  <h3 className="text-foreground text-base font-semibold">{idea.title || "Untitled"}</h3>
                  {idea.description && (
                    <p className="text-muted-foreground line-clamp-2 text-sm">
                      {idea.description.length > 150 ? `${idea.description.substring(0, 150)}...` : idea.description}
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    Last edited {formatTimeAgo(idea.updatedAt || idea.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dialog */}
      <IdeaDetailDialog isOpen={isDetailOpen} onOpenChange={setIsDetailOpen} idea={selectedIdea} />
    </div>
  );
}
