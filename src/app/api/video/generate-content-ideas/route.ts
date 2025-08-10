import { NextRequest, NextResponse } from "next/server";

import { GeminiService } from "@/lib/services/gemini-service";

interface GenerateIdeasRequest {
  transcript?: string;
}

interface ContentIdea {
  title: string; // short label for the idea (Alternative Angle / Deep-Dive / Transformation)
  format: string;
  hook: string;
  keyPoints: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { transcript }: GenerateIdeasRequest = await request.json();

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Transcript is required to generate content ideas" }, { status: 400 });
    }

    const systemPrompt = "You are an AI content strategist that produces fresh content ideas from transcripts.";
    const prompt = `# AI Prompt: Generate 3 Fresh Content Ideas from Video Transcript

Analyze the transcript and produce EXACTLY THREE ideas in JSON as specified. Follow all constraints closely.

TRANSCRIPT:\n"""
${transcript}
"""

OUTPUT (STRICT JSON ONLY):
{
  "ideas": [
    { "title": string, "format": string, "hook": string, "keyPoints": [string, string, string] },
    { "title": string, "format": string, "hook": string, "keyPoints": [string, string, string] },
    { "title": string, "format": string, "hook": string, "keyPoints": [string, string, string] }
  ]
}

CONSTRAINTS:
- Each idea must be distinct (Alternative Angle, Expansion/Deep-Dive, Format Transformation)
- 2-3 key points per idea, concise
- Hook length: 7-20 words; 4th-grade reading level; include topic keywords
- Never use the word "revealed"
- Return ONLY JSON`;

    const gemini = GeminiService.getInstance?.() ?? new GeminiService();
    const ai = await gemini.generateContent<{ ideas: ContentIdea[] }>({
      prompt,
      systemPrompt,
      model: "gemini-1.5-flash",
      temperature: 0.7,
      maxTokens: 900,
      responseType: "json",
      retries: 2,
      timeout: 30000,
    });

    if (!ai.success || !ai.content) {
      return NextResponse.json({ success: false, error: ai.error ?? "Content ideas generation failed" }, { status: 500 });
    }

    const content = ai.content as any;
    const ideas: ContentIdea[] = Array.isArray(content?.ideas) ? content.ideas : [];
    if (ideas.length !== 3) {
      return NextResponse.json({ success: false, error: "Invalid AI response format" }, { status: 500 });
    }

    const normalizedIdeas: ContentIdea[] = ideas.map((i) => ({
      title: String(i?.title ?? "Idea").trim(),
      format: String(i?.format ?? "Video").trim(),
      hook: String(i?.hook ?? "").trim(),
      keyPoints: Array.isArray(i?.keyPoints)
        ? i.keyPoints.filter((kp: unknown) => typeof kp === "string" && kp.trim() !== "").map((kp: string) => kp.trim()).slice(0, 3)
        : [],
    }));

    return NextResponse.json({ success: true, ideas: normalizedIdeas });
  } catch (error) {
    console.error("❌ [IDEAS] Generation error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

