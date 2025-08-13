import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";
import { GeminiService } from "@/lib/services/gemini-service";

interface GenerateHooksRequest {
  transcript?: string;
}

type HookFocus = "surprise" | "pain_point" | "benefit";

interface GeneratedHook {
  text: string;
  rating: number; // 0-100
  focus: HookFocus;
  rationale: string;
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { transcript }: GenerateHooksRequest = await request.json();

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Transcript is required to generate hooks",
        },
        { status: 400 },
      );
    }

    const systemPrompt = `You are an AI Video Hook Generator. Follow the user's constraints exactly. Generate exactly 3 hooks.`;

    // Enforce JSON output for reliable parsing while aligning with provided prompt
    const instruction = `# AI Video Hook Generator Prompt (Transcript-Based)

Generate exactly 3 powerful video hooks based on the transcript. Respect ALL rules:

HOOKS:
- Hook 1 (focus: surprise): focus on the most shocking/surprising element
- Hook 2 (focus: pain_point): target the main problem or pain point
- Hook 3 (focus: benefit): highlight the key benefit/transformation

SPECIFICATIONS:
- 7-20 words (1-2 short sentences)
- 4th grade reading level or under
- Include keywords from transcript topic
- Make it clear who the video is for (target audience)
- Use POWER WORDS when relevant (e.g., Shocking, Surprising, Biggest mistake, Dangerous, Instantly, Incredible, etc.)
- Add optional curiosity enhancers at the end if appropriate (e.g., "And here is why", "Here is what you need to know!")
- Forbidden: never use the word "revealed"

RATING (0-100) based on:
- Novelty/surprise, Relevance, Emotional engagement, Urgency, Psychology triggers

OUTPUT (STRICT JSON):
{
  "hooks": [
    { "text": string, "rating": number, "focus": "surprise" | "pain_point" | "benefit", "rationale": string },
    { "text": string, "rating": number, "focus": "surprise" | "pain_point" | "benefit", "rationale": string },
    { "text": string, "rating": number, "focus": "surprise" | "pain_point" | "benefit", "rationale": string }
  ],
  "topHook": { "text": string, "rating": number }
}

TRANSCRIPT:
"""
${transcript}
"""

Return only valid JSON.`;

    const gemini = GeminiService.getInstance?.() ?? new GeminiService();
    const ai = await gemini.generateContent<{ hooks: GeneratedHook[]; topHook: { text: string; rating: number } }>({
      prompt: `${systemPrompt}\n\n${instruction}`,
      model: "gemini-1.5-flash",
      temperature: 0.7,
      maxTokens: 800,
      responseType: "json",
      retries: 2,
      timeout: 30000,
    });

    if (!ai.success || !ai.content) {
      return NextResponse.json({ success: false, error: ai.error ?? "Hook generation failed" }, { status: 500 });
    }

    const content: any = ai.content;
    const hooks: GeneratedHook[] = Array.isArray(content?.hooks) ? content.hooks : [];
    const topHook = content?.topHook ?? null;

    if (hooks.length !== 3 || !topHook) {
      return NextResponse.json({ success: false, error: "Invalid AI response format" }, { status: 500 });
    }

    // Basic normalization
    const normalizedHooks = hooks.map((h) => ({
      text: String(h.text ?? "").trim(),
      rating: Math.max(0, Math.min(100, Number(h.rating ?? 0))),
      focus: h.focus ?? "surprise",
      rationale: String(h.rationale ?? "").trim(),
    }));

    // persist hooks insight (best-effort)
    try {
      if (isAdminInitialized) {
        const adminDb = getAdminDb();
        await adminDb.collection("hook_generations").add({
          userId: authResult.user.uid,
          transcriptHash: (transcript || "").slice(0, 64),
          hooks: normalizedHooks,
          topHook,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (persistErr) {
      console.warn("⚠️ [HOOKS] Failed to store hook generation:", persistErr);
    }

    return NextResponse.json({ success: true, hooks: normalizedHooks, topHook });
  } catch (error) {
    console.error("❌ [HOOKS] Generation error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
