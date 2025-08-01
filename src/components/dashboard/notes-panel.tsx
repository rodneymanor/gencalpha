"use client";

import { useState } from "react";
import { Plus, StickyNote, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useResizableLayout } from "@/contexts/resizable-layout-context";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

export function NotesPanel() {
  const { toggleNotesPanel } = useResizableLayout();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState<string>("");

  const addNote = () => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: Date.now().toString(),
      title: newNote.slice(0, 30) + (newNote.length > 30 ? "..." : ""),
      content: newNote,
      createdAt: new Date(),
    };
    setNotes((prev) => [note, ...prev]);
    setNewNote("");
  };

  return (
    <Card className="flex h-full flex-col rounded-none border-0">
      <CardHeader className="flex flex-row items-center justify-between border-b p-4">
        <div className="flex items-center gap-2 font-semibold">
          <StickyNote className="h-4 w-4" />
          <CardTitle className="text-base">Notes Panel</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleNotesPanel} aria-label="Close notes panel">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex gap-2">
          <Input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addNote();
            }}
            placeholder="Add a note and press Enter"
          />
          <Button variant="outline" size="icon" onClick={addNote} aria-label="Add note">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          {notes.length === 0 && (
            <p className="text-sm text-muted-foreground">No notes yet. Add one above!</p>
          )}
          <ul className="space-y-2 pt-2">
            {notes.map((note) => (
              <li key={note.id} className="rounded-md border p-3">
                <p className="font-medium">{note.title}</p>
                <p className="text-xs text-muted-foreground">
                  {note.createdAt.toLocaleDateString()} {note.createdAt.toLocaleTimeString()}
                </p>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
