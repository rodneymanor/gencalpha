/**
 * Rules Engine
 * Enforces strict rules and constraints for authentic voice persona script generation
 */

import { VoiceProfile, GenerationParameters, RulesConfig, SpeechPatterns } from "../types";

/**
 * Default rules configuration based on your specification
 */
const DEFAULT_RULES: RulesConfig = {
  strictRules: {
    never: [
      "Use conjunctions absent from their vocabulary",
      "Create sentence structures outside their patterns",
      "Mismatch energy levels to context",
      "Forget signature bridge phrases",
      "Generate hooks outside their style",
      "Use formal language not in persona vocabulary",
      "Ignore established rhythm patterns",
      "Omit signature elements entirely",
    ],
    always: [
      "Maintain 80/20 primary/secondary hook ratio",
      "Follow documented sentence pattern distribution",
      "Insert unconscious tics at mapped intervals",
      "Match original content length ±20%",
      "Preserve breathing/pause patterns",
      "Use signature vocabulary fingerprint",
      "Maintain established energy levels",
      "Include bridge phrases at documented frequency",
    ],
  },
  patternConstraints: {
    hookRotationRatio: [80, 20], // Primary vs secondary hooks
    bridgeFrequencyMin: 2, // Minimum bridge phrases per 100 words
    signatureElementsRequired: 3, // Minimum signature elements per script
  },
  qualityThresholds: {
    minAuthenticityScore: 85,
    maxDeviationFromOriginal: 20, // Percentage deviation allowed
  },
};

/**
 * Rules Engine Class
 */
export class RulesEngine {
  private config: RulesConfig;

  constructor(config: Partial<RulesConfig> = {}) {
    this.config = this.mergeConfig(DEFAULT_RULES, config);
  }

  /**
   * Validate generation parameters against rules
   */
  validateGenerationParameters(
    params: GenerationParameters,
    profile: VoiceProfile,
    speechPatterns?: SpeechPatterns,
  ): { valid: boolean; violations: string[] } {
    console.log(`🔒 [RULES_ENGINE] Validating generation parameters`);

    const violations: string[] = [];

    // Check hook ratio constraints
    const totalHooks = params.hookRatio.primary + params.hookRatio.secondary;
    if (totalHooks > 0) {
      const primaryRatio = (params.hookRatio.primary / totalHooks) * 100;
      const expectedRatio = this.config.patternConstraints.hookRotationRatio[0];

      if (Math.abs(primaryRatio - expectedRatio) > 15) {
        violations.push(`Hook ratio deviation: ${primaryRatio.toFixed(1)}% primary vs expected ${expectedRatio}%`);
      }
    }

    // Check authenticity threshold
    if (params.authenticityThreshold < this.config.qualityThresholds.minAuthenticityScore) {
      violations.push(
        `Authenticity threshold ${params.authenticityThreshold}% below minimum ${this.config.qualityThresholds.minAuthenticityScore}%`,
      );
    }

    // Validate sentence distribution
    const totalDistribution = Object.values(params.sentenceDistribution).reduce((sum, val) => sum + val, 0);
    if (Math.abs(totalDistribution - 100) > 5) {
      violations.push(`Sentence distribution doesn't sum to 100%: ${totalDistribution}%`);
    }

    const isValid = violations.length === 0;
    console.log(
      `${isValid ? "✅" : "❌"} [RULES_ENGINE] Parameter validation ${isValid ? "passed" : "failed"} with ${violations.length} violations`
    );

    return { valid: isValid, violations };
  }

  /**
   * Validate generated script content against rules
   */
  validateGeneratedContent(
    content: string,
    profile: VoiceProfile,
    params: GenerationParameters,
    speechPatterns?: SpeechPatterns,
  ): { valid: boolean; violations: string[] } {
    console.log(`🔒 [RULES_ENGINE] Validating generated content (${content.length} characters)`);

    const violations: string[] = [];

    // Check NEVER rules
    violations.push(...this.checkNeverRules(content, profile, speechPatterns));

    // Check ALWAYS rules
    violations.push(...this.checkAlwaysRules(content, profile, params));

    // Check pattern constraints
    violations.push(...this.checkPatternConstraints(content, profile));

    // Check quality thresholds
    violations.push(...this.checkQualityThresholds(content, params));

    const isValid = violations.length === 0;
    console.log(
      `${isValid ? "✅" : "❌"} [RULES_ENGINE] Content validation ${isValid ? "passed" : "failed"} with ${violations.length} violations`
    );

    return { valid: isValid, violations };
  }

