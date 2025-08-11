import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";
import contentIdeasPrompt from "@/lib/prompts/content-ideas";
import { generateContent } from "@/lib/services/gemini-service";

interface IdeasBody {
  transcript?: string;
  sourceUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult.user.uid;

    const { transcript, sourceUrl }: IdeasBody = await request.json();
    if (!transcript || !transcript.trim()) {
      return NextResponse.json({ success: false, error: "Transcript is required" }, { status: 400 });
    }

    const prompt = `${contentIdeasPrompt}\n\nTRANSCRIPT TO ANALYZE:\n${transcript}`;
    const ai = await generateContent({ prompt, maxTokens: 1200, temperature: 0.7 });
    if (!ai.success || !ai.content) {
      return NextResponse.json({ success: false, error: ai.error ?? "Content ideation failed" }, { status: 500 });
    }

    const adminDb = getAdminDb();
    if (!isAdminInitialized || adminDb == null) {
      return NextResponse.json({ success: false, error: "Admin SDK not configured" }, { status: 500 });
    }

    const ref = await adminDb.collection("contentIdeas").add({
      userId,
      sourceUrl: sourceUrl ?? null,
      transcript,
      ideas: ai.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, ideasId: ref.id, ideas: ai.content });
  } catch (error) {
    console.error("❌ [CONTENT_IDEAS] Error:", error);
    return NextResponse.json({ success: false, error: "Content ideas failed" }, { status: 500 });
  }
}
