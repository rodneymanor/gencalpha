import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/services/gemini-service";

export interface ScriboHook {
  id: number;
  text: string;
  template: string;
  strength: string;
}

export interface HooksResponse {
  success: boolean;
  hooks?: ScriboHook[];
  error?: string;
}

/**
 * POST /api/scribo/hooks
 * Generates 20 hooks using the SCRIBO framework based on user input
 * Expects JSON: { topic: string }
 * Returns: { success: boolean, hooks: ScriboHook[], error?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ 
        success: false, 
        error: "Topic is required" 
      }, { status: 400 });
    }

    console.log("🎯 Generating Scribo hooks for topic:", topic);

    const systemInstructions = `You are Scribo, an expert hook generator using the proven SCRIBO HOOKS framework. Generate exactly 20 diverse, high-converting hooks for short video scripts.

CRITICAL RULES:
1. Each hook must be SPECIFIC to the topic: "${topic}"
2. NO generic money/income hooks unless the topic is specifically about finance
3. BANNED PHRASES: "Think again", "It's not what you think", "Game-changing", "Want a...", "Want to...", "Do you want..."
4. Use power words and emotional triggers
5. Create pattern interrupts that stop scrolling
6. Keep hooks under 15-20 words max
7. Each hook should be numbered 1-20

HOOK CATEGORIES TO USE:
- Conditional (If/Before/When)
- Problem/Solution reveals
- Contrarian takes
- Curiosity gaps  
- Personal insights
- Action-oriented
- Secret reveals
- Myth-busting
- Question hooks (not "Want" questions)
- Story teasers

TONE: Super friendly, relatable, conversational - like talking to your best friend. 5th-grade reading level maximum.

OUTPUT FORMAT:
Return a JSON array with exactly 20 hooks:
[
  {
    "id": 1,
    "text": "The actual hook text here",
    "template": "Template category (e.g. 'IF-THEN', 'SECRET REVEAL', etc.)",
    "strength": "Primary trigger (curiosity, fear, desire, etc.)"
  }
]`;

    const fullPrompt = `${systemInstructions}\n\nTopic: ${topic}\n\nGenerate 20 hooks now:`;

    const aiResponse = await generateContent({
      prompt: fullPrompt,
      model: "gemini-1.5-flash",
      temperature: 0.8,
      maxTokens: 1500,
    });

    if (!aiResponse.success || !aiResponse.content) {
      console.error("❌ AI response failed:", aiResponse.error);
      return NextResponse.json({ 
        success: false, 
        error: aiResponse.error ?? "Failed to generate hooks" 
      }, { status: 500 });
    }

    let hooks: ScriboHook[];
    try {
      // Try to parse as JSON array
      const parsed = JSON.parse(aiResponse.content);
      if (Array.isArray(parsed) && parsed.length === 20) {
        hooks = parsed;
      } else {
        throw new Error("Invalid hook format - expected array of 20 hooks");
      }
    } catch (parseError) {
      console.error("❌ JSON parsing failed:", parseError);
      // Fallback: extract hooks from text format
      hooks = extractHooksFromText(aiResponse.content);
    }

    // Validate hooks
    if (hooks.length !== 20) {
      console.warn("⚠️ Generated", hooks.length, "hooks instead of 20");
    }

    console.log("✅ Generated", hooks.length, "Scribo hooks successfully");

    return NextResponse.json({ 
      success: true, 
      hooks,
      tokensUsed: aiResponse.tokensUsed 
    });

  } catch (error) {
    console.error("❌ Scribo hooks API error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

/**
 * Fallback function to extract hooks from text format
 */
function extractHooksFromText(content: string): ScriboHook[] {
  const hooks: ScriboHook[] = [];
  const lines = content.split('\n');
  
  let currentId = 1;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Look for numbered hooks (1., 2., etc.)
    const numberMatch = trimmed.match(/^(\d+)\.?\s*(.+)/);
    if (numberMatch && currentId <= 20) {
      const hookText = numberMatch[2].replace(/["""]/g, '').trim();
      
      if (hookText.length > 10) { // Ensure it's substantial
        hooks.push({
          id: currentId,
          text: hookText,
          template: inferTemplate(hookText),
          strength: inferStrength(hookText)
        });
        currentId++;
      }
    }
  }
  
  // If we didn't get enough hooks, try to extract any quoted text
  if (hooks.length < 10) {
    const quotedMatches = content.match(/"([^"]{10,})"/g);
    if (quotedMatches) {
      quotedMatches.forEach((match, _index) => {
        if (hooks.length < 20) {
          const hookText = match.replace(/["""]/g, '').trim();
          hooks.push({
            id: hooks.length + 1,
            text: hookText,
            template: inferTemplate(hookText),
            strength: inferStrength(hookText)
          });
        }
      });
    }
  }
  
  return hooks.slice(0, 20); // Ensure max 20 hooks
}

/**
 * Infer template category from hook text
 */
function inferTemplate(hookText: string): string {
  const text = hookText.toLowerCase();
  
  if (text.startsWith('if ')) return 'IF-THEN';
  if (text.startsWith('before ')) return 'BEFORE';
  if (text.startsWith('when ') || text.startsWith('whenever ')) return 'WHEN';
  if (text.includes('secret')) return 'SECRET REVEAL';
  if (text.includes('stop ')) return 'STOP';
  if (text.includes('mistake')) return 'MISTAKE REVEAL';
  if (text.includes('truth')) return 'TRUTH REVEAL';
  if (text.includes('why ')) return 'WHY';
  if (text.includes('?')) return 'QUESTION';
  if (text.startsWith('here') || text.startsWith('this ')) return 'DIRECT';
  
  return 'GENERAL';
}

/**
 * Infer psychological trigger from hook text
 */
function inferStrength(hookText: string): string {
  const text = hookText.toLowerCase();
  
  if (text.includes('secret') || text.includes('hidden')) return 'curiosity';
  if (text.includes('mistake') || text.includes('wrong') || text.includes('fail')) return 'fear';
  if (text.includes('best') || text.includes('amazing') || text.includes('incredible')) return 'desire';
  if (text.includes('stop') || text.includes('never') || text.includes('avoid')) return 'urgency';
  if (text.includes('truth') || text.includes('reality')) return 'revelation';
  
  return 'interest';
}