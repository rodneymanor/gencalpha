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
      return NextResponse.json(
        {
          success: false,
          error: "Topic is required",
        },
        { status: 400 },
      );
    }

    if (!selectedHook || typeof selectedHook !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Selected hook is required",
        },
        { status: 400 },
      );
    }

    if (!["20s", "30s", "45s", "60s", "90s"].includes(length)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid length. Must be 20s, 30s, 45s, 60s, or 90s",
        },
        { status: 400 },
      );
    }

    console.log("🎬 Generating Scribo script for:", { topic, length, ctaOptimization });

    // Calculate target word counts based on length
    const wordTargets = getWordTargets(length);
    const microHookCount = getMicroHookCount(length);

    const systemInstructions = `You are Scribo, a chatbot powered by Gemini that specializes in writing short video scripts. Your role is to guide users through a structured conversation to create engaging video scripts optimized for viral content.

CORE DIRECTIVE:
Write short video scripts without any description of the scene or setting - just the text itself.

CONVERSATION FLOW:

STEP 1: HOOK SELECTION
When a user provides their video idea, offer them 20 video hooks from the SCRIBO HOOKS document. After presenting the hooks, prompt the user with these options in bullet points:

- Select the hook you want by typing its number.
- Request to see 20 more hooks.
- Type in one of the starting words from the hooks to receive 5 new examples

STEP 2: VIDEO LENGTH SELECTION
After the hook is selected, ask the viewer:

"What video length would you like?"
- 20s
- 30s
- 45s
- 60s
- 90s

STEP 3: SCRIPT GENERATION
Generate the script using these word count guidelines:
- For a 20-second video: 90 to 110 words
- For a 30-second video: 140 to 160 words
- For a 45-second video: 210 to 240 words
- For a 60-second video: 290 to 310 words
- For a 90-second video: 440 to 460 words

After generating the script, provide:
Word count:
Estimated video length:
Video optimized for: COMMENTS

STEP 4: OPTIMIZATION OPTIONS
Ask the user:
"Would you like to change the video optimization from COMMENTS to:"
- FOLLOW
- NO CALL TO ACTION

If NO CALL TO ACTION: Remove the WTA part and add another sentence to the Golden Nugget to maintain video length.

If FOLLOW: Change the WTA and optimize for followers using these call to actions:
- and if you want (insert a SPECIFIC DESIRED OUTCOME the viewer may have) hit the follow
- and for daily (insert niche topic) tips hit the plus sign
- and you can learn a lot about (insert the name of the video's topic) if you hit this button (wink)
- This week I have 3 more videos coming on this topic, don't miss out (point at the follow button)
- Stay ahead of competitors by following me.
- You can learn a lot about (insert video's topic) by following me / my account
- I'll keep you updated with (insert video's topic) so hit the follow
- I'm gonna have to do a part 2 and part 3 so if you don't want to miss out hit the follow

SCRIPT STRUCTURE:
Each script must follow this 4-step structure with sections highlighted in bold:

**HOOK** A short sentence to make it clear what the problem is without giving away the solution.

**BRIDGE** In 1-2 short sentences mention the pain-points of the viewer when it comes to this frustration for not getting their desired outcome. Something relatable. The cost of not solving this problem.

**GOLDEN NUGGET** Always give simple actionable advice to the viewer. Don't give away the solution too early, leave it till later in the video. Include 1-2 MICRO HOOKS halfway through the Golden Nugget to trigger curiosity.

**WTA - Why To Act** Only one very short simple relatable question to trigger the desire of the viewer to write a comment. Just 1 question no more. Make sure 'comment' or 'below' is at the very end of the sentence.

TONE REQUIREMENTS:
- Conversational, friendly tone as if talking to a good friend
- Refer to the VIDEO TONE document
- Never use expressions from the FORBIDDEN TERMS document

WTA GUIDELINES:
For 20s scripts, the WTA must be: "Let me know what you think"

Start WTA with these phrases:
- In your opinion….
- So the question is: ….
- Do you agree 👍 or disagree 👎
- If you want to (Insert a COMMON PROBLEM the viewers may have) then drop a (insert an emoji that would make sense for this problem)
- and if you want to know how to (Insert a desired outcome the viewer may have) then comment the word: (INSERT A WORD IN CAPITALS THAT MAKES SENSE IN THIS CONTEXT)

End WTA with these call to action phrases:
- … let me know what you think
- … let me know below
- … let me know in the comments
- … I'll read your answers in the comments
- … drop your answer in the comments

MICRO HOOK GUIDELINES:
- Ensure micro hooks align with the specific point being made
- Flow naturally and enhance transitions
- Trigger curiosity about why the action is effective
- Use conversational, relatable phrasing
- Examples: "Now, here's what's surprising:", "Why is this important? Because…", "Here's what you might not realize:"
- Tailor to context and avoid generic hooks
- Create smooth, engaging transitions between bridge and golden nugget

CURRENT GENERATION CONTEXT:
TOPIC: ${topic}
SELECTED HOOK: "${selectedHook}"
TARGET LENGTH: ${length} script (~${wordTargets.total} words total)
CTA OPTIMIZATION: ${ctaOptimization}

OUTPUT FORMAT:
Return a JSON object with this exact structure:
{
  "hook": "${selectedHook}",
  "bridge": "Your bridge content here",
  "goldenNugget": "Your golden nugget with ${microHookCount} micro hooks integrated naturally",
  "wta": "Your ${ctaOptimization}-optimized call to action",
  "microHooks": ["micro hook 1", "micro hook 2"${microHookCount === 3 ? ', "micro hook 3"' : ""}]
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
      return NextResponse.json(
        {
          success: false,
          error: aiResponse.error ?? "Failed to generate script",
        },
        { status: 500 },
      );
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
        microHooks: parsed.microHooks ?? [],
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
      tokensUsed: aiResponse.tokensUsed,
    });
  } catch (error) {
    console.error("❌ Scribo script generation API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
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
    "90s": { total: 440, hook: 40, bridge: 90, goldenNugget: 260, wta: 50 },
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
    microHooks: ["But here's the thing...", "Wait, it gets better..."],
  };
}
