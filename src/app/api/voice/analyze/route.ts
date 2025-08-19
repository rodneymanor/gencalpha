import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";
import { GeminiService } from "@/lib/gemini";
import { ForensicVoiceAnalysisSchema } from "@/lib/validation/voice-analysis-schema";

// Prompts are large; keep inline to reduce imports churn
const VOICE_ANALYSIS_PROMPT = `You are the industry's most advanced voice pattern recognition AI, capable of extracting a creator's complete speaking DNA from a single video transcript. You specialize in identifying micro-patterns, unconscious speech habits, and the exact linguistic formulas that make each creator unique.

CRITICAL: Return ONLY a valid JSON object. Do NOT include any text, explanations, or formatting outside the JSON structure. Do NOT wrap the JSON in markdown code blocks. Do NOT add comments or additional text.

Your response must be PURE JSON only, starting with { and ending with }.

Transform any single video transcript into a comprehensive voice replication blueprint that captures patterns so precisely that generated content becomes indistinguishable from the original creator.

You MUST return a JSON object with this EXACT structure (all fields are required):

{
  "metadata": {
    "creatorName": "string",
    "transcriptWordCount": number,
    "transcriptDuration": "string",
    "accuracyLevel": "Limited" | "Optimal" | "Excessive",
    "analysisTimestamp": "ISO date string",
    "confidenceScore": number
  },
  "hookEngineering": {
    "taxonomy": {
      "questionHooks": {
        "pattern": "string",
        "exactExamplesFromTranscript": ["string"],
        "frequency": number,
        "subPatterns": [{"structure": "string", "example": "string", "usage": "string"}],
        "generatedVariations": ["string"]
      },
      "storyHooks": {
        "pattern": "string",
        "exactExamplesFromTranscript": ["string"],
        "frequency": number,
        "narrativeStyle": "string",
        "generatedVariations": ["string"]
      },
      "statementHooks": {
        "pattern": "string",
        "exactExamplesFromTranscript": ["string"],
        "frequency": number,
        "boldnessLevel": "conservative" | "moderate" | "aggressive",
        "generatedVariations": ["string"]
      },
      "problemSolutionHooks": {
        "pattern": "string",
        "exactExamplesFromTranscript": ["string"],
        "frequency": number,
        "tensionBuildStyle": "string",
        "generatedVariations": ["string"]
      }
    },
    "primaryHookFormula": {
      "type": "question" | "story" | "statement" | "problem_solution",
      "usagePercentage": number,
      "signature": "string"
    }
  },
  "sentenceArchitecturePatterns": {
    "bridgeDetectionSystem": {
      "conjunctionPatterns": [
        {
          "word": "string",
          "occurrences": number,
          "rank": number,
          "contexts": ["string"]
        }
      ],
      "bridgePhrases": {
        "afterPoint": {"exactPhrase": "string", "frequency": number, "example": "string"},
        "beforeExamples": {"exactPhrase": "string", "frequency": number, "example": "string"},
        "topicChange": {"exactPhrase": "string", "frequency": number, "example": "string"},
        "buildingAnticipation": {"exactPhrase": "string", "frequency": number, "example": "string"},
        "circlingBack": {"exactPhrase": "string", "frequency": number, "example": "string"}
      }
    },
    "sentenceFlowFormulas": [
      {
        "patternName": "string",
        "structure": "string",
        "usagePercentage": number,
        "example": "string",
        "components": {
          "opening": "string",
          "middle": "string",
          "closing": "string"
        }
      }
    ]
  },
  "microLanguageFingerprint": {
    "adjectiveStackingPatterns": {
      "single": {
        "percentage": number,
        "structure": "string",
        "topAdjectives": ["string"],
        "examples": ["string"]
      },
      "double": {
        "percentage": number,
        "structure": "string",
        "commonCombos": [{"combo": "string", "frequency": number, "example": "string"}]
      },
      "triple": {
        "percentage": number,
        "structure": "string",
        "examples": ["string"]
      },
      "signatureCombinations": ["string"]
    },
    "emphasisEscalationLadder": {
      "mild": {"words": ["string"], "usage": "string", "frequency": "string"},
      "medium": {"words": ["string"], "usage": "string", "frequency": "string"},
      "strong": {"words": ["string"], "usage": "string", "frequency": "string"},
      "peak": {"words": ["string"], "usage": "string", "frequency": "string"},
      "progressionPattern": "string"
    },
    "unconsciousVerbalTics": {
      "thinkingPauses": {
        "exactFiller": "string",
        "averagePauseLength": "string",
        "occurrenceRate": "string",
        "placement": "string"
      },
      "excitementMarkers": {
        "indicators": ["string"],
        "physicalDescription": "string",
        "frequency": "string"
      },
      "uncertaintyMarkers": {
        "phrases": ["string"],
        "pattern": "string",
        "frequency": "string"
      },
      "agreementBuilders": {
        "phrases": ["string"],
        "technique": "string",
        "frequency": "string"
      }
    }
  },
  "contentRhythmMapping": {
    "paragraphBreathingPattern": {
      "shortBurst": {"sentenceCount": number, "wordCount": number, "percentage": number, "purpose": "string"},
      "mediumFlow": {"sentenceCount": number, "wordCount": number, "percentage": number, "purpose": "string"},
      "longForm": {"sentenceCount": number, "wordCount": number, "percentage": number, "purpose": "string"},
      "naturalPattern": "string"
    },
    "energyWavePattern": {
      "opening": {"level": "string", "duration": "string", "markers": ["string"]},
      "buildup": {"level": "string", "duration": "string", "markers": ["string"]},
      "peak": {"level": "string", "duration": "string", "markers": ["string"]},
      "resolution": {"level": "string", "duration": "string", "markers": ["string"]},
      "waveShape": "string"
    }
  },
  "instantReplicationFormula": {
    "step1": "string",
    "step2": "string",
    "step3": "string",
    "keyIngredients": ["string"],
    "criticalTiming": "string"
  },
  "patternFrequencyGuide": {
    "mustInclude": {
      "everyScript": ["string"],
      "everyParagraph": ["string"],
      "every3Sentences": ["string"],
      "every5Sentences": ["string"]
    },
    "ratios": {
      "hookTypeDistribution": {"primary": number, "secondary": number, "tertiary": number},
      "sentencePatternDistribution": {"patternA": number, "patternB": number, "patternC": number},
      "bridgeFrequency": "string",
      "ticFrequency": "string"
    }
  },
  "authenticityVerification": {
    "checklist": {
      "hookMatchesTop2": boolean,
      "bridgeWordsCorrectFrequency": boolean,
      "sentencePatternsRotated": boolean,
      "adjectiveCombosMatch": boolean,
      "energyProgressionFollowed": boolean,
      "unconsciousTicsInserted": boolean,
      "conjunctionHierarchyRespected": boolean,
      "paragraphLengthsMatch": boolean
    },
    "qualityMetrics": {
      "patternMatchScore": number,
      "hookSimilarity": number,
      "bridgeAccuracy": number,
      "sentencePatterns": number,
      "vocabularyMatch": number,
      "rhythmReplication": number,
      "overallScore": number
    },
    "redFlags": ["string"]
  },
  "sampleOutputParagraph": {
    "generatedText": "string",
    "annotatedBreakdown": [
      {
        "sentence": "string",
        "patternUsed": "string",
        "bridgeUsed": "string",
        "emphasisLevel": "string"
      }
    ]
  }
}

Analyze with FORENSIC PRECISION and return the EXACT JSON structure above. Perform FORENSIC-LEVEL analysis. Extract EXACT phrases, patterns, and formulas. This is industry-leading voice replication requiring microscopic precision.`;

