import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { notesService } from "@/lib/services/notes-service";
import { NoteType } from "@/app/(main)/dashboard/idea-inbox/_components/types";

interface TextIdeaBody {
  title?: string;
  content?: string;
  url?: string;
  noteType?: NoteType;
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) return authResult;

    const userId = authResult.user.uid;
    const body: TextIdeaBody = await request.json();
    const incomingTitle = (body.title ?? "").trim();
    const resolvedContent = (body.content ?? body.url ?? "").trim();
    const noteType = body.noteType ?? NoteType.NOTE;

    if (!incomingTitle && !resolvedContent) {
      return NextResponse.json(
        { success: false, error: "At least one of title or content/url is required" },
        { status: 400 },
      );
    }

    const finalTitle = incomingTitle || "Saved from Extension";

    const noteId = await notesService.createNote(userId, {
      title: finalTitle,
      content: resolvedContent,
      noteType: noteType,
      type: "idea_inbox",
      source: "inbox",
      starred: false,
    });

    const note = await notesService.getNote(noteId, userId);
    return NextResponse.json({ success: true, note }, { status: 201 });
  } catch (error) {
    console.error("❌ [Chrome Idea Inbox Text] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to create idea note" }, { status: 500 });
  }
}
