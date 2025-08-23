/**
 * Voice Persona Analysis API
 * Main endpoint for analyzing social media user voice personas
 */

import { NextRequest, NextResponse } from "next/server";

import { analyzeVoicePersona } from "@/lib/voice-persona/orchestrators/voice-analysis-orchestrator";
import { UserIdentifier, PersonaAnalysisResult } from "@/lib/voice-persona/types";

interface AnalyzePersonaRequest {
  handle: string;
  platform: "tiktok" | "instagram";
  userId?: string;
  config?: {
    maxVideos?: number;
    batchSize?: number;
    patternSensitivity?: "low" | "medium" | "high";
    enableEmotionalAnalysis?: boolean;
  };
}

interface AnalyzePersonaResponse extends PersonaAnalysisResult {
  timestamp: string;
}

export async function POST(request: NextRequest) {
  console.log("🎭 [VOICE_PERSONA_API] Starting persona analysis request");

  try {
    const body: AnalyzePersonaRequest = await request.json();
    const { handle, platform, userId, config } = body;

    // Validate required parameters
    if (!handle) {
      console.log("❌ Missing handle parameter");
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Handle is required",
          },
          metadata: {
            processingTime: 0,
            videosProcessed: 0,
            requestId: `req_${Date.now()}`,
          },
          timestamp: new Date().toISOString(),
        } satisfies AnalyzePersonaResponse,
        { status: 400 }
      );
    }

    if (!platform || !["tiktok", "instagram"].includes(platform)) {
      console.log("❌ Invalid platform parameter");
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_PLATFORM",
            message: "Platform must be 'tiktok' or 'instagram'",
          },
          metadata: {
            processingTime: 0,
            videosProcessed: 0,
            requestId: `req_${Date.now()}`,
          },
          timestamp: new Date().toISOString(),
        } satisfies AnalyzePersonaResponse,
        { status: 400 }
      );
    }

    console.log(`🔍 [VOICE_PERSONA_API] Analyzing persona for @${handle} on ${platform}`);

    // Create user identifier
    const userIdentifier: UserIdentifier = {
      handle,
      platform,
      userId,
    };

    // Configure analysis if provided
    const analysisConfig = config ? {
      maxVideos: config.maxVideos || 25,
      batchSize: config.batchSize || 5,
      analysis: {
        minTranscriptLength: 50,
        patternSensitivity: config.patternSensitivity || "medium",
        enableEmotionalAnalysis: config.enableEmotionalAnalysis ?? true,
      },
    } : undefined;

    // Perform voice persona analysis
    const result = await analyzeVoicePersona(userIdentifier, analysisConfig);

    console.log(`${result.success ? '✅' : '❌'} [VOICE_PERSONA_API] Analysis completed`);

    if (result.success) {
      console.log(`📊 [VOICE_PERSONA_API] Persona profile created:`);
      console.log(`   - Videos analyzed: ${result.metadata.videosProcessed}`);
      console.log(`   - Processing time: ${result.metadata.processingTime}ms`);
      console.log(`   - Hooks identified: ${result.personaProfile?.voiceProfile.hooks.length}`);
      console.log(`   - Bridge patterns: ${Object.keys(result.personaProfile?.voiceProfile.bridges || {}).length}`);
    }

    const response: AnalyzePersonaResponse = {
      ...result,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("❌ [VOICE_PERSONA_API] Analysis error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error during persona analysis",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        metadata: {
          processingTime: 0,
          videosProcessed: 0,
          requestId: `req_${Date.now()}`,
        },
        timestamp: new Date().toISOString(),
      } satisfies AnalyzePersonaResponse,
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("handle");
  const platform = searchParams.get("platform") as "tiktok" | "instagram";
  const maxVideos = parseInt(searchParams.get("maxVideos") ?? "25");
  const patternSensitivity = searchParams.get("patternSensitivity") as "low" | "medium" | "high" || "medium";

  if (!handle || !platform) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "Handle and platform parameters are required",
        },
        metadata: {
          processingTime: 0,
          videosProcessed: 0,
          requestId: `req_${Date.now()}`,
        },
        timestamp: new Date().toISOString(),
      } satisfies AnalyzePersonaResponse,
      { status: 400 }
    );
  }

  // Forward to POST handler
  const mockRequest = new Request(request.url, {
    method: "POST",
    headers: request.headers,
    body: JSON.stringify({ 
      handle, 
      platform, 
      config: { 
        maxVideos, 
        patternSensitivity 
      } 
    }),
  });

  return POST(mockRequest as NextRequest);
}