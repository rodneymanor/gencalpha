import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";
import contentIdeasPrompt from "@/lib/prompts/content-ideas";
import { generateContent } from "@/lib/services/gemini-service";

interface IdeasBody {
  transcript?: string;
  sourceUrl?: string;
}

export interface ContentIdea {
  id: string;
  userId: string;
  sourceUrl: string | null;
  transcript: string;
  ideas: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentIdeasResponse {
  success: boolean;
  ideas: ContentIdea[];
  error?: string;
}

// GET: Fetch user's content ideas
export async function GET(request: NextRequest): Promise<NextResponse<ContentIdeasResponse>> {
  try {
    console.log("📚 [Content Ideas API] GET request received");

    // Authenticate API key
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const userId = authResult.user.uid;
    console.log("👤 [Content Ideas API] Fetching ideas for user:", userId);

    // Check if admin is initialized
    if (!isAdminInitialized) {
      return NextResponse.json(
        {
          success: false,
          ideas: [],
          error: "Admin SDK not configured",
        },
        { status: 500 },
      );
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json(
        {
          success: false,
          ideas: [],
          error: "Database not available",
        },
        { status: 500 },
      );
    }

    // Fetch content ideas from Firestore - remove orderBy to avoid index requirement
    const ideasSnapshot = await adminDb
      .collection("contentIdeas")
      .where("userId", "==", userId)
      .limit(100) // Limit to last 100 content ideas
      .get();

    // Map documents and sort by createdAt in JavaScript since we can't use orderBy in Firestore
    const ideas: ContentIdea[] = ideasSnapshot.docs
      .map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as ContentIdea,
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    console.log(`✅ [Content Ideas API] Found ${ideas.length} content ideas for user`);

    return NextResponse.json({
      success: true,
      ideas,
    });
  } catch (error) {
    console.error("❌ [Content Ideas API] GET error:", error);
    return NextResponse.json(
      {
        success: false,
        ideas: [],
        error: "Failed to fetch content ideas",
      },
      { status: 500 },
    );
  }
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
