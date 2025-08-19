import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { GeminiService } from "@/lib/gemini";

// Script Generation Prompt (abbreviated; the model receives the full instruction via prompt body)
const SCRIPT_GENERATION_PROMPT_HEADER = `You are generating scripts using FORENSIC voice pattern data. Your output must be INDISTINGUISHABLE from the original creator. CRITICAL: Return ONLY valid JSON. Apply patterns with surgical precision.`;

export async function POST(request: NextRequest) {
  console.log("✍️ [VOICE_GENERATE] Script generation start");
  try {
    const auth = await authenticateApiKey(request);
    if (auth instanceof NextResponse) return auth;

    const body = (await request.json()) as {
      analysis: unknown; // forensic JSON
      topic: string;
      length: "short" | "medium" | "long";
    };

    if (!body?.analysis || !body.topic || !body.length) {
      return NextResponse.json({ success: false, error: "analysis, topic and length are required" }, { status: 400 });
    }

    const systemPrompt =
      "You are a forensic replication model. Output strictly valid JSON per the specified structure.";

    const fullPrompt = `${SCRIPT_GENERATION_PROMPT_HEADER}\n\nVOICE ANALYSIS DATA:\n${JSON.stringify(
      body.analysis,
      null,
      2,
    )}\n\nTOPIC: ${body.topic}\nLENGTH: ${body.length}\n\nReturn ONLY the JSON structure as specified.`;

    const gemini = new GeminiService();
    const ai = await gemini.generateContent({
      prompt: fullPrompt,
      model: "gemini-1.5-pro",
      temperature: 0.3,
      maxTokens: 4000,
      responseType: "json",
      systemPrompt,
    });

    if (!ai.success || !ai.content) {
      return NextResponse.json({ success: false, error: ai.error ?? "Script generation failed" }, { status: 500 });
    }

    let parsed: unknown;
    try {
      parsed = typeof ai.content === "string" ? JSON.parse(ai.content) : ai.content;
    } catch (e) {
      console.error("❌ [VOICE_GENERATE] JSON parse error", e);
      return NextResponse.json({ success: false, error: "Invalid JSON returned from model" }, { status: 422 });
    }

    return NextResponse.json({ success: true, script: parsed });
  } catch (error) {
    console.error("❌ [VOICE_GENERATE] Unexpected error", error);
    return NextResponse.json({ success: false, error: "Script generation failed" }, { status: 500 });
  }
}
