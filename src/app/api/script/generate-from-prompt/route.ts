import { NextRequest, NextResponse } from "next/server";

import { createScriptElements, parseStructuredResponse } from "@/lib/json-extractor";
import { GEMINI_MODELS, GeminiService } from "@/lib/services/gemini-service";

type GenerateFromPromptRequest = {
  prompt: string;
  model?: keyof typeof GEMINI_MODELS;
  temperature?: number;
  maxTokens?: number;
  preferJson?: boolean;
};

type ScriptElements = {
  hook: string;
  bridge: string;
  goldenNugget: string;
  wta: string;
};

type GenerateFromPromptResponse = {
  success: boolean;
  script?: ScriptElements;
  content?: string;
  error?: string;
  debug?: { tokensUsed?: number; responseTime?: number; model?: string; retryCount?: number; phase?: string };
};

const JSON_FORMAT_INSTRUCTION = `You are a script generator. Always return STRICT JSON with these fields only:
{
  "hook": string,
  "bridge": string,
  "goldenNugget": string,
  "wta": string
}`;

export async function POST(request: NextRequest): Promise<NextResponse<GenerateFromPromptResponse>> {
  try {
    const body = (await request.json()) as GenerateFromPromptRequest;
    const prompt = (body?.prompt ?? "").trim();
    const preferJson = body?.preferJson ?? true;

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    const gemini = GeminiService.getInstance();

    // Phase 1: Try JSON-structured response
    if (preferJson) {
      const jsonAttempt = await gemini.generateContent<Record<string, unknown>>({
        prompt,
        systemInstruction: JSON_FORMAT_INSTRUCTION,
        responseType: "json",
        model: body?.model ? GEMINI_MODELS[body.model] : GEMINI_MODELS.FLASH,
        temperature: body?.temperature ?? 0.8,
        maxTokens: body?.maxTokens ?? 800,
        retries: 1,
        timeout: 30000,
      });

      if (jsonAttempt.success && jsonAttempt.content && typeof jsonAttempt.content === "object") {
        const elements = createScriptElements(jsonAttempt.content);
        return NextResponse.json({
          success: true,
          script: elements,
          debug: {
            tokensUsed: jsonAttempt.tokensUsed,
            responseTime: jsonAttempt.responseTime,
            model: jsonAttempt.model,
            retryCount: jsonAttempt.retryCount,
            phase: "json",
          },
        });
      }
    }

    // Phase 2: Fallback to text + parser
    const textAttempt = await gemini.generateContent<string>({
      prompt,
      model: body?.model ? GEMINI_MODELS[body.model] : GEMINI_MODELS.FLASH,
      temperature: body?.temperature ?? 0.8,
      maxTokens: body?.maxTokens ?? 900,
      responseType: "text",
      retries: 1,
      timeout: 30000,
    });

    if (!textAttempt.success || !textAttempt.content) {
      return NextResponse.json(
        {
          success: false,
          error: textAttempt.error ?? "AI generation failed",
          debug: {
            tokensUsed: textAttempt.tokensUsed,
            responseTime: textAttempt.responseTime,
            model: textAttempt.model,
            retryCount: textAttempt.retryCount,
            phase: "text",
          },
        },
        { status: 502 },
      );
    }

    const raw = String(textAttempt.content);
    const parsed = parseStructuredResponse(raw, "generate-from-prompt");

    if (parsed.success && parsed.data) {
      const elements = createScriptElements(parsed.data);
      return NextResponse.json({
        success: true,
        script: elements,
        debug: {
          tokensUsed: textAttempt.tokensUsed,
          responseTime: textAttempt.responseTime,
          model: textAttempt.model,
          retryCount: textAttempt.retryCount,
          phase: "text+parsed",
        },
      });
    }

    // Phase 3: Best-effort raw pass-through
    return NextResponse.json({
      success: true,
      content: raw,
      debug: {
        tokensUsed: textAttempt.tokensUsed,
        responseTime: textAttempt.responseTime,
        model: textAttempt.model,
        retryCount: textAttempt.retryCount,
        phase: "text+raw",
      },
    });
  } catch (error) {
    console.error("❌ [/api/script/generate-from-prompt] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
