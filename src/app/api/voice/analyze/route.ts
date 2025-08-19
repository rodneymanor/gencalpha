import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";
import { GeminiService } from "@/lib/gemini";
import { ForensicVoiceAnalysisSchema } from "@/lib/validation/voice-analysis-schema";

// Prompts are large; keep inline to reduce imports churn
const VOICE_ANALYSIS_PROMPT = `You are the industry's most advanced voice pattern recognition AI, capable of extracting a creator's complete speaking DNA from a single video transcript. You specialize in identifying micro-patterns, unconscious speech habits, and the exact linguistic formulas that make each creator unique.

CRITICAL: Return ONLY valid JSON. No text outside the JSON structure.

Transform any single video transcript into a comprehensive voice replication blueprint that captures patterns so precisely that generated content becomes indistinguishable from the original creator.

Analyze with FORENSIC PRECISION and return the EXACT JSON structure previously described. Perform FORENSIC-LEVEL analysis. Extract EXACT phrases, patterns, and formulas. This is industry-leading voice replication requiring microscopic precision.`;

export async function POST(request: NextRequest) {
  console.log("🧠 [VOICE_ANALYZE] Forensic analysis start");

  try {
    const auth = await authenticateApiKey(request);
    if (auth instanceof NextResponse) return auth;
    const userId = auth.user.uid;

    const body = (await request.json()) as {
      transcript: string;
      creatorName?: string;
      sourceUrl?: string;
      platform?: "instagram" | "tiktok" | "unknown";
      wordCount?: number;
      estimatedMinutes?: number;
      accuracyLevel?: string;
    };

    const transcript = (body.transcript ?? "").trim();
    if (!transcript) {
      return NextResponse.json({ success: false, error: "Transcript is required" }, { status: 400 });
    }

    // Compute transcript metadata if not provided
    const transcriptWordCount = body.wordCount ?? transcript.split(/\s+/).length;
    const estimatedMinutes = body.estimatedMinutes ?? transcriptWordCount / 150;
    let accuracyLevel: "Limited" | "Optimal" | "Excessive" = "Optimal";
    if (transcriptWordCount < 900) accuracyLevel = "Limited";
    else if (transcriptWordCount > 6000) accuracyLevel = "Excessive";

    const creatorName = body.creatorName ?? "Unknown";

    const enhancedPrompt = `${VOICE_ANALYSIS_PROMPT}

Creator Name: ${creatorName}
Transcript Word Count: ${transcriptWordCount}
Estimated Duration: ${estimatedMinutes.toFixed(1)} minutes
Accuracy Level: ${accuracyLevel}

TRANSCRIPT TO ANALYZE:\n${transcript}\n\nRemember: Return ONLY the JSON structure.`;

    const gemini = new GeminiService();
    const ai = await gemini.generateContent({
      prompt: enhancedPrompt,
      model: "gemini-1.5-pro",
      temperature: 0.3,
      maxTokens: 4000,
      responseType: "json",
      systemPrompt:
        "You are a forensic-level voice pattern analysis model. Output strictly valid JSON adhering to the specified schema.",
    });

    if (!ai.success || !ai.content) {
      return NextResponse.json({ success: false, error: ai.error ?? "AI analysis failed" }, { status: 500 });
    }

    // Attempt to parse JSON (Gemini returns string content)
    let parsed: unknown;
    try {
      parsed = typeof ai.content === "string" ? JSON.parse(ai.content) : ai.content;
    } catch (e) {
      console.error("❌ [VOICE_ANALYZE] JSON parse error", e);
      return NextResponse.json({ success: false, error: "Invalid JSON returned from model" }, { status: 422 });
    }

    // Validate structure
    const validation = ForensicVoiceAnalysisSchema.safeParse(parsed);
    if (!validation.success) {
      console.error("❌ [VOICE_ANALYZE] Validation error", validation.error.flatten());
      return NextResponse.json({ success: false, error: "Invalid analysis structure" }, { status: 422 });
    }

    // Enrich metadata
    const analysis = {
      ...validation.data,
      metadata: {
        ...validation.data.metadata,
        creatorName,
        transcriptWordCount,
        transcriptDuration: `${estimatedMinutes.toFixed(1)} minutes`,
        accuracyLevel,
        analysisTimestamp: new Date().toISOString(),
        confidenceScore: validation.data.metadata.confidenceScore ?? 0.0,
        analysisId: `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      },
      _source: {
        url: body.sourceUrl ?? null,
        platform: body.platform ?? "unknown",
        userId,
      },
    } as const;

    // Persist to Firestore
    try {
      if (isAdminInitialized) {
        const db = getAdminDb();
        const docRef = await db.collection("voice_analyses").add({
          userId,
          sourceUrl: body.sourceUrl ?? null,
          platform: body.platform ?? "unknown",
          creatorName,
          transcriptWordCount,
          estimatedMinutes,
          accuracyLevel,
          analysis,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        console.log("✅ [VOICE_ANALYZE] Saved analysis", docRef.id);
      } else {
        console.warn("⚠️ [VOICE_ANALYZE] Admin SDK not initialized; skipping Firestore persist");
      }
    } catch (persistErr) {
      console.warn("⚠️ [VOICE_ANALYZE] Persist failed", persistErr);
      // Continue; return analysis anyway
    }

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error("❌ [VOICE_ANALYZE] Unexpected error", error);
    return NextResponse.json({ success: false, error: "Analysis failed" }, { status: 500 });
  }
}
