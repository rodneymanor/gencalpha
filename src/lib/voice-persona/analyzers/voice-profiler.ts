/**
 * Voice Profiler
 * Creates comprehensive voice profiles from extracted patterns and analysis data
 */

import { VideoAnalysisData, VoiceProfile, GenerationParameters, SpeechPatterns, PatternMappingMatrix } from "../types";

/**
 * Voice Profiler Class
 */
export class VoiceProfiler {
  /**
   * Create a comprehensive voice profile from analysis data
   */
  createProfile(
    videos: VideoAnalysisData[],
    speechPatterns: SpeechPatterns,
    patternMatrix: PatternMappingMatrix,
  ): VoiceProfile {
    console.log(`🎭 [VOICE_PROFILER] Creating voice profile from ${videos.length} videos`);

    const combinedTranscript = videos.map((v) => v.transcript).join(" ");

    // Extract core voice elements
    const hooks = this.extractHooks(speechPatterns, patternMatrix);
    const bridges = this.extractBridges(speechPatterns, patternMatrix);
    const energyWave = this.analyzeEnergyWave(speechPatterns, combinedTranscript);
    const sentencePatterns = this.analyzeSentencePatterns(combinedTranscript);
    const signatureElements = this.extractSignatureElements(speechPatterns);
    const vocabularyFingerprint = this.createVocabularyFingerprint(combinedTranscript);
    const rhythmPattern = this.analyzeRhythmPattern(speechPatterns, videos);

    const profile: VoiceProfile = {
      hooks,
      bridges,
      energyWave,
      sentencePatterns,
      signatureElements,
      vocabularyFingerprint,
      rhythmPattern,
    };

    console.log(
      `✅ [VOICE_PROFILER] Voice profile created with ${hooks.length} hooks and ${Object.keys(bridges).length} bridge patterns`,
    );
    return profile;
  }

  /**
   * Create generation parameters optimized for this voice
   */
  createGenerationParameters(
    voiceProfile: VoiceProfile,
    speechPatterns: SpeechPatterns,
    videos: VideoAnalysisData[],
  ): GenerationParameters {
    console.log(`⚙️ [VOICE_PROFILER] Creating generation parameters`);

    // Calculate optimal length from video durations
    const avgDuration = videos.reduce((sum, v) => sum + v.duration, 0) / videos.length;
    const optimalLength = Math.min(Math.max(avgDuration, 15), 60); // 15-60 second range

    // Determine authenticity threshold based on pattern consistency
    const authenticityThreshold = this.calculateOptimalThreshold(voiceProfile, speechPatterns);

    // Analyze hook usage patterns
    const hookRatio = this.analyzeHookRatio(voiceProfile.hooks);

    // Analyze sentence distribution
    const sentenceDistribution = this.analyzeSentenceDistribution(voiceProfile.sentencePatterns);

    // Determine pattern rotation strategy
    const patternRotation = this.determinePatternRotation(voiceProfile);

    const parameters: GenerationParameters = {
      optimalLength,
      authenticityThreshold,
      patternRotation,
      hookRatio,
      sentenceDistribution,
    };

    console.log(
      `✅ [VOICE_PROFILER] Generation parameters created: ${optimalLength}s optimal length, ${authenticityThreshold}% authenticity threshold`,
    );
    return parameters;
  }

  /**
   * Extract primary and secondary hooks from patterns
   */
  private extractHooks(speechPatterns: SpeechPatterns, patternMatrix: PatternMappingMatrix): string[] {
    const hooks: string[] = [];

    // Add signature opening phrases
    hooks.push(...speechPatterns.signatureElements.catchphrases.opening);

    // Add primary hook examples from pattern matrix
    hooks.push(...patternMatrix.primaryHook.examples);

    // Add excited state markers as high-energy hooks
    hooks.push(...speechPatterns.emotionalStates.excited.markerPhrases.slice(0, 3));

    // Filter and deduplicate
    return [...new Set(hooks)].filter((hook) => hook && hook.length > 2).slice(0, 15); // Top 15 hooks
  }

