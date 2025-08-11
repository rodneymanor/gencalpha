import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";
import { generateContent } from "@/lib/services/gemini-service";

const ANALYZE_SYSTEM_PROMPT = `Advanced AI Script Analyzer & Style Replicator
You are an expert in stylometric analysis. Extract a detailed STYLE PROFILE from the given transcript covering:
- Voice signature (tone, register, energy)
- Linguistic patterns (dominant sentence structures, signature phrases, vocabulary complexity)
- Rhetorical framework (persuasion techniques, narrative style, engagement methods)
- Replication parameters (clear, actionable guidelines to recreate the voice)

Return the STYLE PROFILE followed by a short actionable summary.`;

interface AnalyzeBody {
  transcript?: string;
  sourceUrl?: string;
  platform?: "TikTok" | "Instagram" | "Unknown";
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult.user.uid;

    const { transcript, sourceUrl, platform = "Unknown" }: AnalyzeBody = await request.json();
    if (!transcript || !transcript.trim()) {
      return NextResponse.json({ success: false, error: "Transcript is required" }, { status: 400 });
    }

    const safeTranscript = transcript ?? "";
    const prompt = `${ANALYZE_SYSTEM_PROMPT}\n\nTRANSCRIPT:\n${safeTranscript}`;

    const ai = await generateContent({ prompt, maxTokens: 1500, temperature: 0.4 });
    if (!ai.success || !ai.content) {
      return NextResponse.json({ success: false, error: ai.error ?? "AI analysis failed" }, { status: 500 });
    }

    // Persist to Firestore under user record
    const adminDb = getAdminDb();
    if (!isAdminInitialized || adminDb == null) {
      return NextResponse.json({ success: false, error: "Admin SDK not configured" }, { status: 500 });
    }

    const ref = await adminDb.collection("analyses").add({
      userId,
      sourceUrl: sourceUrl ?? null,
      platform,
      transcript,
      analysis: ai.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, analysisId: ref.id, analysis: ai.content });
  } catch (error) {
    console.error("❌ [ANALYZE_STYLE] Error:", error);
    return NextResponse.json({ success: false, error: "Analysis failed" }, { status: 500 });
  }
}
