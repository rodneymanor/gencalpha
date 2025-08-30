/**
 * Authenticity Scorer
 * Evaluates generated content against original voice persona for authenticity scoring
 */

import { VoiceProfile, AuthenticityMetrics, SpeechPatterns } from "../types";

/**
 * Authenticity scoring configuration
 */
interface ScoringConfig {
  strictMode: boolean;
  penaltyMultiplier: number;
  minPassingScore: number;
}

const DEFAULT_CONFIG: ScoringConfig = {
  strictMode: false,
  penaltyMultiplier: 1.0,
  minPassingScore: 75,
};

/**
 * Individual metric weights (must sum to 100)
 */
const METRIC_WEIGHTS = {
  hookAccuracy: 20,
  bridgeFrequency: 20,
  sentencePatterns: 20,
  vocabularyMatch: 20,
  rhythmReplication: 20,
} as const;

/**
 * Authenticity Scorer Class
 */
export class AuthenticityScorer {
  private config: ScoringConfig;

  constructor(config: Partial<ScoringConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Calculate comprehensive authenticity score for generated content
   */
  scoreAuthenticity(
    generatedContent: string,
    voiceProfile: VoiceProfile,
    speechPatterns?: SpeechPatterns,
  ): AuthenticityMetrics {
    console.log(`🎯 [AUTHENTICITY_SCORER] Scoring generated content (${generatedContent.length} characters)`);

    const hookAccuracy = this.scoreHookAccuracy(generatedContent, voiceProfile);
    const bridgeFrequency = this.scoreBridgeFrequency(generatedContent, voiceProfile);
    const sentencePatterns = this.scoreSentencePatterns(generatedContent, voiceProfile);
    const vocabularyMatch = this.scoreVocabularyMatch(generatedContent, voiceProfile);
    const rhythmReplication = this.scoreRhythmReplication(generatedContent, voiceProfile, speechPatterns);

    // Calculate overall score using weighted average
    const overallScore = this.calculateOverallScore({
      hookAccuracy,
      bridgeFrequency,
      sentencePatterns,
      vocabularyMatch,
      rhythmReplication,
    });

    const metrics: AuthenticityMetrics = {
      hookAccuracy,
      bridgeFrequency,
      sentencePatterns,
      vocabularyMatch,
      rhythmReplication,
      overallScore,
    };

    console.log(`✅ [AUTHENTICITY_SCORER] Overall authenticity score: ${overallScore}%`);
    return metrics;
  }

  /**
   * Score hook accuracy - checks if generated hooks match persona's top patterns
   */
  private scoreHookAccuracy(content: string, profile: VoiceProfile): AuthenticityMetrics["hookAccuracy"] {
    const contentLower = content.toLowerCase();
    const sentences = content.split(/[.!?]+/);
    const firstSentence = sentences[0]?.toLowerCase().trim() || "";

    let score = 0;
    let matchedHooks = 0;
    let checkDescription = "Matches persona's primary hooks";

    // Check if opening uses persona's hooks
    const hookMatches = profile.hooks.filter(
      (hook) => firstSentence.includes(hook.toLowerCase()) || contentLower.includes(hook.toLowerCase()),
    );

    matchedHooks = hookMatches.length;

    if (matchedHooks === 0) {
      score = 0;
      checkDescription = "No persona hooks found";
    } else if (matchedHooks === 1) {
      score = 70;
      checkDescription = "Uses one persona hook";
    } else if (matchedHooks >= 2) {
      score = 100;
      checkDescription = "Uses multiple persona hooks";
    }

    // Penalty for using non-persona language in hooks
    if (this.containsNonPersonaLanguage(firstSentence, profile)) {
      score = Math.max(0, score - 30);
      checkDescription += " (penalty for non-persona language)";
    }

    return {
      weight: METRIC_WEIGHTS.hookAccuracy,
      score: Math.round(score * this.config.penaltyMultiplier),
      check: checkDescription,
    };
  }

  /**
   * Score bridge phrase frequency - checks if bridge phrases appear at documented rate
   */
  private scoreBridgeFrequency(content: string, profile: VoiceProfile): AuthenticityMetrics["bridgeFrequency"] {
    const contentLower = content.toLowerCase();
    const wordCount = content.split(/\s+/).length;

    let bridgesFound = 0;
    let totalExpectedFrequency = 0;

    // Check each bridge phrase
    Object.entries(profile.bridges).forEach(([phrase, expectedFreq]) => {
      const matches = (contentLower.match(new RegExp(phrase.toLowerCase(), "g")) || []).length;
      bridgesFound += matches;

      // Expected frequency is relative to content length
      const expectedInContent = Math.max(1, Math.round((wordCount / 100) * (expectedFreq / 10)));
      totalExpectedFrequency += expectedInContent;
    });

    // Calculate score based on bridge usage
    let score = 0;
    let checkDescription = "Appears at documented rate";

    if (bridgesFound === 0 && totalExpectedFrequency > 0) {
      score = 0;
      checkDescription = "No bridge phrases found";
    } else if (totalExpectedFrequency === 0) {
      score = 80; // Profile has no bridges, so neutral score
      checkDescription = "No bridge pattern to match";
    } else {
      const ratio = bridgesFound / totalExpectedFrequency;
      if (ratio >= 0.8) {
        score = 100;
      } else if (ratio >= 0.5) {
        score = 80;
      } else if (ratio >= 0.2) {
        score = 60;
      } else {
        score = 30;
      }
      checkDescription = `Found ${bridgesFound}/${totalExpectedFrequency} expected bridges`;
    }

    return {
      weight: METRIC_WEIGHTS.bridgeFrequency,
      score: Math.round(score * this.config.penaltyMultiplier),
      check: checkDescription,
    };
  }

  /**
   * Score sentence pattern matching
   */
  private scoreSentencePatterns(content: string, profile: VoiceProfile): AuthenticityMetrics["sentencePatterns"] {
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const lengths = sentences.map((s) => s.split(/\s+/).length);
    const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;

    let score = 70; // Base score
    let checkDescription = "Follows ratio distribution";

    // Analyze pattern matching
    const patternChecks = profile.sentencePatterns.join(" ").toLowerCase();

    if (patternChecks.includes("short")) {
      if (avgLength < 10) {
        score += 15;
        checkDescription = "Matches short sentence pattern";
      } else {
        score -= 10;
        checkDescription = "Deviates from short sentence pattern";
      }
    }

    if (patternChecks.includes("complex")) {
      if (avgLength > 15) {
        score += 15;
        checkDescription = "Matches complex sentence pattern";
      } else {
        score -= 10;
        checkDescription = "Deviates from complex sentence pattern";
      }
    }

    // Check punctuation usage
    const exclamationRatio = (content.match(/!/g) || []).length / sentences.length;
    const questionRatio = (content.match(/\?/g) || []).length / sentences.length;

    if (patternChecks.includes("exclamation") && exclamationRatio > 0.2) {
      score += 10;
    }
    if (patternChecks.includes("question") && questionRatio > 0.1) {
      score += 5;
    }

    return {
      weight: METRIC_WEIGHTS.sentencePatterns,
      score: Math.min(100, Math.max(0, Math.round(score * this.config.penaltyMultiplier))),
      check: checkDescription,
    };
  }

  /**
   * Score vocabulary fingerprint matching
   */
  private scoreVocabularyMatch(content: string, profile: VoiceProfile): AuthenticityMetrics["vocabularyMatch"] {
    const contentWords = content
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3);

    const vocabularyWords = profile.vocabularyFingerprint.map((word) => word.toLowerCase());

    let matchedWords = 0;
    vocabularyWords.forEach((vocabWord) => {
      if (contentWords.includes(vocabWord)) {
        matchedWords++;
      }
    });

    const matchRatio = vocabularyWords.length > 0 ? matchedWords / vocabularyWords.length : 0;

    let score = Math.round(matchRatio * 100);
    let checkDescription = `Uses ${matchedWords}/${vocabularyWords.length} signature words`;

    // Bonus for using multiple signature words
    if (matchedWords >= 5) {
      score = Math.min(100, score + 10);
      checkDescription += " (bonus for high usage)";
    }

    // Penalty for overusing words not in vocabulary
    const nonVocabWords = contentWords.filter((word) => !vocabularyWords.includes(word));
    if (nonVocabWords.length > contentWords.length * 0.8) {
      score = Math.max(0, score - 20);
      checkDescription += " (penalty for non-persona vocabulary)";
    }

    return {
      weight: METRIC_WEIGHTS.vocabularyMatch,
      score: Math.round(score * this.config.penaltyMultiplier),
      check: checkDescription,
    };
  }

