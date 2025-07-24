"use client";

import React, { useState, useEffect } from "react";

import { Plus, Search, Calendar, Edit, Trash2, BookOpen, Filter } from "lucide-react";

import { HemingwayEditor } from "@/components/editor/hemingway-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Note {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  tags: string[];
}

export default function IdeaInboxPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [editorTitle, setEditorTitle] = useState("");

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("idea-inbox-notes");
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes);
      setNotes(parsedNotes);
      setFilteredNotes(parsedNotes);
    }
  }, []);

  // Filter notes based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = notes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      );
      setFilteredNotes(filtered);
    } else {
      setFilteredNotes(notes);
    }
  }, [notes, searchQuery]);

  // Save notes to localStorage whenever notes change
  const saveNotes = (updatedNotes: Note[]) => {
    localStorage.setItem("idea-inbox-notes", JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const generateExcerpt = (content: string): string => {
    return content.replace(/\n/g, " ").substring(0, 120).trim() + (content.length > 120 ? "..." : "");
  };

  const getWordCount = (content: string): number => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  };

  const handleNewNote = () => {
    setCurrentNote(null);
    setEditorContent("");
    setEditorTitle("");
    setIsEditorOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setCurrentNote(note);
    setEditorContent(note.content);
    setEditorTitle(note.title);
    setIsEditorOpen(true);
  };

  const handleSaveNote = () => {
    if (!editorContent.trim()) return;

    const now = new Date().toISOString();
    const wordCount = getWordCount(editorContent);
    const excerpt = generateExcerpt(editorContent);
    const title = editorTitle.trim() || editorContent.split("\n")[0].substring(0, 50).trim() || "Untitled Note";

    if (currentNote) {
      // Update existing note
      const updatedNotes = notes.map((note) =>
        note.id === currentNote.id
          ? {
              ...note,
              title,
              content: editorContent,
              excerpt,
              updatedAt: now,
              wordCount,
            }
          : note,
      );
      saveNotes(updatedNotes);
    } else {
      // Create new note
      const newNote: Note = {
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        content: editorContent,
        excerpt,
        createdAt: now,
        updatedAt: now,
        wordCount,
        tags: [],
      };
      saveNotes([newNote, ...notes]);
    }

    setIsEditorOpen(false);
    setCurrentNote(null);
    setEditorContent("");
    setEditorTitle("");
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId);
    saveNotes(updatedNotes);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 p-3">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Idea Inbox</h1>
            <p className="text-muted-foreground">Capture and organize your thoughts with the Hemingway editor</p>
          </div>
        </div>

        {/* Actions and Search */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10"
              />
            </div>
            <div className="text-muted-foreground text-sm">
              {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
            </div>
          </div>

          <Button onClick={handleNewNote} className="gap-2">
            <Plus className="h-4 w-4" />
            New Note
          </Button>
        </div>
      </div>

      {/* Notes Table */}
      {filteredNotes.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Your Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Excerpt</TableHead>
                  <TableHead>Words</TableHead>
                  <TableHead>Modified</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotes.map((note) => (
                  <TableRow key={note.id} className="hover:bg-muted/50 cursor-pointer">
                    <TableCell onClick={() => handleEditNote(note)} className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="line-clamp-1">{note.title}</span>
                        {note.tags.length > 0 && (
                          <div className="flex gap-1">
                            {note.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {note.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{note.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleEditNote(note)} className="text-muted-foreground">
                      <span className="line-clamp-2">{note.excerpt}</span>
                    </TableCell>
                    <TableCell onClick={() => handleEditNote(note)}>
                      <Badge variant="outline" className="text-xs">
                        {note.wordCount}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={() => handleEditNote(note)}>
                      <div className="text-muted-foreground flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {formatDate(note.updatedAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditNote(note);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id);
                          }}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">{searchQuery ? "No notes found" : "No notes yet"}</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try adjusting your search terms to find what you're looking for."
                : "Start capturing your ideas and thoughts with the Hemingway editor."}
            </p>
            {!searchQuery && (
              <Button onClick={handleNewNote} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Note
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="h-[90vh] max-w-7xl p-0">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>{currentNote ? "Edit Note" : "New Note"}</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1">
            <HemingwayEditor
              value={editorContent}
              onChange={setEditorContent}
              title={editorTitle}
              onTitleChange={setEditorTitle}
              showTitleEditor={true}
              placeholder="Start writing your note..."
              context="notes"
              autoFocus={true}
            />
          </div>
          <div className="flex justify-between border-t px-6 py-4">
            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNote} disabled={!editorContent.trim()}>
              {currentNote ? "Update Note" : "Save Note"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
