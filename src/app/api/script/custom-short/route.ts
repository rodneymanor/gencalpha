import { NextRequest, NextResponse } from "next/server";

import { generateContent } from "@/lib/services/gemini-service";

/**
 * POST /api/script/custom-short
 * Generates a short, conversational video script following the custom GPT instructions.
 * Expects JSON: { prompt: string }
 * Returns: { script: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const systemInstructions = `You are a script generator that creates short video scripts following these strict rules:

1. The script must contain: a hook (8-12 words starting with "If" and ending with "try this", "do this" or "say this"), followed by simple actionable advice, an explanation of why the advice works, and a benefit statement.
2. Tone must be conversational, friendly, direct, using the word "you" frequently.
3. Use simple words and short sentences suitable for grade 3 reading level.
4. Total length: 425-450 characters.
5. Do NOT label sections – output should flow naturally.
6. Verify readability; if any sentence is complex, simplify.
7. Focus on a single specific problem derived from the user's prompt.
8. Output ONLY the script text with no additional commentary.`;

    const fullPrompt = `${systemInstructions}\n\nUser idea/topic: ${prompt}\n\nGenerate the script now.`;

    const aiResponse = await generateContent({
      prompt: fullPrompt,
      model: "gemini-1.5-flash",
      temperature: 0.7,
      maxTokens: 300,
    });

    if (!aiResponse.success || !aiResponse.content) {
      return NextResponse.json({ error: aiResponse.error ?? "Failed to generate script" }, { status: 500 });
    }

    return NextResponse.json({ script: aiResponse.content.trim(), tokensUsed: aiResponse.tokensUsed });
  } catch (error) {
    console.error("Custom Short Script API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