  /**
   * Extract bridge phrases with frequency mapping
   */
  private extractBridges(speechPatterns: SpeechPatterns, patternMatrix: PatternMappingMatrix): Record<string, number> {
    const bridges: Record<string, number> = {};

    // Add transition words from explaining patterns
    speechPatterns.emotionalStates.explaining.transitionWords.forEach((word, index) => {
      bridges[word] = Math.max(10 - index, 1); // Higher frequency for earlier items
    });

    // Add bridge phrase examples
    patternMatrix.bridgePhrase.examples.forEach((phrase, index) => {
      bridges[phrase] = Math.max(8 - index, 1);
    });

    // Add random insertions as bridge elements
    speechPatterns.signatureElements.randomInsertions.forEach((phrase, index) => {
      bridges[phrase] = Math.max(6 - index, 1);
    });

    return bridges;
  }

  /**
   * Analyze energy wave pattern
   */
  private analyzeEnergyWave(speechPatterns: SpeechPatterns, transcript: string): string {
    const baseEnergy = speechPatterns.baseline.typicalEnergy;
    const energyDescription = speechPatterns.baseline.energyDescription;
    const excitedPattern = speechPatterns.emotionalStates.excited.patternChanges;

    // Analyze energy distribution throughout transcript
    const sentences = transcript.split(/[.!?]+/);
    const energyScores = sentences.map((sentence) => {
      const capsCount = (sentence.match(/[A-Z]/g) || []).length;
      const exclamationCount = (sentence.match(/[!]/g) || []).length;
      return capsCount + exclamationCount * 2;
    });

    const avgEnergyScore = energyScores.reduce((sum, score) => sum + score, 0) / energyScores.length;
    const energyVariation = this.calculateVariation(energyScores);

    let wavePattern = "";

    if (energyVariation > 2) {
      wavePattern = "Dynamic energy waves with peaks and valleys";
    } else if (baseEnergy === "high") {
      wavePattern = "Consistently high energy with occasional spikes";
    } else if (baseEnergy === "low") {
      wavePattern = "Steady, measured energy with subtle emphasis";
    } else {
      wavePattern = "Moderate energy with controlled escalation";
    }

    return `${wavePattern}. ${energyDescription}. ${excitedPattern}`;
  }

  /**
   * Analyze sentence pattern distribution
   */
  private analyzeSentencePatterns(transcript: string): string[] {
    const sentences = transcript.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const patterns: string[] = [];

    // Analyze sentence lengths
    const lengths = sentences.map((s) => s.split(/\s+/).length);
    const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;

    if (avgLength < 8) {
      patterns.push("Short, punchy sentences");
    } else if (avgLength > 15) {
      patterns.push("Complex, detailed sentences");
    } else {
      patterns.push("Balanced sentence length");
    }

    // Analyze sentence starters
    const starters = sentences.map((s) => s.trim().toLowerCase().split(/\s+/)[0]);
    const starterFreq = this.getFrequencyMap(starters);
    const topStarters = Object.entries(starterFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([starter]) => `"${starter}"`);

    patterns.push(`Common starters: ${topStarters.join(", ")}`);

    // Analyze punctuation usage
    const exclamationRatio = (transcript.match(/!/g) || []).length / sentences.length;
    const questionRatio = (transcript.match(/\?/g) || []).length / sentences.length;

    if (exclamationRatio > 0.3) {
      patterns.push("High exclamation usage for emphasis");
    }
    if (questionRatio > 0.2) {
      patterns.push("Frequent rhetorical questions");
    }

    return patterns;
  }

  /**
   * Extract signature elements for the profile
   */
  private extractSignatureElements(speechPatterns: SpeechPatterns): string[] {
    const elements: string[] = [];

    // Add top random insertions
    elements.push(...speechPatterns.signatureElements.randomInsertions.slice(0, 5));

    // Add filler patterns
    elements.push(...speechPatterns.signatureElements.fillerPatterns.slice(0, 3));

    // Add signature opening/closing
    elements.push(...speechPatterns.signatureElements.catchphrases.opening.slice(0, 2));
    elements.push(...speechPatterns.signatureElements.catchphrases.closing.slice(0, 2));

    return [...new Set(elements)].filter(Boolean);
  }

  /**
   * Create vocabulary fingerprint
   */
  private createVocabularyFingerprint(transcript: string): string[] {
    const words = transcript
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3);

    const frequency = this.getFrequencyMap(words);

    // Remove common words
    const commonWords = [
      "that",
      "this",
      "with",
      "have",
      "will",
      "they",
      "from",
      "been",
      "were",
      "said",
      "each",
      "which",
      "their",
      "time",
      "about",
      "would",
      "there",
      "could",
      "other",
      "after",
      "first",
      "well",
      "also",
      "more",
      "very",
      "what",
      "know",
      "just",
      "into",
      "over",
      "think",
      "only",
      "its",
      "work",
      "life",
      "way",
      "may",
      "say",
      "come",
      "good",
      "much",
    ];