  /**
   * Score rhythm and energy replication
   */
  private scoreRhythmReplication(
    content: string,
    profile: VoiceProfile,
    speechPatterns?: SpeechPatterns,
  ): AuthenticityMetrics["rhythmReplication"] {
    let score = 70; // Base score
    let checkDescription = "Maintains energy wave";

    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;

    // Check rhythm pattern matching
    const rhythmPattern = profile.rhythmPattern.toLowerCase();

    if (rhythmPattern.includes("fast") && avgSentenceLength < 8) {
      score += 15;
      checkDescription = "Matches fast-paced rhythm";
    } else if (rhythmPattern.includes("slow") && avgSentenceLength > 12) {
      score += 15;
      checkDescription = "Matches deliberate rhythm";
    }

    // Check energy level matching using speech patterns
    if (speechPatterns) {
      const baselineEnergy = speechPatterns.baseline.typicalEnergy;
      const capsCount = (content.match(/[A-Z]/g) || []).length;
      const exclamationCount = (content.match(/!/g) || []).length;
      const energyScore = ((capsCount + exclamationCount * 2) / content.length) * 100;

      if (baselineEnergy === "high" && energyScore > 2) {
        score += 10;
        checkDescription += ", high energy maintained";
      } else if (baselineEnergy === "low" && energyScore < 1) {
        score += 10;
        checkDescription += ", calm energy maintained";
      } else if (baselineEnergy === "medium" && energyScore >= 1 && energyScore <= 2) {
        score += 10;
        checkDescription += ", moderate energy maintained";
      }
    }

    // Check for signature elements usage
    const signatureMatches = profile.signatureElements.filter((element) =>
      content.toLowerCase().includes(element.toLowerCase()),
    ).length;

    if (signatureMatches >= 2) {
      score += 10;
      checkDescription += ", uses signature elements";
    } else if (signatureMatches === 0) {
      score -= 15;
      checkDescription += ", missing signature elements";
    }

    return {
      weight: METRIC_WEIGHTS.rhythmReplication,
      score: Math.min(100, Math.max(0, Math.round(score * this.config.penaltyMultiplier))),
      check: checkDescription,
    };
  }

