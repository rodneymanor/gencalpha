/**
 * Script Generator
 * Generates authentic scripts using voice persona profiles and generation rules
 */

import { createAuthenticityScorer, AuthenticityScorer } from "../analyzers/authenticity-scorer";
import {
  PersonaProfile,
  ScriptGenerationInput,
  GeneratedScript,
  ScriptGenerationResult,
} from "../types";
import { createRulesEngine, RulesEngine } from "./rules-engine";

/**
 * Script generation configuration
 */
interface GenerationConfig {
  maxRetries: number;
  enableRuleValidation: boolean;
  enableAuthenticityScoring: boolean;
  minAcceptableScore: number;
  debugMode: boolean;
}

const DEFAULT_CONFIG: GenerationConfig = {
  maxRetries: 3,
  enableRuleValidation: true,
  enableAuthenticityScoring: true,
  minAcceptableScore: 85,
  debugMode: false,
};

/**
 * Script Generator Class
 */
export class ScriptGenerator {
  private config: GenerationConfig;
  private rulesEngine: RulesEngine;
  private authenticityScorer: AuthenticityScorer;

  constructor(config: Partial<GenerationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.rulesEngine = createRulesEngine();
    this.authenticityScorer = createAuthenticityScorer({
      minPassingScore: this.config.minAcceptableScore,
    });
  }

  /**
   * Generate a 30-second script using the persona profile
   * Implements the formula: Hook → Bridge → Core Message → Escalation → Close
   */
  async generateScript(input: ScriptGenerationInput, personaProfile: PersonaProfile): Promise<ScriptGenerationResult> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    console.log(`🎬 [SCRIPT_GENERATOR] Generating script for persona ${input.personaId} on topic: ${input.topic}`);

