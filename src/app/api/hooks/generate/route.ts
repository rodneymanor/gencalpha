import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { createHookGenerationPrompt, type HookGenerationResponse } from "@/lib/prompts/hook-generation";
import { generateContent } from "@/lib/services/gemini-service";

interface HooksBody {
  input?: string;
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) return authResult;

    const { input }: HooksBody = await request.json();
    if (!input || !input.trim()) {
      return NextResponse.json({ success: false, error: "Input is required" }, { status: 400 });
    }

    const prompt = createHookGenerationPrompt(input);
    const ai = await generateContent<HookGenerationResponse>({
      prompt,
      responseType: "json",
      maxTokens: 1000,
      temperature: 0.7,
    });
    if (!ai.success || !ai.content) {
      return NextResponse.json({ success: false, error: ai.error ?? "Hook generation failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, ...ai.content });
  } catch (error) {
    console.error("❌ [HOOKS_GENERATE] Error:", error);
    return NextResponse.json({ success: false, error: "Hook generation failed" }, { status: 500 });
  }
}