  /**
   * Get content generation constraints
   */
  getGenerationConstraints(
    profile: VoiceProfile,
    params: GenerationParameters,
  ): {
    requiredElements: string[];
    forbiddenElements: string[];
    structuralConstraints: Record<string, any>;
  } {
    const requiredElements = [
      ...profile.hooks.slice(0, Math.ceil(profile.hooks.length * 0.6)), // Primary hooks
      ...Object.keys(profile.bridges).slice(0, 3), // Top bridge phrases
      ...profile.signatureElements.slice(0, this.config.patternConstraints.signatureElementsRequired),
    ];

    const forbiddenElements = [
      "furthermore",
      "moreover",
      "consequently",
      "nevertheless", // Formal language
      "pursuant to",
      "in accordance with",
      "notwithstanding",
      // Add words not in vocabulary fingerprint that are overly formal
    ];

    const structuralConstraints = {
      hookRatio: this.config.patternConstraints.hookRotationRatio,
      minBridgeFrequency: this.config.patternConstraints.bridgeFrequencyMin,
      requiredSignatureElements: this.config.patternConstraints.signatureElementsRequired,
      sentenceDistribution: params.sentenceDistribution,
      maxDeviationPercent: this.config.qualityThresholds.maxDeviationFromOriginal,
    };

    return {
      requiredElements,
      forbiddenElements,
      structuralConstraints,
    };
  }

  /**
   * Check NEVER rules violations
   */
  private checkNeverRules(content: string, profile: VoiceProfile, speechPatterns?: SpeechPatterns): string[] {
    const violations: string[] = [];
    const contentLower = content.toLowerCase();

    // Check for formal language not in persona vocabulary
    const formalWords = ["furthermore", "moreover", "consequently", "nevertheless", "pursuant", "notwithstanding"];
    const personaWords = profile.vocabularyFingerprint.map((w) => w.toLowerCase());

    formalWords.forEach((formal) => {
      if (contentLower.includes(formal) && !personaWords.includes(formal)) {
        violations.push(`Uses formal conjunction '${formal}' absent from vocabulary`);
      }
    });

    // Check sentence structure deviation
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const avgLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;

    const patternText = profile.sentencePatterns.join(" ").toLowerCase();
    if (patternText.includes("short") && avgLength > 12) {
      violations.push("Creates sentence structures outside short patterns");
    }
    if (patternText.includes("complex") && avgLength < 8) {
      violations.push("Creates sentence structures outside complex patterns");
    }

    // Check for missing signature elements
    const signatureMatches = profile.signatureElements.filter((element) =>
      contentLower.includes(element.toLowerCase()),
    ).length;

    if (signatureMatches === 0) {
      violations.push("Omits signature elements entirely");
    }

    // Check energy level mismatch
    if (speechPatterns) {
      const baselineEnergy = speechPatterns.baseline.typicalEnergy;
      const capsCount = (content.match(/[A-Z]/g) || []).length;
      const exclamationCount = (content.match(/!/g) || []).length;
      const contentEnergyScore = ((capsCount + exclamationCount * 2) / content.length) * 100;

      if (baselineEnergy === "high" && contentEnergyScore < 1) {
        violations.push("Mismatches energy level - too low for high-energy persona");
      }
      if (baselineEnergy === "low" && contentEnergyScore > 3) {
        violations.push("Mismatches energy level - too high for low-energy persona");
      }
    }

    return violations;
  }

  /**
   * Check ALWAYS rules violations
   */
  private checkAlwaysRules(content: string, profile: VoiceProfile, params: GenerationParameters): string[] {
    const violations: string[] = [];
    const contentLower = content.toLowerCase();
    const wordCount = content.split(/\s+/).length;

    // Check hook ratio (ALWAYS rule 1)
    const hookMatches = profile.hooks.filter((hook) => contentLower.includes(hook.toLowerCase()));

    if (hookMatches.length === 0) {
      violations.push("Fails to maintain hook usage ratio - no persona hooks found");
    }

    // Check bridge phrase frequency (ALWAYS rule 8)
    const bridgeMatches = Object.keys(profile.bridges).filter((bridge) =>
      contentLower.includes(bridge.toLowerCase()),
    ).length;

    const expectedBridges = Math.max(1, Math.floor(wordCount / 50)); // Expect ~1 per 50 words
    if (bridgeMatches < expectedBridges * 0.5) {
      violations.push(`Insufficient bridge phrase frequency: ${bridgeMatches} found, ${expectedBridges} expected`);
    }

    // Check vocabulary fingerprint usage (ALWAYS rule 6)
    const vocabMatches = profile.vocabularyFingerprint.filter((word) =>
      contentLower.includes(word.toLowerCase()),
    ).length;

    const expectedVocabUsage = Math.max(2, Math.floor(profile.vocabularyFingerprint.length * 0.3));
    if (vocabMatches < expectedVocabUsage) {
      violations.push(
        `Insufficient signature vocabulary usage: ${vocabMatches}/${profile.vocabularyFingerprint.length} words`,
      );
    }

    // Check signature elements requirement (ALWAYS rule 3)
    const requiredSignatureElements = this.config.patternConstraints.signatureElementsRequired;
    const signatureMatches = profile.signatureElements.filter((element) =>
      contentLower.includes(element.toLowerCase()),
    ).length;

    if (signatureMatches < requiredSignatureElements) {
      violations.push(`Insufficient signature elements: ${signatureMatches}/${requiredSignatureElements} required`);
    }

    return violations;
  }

