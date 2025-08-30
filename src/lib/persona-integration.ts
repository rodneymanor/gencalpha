/**
 * Persona Integration System
 * Converts voice analysis data into actionable prompt instructions for AI script generation
 */

interface VoiceAnalysis {
  voiceProfile: {
    distinctiveness: string;
    complexity: string;
    primaryStyle: string;
  };
  hookReplicationSystem?: {
    primaryHookType: string;
    hookTemplates: Array<{
      template: string;
      type: string;
      frequency: number;
      effectiveness: string;
      emotionalTrigger: string;
      realExamples: string[];
      newExamples: string[];
    }>;
    hookProgression: {
      structure: string;
      avgWordCount: number;
      timing: string;
      examples: string[];
    };
    hookRules: string[];
  };
  linguisticFingerprint: {
    avgSentenceLength: number;
    vocabularyTier: {
      simple: number;
      moderate: number;
      advanced: number;
    };
    topUniqueWords: string[];
    avoidedWords: string[];
    grammarQuirks: string[];
  };
  transitionPhrases: {
    conceptBridges: string[];
    enumeration: string[];
    topicPivots: string[];
    softeners: string[];
  };
  microPatterns: {
    fillers: string[];
    emphasisWords: string[];
    numberPatterns: string;
    timeReferences: string[];
  };
  scriptGenerationRules?: {
    mustInclude: string[];
    neverInclude: string[];
    optimalStructure: {
      hookSection: string;
      bodySection: string;
      closeSection: string;
    };
    formulaForNewScript: string;
  };
  signatureMoves: Array<{
    move: string;
    description: string;
    frequency: string;
    placement: string;
    verbatim: string[];
  }>;
}

/**
 * Generate persona-specific instructions to be injected into AI prompts
 */
export function generatePersonaInstructions(persona: VoiceAnalysis): string {
  const instructions = [];

  instructions.push("=== VOICE CLONING MODE ACTIVATED ===");
  instructions.push("You are now this creator. Write in their EXACT voice. Every pattern below is MANDATORY:\n");

  // Voice Profile
  instructions.push("VOICE PROFILE:");
  instructions.push(`- Style: ${persona.voiceProfile.primaryStyle}`);
  instructions.push(`- Complexity: ${persona.voiceProfile.complexity}`);
  instructions.push(`- Distinctiveness: ${persona.voiceProfile.distinctiveness}/10`);
  instructions.push("");

  // Hook System - MANDATORY TEMPLATES
  if (persona.hookReplicationSystem) {
    instructions.push("MANDATORY HOOK TEMPLATES (choose ONE and adapt to your topic):");
    persona.hookReplicationSystem.hookTemplates.forEach((template, i) => {
      instructions.push(`${i + 1}. "${template.template}"`);
      instructions.push(`   → Triggers ${template.emotionalTrigger}, ${template.effectiveness} effectiveness`);
      instructions.push(`   → UNIVERSAL: Works for any subject matter`);
      // Show how to apply the template
      instructions.push(`   → Fill placeholders with your topic-specific content`);
    });

    instructions.push(`\nHOOK REQUIREMENTS:`);
    instructions.push(`- Length: EXACTLY ${persona.hookReplicationSystem.hookProgression.avgWordCount} words`);
    instructions.push(`- Structure: ${persona.hookReplicationSystem.hookProgression.structure}`);

    instructions.push("\nHOOK RULES (NON-NEGOTIABLE):");
    persona.hookReplicationSystem.hookRules.forEach((rule) => {
      instructions.push(`✓ ${rule}`);
    });
    instructions.push("");
  }

  // Linguistic Requirements - MANDATORY
  instructions.push("LANGUAGE REQUIREMENTS (MUST FOLLOW):");
  instructions.push(`- Sentence length: Average ${persona.linguisticFingerprint.avgSentenceLength} words per sentence`);
  instructions.push(
    `- Vocabulary: ${persona.linguisticFingerprint.vocabularyTier.simple}% simple, ${persona.linguisticFingerprint.vocabularyTier.moderate}% moderate, ${persona.linguisticFingerprint.vocabularyTier.advanced}% advanced words`,
  );

  if (persona.linguisticFingerprint.topUniqueWords.length > 0) {
    instructions.push(`- MUST use these words: ${persona.linguisticFingerprint.topUniqueWords.join(", ")}`);
  }

  if (persona.linguisticFingerprint.avoidedWords.length > 0) {
    instructions.push(`- NEVER use these words: ${persona.linguisticFingerprint.avoidedWords.join(", ")}`);
  }

  if (persona.linguisticFingerprint.grammarQuirks.length > 0) {
    instructions.push("- Grammar style (copy exactly):");
    persona.linguisticFingerprint.grammarQuirks.forEach((quirk) => {
      instructions.push(`  ✓ ${quirk}`);
    });
  }
  instructions.push("");

  // Transitions - USE EXACT PHRASES
  instructions.push("MANDATORY TRANSITION PHRASES (use these exact words):");
  if (persona.transitionPhrases.conceptBridges.length > 0) {
    instructions.push(`- Between ideas: "${persona.transitionPhrases.conceptBridges.join('", "')}"`);
  }
  if (persona.transitionPhrases.enumeration.length > 0) {
    instructions.push(`- For lists: "${persona.transitionPhrases.enumeration.join('", "')}"`);
  }
  if (persona.transitionPhrases.topicPivots.length > 0) {
    instructions.push(`- Topic changes: "${persona.transitionPhrases.topicPivots.join('", "')}"`);
  }
  instructions.push("");

  // Micro Patterns
  instructions.push("MICRO PATTERNS:");
  if (persona.microPatterns.fillers.length > 0) {
    instructions.push(`- Fillers: ${persona.microPatterns.fillers.join(", ")}`);
  }
  if (persona.microPatterns.emphasisWords.length > 0) {
    instructions.push(`- Emphasis words: ${persona.microPatterns.emphasisWords.join(", ")}`);
  }
  instructions.push(`- Number style: ${persona.microPatterns.numberPatterns}`);
  instructions.push("");

  // Script Generation Rules
  if (persona.scriptGenerationRules) {
    instructions.push("SCRIPT RULES:");
    instructions.push("Must include:");
    persona.scriptGenerationRules.mustInclude.forEach((rule) => {
      instructions.push(`✓ ${rule}`);
    });

    instructions.push("\nNever include:");
    persona.scriptGenerationRules.neverInclude.forEach((rule) => {
      instructions.push(`✗ ${rule}`);
    });

    instructions.push(
      `\nStructure: ${persona.scriptGenerationRules.optimalStructure.hookSection} → ${persona.scriptGenerationRules.optimalStructure.bodySection} → ${persona.scriptGenerationRules.optimalStructure.closeSection}`,
    );

    instructions.push(`\nFormula: ${persona.scriptGenerationRules.formulaForNewScript}`);
    instructions.push("");
  }

  // Signature Moves
  if (persona.signatureMoves.length > 0) {
    instructions.push("SIGNATURE MOVES (include these techniques):");
    persona.signatureMoves.forEach((move) => {
      instructions.push(`- ${move.move}: ${move.description} (use ${move.frequency}, place in ${move.placement})`);
      if (move.verbatim.length > 0) {
        instructions.push(`  Example phrases: "${move.verbatim.join('", "')}"`);
      }
    });
    instructions.push("");
  }

  instructions.push("=== END VOICE CLONING INSTRUCTIONS ===");
  instructions.push(
    "\nCRITICAL: Every word must sound like this creator wrote it. Use their exact patterns, phrases, and formula. The script must be indistinguishable from their original content.",
  );

  return instructions.join("\n");
}

