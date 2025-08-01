import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/services/gemini-service";

export interface CtaOptimizationRequest {
  script: {
    hook: string;
    bridge: string;
    goldenNugget: string;
    wta: string;
  };
  newOptimization: "comments" | "follow" | "none";
  topic: string;
}

export interface CtaResponse {
  success: boolean;
  optimizedWta?: string;
  error?: string;
}

/**
 * POST /api/scribo/optimize-cta
 * Optimizes the WTA (Why To Act) section for different engagement types
 * Expects JSON: { script: object, newOptimization: string, topic: string }
 * Returns: { success: boolean, optimizedWta: string, error?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { script, newOptimization, topic } = await request.json();

    // Validation
    if (!script || !script.wta) {
      return NextResponse.json({ 
        success: false, 
        error: "Script with WTA section is required" 
      }, { status: 400 });
    }

    if (!["comments", "follow", "none"].includes(newOptimization)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid optimization type. Must be comments, follow, or none" 
      }, { status: 400 });
    }

    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ 
        success: false, 
        error: "Topic is required" 
      }, { status: 400 });
    }

    console.log("🎯 Optimizing CTA for:", newOptimization);

    const systemInstructions = `You are Scribo's CTA optimization specialist. Your job is to rewrite ONLY the WTA (Why To Act) section of a script to optimize for ${newOptimization}.

CURRENT SCRIPT CONTEXT:
Topic: ${topic}
Hook: "${script.hook}"
Bridge: "${script.bridge}"
Golden Nugget: "${script.goldenNugget}"
Current WTA: "${script.wta}"

CTA OPTIMIZATION RULES:
${getCtaOptimizationRules(newOptimization)}

CRITICAL REQUIREMENTS:
- Keep the same friendly, conversational tone as the original script
- 5th-grade reading level MAX
- Must feel natural and not pushy
- Should flow naturally from the golden nugget
- Length: 15-25 words maximum

FORBIDDEN TERMS (NEVER USE):
- "Think again"
- "It's not what you think" 
- "Game-changing"
- Any overly formal language

OUTPUT FORMAT:
Return ONLY the new WTA text. No JSON, no labels, just the optimized call-to-action text.`;

    const aiResponse = await generateContent({
      prompt: systemInstructions,
      model: "gemini-1.5-flash",
      temperature: 0.7,
      maxTokens: 200,
    });

    if (!aiResponse.success || !aiResponse.content) {
      console.error("❌ AI response failed:", aiResponse.error);
      return NextResponse.json({ 
        success: false, 
        error: aiResponse.error ?? "Failed to optimize CTA" 
      }, { status: 500 });
    }

    const optimizedWta = aiResponse.content.trim();

    console.log(`✅ Optimized CTA for ${newOptimization}: "${optimizedWta}"`);

    return NextResponse.json({ 
      success: true, 
      optimizedWta,
      tokensUsed: aiResponse.tokensUsed 
    });

  } catch (error) {
    console.error("❌ Scribo CTA optimization API error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

/**
 * Get CTA optimization rules based on type
 */
function getCtaOptimizationRules(optimization: string): string {
  switch (optimization) {
    case "comments":
      return `COMMENTS OPTIMIZATION:
- End with a single, friendly question that naturally encourages comments
- MUST end with "below" or "comments"
- Make it personal and relatable
- Examples: "What's your experience with this? Share below!", "Which tip surprised you most? Let me know in the comments!", "Have you tried this before? Tell me about it in the comments!"`;
    
    case "follow":
      return `FOLLOW OPTIMIZATION:
- End with a natural follow request that provides clear value
- Explain WHY they should follow (what they'll get)
- Make it feel like an invitation, not a demand
- Examples: "Follow for more quick tips like this!", "Follow if this helped you!", "Follow for daily productivity hacks!", "Follow me for more content creation secrets!"`;
    
    case "none":
      return `NO CALL TO ACTION:
- End with a value-focused statement that doesn't ask for specific action
- Leave them with inspiration or motivation
- Close the loop on the topic naturally
- Examples: "This changed everything for me.", "Now you have the tools to succeed.", "The choice is yours.", "You've got this!"`;
    
    default:
      return `COMMENTS OPTIMIZATION:
- End with a single, friendly question that naturally encourages comments
- MUST end with "below" or "comments"
- Make it personal and relatable`;
  }
}