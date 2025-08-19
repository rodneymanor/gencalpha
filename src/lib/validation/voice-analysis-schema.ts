import { z } from "zod";

// Zod schema to validate the forensic analysis JSON returned from the model
// Focused on required structure; allows extra keys to keep forward-compatible

export const BridgePhraseInstanceSchema = z.object({
  exactPhrase: z.string(),
  frequency: z.number().or(z.string()),
  example: z.string(),
});

export const ForensicVoiceAnalysisSchema = z
  .object({
    metadata: z.object({
      creatorName: z.string(),
      transcriptWordCount: z.number(),
      transcriptDuration: z.string(),
      accuracyLevel: z.enum(["Limited", "Optimal", "Excessive"]),
      analysisTimestamp: z.string(),
      confidenceScore: z.number(),
    }),

    hookEngineering: z.object({
      taxonomy: z.object({
        questionHooks: z.object({
          pattern: z.string(),
          exactExamplesFromTranscript: z.array(z.string()),
          frequency: z.number(),
          subPatterns: z.array(z.object({ structure: z.string(), example: z.string(), usage: z.string() })).default([]),
          generatedVariations: z.array(z.string()),
        }),
        storyHooks: z.object({
          pattern: z.string(),
          exactExamplesFromTranscript: z.array(z.string()),
          frequency: z.number(),
          narrativeStyle: z.string(),
          generatedVariations: z.array(z.string()),
        }),
        statementHooks: z.object({
          pattern: z.string(),
          exactExamplesFromTranscript: z.array(z.string()),
          frequency: z.number(),
          boldnessLevel: z.enum(["conservative", "moderate", "aggressive"]),
          generatedVariations: z.array(z.string()),
        }),
        problemSolutionHooks: z.object({
          pattern: z.string(),
          exactExamplesFromTranscript: z.array(z.string()),
          frequency: z.number(),
          tensionBuildStyle: z.string(),
          generatedVariations: z.array(z.string()),
        }),
      }),
      primaryHookFormula: z.object({
        type: z.enum(["question", "story", "statement", "problem_solution"]),
        usagePercentage: z.number(),
        signature: z.string(),
      }),
    }),

    sentenceArchitecturePatterns: z.object({
      bridgeDetectionSystem: z.object({
        conjunctionPatterns: z.array(
          z.object({
            word: z.string(),
            occurrences: z.number(),
            rank: z.number(),
            contexts: z.array(z.string()),
          }),
        ),
        bridgePhrases: z.object({
          afterPoint: BridgePhraseInstanceSchema,
          beforeExamples: BridgePhraseInstanceSchema,
          topicChange: BridgePhraseInstanceSchema,
          buildingAnticipation: BridgePhraseInstanceSchema,
          circlingBack: BridgePhraseInstanceSchema,
        }),
      }),
      sentenceFlowFormulas: z
        .array(
          z.object({
            patternName: z.string(),
            structure: z.string(),
            usagePercentage: z.number(),
            example: z.string(),
            components: z.object({
              opening: z.string(),
              middle: z.string(),
              closing: z.string(),
            }),
          }),
        )
        .min(3),
    }),

    microLanguageFingerprint: z.object({
      adjectiveStackingPatterns: z.object({
        single: z.object({
          percentage: z.number(),
          structure: z.string(),
          topAdjectives: z.array(z.string()),
          examples: z.array(z.string()),
        }),
        double: z.object({
          percentage: z.number(),
          structure: z.string(),
          commonCombos: z.array(z.object({ combo: z.string(), frequency: z.number(), example: z.string() })),
        }),
        triple: z.object({ percentage: z.number(), structure: z.string(), examples: z.array(z.string()) }),
        signatureCombinations: z.array(z.string()),
      }),
      emphasisEscalationLadder: z.object({
        mild: z.object({ words: z.array(z.string()), usage: z.string(), frequency: z.any() }),
        medium: z.object({ words: z.array(z.string()), usage: z.string(), frequency: z.any() }),
        strong: z.object({ words: z.array(z.string()), usage: z.string(), frequency: z.any() }),
        peak: z.object({ words: z.array(z.string()), usage: z.string(), frequency: z.any() }),
        progressionPattern: z.string(),
      }),
      unconsciousVerbalTics: z.object({
        thinkingPauses: z.object({
          exactFiller: z.string(),
          averagePauseLength: z.string(),
          occurrenceRate: z.string(),
          placement: z.string(),
        }),
        excitementMarkers: z.object({
          indicators: z.array(z.string()),
          physicalDescription: z.string(),
          frequency: z.string(),
        }),
        uncertaintyMarkers: z.object({ phrases: z.array(z.string()), pattern: z.string(), frequency: z.string() }),
        agreementBuilders: z.object({ phrases: z.array(z.string()), technique: z.string(), frequency: z.string() }),
      }),
    }),

    contentRhythmMapping: z.object({
      paragraphBreathingPattern: z.object({
        shortBurst: z.object({
          sentenceCount: z.number(),
          wordCount: z.number(),
          percentage: z.number(),
          purpose: z.string(),
        }),
        mediumFlow: z.object({
          sentenceCount: z.number(),
          wordCount: z.number(),
          percentage: z.number(),
          purpose: z.string(),
        }),
        longForm: z.object({
          sentenceCount: z.number(),
          wordCount: z.number(),
          percentage: z.number(),
          purpose: z.string(),
        }),
        naturalPattern: z.string(),
      }),
      energyWavePattern: z.object({
        opening: z.object({ level: z.string(), duration: z.string(), markers: z.array(z.string()) }),
        buildup: z.object({ level: z.string(), duration: z.string(), markers: z.array(z.string()) }),
        peak: z.object({ level: z.string(), duration: z.string(), markers: z.array(z.string()) }),
        resolution: z.object({ level: z.string(), duration: z.string(), markers: z.array(z.string()) }),
        waveShape: z.string(),
      }),
    }),

    instantReplicationFormula: z.record(z.any()),

    patternFrequencyGuide: z.object({
      mustInclude: z.object({
        everyScript: z.array(z.string()),
        everyParagraph: z.array(z.string()),
        every3Sentences: z.array(z.string()),
        every5Sentences: z.array(z.string()),
      }),
      ratios: z.object({
        hookTypeDistribution: z.object({ primary: z.number(), secondary: z.number(), tertiary: z.number() }),
        sentencePatternDistribution: z.object({ patternA: z.number(), patternB: z.number(), patternC: z.number() }),
        bridgeFrequency: z.string(),
        ticFrequency: z.string(),
      }),
    }),

    authenticityVerification: z.object({
      checklist: z.object({
        hookMatchesTop2: z.boolean(),
        bridgeWordsCorrectFrequency: z.boolean(),
        sentencePatternsRotated: z.boolean(),
        adjectiveCombosMatch: z.boolean(),
        energyProgressionFollowed: z.boolean(),
        unconsciousTicsInserted: z.boolean(),
        conjunctionHierarchyRespected: z.boolean(),
        paragraphLengthsMatch: z.boolean(),
      }),
      qualityMetrics: z.object({
        patternMatchScore: z.number(),
        hookSimilarity: z.number(),
        bridgeAccuracy: z.number(),
        sentencePatterns: z.number(),
        vocabularyMatch: z.number(),
        rhythmReplication: z.number(),
        overallScore: z.number(),
      }),
      redFlags: z.array(z.string()),
    }),

    sampleOutputParagraph: z.object({
      generatedText: z.string(),
      annotatedBreakdown: z.array(
        z.object({ sentence: z.string(), patternUsed: z.string(), bridgeUsed: z.string(), emphasisLevel: z.string() }),
      ),
    }),
  })
  .passthrough();

export type ForensicVoiceAnalysisSchemaType = z.infer<typeof ForensicVoiceAnalysisSchema>;
