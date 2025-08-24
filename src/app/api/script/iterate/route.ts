// API route for iterative script refinement
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { IterationRequest, IterationResponse } from "@/lib/script-generation/conversation-types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const request: IterationRequest = await req.json();
    const { context, userMessage, requestedAction, actionDetails } = request;
    
    // Build conversation history for AI context
    const conversationHistory = context.history
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
    
    // Create action-specific prompt
    const actionPrompts: Record<string, string> = {
      refine_hook: `Refine the hook to be more attention-grabbing. Current hook: "${context.currentScript.elements.hook}"`,
      change_tone: `Change the script tone to ${actionDetails?.newTone || 'more engaging'}`,
      add_cta: `Add a compelling call-to-action that drives engagement`,
      expand_section: `Expand the ${actionDetails?.targetSection || 'content'} section with more detail`,
      shorten_content: `Shorten the script while maintaining key messages`,
      generate_variations: `Create 3 variations of the current hook`,
      apply_voice_persona: `Apply the voice persona: ${context.preferences.voicePersona}`,
      adjust_pacing: `Adjust the pacing for better flow and engagement`,
      add_emotional_beat: `Add an emotional beat to connect with the audience`,
      generate_initial: `Generate initial script based on the idea`
    };
    
    const prompt = `
You are an expert script writer helping to iteratively improve a script.

ORIGINAL IDEA: ${context.originalIdea}

CURRENT SCRIPT:
${context.currentScript.content}

SCRIPT ELEMENTS:
- Hook: ${context.currentScript.elements.hook}
- Bridge: ${context.currentScript.elements.bridge}
- Golden Nugget: ${context.currentScript.elements.goldenNugget}
- WTA (What To Avoid): ${context.currentScript.elements.wta}

CONVERSATION HISTORY:
${conversationHistory}

USER REQUEST: ${userMessage}

SPECIFIC ACTION: ${actionPrompts[requestedAction]}

Please provide:
1. An improved version of the script based on the requested action
2. Explanation of what was changed and why
3. Updated script elements (hook, bridge, golden nugget, wta)
4. 2-3 suggestions for what to improve next

Format your response as JSON:
{
  "updatedScript": "full script text",
  "elements": {
    "hook": "updated hook",
    "bridge": "updated bridge",
    "goldenNugget": "updated golden nugget",
    "wta": "updated wta"
  },
  "explanation": "what was changed and why",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Parse AI response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid AI response format");
    }
    
    const aiResponse = JSON.parse(jsonMatch[0]);
    
    // Calculate metadata
    const wordCount = aiResponse.updatedScript.split(/\s+/).length;
    const estimatedDuration = `${Math.ceil(wordCount / 150)}:${Math.floor((wordCount % 150) / 2.5).toString().padStart(2, '0')}`;
    
    // Build response
    const iterationResponse: IterationResponse = {
      success: true,
      updatedScript: {
        version: context.currentScript.version + 1,
        content: aiResponse.updatedScript,
        elements: aiResponse.elements,
        metadata: {
          ...context.currentScript.metadata,
          wordCount,
          duration: estimatedDuration,
          lastModified: new Date(),
          changeLog: [
            ...context.currentScript.metadata.changeLog,
            `${requestedAction}: ${aiResponse.explanation}`
          ]
        }
      },
      assistantMessage: aiResponse.explanation,
      suggestions: aiResponse.suggestions
    };
    
    return NextResponse.json(iterationResponse);
    
  } catch (error) {
    console.error("Script iteration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to iterate script",
        updatedScript: null,
        assistantMessage: "I encountered an error while refining the script. Please try again."
      } as IterationResponse,
      { status: 500 }
    );
  }
}