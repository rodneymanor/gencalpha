import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/services/gemini-service";

export interface ScriptSection {
  hook: string;
  bridge: string;
  goldenNugget: string;
  wta: string;
  microHooks?: string[];
}

export interface ScriptGenerationRequest {
  topic: string;
  selectedHook: string;
  length: "20s" | "30s" | "45s" | "60s" | "90s";
  ctaOptimization?: "comments" | "follow" | "none";
}

export interface ScriptResponse {
  success: boolean;
  script?: ScriptSection;
  wordCount?: number;
  error?: string;
}

/**
 * POST /api/scribo/generate-script
 * Generates a complete script using SCRIBO framework: HOOK → BRIDGE → GOLDEN NUGGET → WTA
 */
export async function POST(request: NextRequest) {
  try {
    const { topic, selectedHook, length, ctaOptimization = "comments" } = await request.json();

    // Validation
    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ 
        success: false, 
        error: "Topic is required" 
      }, { status: 400 });
    }

    if (!selectedHook || typeof selectedHook !== "string") {
      return NextResponse.json({ 
        success: false, 
        error: "Selected hook is required" 
      }, { status: 400 });
    }

    if (!["20s", "30s", "45s", "60s", "90s"].includes(length)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid length. Must be 20s, 30s, 45s, 60s, or 90s" 
      }, { status: 400 });
    }

    console.log("🎬 Generating Scribo script for:", { topic, length, ctaOptimization });

    // Calculate target word counts based on length
    const wordTargets = getWordTargets(length);
    const microHookCount = getMicroHookCount(length);

    const systemInstructions = `You are Scribo, an expert script writer that creates high-converting short video scripts using the proven SCRIBO formula.

SCRIBO 4-STEP STRUCTURE (MANDATORY):
1. HOOK – Grab attention without giving away the solution (ALREADY PROVIDED)
2. BRIDGE – Relate to a frustration or pain-point 
3. GOLDEN NUGGET – Share one simple, actionable piece of advice (with ${microHookCount} Micro Hooks)
4. WTA (Why To Act) – One single, natural, curiosity-triggering question to spark ${ctaOptimization}

TARGET: ${length} script (~${wordTargets.total} words total)
- Hook: ${wordTargets.hook} words (PROVIDED)
- Bridge: ${wordTargets.bridge} words
- Golden Nugget: ${wordTargets.goldenNugget} words (including ${microHookCount} micro hooks)
- WTA: ${wordTargets.wta} words

CRITICAL TONE REQUIREMENTS:
- Super friendly, relatable, conversational - like FaceTiming your best friend
- 5th-grade reading level MAX
- Personal insights, rhetorical questions, casual vibes
- Always talking TO you, not AT you
- NO formal words

FORBIDDEN TERMS (NEVER USE):
- "Think again"
- "It's not what you think" 
- "Game-changing"
- Any overly formal language

MICRO HOOKS RULES:
- Include exactly ${microHookCount} micro hooks within the Golden Nugget
- Micro hooks keep viewers curious and watching till the end
- Format: Brief curiosity statements that tease what's coming next
- Examples: "But here's the crazy part...", "Wait, it gets better...", "This is where it gets interesting..."

WTA (CALL TO ACTION) OPTIMIZATION:
${getCtaInstructions(ctaOptimization)}

TOPIC: ${topic}
SELECTED HOOK: "${selectedHook}"

OUTPUT FORMAT:
Return a JSON object with this exact structure:
{
  "hook": "${selectedHook}",
  "bridge": "Your bridge content here",
  "goldenNugget": "Your golden nugget with ${microHookCount} micro hooks integrated naturally",
  "wta": "Your ${ctaOptimization}-optimized call to action",
  "microHooks": ["micro hook 1", "micro hook 2"${microHookCount === 3 ? ', "micro hook 3"' : ''}]
}`;

    const fullPrompt = `${systemInstructions}\n\nGenerate the complete script now:`;

    const aiResponse = await generateContent({
      prompt: fullPrompt,
      model: "gemini-1.5-flash",
      temperature: 0.7,
      maxTokens: 1000,
    });

    if (!aiResponse.success || !aiResponse.content) {
      console.error("❌ AI response failed:", aiResponse.error);
      return NextResponse.json({ 
        success: false, 
        error: aiResponse.error ?? "Failed to generate script" 
      }, { status: 500 });
    }

    let script: ScriptSection;
    try {
      const parsed = JSON.parse(aiResponse.content);
      
      // Validate required fields
      if (!parsed.hook || !parsed.bridge || !parsed.goldenNugget || !parsed.wta) {
        throw new Error("Missing required script sections");
      }

      script = {
        hook: parsed.hook,
        bridge: parsed.bridge,
        goldenNugget: parsed.goldenNugget,
        wta: parsed.wta,
        microHooks: parsed.microHooks ?? []
      };

    } catch (parseError) {
      console.error("❌ Script parsing failed:", parseError);
      // Fallback: try to extract sections from text
      script = extractScriptSections(aiResponse.content, selectedHook);
    }

    // Calculate actual word count
    const fullScript = `${script.hook} ${script.bridge} ${script.goldenNugget} ${script.wta}`;
    const wordCount = fullScript.split(/\s+/).length;

    console.log(`✅ Generated ${length} script (${wordCount} words) with ${ctaOptimization} optimization`);

    return NextResponse.json({ 
      success: true, 
      script,
      wordCount,
      tokensUsed: aiResponse.tokensUsed 
    });

  } catch (error) {
    console.error("❌ Scribo script generation API error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

/**
 * Get word count targets for each section based on script length
 */
function getWordTargets(length: string) {
  const targets = {
    "20s": { total: 90, hook: 15, bridge: 20, goldenNugget: 40, wta: 15 },
    "30s": { total: 140, hook: 20, bridge: 30, goldenNugget: 70, wta: 20 },
    "45s": { total: 210, hook: 25, bridge: 45, goldenNugget: 110, wta: 30 },
    "60s": { total: 290, hook: 30, bridge: 60, goldenNugget: 160, wta: 40 },
    "90s": { total: 440, hook: 40, bridge: 90, goldenNugget: 260, wta: 50 }
  };
  
  return targets[length as keyof typeof targets];
}

/**
 * Get number of micro hooks based on script length
 */
function getMicroHookCount(length: string): number {
  return ["20s", "30s", "45s"].includes(length) ? 2 : 3;
}

/**
 * Get CTA instructions based on optimization type
 */
function getCtaInstructions(ctaOptimization: string): string {
  switch (ctaOptimization) {
    case "comments":
      return `End with a single, friendly question that naturally encourages comments. Must end with "below" or "comments". Examples: "What's your experience with this? Share below!", "Which tip surprised you most? Let me know in the comments!"`;
    
    case "follow":
      return `End with a natural follow request that provides value. Examples: "Follow for more quick tips like this!", "Follow if this helped you!", "Follow for daily productivity hacks!"`;
    
    case "none":
      return `End with a value-focused statement that doesn't ask for specific action. Examples: "This changed everything for me.", "Now you have the tools to succeed.", "The choice is yours."`;
    
    default:
      return `End with a single, friendly question that naturally encourages comments. Must end with "below" or "comments". Examples: "What's your experience with this? Share below!", "Which tip surprised you most? Let me know in the comments!"`;
  }
}

/**
 * Fallback function to extract script sections from text format
 */
function extractScriptSections(content: string, selectedHook: string): ScriptSection {
  // Simple fallback - create basic structure
  return {
    hook: selectedHook,
    bridge: "Let me break this down for you.",
    goldenNugget: "Here's the key insight you need to know.",
    wta: "What do you think about this? Share your thoughts below!",
    microHooks: ["But here's the thing...", "Wait, it gets better..."]
  };
}