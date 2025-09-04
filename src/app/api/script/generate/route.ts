import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";
import { parseStructuredResponse, createScriptElements } from "@/lib/json-extractor";
import { ensurePromptLibraryInitialized } from "@/lib/prompts";
import { executePrompt } from "@/lib/prompts/prompt-manager";
import { createSpeedWriteVariables, type SpeedWriteResult } from "@/lib/prompts/script-generation";
import { geminiService } from "@/lib/services/gemini-service";

type VoiceAnalysis = {
  voiceProfile: {
    distinctiveness: string;
    complexity: string;
    primaryStyle: string;
  };
  hookReplicationSystem?: {
    primaryHookType: string;
    hookTemplates: Array<{
      template: string;
      type: string;
      frequency: number;
      effectiveness: string;
      emotionalTrigger: string;
      realExamples: string[];
      newExamples: string[];
    }>;
    hookProgression: {
      structure: string;
      avgWordCount: number;
      timing: string;
      examples: string[];
    };
    hookRules: string[];
  };
  linguisticFingerprint: {
    avgSentenceLength: number;
    vocabularyTier: {
      simple: number;
      moderate: number;
      advanced: number;
    };
    topUniqueWords: string[];
    avoidedWords: string[];
    grammarQuirks: string[];
  };
  transitionPhrases: {
    conceptBridges: string[];
    enumeration: string[];
    topicPivots: string[];
    softeners: string[];
  };
  microPatterns: {
    fillers: string[];
    emphasisWords: string[];
    numberPatterns: string;
    timeReferences: string[];
  };
  scriptGenerationRules?: {
    mustInclude: string[];
    neverInclude: string[];
    optimalStructure: {
      hookSection: string;
      bodySection: string;
      closeSection: string;
    };
    formulaForNewScript: string;
  };
  signatureMoves: Array<{
    move: string;
    description: string;
    frequency: string;
    placement: string;
    verbatim: string[];
  }>;
};

type GenerateRequestBody = {
  idea: string;
  length?: "15" | "20" | "30" | "45" | "60" | "90";
  persona?: VoiceAnalysis;
  generatorType?: string | null;
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

/**
 * Parses numbered list content into structured items
 * Handles formats like "1. Item text" or "1) Item text"
 */
function parseNumberedItems(content: string): Array<{ number: number; text: string }> {
  if (!content) return [];
  
  const lines = content.split('\n').filter(line => line.trim());
  const items: Array<{ number: number; text: string }> = [];
  
  lines.forEach(line => {
    // Match patterns: "1. Text" or "1) Text" or just numbered lines
    const match = line.match(/^(\d+)[.)\s]+(.+)$/);
    if (match) {
      const [, numberStr, text] = match;
      items.push({
        number: parseInt(numberStr, 10),
        text: text.trim()
      });
    }
  });
  
  return items;
}

export async function POST(request: NextRequest): Promise<NextResponse<GenerateResponseBody>> {
  try {
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) {
      return authResult as NextResponse<GenerateResponseBody>;
    }

    const body = (await request.json()) as GenerateRequestBody;
    const idea = (body?.idea ?? "").trim();
    const length = body?.length ?? "60";
    const persona = body?.persona;
    const generatorType = body?.generatorType;

    if (!idea) {
      return NextResponse.json({ success: false, error: "Idea is required" }, { status: 400 });
    }

    console.log(
      `🎭 [Script Generate] ${persona ? "Using persona" : "No persona"} | Generator: ${generatorType ?? "full-script"} | Idea: "${idea.substring(0, 50)}..."`,
    );

    ensurePromptLibraryInitialized();

    // Handle quick generator types with simple, direct prompts
    if (generatorType === "generate-hooks" || generatorType === "content-ideas" || generatorType === "value-bombs") {
      // Create a simple prompt that doesn't require complex speed-write variables
      let simplePrompt = "";
      
      if (generatorType === "generate-hooks") {
        simplePrompt = `Generate 10 compelling hooks for the following topic. Each hook should be attention-grabbing and make the reader want to continue. 
        
Topic: ${idea}

Return ONLY a numbered list (1-10) with each hook on its own line. Keep each hook concise (1-2 sentences max).`;
      } else if (generatorType === "content-ideas") {
        simplePrompt = `Generate 10 creative content ideas for the following topic. Each idea should be unique and actionable.
        
Topic: ${idea}

Return ONLY a numbered list (1-10) with each content idea on its own line. Keep each idea clear and specific.`;
      } else if (generatorType === "value-bombs") {
        simplePrompt = `Generate 10 high-value actionable tips for the following topic. Each tip should provide immediate practical value.
        
Topic: ${idea}

Return ONLY a numbered list (1-10) with each tip on its own line. Keep each tip concise and actionable.`;
      }

      // Use Gemini service directly for simple prompt execution
      const result = await geminiService.generateContent<string>({
        prompt: simplePrompt,
        temperature: 0.7,
        maxTokens: 1000,
      });
      
      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: result.error ?? `Failed to generate ${generatorType.replace("generate-", "").replace("-", " ")}`,
          },
          { status: 500 },
        );
      }

      // Parse the generated content into structured items
      const content = result.content as string;
      const parsedItems = parseNumberedItems(content);
      
      // Create the script response
      const scriptResponse = {
        hook: content || `Generated ${generatorType.replace("generate-", "").replace("-", " ")} based on your topic`,
        bridge: "",
        content: "",
        callToAction: "",
      };
      
      // Save to database with structured elements
      try {
        if (isAdminInitialized) {
          const adminDb = getAdminDb();
          const now = new Date().toISOString();
          
          await adminDb.collection("scripts").add({
            userId: authResult.user.uid,
            title: content.split('\n')[0]?.substring(0, 100) || `Generated ${generatorType.replace("generate-", "").replace("-", " ")}`,
            content: content,
            authors: authResult.user.email || "Unknown",
            status: "draft",
            performance: { views: 0, engagement: 0 },
            category: generatorType, // Store the generator type for retrieval
            createdAt: now,
            updatedAt: now,
            viewedAt: now,
            duration: "",
            tags: [`generator:${generatorType}`],
            fileType: "Script",
            summary: "Script generated with default persona",
            approach: "ai-voice",
            wordCount: content.split(/\s+/).filter(Boolean).length,
            characterCount: content.length,
            // Store structured items in elements
            elements: {
              items: parsedItems, // Structured items array
              rawContent: content, // Keep raw content for backward compatibility
              type: generatorType,
            },
            originalIdea: idea,
            source: "scripting",
          });
          
          console.log(`✅ [Script Generate] Saved ${generatorType} with ${parsedItems.length} structured items`);
        }
      } catch (persistErr) {
        console.warn(`⚠️ [Script Generate] Failed to persist ${generatorType}:`, persistErr);
      }
      
      return NextResponse.json({
        success: true,
        script: scriptResponse,
      });
    }

    // Default: Generate full script
    const variables = createSpeedWriteVariables(idea, length);

    // If persona is provided, enhance the prompt with voice cloning instructions
    const promptOptions: any = { variables };
    if (persona) {
      // Add safety check for voiceProfile
      if (persona.voiceProfile?.primaryStyle) {
        console.log(`🎯 [Script Generate] Applying persona: ${persona.voiceProfile.primaryStyle} style`);
      } else {
        console.log(`🎭 [Script Generate] Persona provided but missing voiceProfile data`);
      }
      // We'll need to modify executePrompt to support persona enhancement
      promptOptions.persona = persona;
    }

    const result = await executePrompt<SpeedWriteResult>("speed-write-v2", promptOptions);

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
