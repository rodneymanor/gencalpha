import { NextRequest, NextResponse } from "next/server";

import { GeminiService } from "@/lib/services/gemini-service";
import { ScriptComponent } from "@/types/script-panel";

interface AnalyzeTranscriptRequest {
  transcript: string;
  url?: string;
}

interface AnalyzedComponents {
  hook: string;
  bridge: string;
  goldenNugget: string;
  callToAction: string;
}

export async function POST(request: NextRequest) {
  try {
    const { transcript, url }: AnalyzeTranscriptRequest = await request.json();

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Transcript is required" },
        { status: 400 },
      );
    }

    const systemPrompt = "You are an expert script analyst that breaks down video transcripts into structured script components.";
    
    const prompt = `# Analyze Video Transcript into Script Components

Analyze the following transcript and extract four key script components. Return ONLY valid JSON.

TRANSCRIPT:
"""
${transcript}
"""

TASK: Extract and rewrite the transcript into these 4 components:

1. **Hook** - The opening 1-2 sentences that grab attention (15% of content)
2. **Bridge** - The context/setup that transitions from hook to main content (20% of content)  
3. **Golden Nugget** - The main value, insight, or story being shared (50% of content)
4. **Call to Action** - The closing that tells viewers what to do next (15% of content)

IMPORTANT:
- Each component should be a coherent, well-written section
- Maintain the original message and tone
- Clean up any transcription errors or filler words
- Make each section flow naturally into the next
- If the transcript is very short, still create all 4 components even if brief

OUTPUT (STRICT JSON):
{
  "hook": "string - compelling opening that grabs attention",
  "bridge": "string - context and transition to main content",
  "goldenNugget": "string - the main value/insight/story",
  "callToAction": "string - what viewers should do next"
}`;

    const gemini = GeminiService.getInstance?.() ?? new GeminiService();
    const ai = await gemini.generateContent<AnalyzedComponents>({
      prompt,
      systemPrompt,
      model: "gemini-1.5-flash",
      temperature: 0.3,
      maxTokens: 2000,
      responseType: "json",
      retries: 2,
      timeout: 30000,
    });

    if (!ai.success || !ai.content) {
      return NextResponse.json(
        { success: false, error: ai.error ?? "Failed to analyze transcript" },
        { status: 500 },
      );
    }

    const analyzed = ai.content as AnalyzedComponents;
    
    // Validate the response has all required fields
    if (!analyzed.hook || !analyzed.bridge || !analyzed.goldenNugget || !analyzed.callToAction) {
      return NextResponse.json(
        { success: false, error: "Invalid AI response structure" },
        { status: 500 },
      );
    }

    // Create properly structured script components
    const components: ScriptComponent[] = [
      {
        id: "hook-analyzed",
        type: "hook",
        label: "Hook",
        content: analyzed.hook,
        icon: "H",
        metadata: {
          source: "ai-analysis",
        },
      },
      {
        id: "bridge-analyzed",
        type: "bridge",
        label: "Bridge",
        content: analyzed.bridge,
        icon: "B",
        metadata: {
          source: "ai-analysis",
        },
      },
      {
        id: "nugget-analyzed",
        type: "nugget",
        label: "Golden Nugget",
        content: analyzed.goldenNugget,
        icon: "G",
        metadata: {
          source: "ai-analysis",
        },
      },
      {
        id: "cta-analyzed",
        type: "cta",
        label: "Call to Action",
        content: analyzed.callToAction,
        icon: "C",
        metadata: {
          source: "ai-analysis",
        },
      },
    ];

    // Also include the original transcript for reference
    components.push({
      id: "transcript-original",
      type: "transcript",
      label: "Original Transcript",
      content: transcript,
      icon: "T",
      metadata: {
        isOriginal: true,
        url: url,
      },
    });

    return NextResponse.json({ 
      success: true, 
      components,
      analyzed,
    });
  } catch (error) {
    console.error("❌ [ANALYZE_TRANSCRIPT] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}