  /**
   * Check pattern constraints
   */
  private checkPatternConstraints(content: string, profile: VoiceProfile): string[] {
    const violations: string[] = [];
    const wordCount = content.split(/\s+/).length;

    // Check minimum bridge frequency
    const bridgeCount = Object.keys(profile.bridges).filter((bridge) =>
      content.toLowerCase().includes(bridge.toLowerCase()),
    ).length;

    const minBridgesExpected = Math.ceil((wordCount / 100) * this.config.patternConstraints.bridgeFrequencyMin);
    if (bridgeCount < minBridgesExpected) {
      violations.push(
        `Bridge frequency below minimum: ${bridgeCount} found, ${minBridgesExpected} required per 100 words`,
      );
    }

    // Check hook rotation ratio
    const primaryHooks = profile.hooks.slice(0, Math.ceil(profile.hooks.length * 0.6));
    const secondaryHooks = profile.hooks.slice(Math.ceil(profile.hooks.length * 0.6));

    const primaryMatches = primaryHooks.filter((hook) => content.toLowerCase().includes(hook.toLowerCase())).length;

    const secondaryMatches = secondaryHooks.filter((hook) => content.toLowerCase().includes(hook.toLowerCase())).length;

    const totalMatches = primaryMatches + secondaryMatches;
    if (totalMatches > 0) {
      const actualPrimaryRatio = (primaryMatches / totalMatches) * 100;
      const expectedRatio = this.config.patternConstraints.hookRotationRatio[0];

      if (Math.abs(actualPrimaryRatio - expectedRatio) > 20) {
        violations.push(
          `Hook rotation ratio deviation: ${actualPrimaryRatio.toFixed(1)}% primary vs expected ${expectedRatio}%`,
        );
      }
    }

    return violations;
  }

  /**
   * Check quality thresholds
   */
  private checkQualityThresholds(content: string, params: GenerationParameters): string[] {
    const violations: string[] = [];

    // Check content length deviation
    const actualLength = content.split(/\s+/).length;
    const targetLength = params.optimalLength * 3; // Rough words per second estimate
    const deviation = (Math.abs(actualLength - targetLength) / targetLength) * 100;

    if (deviation > this.config.qualityThresholds.maxDeviationFromOriginal) {
      violations.push(
        `Content length deviation: ${deviation.toFixed(1)}% (max: ${this.config.qualityThresholds.maxDeviationFromOriginal}%)`,
      );
    }

    return violations;
  }

  /**
   * Deep merge configuration objects
   */
  private mergeConfig(defaultConfig: RulesConfig, userConfig: Partial<RulesConfig>): RulesConfig {
    return {
      strictRules: {
        never: [...(defaultConfig.strictRules.never || []), ...(userConfig.strictRules?.never || [])],
        always: [...(defaultConfig.strictRules.always || []), ...(userConfig.strictRules?.always || [])],
      },
      patternConstraints: {
        ...defaultConfig.patternConstraints,
        ...userConfig.patternConstraints,
      },
      qualityThresholds: {
        ...defaultConfig.qualityThresholds,
        ...userConfig.qualityThresholds,
      },
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RulesConfig>): void {
    this.config = this.mergeConfig(this.config, config);
  }

  /**
   * Get current configuration
   */
  getConfig(): RulesConfig {
    return { ...this.config };
  }
}

/**
 * Factory function for easy usage
 */
export function createRulesEngine(config?: Partial<RulesConfig>): RulesEngine {
  return new RulesEngine(config);
}

/**
 * Convenience function for content validation
 */
export function validateContent(
  content: string,
  profile: VoiceProfile,
  params: GenerationParameters,
  speechPatterns?: SpeechPatterns,
  config?: Partial<RulesConfig>,
): { valid: boolean; violations: string[] } {
  const engine = createRulesEngine(config);
  return engine.validateGeneratedContent(content, profile, params, speechPatterns);
}