    try {
      let attempts = 0;
      let bestScript: GeneratedScript | null = null;
      let bestScore = 0;

      while (attempts < this.config.maxRetries) {
        attempts++;
        console.log(`🎯 [SCRIPT_GENERATOR] Attempt ${attempts}/${this.config.maxRetries}`);

        try {
          // Generate script structure
          const scriptStructure = this.generateScriptStructure(input, personaProfile);

          // Combine structure into full script
          const fullScript = this.combineStructure(scriptStructure);

          // Validate against rules if enabled
          if (this.config.enableRuleValidation) {
            const validation = this.rulesEngine.validateGeneratedContent(
              fullScript,
              personaProfile.voiceProfile,
              personaProfile.generationParameters,
              personaProfile.speechPatterns,
            );

            if (!validation.valid) {
              console.log(`❌ [SCRIPT_GENERATOR] Rule validation failed: ${validation.violations.join(", ")}`);
              if (attempts < this.config.maxRetries) continue;
            }
          }

          // Score authenticity if enabled
          let authenticityScore = 0;
          if (this.config.enableAuthenticityScoring) {
            const authenticity = this.authenticityScorer.scoreAuthenticity(
              fullScript,
              personaProfile.voiceProfile,
              personaProfile.speechPatterns,
            );
            authenticityScore = authenticity.overallScore;

            if (authenticityScore < this.config.minAcceptableScore && attempts < this.config.maxRetries) {
              console.log(
                `📊 [SCRIPT_GENERATOR] Authenticity score ${authenticityScore}% below threshold ${this.config.minAcceptableScore}%`,
              );
              continue;
            }
          }

          // Create generated script object
          const generatedScript: GeneratedScript = {
            id: this.generateScriptId(),
            personaId: input.personaId,
            topic: input.topic,
            script: fullScript,
            structure: scriptStructure,
            authenticity: this.config.enableAuthenticityScoring
              ? this.authenticityScorer.scoreAuthenticity(
                  fullScript,
                  personaProfile.voiceProfile,
                  personaProfile.speechPatterns,
                )
              : this.createDefaultAuthenticity(),
            metadata: {
              generatedAt: new Date().toISOString(),
              targetLength: input.targetLength,
              actualLength: this.estimateScriptDuration(fullScript),
              wordCount: fullScript.split(/\s+/).length,
            },
          };

          // Keep track of best attempt
          if (authenticityScore > bestScore) {
            bestScript = generatedScript;
            bestScore = authenticityScore;
          }

          // If we meet all criteria, use this script
          if (authenticityScore >= this.config.minAcceptableScore) {
            console.log(`✅ [SCRIPT_GENERATOR] Script generated successfully with ${authenticityScore}% authenticity`);
            break;
          }
        } catch (error) {
          console.error(`❌ [SCRIPT_GENERATOR] Attempt ${attempts} failed:`, error);
          if (attempts === this.config.maxRetries) {
            throw error;
          }
        }
      }

      // Use best script if no perfect one was generated
      if (!bestScript) {
        throw new Error("Failed to generate acceptable script after all attempts");
      }

      const generationTime = Date.now() - startTime;
      console.log(
        `🎉 [SCRIPT_GENERATOR] Script generation completed in ${generationTime}ms with ${bestScore}% authenticity`,
      );

      return {
        success: true,
        script: bestScript,
        metadata: {
          generationTime,
          requestId,
        },
      };
    } catch (error) {
      const generationTime = Date.now() - startTime;
      console.error(`❌ [SCRIPT_GENERATOR] Script generation failed after ${generationTime}ms:`, error);

      return {
        success: false,
        error: {
          code: "GENERATION_FAILED",
          message: error instanceof Error ? error.message : "Unknown generation error",
        },
        metadata: {
          generationTime,
          requestId,
        },
      };
    }
  }

  /**
   * Generate script structure following the 30-second formula
   */
  private generateScriptStructure(input: ScriptGenerationInput, profile: PersonaProfile): GeneratedScript["structure"] {
    console.log(`🏗️ [SCRIPT_GENERATOR] Building script structure for ${input.targetLength}s target`);

    // 1. HOOK (0-3 sec): Use persona's top hook patterns
    const hook = this.generateHook(input, profile);

    // 2. BRIDGE (3-5 sec): Use primary connector
    const bridge = this.generateBridge(input, profile);

    // 3. CORE MESSAGE (5-20 sec): Main content with persona patterns
    const coreMessage = this.generateCoreMessage(input, profile);

    // 4. ESCALATION (20-25 sec): Climax phrase with energy spike
    const escalation = this.generateEscalation(input, profile);

    // 5. CLOSE (25-30 sec): Conclusion pattern
    const close = this.generateClose(input, profile);

    return {
      hook,
      bridge,
      coreMessage,
      escalation,
      close,
    };
  }

  /**
   * Generate hook using persona's patterns (0-3 seconds)
   */
  private generateHook(input: ScriptGenerationInput, profile: PersonaProfile): string {
    const hooks = profile.voiceProfile.hooks;
    const primaryHooks = hooks.slice(0, Math.ceil(hooks.length * 0.6));

    // Select hook based on style preference
    let selectedHook = primaryHooks[0] || "Hey everyone";

    if (input.style === "energetic" && primaryHooks.length > 1) {
      selectedHook = primaryHooks.find((h) => h.toLowerCase().includes("check")) || primaryHooks[1] || selectedHook;
    } else if (input.style === "educational") {
      selectedHook = primaryHooks.find((h) => h.toLowerCase().includes("let")) || primaryHooks[0] || selectedHook;
    }

    // Customize hook for topic if possible
    const topicHook = this.customizeForTopic(selectedHook, input.topic);

    return this.capitalizeFirstLetter(topicHook);
  }

  /**
   * Generate bridge phrase (3-5 seconds)
   */
  private generateBridge(input: ScriptGenerationInput, profile: PersonaProfile): string {
    const bridges = Object.entries(profile.voiceProfile.bridges)
      .sort((a, b) => b[1] - a[1]) // Sort by frequency
      .slice(0, 3)
      .map(([phrase]) => phrase);

    const selectedBridge = bridges[0] || "here's the thing";
    return this.capitalizeFirstLetter(selectedBridge);
  }

  /**
   * Generate core message (5-20 seconds)
   */
  private generateCoreMessage(input: ScriptGenerationInput, profile: PersonaProfile): string {
    const sentencePatterns = profile.voiceProfile.sentencePatterns;
    const vocabularyWords = profile.voiceProfile.vocabularyFingerprint.slice(0, 10);
    const signatureElements = profile.voiceProfile.signatureElements;

    // Build core message using topic and persona elements
    let coreMessage = `When it comes to ${input.topic.toLowerCase()}, `;

    // Add persona-specific vocabulary
    if (vocabularyWords.length > 0) {
      const randomVocab = vocabularyWords[Math.floor(Math.random() * vocabularyWords.length)];
      coreMessage += `${randomVocab} is absolutely crucial. `;
    }

    // Add personal reference if available
    const personalReferences = profile.speechPatterns.emotionalStates.explaining.transitionWords.filter((word) =>
      word.toLowerCase().includes("i "),

    if (personalReferences.length > 0) {
      coreMessage += `${personalReferences[0]} this changed everything for me. `;
    } else {
      coreMessage += `This is what most people don't understand. `;
    }

    // Add signature element
    if (signatureElements.length > 0) {
      const randomSignature = signatureElements[Math.floor(Math.random() * signatureElements.length)];
      coreMessage += `${randomSignature}, `;
    }

    // Add topic-specific content
    coreMessage += this.generateTopicContent(input.topic, profile);

    return coreMessage.trim();
  }

  /**
   * Generate escalation section (20-25 seconds)
   */
  private generateEscalation(input: ScriptGenerationInput, profile: PersonaProfile): string {
    const excitedMarkers = profile.speechPatterns.emotionalStates.excited.markerPhrases;
    const energyMarker = excitedMarkers[0] || "THIS is incredible";

    let escalation = `But ${energyMarker.toLowerCase()}! `;

    // Add emphasis based on persona energy
    if (profile.speechPatterns.baseline.typicalEnergy === "high") {
      escalation += `The results are MIND-BLOWING when you `;
    } else {
      escalation += `What happens next is remarkable when you `;
    }

    escalation += this.generateActionStatement(input.topic, profile);

    return escalation;
  }

  /**
   * Generate closing section (25-30 seconds)
   */
  private generateClose(input: ScriptGenerationInput, profile: PersonaProfile): string {
    const closingPhrases = profile.speechPatterns.signatureElements.catchphrases.closing;
    const audienceAddress =
      ["you guys", "everyone", "people"].find((addr) => profile.voiceProfile.vocabularyFingerprint.includes(addr)) ||
      "you";

    let close = closingPhrases.length > 0
      ? closingPhrases[0]
      : `So ${audienceAddress}, `;

    close += `if you want to master ${input.topic.toLowerCase()}, `;

    // Add call to action with persona style
    if (profile.speechPatterns.baseline.typicalEnergy === "high") {
      close += `DROP a comment below and let me know what you think!`;
    } else {
      close += `let me know in the comments what your experience has been.`;
    }

    return close;
  }

  /**
   * Generate topic-specific content using persona vocabulary
   */
  private generateTopicContent(topic: string, profile: PersonaProfile): string {
    const vocab = profile.voiceProfile.vocabularyFingerprint;
    const actionWords = vocab.filter((word) =>
      ["make", "get", "find", "use", "work", "help", "show", "give"].some((action) => word.includes(action)),
    );

    const actionWord = actionWords[0] || "use";

    return `you need to ${actionWord} the right approach. Most people skip the fundamentals, but that's exactly why they struggle.`;
  }

  /**
   * Generate action statement for escalation
   */
  private generateActionStatement(topic: string, profile: PersonaProfile): string {
    const vocab = profile.voiceProfile.vocabularyFingerprint;
    const processWords = vocab.filter((word) =>
      ["apply", "follow", "implement", "practice", "focus"].some((process) => word.includes(process)),
    );

    const processWord = processWords[0] || "apply";

    return `${processWord} these principles consistently. It's not just theory - this is proven to work.`;
  }

  /**
   * Customize hook for specific topic
   */
  private customizeForTopic(hook: string, topic: string): string {
    // Simple topic integration - could be made more sophisticated
    if (hook.toLowerCase().includes("check this out")) {
      return `Check this out - ${topic.toLowerCase()} just got way easier`;
    }
    if (hook.toLowerCase().includes("listen up")) {
      return `Listen up - everything you know about ${topic.toLowerCase()} is wrong`;
    }

    return hook;
  }

  /**
   * Combine structure elements into full script
   */
  private combineStructure(structure: GeneratedScript["structure"]): string {
    return [structure.hook, structure.bridge, structure.coreMessage, structure.escalation, structure.close].join(" ");
  }

  /**
   * Estimate script duration in seconds (rough approximation)
   */
  private estimateScriptDuration(script: string): number {
    const wordCount = script.split(/\s+/).length;
    const wordsPerSecond = 3; // Average speaking rate
    return Math.round(wordCount / wordsPerSecond);
  }

  /**
   * Create default authenticity metrics when scoring is disabled
   */
  private createDefaultAuthenticity(): any {
    return {
      hookAccuracy: { weight: 20, score: 80, check: "Default scoring disabled" },
      bridgeFrequency: { weight: 20, score: 80, check: "Default scoring disabled" },
      sentencePatterns: { weight: 20, score: 80, check: "Default scoring disabled" },
      vocabularyMatch: { weight: 20, score: 80, check: "Default scoring disabled" },
      rhythmReplication: { weight: 20, score: 80, check: "Default scoring disabled" },
      overallScore: 80,
    };
  }

  /**
   * Utility methods
   */
  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateScriptId(): string {
    return `script_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<GenerationConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function for easy usage
 */
export function createScriptGenerator(config?: Partial<GenerationConfig>): ScriptGenerator {
  return new ScriptGenerator(config);
}

/**
 * Convenience function for script generation
 */
export async function generatePersonaScript(
  input: ScriptGenerationInput,
  personaProfile: PersonaProfile,
  config?: Partial<GenerationConfig>,
): Promise<ScriptGenerationResult> {
  const generator = createScriptGenerator(config);
  return await generator.generateScript(input, personaProfile);
}