    return Object.entries(frequency)
      .filter(([word, count]) => count >= 3 && !commonWords.includes(word))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([word]) => word);
  }

  /**
   * Analyze rhythm pattern from speech characteristics
   */
  private analyzeRhythmPattern(speechPatterns: SpeechPatterns, videos: VideoAnalysisData[]): string {
    const baseline = speechPatterns.baseline;
    const avgDuration = videos.reduce((sum, v) => sum + v.duration, 0) / videos.length;
    const avgWords = videos.reduce((sum, v) => sum + v.transcript.split(/\s+/).length, 0) / videos.length;
    const wordsPerSecond = avgWords / avgDuration;

    let rhythm = baseline.defaultRhythm;

    // Add pace information
    if (wordsPerSecond > 3) {
      rhythm += ". Fast-paced delivery";
    } else if (wordsPerSecond < 2) {
      rhythm += ". Deliberate, slower pace";
    } else {
      rhythm += ". Moderate pacing";
    }

    // Add energy information
    if (baseline.typicalEnergy === "high") {
      rhythm += " with energetic punctuation";
    } else if (baseline.typicalEnergy === "low") {
      rhythm += " with calm emphasis";
    }

    return rhythm;
  }

  /**
   * Calculate optimal authenticity threshold
   */
  private calculateOptimalThreshold(voiceProfile: VoiceProfile, speechPatterns: SpeechPatterns): number {
    // Base threshold on pattern consistency
    let threshold = 85; // Default

    // Increase threshold for very consistent patterns
    if (voiceProfile.hooks.length > 10) threshold += 5;
    if (Object.keys(voiceProfile.bridges).length > 8) threshold += 3;
    if (voiceProfile.signatureElements.length > 6) threshold += 2;

    // Decrease threshold for highly varied speakers
    if (speechPatterns.baseline.sentenceStructure === "varied") threshold -= 3;

    return Math.min(Math.max(threshold, 75), 95); // Keep in 75-95 range
  }

  /**
   * Analyze hook usage ratio
   */
  private analyzeHookRatio(hooks: string[]): GenerationParameters["hookRatio"] {
    // Assume first 60% are primary hooks, rest are secondary
    const primaryCount = Math.ceil(hooks.length * 0.6);

    return {
      primary: primaryCount,
      secondary: hooks.length - primaryCount,
    };
  }

  /**
   * Analyze sentence length distribution
   */
  private analyzeSentenceDistribution(sentencePatterns: string[]): GenerationParameters["sentenceDistribution"] {
    // Default distribution based on patterns
    const hasShort = sentencePatterns.some((p) => p.includes("Short"));
    const hasComplex = sentencePatterns.some((p) => p.includes("Complex"));

    if (hasShort) {
      return { short: 50, medium: 30, long: 20 };
    } else if (hasComplex) {
      return { short: 20, medium: 30, long: 50 };
    } else {
      return { short: 30, medium: 40, long: 30 };
    }
  }

  /**
   * Determine pattern rotation strategy
   */
  private determinePatternRotation(voiceProfile: VoiceProfile): GenerationParameters["patternRotation"] {
    // Choose strategy based on voice characteristics
    if (voiceProfile.hooks.length > 12) return "weighted";
    if (voiceProfile.signatureElements.length > 8) return "sequential";
    return "random";
  }

  /**
   * Helper method to get frequency map
   */
  private getFrequencyMap(items: string[]): Record<string, number> {
    return items.reduce(
      (freq, item) => {
        freq[item] = (freq[item] || 0) + 1;
        return freq;
      },
      {} as Record<string, number>,
    );
  }

  /**
   * Calculate variation coefficient
   */
  private calculateVariation(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const variance = numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;
    return Math.sqrt(variance);
  }
}

/**
 * Factory function for easy usage
 */
export function createVoiceProfiler(): VoiceProfiler {
  return new VoiceProfiler();
}

/**
 * Convenience function for voice profile creation
 */
export function createVoiceProfile(
  videos: VideoAnalysisData[],
  speechPatterns: SpeechPatterns,
  patternMatrix: PatternMappingMatrix,
): VoiceProfile {
  const profiler = createVoiceProfiler();
  return profiler.createProfile(videos, speechPatterns, patternMatrix);
}
