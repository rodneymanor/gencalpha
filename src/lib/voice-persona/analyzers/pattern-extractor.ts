/**
 * Pattern Extractor
 * Analyzes transcripts to extract speech patterns, signature elements, and voice characteristics
 */

import { VideoAnalysisData, SpeechPatterns, PatternMappingMatrix, PatternElement } from "../types";

/**
 * Configuration for pattern extraction
 */
interface PatternExtractionConfig {
  sensitivity: "low" | "medium" | "high";
  minFrequency: number;
  contextWindow: number; // words around pattern for context
  enableEmotionalAnalysis: boolean;
}

const DEFAULT_CONFIG: PatternExtractionConfig = {
  sensitivity: "medium",
  minFrequency: 2,
  contextWindow: 5,
  enableEmotionalAnalysis: true,
};

/**
 * Common speech pattern definitions
 */
const PATTERN_DEFINITIONS = {
  hooks: {
    opening: [
      /^(listen up|okay so|here's the thing|check this out|wait for it|hold up)/i,
      /^(guys|everyone|people|listen|hey)/i,
      /^(you know what|let me tell you|i just realized|here's what)/i,
    ],
    questions: [
      /(right\?|you know\?|don't you think\?|am i right\?)/i,
      /(have you ever|did you know|can you believe)/i,
    ],
  },
  bridges: [
    /(which means|basically|so here's the thing|the point is)/i,
    /(in other words|what i'm saying is|long story short)/i,
    /(but here's the kicker|but wait|but seriously)/i,
  ],
  energyEscalators: [
    /(THIS is|THAT'S|OH MY GOD|BOOM|BAM|WAIT)/i,
    /([A-Z]{2,})/g, // All caps words
    /(!!!|!!\s)/g, // Multiple exclamations
  ],
  personalReferences: [
    /(i think|in my opinion|my experience|i believe|i feel)/i,
    /(when i was|i remember|i used to|i always)/i,
  ],
  audienceAddress: [
    /(you guys|you need to|you should|you have to|you can)/i,
    /(let me ask you|think about it|imagine this)/i,
  ],
  fillers: [/(um|uh|like|you know|so|well|actually)/i, /(obviously|literally|basically|honestly)/i],
};

/**
 * Emotional state indicators
 */
const EMOTIONAL_PATTERNS = {
  excited: {
    markers: [/(amazing|incredible|unbelievable|wow|omg|crazy)/i, /[!]{2,}/g, /[A-Z]{3,}/g],
    rhythm: "fast",
  },
  explaining: {
    markers: [/(first|second|third|next|then|finally)/i, /(because|since|due to|as a result)/i],
    rhythm: "measured",
  },
  storytelling: {
    markers: [/(once|when|there was|i remember|back when)/i, /(and then|suddenly|meanwhile|after that)/i],
    rhythm: "narrative",
  },
};

/**
 * Pattern Extractor Class
 */
export class PatternExtractor {
  private config: PatternExtractionConfig;

  constructor(config: Partial<PatternExtractionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Extract speech patterns from video analysis data
   */
  extractPatterns(videos: VideoAnalysisData[]): SpeechPatterns {
    console.log(`🔍 [PATTERN_EXTRACTOR] Analyzing ${videos.length} videos for speech patterns`);

    // Combine all transcripts for comprehensive analysis
    const combinedTranscript = videos.map((v) => v.transcript).join(" ");
    const transcripts = videos.map((v) => v.transcript);

    // Extract baseline patterns
    const baseline = this.extractBaseline(combinedTranscript, transcripts);

    // Extract emotional state patterns
    const emotionalStates = this.config.enableEmotionalAnalysis
      ? this.extractEmotionalStates(transcripts)
      : this.getDefaultEmotionalStates();

    // Extract signature elements
    const signatureElements = this.extractSignatureElements(transcripts);

    const patterns: SpeechPatterns = {
      baseline,
      emotionalStates,
      signatureElements,
    };

    console.log(`✅ [PATTERN_EXTRACTOR] Extracted patterns from ${combinedTranscript.length} characters of transcript`);
    return patterns;
  }

  /**
   * Extract pattern mapping matrix for frequency analysis
   */
  extractPatternMatrix(videos: VideoAnalysisData[]): PatternMappingMatrix {
    console.log(`📊 [PATTERN_EXTRACTOR] Creating pattern mapping matrix`);

    const transcripts = videos.map((v) => v.transcript);
    const combinedTranscript = transcripts.join(" ");
    const wordCount = combinedTranscript.split(/\s+/).length;

    return {
      primaryHook: this.analyzePatternElement(
        "Primary Hook",
        PATTERN_DEFINITIONS.hooks.opening,
        combinedTranscript,
        wordCount,
      ),
      bridgePhrase: this.analyzePatternElement(
        "Bridge Phrase",
        PATTERN_DEFINITIONS.bridges,
        combinedTranscript,
        wordCount,
      ),
      energyEscalator: this.analyzePatternElement(
        "Energy Escalator",
        PATTERN_DEFINITIONS.energyEscalators,
        combinedTranscript,
        wordCount,
      ),
      personalReference: this.analyzePatternElement(
        "Personal Reference",
        PATTERN_DEFINITIONS.personalReferences,
        combinedTranscript,
        wordCount,
      ),
      audienceAddress: this.analyzePatternElement(
        "Audience Address",
        PATTERN_DEFINITIONS.audienceAddress,
        combinedTranscript,
        wordCount,
      ),
      questionPattern: this.analyzePatternElement(
        "Question Pattern",
        PATTERN_DEFINITIONS.hooks.questions,
        combinedTranscript,
        wordCount,
      ),
    };
  }

  /**
   * Extract baseline speech patterns
   */
  private extractBaseline(combinedTranscript: string, transcripts: string[]): SpeechPatterns["baseline"] {
    const sentences = combinedTranscript.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;

    // Analyze sentence structure
    let sentenceStructure: "short" | "varied" | "complex" = "varied";
    if (avgSentenceLength < 8) sentenceStructure = "short";
    else if (avgSentenceLength > 15) sentenceStructure = "complex";

    // Analyze energy level from caps and punctuation
    const capsWords = (combinedTranscript.match(/\b[A-Z]{2,}\b/g) || []).length;
    const exclamations = (combinedTranscript.match(/[!]/g) || []).length;
    const energyScore = ((capsWords + exclamations) / combinedTranscript.length) * 1000;

    let typicalEnergy: "low" | "medium" | "high" = "medium";
    let energyDescription = "Consistent moderate energy";

    if (energyScore > 5) {
      typicalEnergy = "high";
      energyDescription = "High energy with frequent emphasis and excitement";
    } else if (energyScore < 1) {
      typicalEnergy = "low";
      energyDescription = "Calm and measured delivery";
    }

    // Analyze rhythm from sentence variation
    const sentenceLengths = sentences.map((s) => s.split(/\s+/).length);
    const variation = this.calculateVariation(sentenceLengths);
    const defaultRhythm = variation > 0.3 ? "Variable pacing with dynamic rhythm" : "Consistent, steady rhythm";

    return {
      defaultRhythm,
      typicalEnergy,
      energyDescription,
      sentenceStructure,
    };
  }

  /**
   * Extract emotional state patterns
   */
  private extractEmotionalStates(transcripts: string[]): SpeechPatterns["emotionalStates"] {
    const combinedTranscript = transcripts.join(" ");

    // Analyze excited patterns
    const excitedMatches = EMOTIONAL_PATTERNS.excited.markers.reduce((count, pattern) => {
      return count + (combinedTranscript.match(pattern) || []).length;
    }, 0);

    const excitedPhrases = this.extractMatchingPhrases(combinedTranscript, EMOTIONAL_PATTERNS.excited.markers);

    // Analyze explaining patterns
    const explainingMatches = EMOTIONAL_PATTERNS.explaining.markers.reduce((count, pattern) => {
      return count + (combinedTranscript.match(pattern) || []).length;
    }, 0);

    const transitionWords = this.extractMatchingPhrases(combinedTranscript, EMOTIONAL_PATTERNS.explaining.markers);

    return {
      excited: {
        patternChanges: excitedMatches > 5 ? "Increases pace, uses more emphasis" : "Slight energy increase",
        markerPhrases: excitedPhrases.slice(0, 10),
        energySpike: "Voice raises, more exclamations and caps",
      },
      explaining: {
        structure: explainingMatches > 10 ? "step-by-step" : "circular",
        transitionWords: transitionWords.slice(0, 8),
        complexityManagement: "Breaks down complex ideas into simple terms",
      },
    };
  }

  /**
   * Extract signature elements
   */
  private extractSignatureElements(transcripts: string[]): SpeechPatterns["signatureElements"] {
    const combinedTranscript = transcripts.join(" ");

    // Extract random insertions (frequent phrases)
    const randomInsertions = this.extractFrequentPhrases(combinedTranscript, 2, 4);

    // Extract filler patterns
    const fillerMatches = PATTERN_DEFINITIONS.fillers.reduce((acc, pattern) => {
      const matches = combinedTranscript.match(new RegExp(pattern, "gi")) || [];
      return acc.concat(matches);
    }, [] as string[]);

    const fillerPatterns = [...new Set(fillerMatches)].slice(0, 8);

    // Extract opening and closing catchphrases
    const openingPhrases = this.extractOpeningPhrases(transcripts);
    const closingPhrases = this.extractClosingPhrases(transcripts);

    return {
      randomInsertions: randomInsertions.slice(0, 8),
      fillerPatterns,
      catchphrases: {
        opening: openingPhrases,
        closing: closingPhrases,
      },
    };
  }

  /**
   * Analyze a specific pattern element for the matrix
   */
  private analyzePatternElement(
    elementName: string,
    patterns: RegExp[],
    transcript: string,
    totalWords: number,
  ): PatternElement {
    const matches = patterns.reduce((acc, pattern) => {
      const found = transcript.match(new RegExp(pattern, "gi")) || [];
      return acc.concat(found);
    }, [] as string[]);

    const frequency = matches.length;
    const wordsPerOccurrence = frequency > 0 ? Math.round(totalWords / frequency) : 0;

    const examples = [...new Set(matches)].slice(0, 5);

    return {
      element: elementName,
      frequency: frequency > 0 ? `Every ${wordsPerOccurrence} words` : "Rarely used",
      examples,
      context: this.determineContext(elementName),
    };
  }

  /**
   * Helper method to extract phrases matching patterns
   */
  private extractMatchingPhrases(transcript: string, patterns: RegExp[]): string[] {
    return patterns.reduce((acc, pattern) => {
      const matches = transcript.match(new RegExp(pattern, "gi")) || [];
      return acc.concat(matches);
    }, [] as string[]);
  }

  /**
   * Extract frequent phrases from transcript
   */
  private extractFrequentPhrases(transcript: string, minLength: number, maxLength: number): string[] {
    const words = transcript.toLowerCase().split(/\s+/);
    const phrases: { [key: string]: number } = {};

    // Extract n-grams
    for (let n = minLength; n <= maxLength; n++) {
      for (let i = 0; i <= words.length - n; i++) {
        const phrase = words.slice(i, i + n).join(" ");
        if (this.isValidPhrase(phrase)) {
          phrases[phrase] = (phrases[phrase] || 0) + 1;
        }
      }
    }

    // Return phrases that appear frequently
    return Object.entries(phrases)
      .filter(([_, count]) => count >= this.config.minFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(([phrase]) => phrase);
  }

  /**
   * Extract opening phrases from transcripts
   */
  private extractOpeningPhrases(transcripts: string[]): string[] {
    const openings = transcripts
      .map((transcript) => {
        const sentences = transcript.split(/[.!?]+/);
        return sentences[0]?.trim().toLowerCase();
      })
      .filter(Boolean);

    return this.findCommonPatterns(openings).slice(0, 5);
  }

  /**
   * Extract closing phrases from transcripts
   */
  private extractClosingPhrases(transcripts: string[]): string[] {
    const closings = transcripts
      .map((transcript) => {
        const sentences = transcript.split(/[.!?]+/).filter((s) => s.trim());
        return sentences[sentences.length - 1]?.trim().toLowerCase();
      })
      .filter(Boolean);

    return this.findCommonPatterns(closings).slice(0, 5);
  }

  /**
   * Find common patterns in a list of phrases
   */
  private findCommonPatterns(phrases: string[]): string[] {
    const frequency: { [key: string]: number } = {};

    phrases.forEach((phrase) => {
      // Extract key words (ignore common words)
      const keyWords = phrase
        .split(/\s+/)
        .filter((word) => !["the", "a", "an", "and", "or", "but", "is", "are", "was", "were"].includes(word));

      keyWords.forEach((word) => {
        frequency[word] = (frequency[word] || 0) + 1;
      });
    });

    return Object.entries(frequency)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word);
  }

  /**
   * Check if a phrase is valid for analysis
   */
  private isValidPhrase(phrase: string): boolean {
    // Filter out common words and short phrases
    const commonWords = ["the", "and", "or", "but", "is", "are", "was", "were", "a", "an"];
    const words = phrase.split(/\s+/);

    return !words.every((word) => commonWords.includes(word)) && phrase.length > 3 && !phrase.match(/^\d+$/);
  }

  /**
   * Calculate variation coefficient
   */
  private calculateVariation(numbers: number[]): number {
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const variance = numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;
    return Math.sqrt(variance) / mean;
  }

  /**
   * Determine context based on element type
   */
  private determineContext(elementName: string): string {
    const contexts = {
      "Primary Hook": "Video openings and attention grabbers",
      "Bridge Phrase": "Transitions between topics",
      "Energy Escalator": "Peak moments and emphasis",
      "Personal Reference": "Storytelling and credibility",
      "Audience Address": "Direct engagement",
      "Question Pattern": "Audience interaction and confirmation",
    };

    return contexts[elementName as keyof typeof contexts] || "General usage";
  }

  /**
   * Get default emotional states when analysis is disabled
   */
  private getDefaultEmotionalStates(): SpeechPatterns["emotionalStates"] {
    return {
      excited: {
        patternChanges: "Energy level increases",
        markerPhrases: [],
        energySpike: "More animated delivery",
      },
      explaining: {
        structure: "step-by-step",
        transitionWords: [],
        complexityManagement: "Simplifies complex concepts",
      },
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PatternExtractionConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function for easy usage
 */
export function createPatternExtractor(config?: Partial<PatternExtractionConfig>): PatternExtractor {
  return new PatternExtractor(config);
}

/**
 * Convenience function for pattern extraction
 */
export function extractSpeechPatterns(
  videos: VideoAnalysisData[],
  config?: Partial<PatternExtractionConfig>,
): SpeechPatterns {
  const extractor = createPatternExtractor(config);
  return extractor.extractPatterns(videos);
}

/**
 * Convenience function for pattern matrix extraction
 */
export function extractPatternMatrix(
  videos: VideoAnalysisData[],
  config?: Partial<PatternExtractionConfig>,
): PatternMappingMatrix {
  const extractor = createPatternExtractor(config);
  return extractor.extractPatternMatrix(videos);
}
