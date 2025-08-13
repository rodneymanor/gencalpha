import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";
import { parseStructuredResponse, createScriptElements } from "@/lib/json-extractor";
import { ensurePromptLibraryInitialized } from "@/lib/prompts";
import { executePrompt } from "@/lib/prompts/prompt-manager";
import { createSpeedWriteVariables, type SpeedWriteResult } from "@/lib/prompts/script-generation";

type GenerateRequestBody = {
  idea: string;
  length?: "15" | "20" | "30" | "45" | "60" | "90";
};

type GenerateResponseBody = {
  success: boolean;
  script?: SpeedWriteResult;
  error?: string;
  debug?: {
    responseTime?: number;
    tokensUsed?: number;
  };
};

export async function POST(request: NextRequest): Promise<NextResponse<GenerateResponseBody>> {
  try {
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) {
      return authResult as NextResponse<GenerateResponseBody>;
    }

    const body = (await request.json()) as GenerateRequestBody;
    const idea = (body?.idea ?? "").trim();
    const length = body?.length ?? "60";

    if (!idea) {
      return NextResponse.json({ success: false, error: "Idea is required" }, { status: 400 });
    }

    ensurePromptLibraryInitialized();

    const variables = createSpeedWriteVariables(idea, length);

    const result = await executePrompt<SpeedWriteResult>("speed-write-v2", {
      variables,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error ?? "Failed to generate script",
        },
        { status: 500 },
      );
    }

    // result.content may already be parsed JSON. Ensure structure robustly.
    let script: SpeedWriteResult | null = null;
    const content = result.content as unknown;

    if (typeof content === "string") {
      const parsed = parseStructuredResponse(content, "script-generation");
      if (parsed.success && parsed.data) {
        const elements = createScriptElements(parsed.data);
        script = elements;
      }
    } else if (content && typeof content === "object") {
      const elements = createScriptElements(content as Record<string, unknown>);
      script = elements;
    }

    if (!script) {
      return NextResponse.json(
        {
          success: false,
          error: "AI returned invalid response format",
        },
        { status: 502 },
      );
    }

    // Persist generated script elements (best-effort)
    try {
      if (isAdminInitialized) {
        const adminDb = getAdminDb();
        const now = new Date().toISOString();
        await adminDb.collection("scripts").add({
          userId: authResult.user.uid,
          title: idea.slice(0, 100) || "Untitled Script",
          content: `${script.hook}\n\n${script.bridge}\n\n${script.goldenNugget}\n\n${script.wta}`,
          authors: authResult.user.email || "Unknown",
          status: "draft",
          performance: { views: 0, engagement: 0 },
          category: "generated",
          createdAt: now,
          updatedAt: now,
          viewedAt: now,
          duration: "",
          tags: [],
          fileType: "Script",
          summary: idea,
          approach: "speed-write",
          wordCount: (script.hook + " " + script.bridge + " " + script.goldenNugget + " " + script.wta).split(/\s+/)
            .length,
          characterCount: (script.hook + script.bridge + script.goldenNugget + script.wta).length,
          elements: script,
          source: "scripting",
        });
      }
    } catch (persistErr) {
      console.warn("⚠️ [/api/script/generate] Failed to persist generated script:", persistErr);
    }

    return NextResponse.json({
      success: true,
      script,
      debug: {
        responseTime: result.responseTime,
        tokensUsed: result.tokensUsed,
      },
    });
  } catch (error) {
    console.error("/api/script/generate error", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}