/**
 * Combine base assistant prompt with persona instructions
 */
export function enhancePromptWithPersona(basePrompt: string, persona: VoiceAnalysis): string {
  const personaInstructions = generatePersonaInstructions(persona);

  return `${basePrompt}

${personaInstructions}`;
}

/**
 * Generate topic-specific persona instructions for script generation (most optimal approach)
 */
export function generateTopicPersonaPrompt(persona: VoiceAnalysis, topic: string): string {
  const instructions = [];

  instructions.push("=== UNIVERSAL VOICE TRANSFER: SCRIPT GENERATION ===");
  instructions.push(`TOPIC: ${topic}`);
  instructions.push(
    "Apply this creator's voice patterns to this new topic. The templates are universal - adapt them to your subject.\n",
  );

  // Hook Selection - Most Important
  if (persona.hookReplicationSystem?.hookTemplates.length > 0) {
    instructions.push("1. CHOOSE ONE UNIVERSAL HOOK TEMPLATE:");
    instructions.push("Replace the [PLACEHOLDERS] with content specific to your topic:");
    persona.hookReplicationSystem.hookTemplates.forEach((template, i) => {
      instructions.push(`Option ${i + 1}: "${template.template}"`);
      instructions.push(`          (${template.effectiveness} effectiveness, triggers ${template.emotionalTrigger})`);
    });
    instructions.push("");
  }

  // Script Formula
  if (persona.scriptGenerationRules?.formulaForNewScript) {
    instructions.push("2. FOLLOW THIS EXACT SCRIPT FORMULA:");
    instructions.push(persona.scriptGenerationRules.formulaForNewScript);
    instructions.push("");
  }

  // Mandatory Elements
  if (persona.scriptGenerationRules?.mustInclude.length > 0) {
    instructions.push("3. MUST INCLUDE:");
    persona.scriptGenerationRules.mustInclude.forEach((rule) => {
      instructions.push(`✓ ${rule}`);
    });
    instructions.push("");
  }

  // Forbidden Elements
  if (persona.scriptGenerationRules?.neverInclude.length > 0) {
    instructions.push("4. NEVER INCLUDE:");
    persona.scriptGenerationRules.neverInclude.forEach((rule) => {
      instructions.push(`✗ ${rule}`);
    });
    instructions.push("");
  }

  // Language Constraints
  instructions.push("5. LANGUAGE REQUIREMENTS:");
  instructions.push(`- Sentence length: ${persona.linguisticFingerprint.avgSentenceLength} words average`);
  if (persona.linguisticFingerprint.topUniqueWords.length > 0) {
    instructions.push(`- Use these words: ${persona.linguisticFingerprint.topUniqueWords.join(", ")}`);
  }
  instructions.push("");

  // Signature Elements
  if (persona.signatureMoves.length > 0) {
    instructions.push("6. INCLUDE SIGNATURE MOVES:");
    persona.signatureMoves.forEach((move) => {
      instructions.push(`- ${move.move} (${move.placement})`);
    });
    instructions.push("");
  }

  instructions.push("WRITE THE SCRIPT NOW:");
  instructions.push("- Apply the creator's voice patterns to YOUR topic");
  instructions.push("- Use the universal templates with your specific content");
  instructions.push("- Maintain their energy, pacing, and structure");
  instructions.push("- The result should sound like this creator talking about YOUR subject");

  return instructions.join("\n");
}

/**
 * Extract persona name/identifier for logging
 */
export function getPersonaName(persona: VoiceAnalysis): string {
  // For now, use voice profile info. Later we can add a name field
  return `${persona.voiceProfile.primaryStyle}_${persona.voiceProfile.distinctiveness}`;
}