export async function POST(request: NextRequest) {
  console.log("🧠 [VOICE_ANALYZE] Forensic analysis start");

  try {
    const auth = await authenticateApiKey(request);
    if (auth instanceof NextResponse) return auth;
    const userId = auth.user.uid;

    const body = (await request.json()) as {
      transcript: string;
      creatorName?: string;
      sourceUrl?: string;
      platform?: "instagram" | "tiktok" | "unknown";
      wordCount?: number;
      estimatedMinutes?: number;
      accuracyLevel?: string;
    };

    const transcript = (body.transcript ?? "").trim();
    if (!transcript) {
      return NextResponse.json({ success: false, error: "Transcript is required" }, { status: 400 });
    }

    // Compute transcript metadata if not provided
    const transcriptWordCount = body.wordCount ?? transcript.split(/\s+/).length;
    const estimatedMinutes = body.estimatedMinutes ?? transcriptWordCount / 150;
    let accuracyLevel: "Limited" | "Optimal" | "Excessive" = "Optimal";
    if (transcriptWordCount < 900) accuracyLevel = "Limited";
    else if (transcriptWordCount > 6000) accuracyLevel = "Excessive";

    const creatorName = body.creatorName ?? "Unknown";

    const enhancedPrompt = `${VOICE_ANALYSIS_PROMPT}

Creator Name: ${creatorName}
Transcript Word Count: ${transcriptWordCount}
Estimated Duration: ${estimatedMinutes.toFixed(1)} minutes
Accuracy Level: ${accuracyLevel}

TRANSCRIPT TO ANALYZE:\n${transcript}\n\nRemember: Return ONLY the JSON structure.`;

    const gemini = new GeminiService();
    const ai = await gemini.generateContent({
      prompt: enhancedPrompt,
      model: "gemini-1.5-pro",
      temperature: 0.3,
      maxTokens: 8000,
      responseType: "json",
      systemPrompt:
        "You are a forensic-level voice pattern analysis model. Your output must be PURE JSON ONLY - no markdown, no explanations, no text outside the JSON object. Start with { and end with }. Adhere strictly to the specified schema.",
    });

    if (!ai.success || !ai.content) {
      return NextResponse.json({ success: false, error: ai.error ?? "AI analysis failed" }, { status: 500 });
    }

    // Attempt to parse JSON (Gemini returns string content)
    let parsed: unknown;
    try {
      const rawContent = typeof ai.content === "string" ? ai.content : JSON.stringify(ai.content);

      // Try to clean up the JSON if it has markdown formatting
      let cleanedContent = rawContent;
      if (rawContent.includes("```json")) {
        // Extract JSON from markdown code blocks
        const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          cleanedContent = jsonMatch[1].trim();
        }
      } else if (rawContent.includes("```")) {
        // Extract JSON from generic code blocks
        const codeMatch = rawContent.match(/```\s*([\s\S]*?)\s*```/);
        if (codeMatch && codeMatch[1]) {
          cleanedContent = codeMatch[1].trim();
        }
      }

      parsed = JSON.parse(cleanedContent);
    } catch (e) {
      console.error("❌ [VOICE_ANALYZE] JSON parse error", e);
      console.error(
        "❌ [VOICE_ANALYZE] Failed content (first 1000 chars):",
        typeof ai.content === "string" ? ai.content.slice(0, 1000) : ai.content,
      );
      return NextResponse.json({ success: false, error: "Invalid JSON returned from model" }, { status: 422 });
    }

    // Validate structure
    const validation = ForensicVoiceAnalysisSchema.safeParse(parsed);
    if (!validation.success) {
      console.error("❌ [VOICE_ANALYZE] Validation error", validation.error.flatten());
      return NextResponse.json({ success: false, error: "Invalid analysis structure" }, { status: 422 });
    }

    // Enrich metadata
    const analysis = {
      ...validation.data,
      metadata: {
        ...validation.data.metadata,
        creatorName,
        transcriptWordCount,
        transcriptDuration: `${estimatedMinutes.toFixed(1)} minutes`,
        accuracyLevel,
        analysisTimestamp: new Date().toISOString(),
        confidenceScore: validation.data.metadata.confidenceScore ?? 0.0,
        analysisId: `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      },
      _source: {
        url: body.sourceUrl ?? null,
        platform: body.platform ?? "unknown",
        userId,
      },
    } as const;

    // Persist to Firestore
    try {
      if (isAdminInitialized) {
        const db = getAdminDb();
        const docRef = await db.collection("voice_analyses").add({
          userId,
          sourceUrl: body.sourceUrl ?? null,
          platform: body.platform ?? "unknown",
          creatorName,
          transcriptWordCount,
          estimatedMinutes,
          accuracyLevel,
          analysis,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        console.log("✅ [VOICE_ANALYZE] Saved analysis", docRef.id);
      } else {
        console.warn("⚠️ [VOICE_ANALYZE] Admin SDK not initialized; skipping Firestore persist");
      }
    } catch (persistErr) {
      console.warn("⚠️ [VOICE_ANALYZE] Persist failed", persistErr);
      // Continue; return analysis anyway
    }

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error("❌ [VOICE_ANALYZE] Unexpected error", error);
    return NextResponse.json({ success: false, error: "Analysis failed" }, { status: 500 });
  }
}
