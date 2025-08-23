/**
 * Voice Persona Script Generation API
 * Generates scripts using existing persona profiles
 */

import { NextRequest, NextResponse } from "next/server";

import { generateScriptWithPersona } from "@/lib/voice-persona/orchestrators/voice-analysis-orchestrator";
import { 
  ScriptGenerationInput, 
  ScriptGenerationResult, 
  PersonaProfile 
} from "@/lib/voice-persona/types";

interface GenerateScriptRequest {
  personaProfile: PersonaProfile;
  topic: string;
  targetLength?: number; // in seconds
  style?: "hook-heavy" | "educational" | "conversational" | "energetic";
  customInstructions?: string;
}

interface GenerateScriptResponse extends ScriptGenerationResult {
  timestamp: string;
}

export async function POST(request: NextRequest) {
  console.log("📝 [VOICE_PERSONA_GENERATE] Starting script generation request");

  try {
    const body: GenerateScriptRequest = await request.json();
    const { personaProfile, topic, targetLength = 30, style, customInstructions } = body;

    // Validate required parameters
    if (!personaProfile) {
      console.log("❌ Missing persona profile");
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Persona profile is required",
          },
          metadata: {
            generationTime: 0,
            requestId: `req_${Date.now()}`,
          },
          timestamp: new Date().toISOString(),
        } satisfies GenerateScriptResponse,
        { status: 400 }
      );
    }

    if (!topic || topic.trim().length === 0) {
      console.log("❌ Missing or empty topic");
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Topic is required and cannot be empty",
          },
          metadata: {
            generationTime: 0,
            requestId: `req_${Date.now()}`,
          },
          timestamp: new Date().toISOString(),
        } satisfies GenerateScriptResponse,
        { status: 400 }
      );
    }

    // Validate persona profile structure
    if (!personaProfile.voiceProfile || !personaProfile.speechPatterns || !personaProfile.generationParameters) {
      console.log("❌ Invalid persona profile structure");
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_PERSONA",
            message: "Persona profile is missing required components (voiceProfile, speechPatterns, generationParameters)",
          },
          metadata: {
            generationTime: 0,
            requestId: `req_${Date.now()}`,
          },
          timestamp: new Date().toISOString(),
        } satisfies GenerateScriptResponse,
        { status: 400 }
      );
    }

    console.log(`🎬 [VOICE_PERSONA_GENERATE] Generating script for persona ${personaProfile.personaId}`);
    console.log(`📝 [VOICE_PERSONA_GENERATE] Topic: "${topic}" | Length: ${targetLength}s | Style: ${style || "default"}`);

    // Create generation input
    const generationInput: ScriptGenerationInput = {
      personaId: personaProfile.personaId,
      topic,
      targetLength,
      style,
      customInstructions,
    };

    // Generate script using persona
    const result = await generateScriptWithPersona(generationInput, personaProfile);

    console.log(`${result.success ? '✅' : '❌'} [VOICE_PERSONA_GENERATE] Script generation completed`);

    if (result.success && result.script) {
      console.log(`📊 [VOICE_PERSONA_GENERATE] Script generated:`);
      console.log(`   - Word count: ${result.script.metadata.wordCount}`);
      console.log(`   - Estimated length: ${result.script.metadata.actualLength}s`);
      console.log(`   - Authenticity score: ${result.script.authenticity.overallScore}%`);
      console.log(`   - Generation time: ${result.metadata.generationTime}ms`);
    } else if (result.error) {
      console.log(`❌ [VOICE_PERSONA_GENERATE] Generation failed: ${result.error.message}`);
    }

    const response: GenerateScriptResponse = {
      ...result,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("❌ [VOICE_PERSONA_GENERATE] Generation error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error during script generation",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        metadata: {
          generationTime: 0,
          requestId: `req_${Date.now()}`,
        },
        timestamp: new Date().toISOString(),
      } satisfies GenerateScriptResponse,
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Voice Persona Script Generation API",
    description: "Generate authentic scripts using voice persona profiles",
    usage: {
      "POST /api/voice-persona/generate": {
        body: {
          personaProfile: "Complete PersonaProfile object (required)",
          topic: "Script topic/subject (required)",
          targetLength: "Target length in seconds (optional, default: 30)",
          style: "Generation style: hook-heavy | educational | conversational | energetic (optional)",
          customInstructions: "Additional generation instructions (optional)",
        },
        response: {
          success: "boolean",
          script: "Generated script with structure and authenticity metrics",
          error: "Error details if generation failed",
          metadata: "Generation time and request ID",
        },
      },
    },
    features: [
      "Authentic voice replication with 85%+ accuracy",
      "30-second optimized script structure",
      "Hook → Bridge → Core → Escalation → Close format",
      "Pattern validation and authenticity scoring",
      "Multiple generation styles",
      "Comprehensive error handling",
    ],
    scriptStructure: {
      hook: "0-3 seconds - Opening attention grabber using persona hooks",
      bridge: "3-5 seconds - Transition phrase using persona bridges", 
      coreMessage: "5-20 seconds - Main content with persona vocabulary",
      escalation: "20-25 seconds - Energy spike with persona excitement patterns",
      close: "25-30 seconds - Conclusion using persona closing patterns",
    },
    authenticityMetrics: [
      "Hook Accuracy - Matches persona's primary hooks (20%)",
      "Bridge Frequency - Uses bridges at documented rate (20%)",
      "Sentence Patterns - Follows persona's structure patterns (20%)",
      "Vocabulary Match - Uses persona's signature words (20%)",
      "Rhythm Replication - Maintains energy and pacing (20%)",
    ],
  });
}