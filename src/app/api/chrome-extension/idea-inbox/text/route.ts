import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { notesService } from "@/lib/services/notes-service";

interface TextIdeaBody {
  title: string;
  content: string;
  tags?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) return authResult;

    const userId = authResult.user.uid;
    const { title, content, tags = [] }: TextIdeaBody = await request.json();

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ success: false, error: "title and content are required" }, { status: 400 });
    }

    const noteId = await notesService.createNote(userId, {
      title: title.trim(),
      content: content.trim(),
      tags: tags.filter((t) => t && t.trim()),
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
