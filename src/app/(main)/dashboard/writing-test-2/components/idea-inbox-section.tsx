"use client";

import { useEffect, useState } from "react";

import { Plus, X, Search, Edit3, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { clientNotesService, type Note } from "@/lib/services/client-notes-service";

interface IdeaInboxSectionProps {
  onClose?: () => void;
}

export function IdeaInboxSection({ onClose }: IdeaInboxSectionProps) {
  const [ideas, setIdeas] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newIdeaContent, setNewIdeaContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      setLoading(true);
      const response = await clientNotesService.getIdeaInboxNotes();
      setIdeas(response.notes || []);
    } catch (error) {
      console.error("Failed to load ideas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIdea = async () => {
    if (!newIdeaContent.trim()) return;

    try {
      const firstLine = newIdeaContent.split("\n")[0]?.trim() ?? "Untitled";
      const title = firstLine.length > 60 ? firstLine.slice(0, 60) + "…" : firstLine || "Untitled";

      await clientNotesService.createNote({
        title,
        content: newIdeaContent.trim(),
        type: "idea_inbox",
        source: "manual",
        starred: false,
      });

      setNewIdeaContent("");
      setIsAdding(false);
      await loadIdeas();
    } catch (error) {
      console.error("Failed to add idea:", error);
    }
  };

  const handleDeleteIdea = async (id: string) => {
    try {
      await clientNotesService.deleteNote(id);
      await loadIdeas();
    } catch (error) {
      console.error("Failed to delete idea:", error);
    }
  };

  const handleStartEdit = (idea: Note) => {
    setEditingId(idea.id);
    setEditContent(idea.content || "");
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editContent.trim()) return;

    try {
      const firstLine = editContent.split("\n")[0]?.trim() ?? "Untitled";
      const title = firstLine.length > 60 ? firstLine.slice(0, 60) + "…" : firstLine || "Untitled";

      await clientNotesService.updateNote(editingId, {
        title,
        content: editContent.trim(),
      });

      setEditingId(null);
      setEditContent("");
      await loadIdeas();
    } catch (error) {
      console.error("Failed to update idea:", error);
    }
  };

  const filteredIdeas = ideas.filter(
    (idea) =>
      idea.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.content?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-border bg-background flex items-center justify-between border-b p-4">
        <div>
          <h2 className="text-foreground text-lg font-semibold">Idea Inbox</h2>
          <p className="text-muted-foreground text-sm">Capture and organize your content ideas</p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search and Add */}
      <div className="border-border border-b p-4">
        <div className="mb-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => setIsAdding(true)} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Idea
          </Button>
        </div>

        {/* New Idea Form */}
        {isAdding && (
          <Card className="p-3">
            <Textarea
              placeholder="Write your idea here..."
              value={newIdeaContent}
              onChange={(e) => setNewIdeaContent(e.target.value)}
              className="mb-3 min-h-[80px] resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <Button onClick={handleAddIdea} size="sm" disabled={!newIdeaContent.trim()}>
                Save
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)} size="sm">
                Cancel
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Ideas Grid */}
      <ScrollArea className="flex-1">
        <div className="grid gap-3 p-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {loading ? (
            <div className="text-muted-foreground col-span-full flex items-center justify-center py-8">
              Loading ideas...
            </div>
          ) : filteredIdeas.length === 0 ? (
            <div className="text-muted-foreground col-span-full flex flex-col items-center justify-center py-8">
              {searchQuery ? (
                <>
                  <Search className="mb-2 h-8 w-8 opacity-50" />
                  <p>No ideas match your search</p>
                </>
              ) : (
                <>
                  <Plus className="mb-2 h-8 w-8 opacity-50" />
                  <p>No ideas yet</p>
                  <p className="text-sm">Add your first idea to get started</p>
                </>
              )}
            </div>
          ) : (
            filteredIdeas.map((idea) => (
              <Card key={idea.id} className="group p-3 transition-shadow hover:shadow-md">
                {editingId === idea.id ? (
                  <div>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="mb-3 min-h-[80px] resize-none"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit} size="sm" disabled={!editContent.trim()}>
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setEditingId(null)} size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="text-foreground line-clamp-2 font-medium">{idea.title || "Untitled"}</h3>
                      <div className="ml-2 flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleStartEdit(idea)}>
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-destructive h-6 w-6"
                          onClick={() => handleDeleteIdea(idea.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-muted-foreground line-clamp-3 text-sm whitespace-pre-wrap">{idea.content}</p>
                    {idea.createdAt && (
                      <p className="text-muted-foreground mt-2 text-xs">
                        {new Date(idea.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