  /**
   * Calculate weighted overall score
   */
  private calculateOverallScore(metrics: Omit<AuthenticityMetrics, "overallScore">): number {
    const totalWeightedScore =
      metrics.hookAccuracy.score * (metrics.hookAccuracy.weight / 100) +
      metrics.bridgeFrequency.score * (metrics.bridgeFrequency.weight / 100) +
      metrics.sentencePatterns.score * (metrics.sentencePatterns.weight / 100) +
      metrics.vocabularyMatch.score * (metrics.vocabularyMatch.weight / 100) +
      metrics.rhythmReplication.score * (metrics.rhythmReplication.weight / 100);

    return Math.round(totalWeightedScore);
  }

  /**
   * Check if content contains language not typical of the persona
   */
  private containsNonPersonaLanguage(content: string, profile: VoiceProfile): boolean {
    const contentLower = content.toLowerCase();

    // Common formal/corporate language that might indicate non-persona content
    const formalLanguage = [
      "furthermore",
      "moreover",
      "consequently",
      "nevertheless",
      "henceforth",
      "pursuant to",
      "in accordance with",
      "notwithstanding",
      "heretofore",
    ];

    // Check if content uses formal language not in persona vocabulary
    return formalLanguage.some(
      (formal) => contentLower.includes(formal) && !profile.vocabularyFingerprint.includes(formal),
    );
  }

  /**
   * Determine if score meets passing threshold
   */
  isPassing(score: number): boolean {
    return score >= this.config.minPassingScore;
  }

  /**
   * Get detailed scoring breakdown
   */
  getScoreBreakdown(metrics: AuthenticityMetrics): string {
    const breakdown = [
      `Hook Accuracy: ${metrics.hookAccuracy.score}% (${metrics.hookAccuracy.check})`,
      `Bridge Frequency: ${metrics.bridgeFrequency.score}% (${metrics.bridgeFrequency.check})`,
      `Sentence Patterns: ${metrics.sentencePatterns.score}% (${metrics.sentencePatterns.check})`,
      `Vocabulary Match: ${metrics.vocabularyMatch.score}% (${metrics.vocabularyMatch.check})`,
      `Rhythm Replication: ${metrics.rhythmReplication.score}% (${metrics.rhythmReplication.check})`,
      ``,
      `Overall Score: ${metrics.overallScore}%`,
      `Status: ${this.isPassing(metrics.overallScore) ? "PASSING" : "NEEDS IMPROVEMENT"}`,
    ];

    return breakdown.join("\n");
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ScoringConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function for easy usage
 */
export function createAuthenticityScorer(config?: Partial<ScoringConfig>): AuthenticityScorer {
  return new AuthenticityScorer(config);
}

/**
 * Convenience function for authenticity scoring
 */
export function scoreContentAuthenticity(
  content: string,
  voiceProfile: VoiceProfile,
  speechPatterns?: SpeechPatterns,
  config?: Partial<ScoringConfig>,
): AuthenticityMetrics {
  const scorer = createAuthenticityScorer(config);
  return scorer.scoreAuthenticity(content, voiceProfile, speechPatterns);
}
