import { NextRequest, NextResponse } from "next/server";

import { generateContent } from "@/lib/services/gemini-service";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const prompt = `You are a writing assistant that condenses short-form video scripts while preserving clarity, intent, and structure.

TASK: Shorten the text significantly without losing core meaning. Apply:
- Remove redundancy and filler
- Merge overlapping sentences
- Prefer simple, direct wording
- Keep any list/numbered structure intact

Return ONLY the shortened text. No explanations.

Text to shorten:
${text}`;

    const response = await generateContent({
      prompt,
      model: "gemini-1.5-flash",
      temperature: 0.5,
      maxTokens: 800,
    });

    if (!response.success || !response.content) {
      return NextResponse.json({ error: response.error || "Failed to shorten text" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      shortenedText: response.content.trim(),
      tokensUsed: response.tokensUsed,
      responseTime: response.responseTime,
    });
  } catch (error) {
    console.error("Shorten API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

