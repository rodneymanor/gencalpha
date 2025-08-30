/**
 * Voice Persona Validation API
 * Validates content against persona profiles for authenticity scoring
 */

import { NextRequest, NextResponse } from "next/server";

import { scoreContentAuthenticity } from "@/lib/voice-persona/analyzers/authenticity-scorer";
import { validateContent } from "@/lib/voice-persona/generators/rules-engine";
import { VoiceProfile, SpeechPatterns, GenerationParameters, AuthenticityMetrics } from "@/lib/voice-persona/types";

interface ValidateContentRequest {
  content: string;
  voiceProfile: VoiceProfile;
  speechPatterns?: SpeechPatterns;
  generationParameters?: GenerationParameters;
  includeRuleValidation?: boolean;
  includeDetailedBreakdown?: boolean;
}

interface ValidateContentResponse {
  success: boolean;
  authenticity: AuthenticityMetrics;
  ruleValidation?: {
    valid: boolean;
    violations: string[];
  };
  detailedBreakdown?: string;
  recommendations?: string[];
  metadata: {
    contentLength: number;
    wordCount: number;
    processingTime: number;
    requestId: string;
  };
  timestamp: string;
}

export async function POST(request: NextRequest) {
  console.log("🎯 [VOICE_PERSONA_VALIDATE] Starting content validation request");

  const startTime = Date.now();
  const requestId = `validate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const body: ValidateContentRequest = await request.json();
    const {
      content,
      voiceProfile,
      speechPatterns,
      generationParameters,
      includeRuleValidation = false,
      includeDetailedBreakdown = false,
    } = body;

    // Validate required parameters
    if (!content || content.trim().length === 0) {
      console.log("❌ Missing or empty content");
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Content is required and cannot be empty",
          },
          metadata: {
            contentLength: 0,
            wordCount: 0,
            processingTime: Date.now() - startTime,
            requestId,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      );
    }

    if (!voiceProfile) {
      console.log("❌ Missing voice profile");
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Voice profile is required",
          },
          metadata: {
            contentLength: content.length,
            wordCount: content.split(/\s+/).length,
            processingTime: Date.now() - startTime,
            requestId,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      );
    }

    console.log(`🔍 [VOICE_PERSONA_VALIDATE] Validating content (${content.length} characters)`);

    // Score authenticity
    const authenticity = scoreContentAuthenticity(content, voiceProfile, speechPatterns);
    console.log(`📊 [VOICE_PERSONA_VALIDATE] Authenticity score: ${authenticity.overallScore}%`);

    // Rule validation if requested
    let ruleValidation: { valid: boolean; violations: string[] } | undefined;
    if (includeRuleValidation && generationParameters) {
      console.log(`🔒 [VOICE_PERSONA_VALIDATE] Running rule validation`);
      ruleValidation = validateContent(content, voiceProfile, generationParameters, speechPatterns);
      console.log(
        `${ruleValidation.valid ? "✅" : "❌"} [VOICE_PERSONA_VALIDATE] Rule validation: ${ruleValidation.violations.length} violations`,
      );
    }

    // Generate detailed breakdown if requested
    let detailedBreakdown: string | undefined;
    if (includeDetailedBreakdown) {
      const scorer = await import("@/lib/voice-persona/analyzers/authenticity-scorer");
      const authenticityScorer = scorer.createAuthenticityScorer();
      detailedBreakdown = authenticityScorer.getScoreBreakdown(authenticity);
    }

    // Generate recommendations based on scores
    const recommendations = generateRecommendations(authenticity, ruleValidation);

    const processingTime = Date.now() - startTime;

    const response: ValidateContentResponse = {
      success: true,
      authenticity,
      ruleValidation,
      detailedBreakdown,
      recommendations,
      metadata: {
        contentLength: content.length,
        wordCount: content.split(/\s+/).length,
        processingTime,
        requestId,
      },
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ [VOICE_PERSONA_VALIDATE] Validation completed in ${processingTime}ms`);

    return NextResponse.json(response);
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error("❌ [VOICE_PERSONA_VALIDATE] Validation error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error during content validation",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        metadata: {
          contentLength: 0,
          wordCount: 0,
          processingTime,
          requestId,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

/**
 * Generate recommendations based on validation results
 */
function generateRecommendations(
  authenticity: AuthenticityMetrics,
  ruleValidation?: { valid: boolean; violations: string[] },
): string[] {
  const recommendations: string[] = [];

  // Authenticity-based recommendations
  if (authenticity.hookAccuracy.score < 70) {
    recommendations.push("Consider using more of the persona's signature hooks and opening phrases");
  }

  if (authenticity.bridgeFrequency.score < 70) {
    recommendations.push("Increase usage of the persona's bridge phrases and transition words");
  }

  if (authenticity.vocabularyMatch.score < 70) {
    recommendations.push("Incorporate more words from the persona's vocabulary fingerprint");
  }

  if (authenticity.sentencePatterns.score < 70) {
    recommendations.push("Adjust sentence length and structure to better match the persona's patterns");
  }

  if (authenticity.rhythmReplication.score < 70) {
    recommendations.push("Modify energy level and pacing to match the persona's rhythm pattern");
  }

  // Overall score recommendations
  if (authenticity.overallScore >= 90) {
    recommendations.push("Excellent authenticity - content closely matches persona voice");
  } else if (authenticity.overallScore >= 80) {
    recommendations.push("Good authenticity - minor adjustments could improve alignment");
  } else if (authenticity.overallScore >= 70) {
    recommendations.push("Moderate authenticity - consider reviewing persona patterns more carefully");
  } else {
    recommendations.push("Low authenticity - significant revision needed to match persona voice");
  }

  // Rule validation recommendations
  if (ruleValidation && !ruleValidation.valid) {
    recommendations.push(`Rule violations detected: ${ruleValidation.violations.length} issues to address`);

    // Specific rule recommendations
    if (ruleValidation.violations.some((v) => v.includes("hook"))) {
      recommendations.push("Review hook usage to ensure it follows persona patterns");
    }

    if (ruleValidation.violations.some((v) => v.includes("bridge"))) {
      recommendations.push("Check bridge phrase frequency and placement");
    }

    if (ruleValidation.violations.some((v) => v.includes("signature"))) {
      recommendations.push("Include more signature elements from the persona profile");
    }
  }

  return recommendations;
}

export async function GET() {
  return NextResponse.json({
    message: "Voice Persona Content Validation API",
    description: "Validate content authenticity against voice persona profiles",
    usage: {
      "POST /api/voice-persona/validate": {
        body: {
          content: "Content to validate (required)",
          voiceProfile: "VoiceProfile object with persona patterns (required)",
          speechPatterns: "SpeechPatterns object for detailed analysis (optional)",
          generationParameters: "GenerationParameters for rule validation (optional)",
          includeRuleValidation: "Whether to run rule validation (optional, default: false)",
          includeDetailedBreakdown: "Whether to include detailed score breakdown (optional, default: false)",
        },
        response: {
          success: "boolean",
          authenticity: "AuthenticityMetrics with detailed scoring",
          ruleValidation: "Rule validation results if requested",
          detailedBreakdown: "Human-readable score breakdown if requested",
          recommendations: "Improvement recommendations",
          metadata: "Processing stats and request info",
        },
      },
    },
    features: [
      "Comprehensive authenticity scoring (85%+ target)",
      "Five-metric evaluation system",
      "Rule validation against persona constraints",
      "Detailed scoring breakdowns",
      "Actionable improvement recommendations",
      "Fast validation (typically <500ms)",
    ],
    metrics: [
      "Hook Accuracy (20%) - Matches persona's primary hooks",
      "Bridge Frequency (20%) - Uses bridges at documented rate",
      "Sentence Patterns (20%) - Follows persona's structure patterns",
      "Vocabulary Match (20%) - Uses persona's signature words",
      "Rhythm Replication (20%) - Maintains energy and pacing",
    ],
  });
}
