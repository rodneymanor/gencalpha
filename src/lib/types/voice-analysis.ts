/*
  Voice Analysis Types
  These interfaces mirror the expected JSON structure returned by the forensic analysis prompt.
  They intentionally prioritize readability and maintainability over 100% exhaustiveness.
  If the model returns additional fields, they will be preserved at runtime but not typed here.
*/

export interface VoiceAnalysisMetadata {
  creatorName: string;
  transcriptWordCount: number;
  transcriptDuration: string;
  accuracyLevel: "Limited" | "Optimal" | "Excessive";
  analysisTimestamp: string; // ISO 8601
  confidenceScore: number;
  analysisId?: string;
}

export interface HookPatternCommon {
  pattern: string;
  exactExamplesFromTranscript: string[];
  frequency: number;
  generatedVariations: string[];
}

export interface QuestionHookPattern extends HookPatternCommon {
  subPatterns: Array<{
    structure: string;
    example: string;
    usage: string;
  }>;
}

export interface StoryHookPattern extends HookPatternCommon {
  narrativeStyle: string;
}

export interface StatementHookPattern extends HookPatternCommon {
  boldnessLevel: "conservative" | "moderate" | "aggressive";
}

export interface ProblemSolutionHookPattern extends HookPatternCommon {
  tensionBuildStyle: string;
}

export interface HookEngineeringTaxonomy {
  questionHooks: QuestionHookPattern;
  storyHooks: StoryHookPattern;
  statementHooks: StatementHookPattern;
  problemSolutionHooks: ProblemSolutionHookPattern;
}

export interface PrimaryHookFormula {
  type: "question" | "story" | "statement" | "problem_solution";
  usagePercentage: number;
  signature: string;
}

export interface HookEngineeringSection {
  taxonomy: HookEngineeringTaxonomy;
  primaryHookFormula: PrimaryHookFormula;
}

export interface ConjunctionPattern {
  word: string;
  occurrences: number;
  rank: number;
  contexts: string[];
}

export interface BridgePhraseInstance {
  exactPhrase: string;
  frequency: number;
  example: string;
}

export interface BridgeDetectionSystem {
  conjunctionPatterns: ConjunctionPattern[];
  bridgePhrases: {
    afterPoint: BridgePhraseInstance;
    beforeExamples: BridgePhraseInstance;
    topicChange: BridgePhraseInstance;
    buildingAnticipation: BridgePhraseInstance;
    circlingBack: BridgePhraseInstance;
  };
}

export interface SentenceFlowFormulaComponent {
  opening: string;
  middle: string;
  closing: string;
}

export interface SentenceFlowFormula {
  patternName: string; // Pattern A/B/C naming convention
  structure: string;
  usagePercentage: number;
  example: string;
  components: SentenceFlowFormulaComponent;
}

export interface SentenceArchitecturePatterns {
  bridgeDetectionSystem: BridgeDetectionSystem;
  sentenceFlowFormulas: SentenceFlowFormula[]; // expected >= 3
}

export interface AdjectiveStackingSingle {
  percentage: number;
  structure: string;
  topAdjectives: string[];
  examples: string[];
}

export interface AdjectiveStackingDouble {
  percentage: number;
  structure: string;
  commonCombos: Array<{ combo: string; frequency: number; example: string }>;
}

export interface AdjectiveStackingTriple {
  percentage: number;
  structure: string;
  examples: string[];
}

export interface AdjectiveStackingPatterns {
  single: AdjectiveStackingSingle;
  double: AdjectiveStackingDouble;
  triple: AdjectiveStackingTriple;
  signatureCombinations: string[];
}

export interface EmphasisLevelLadder {
  words: string[];
  usage: string; // when they use
  frequency: number | string; // allow string for model variability
}

export interface EmphasisEscalationLadder {
  mild: EmphasisLevelLadder;
  medium: EmphasisLevelLadder;
  strong: EmphasisLevelLadder;
  peak: EmphasisLevelLadder;
  progressionPattern: string;
}

export interface UnconsciousVerbalTics {
  thinkingPauses: {
    exactFiller: string;
    averagePauseLength: string;
    occurrenceRate: string; // per X sentences
    placement: "beginning" | "middle" | "end" | string;
  };
  excitementMarkers: {
    indicators: string[];
    physicalDescription: string;
    frequency: string;
  };
  uncertaintyMarkers: {
    phrases: string[];
    pattern: string;
    frequency: string;
  };
  agreementBuilders: {
    phrases: string[];
    technique: string;
    frequency: string;
  };
}

export interface MicroLanguageFingerprint {
  adjectiveStackingPatterns: AdjectiveStackingPatterns;
  emphasisEscalationLadder: EmphasisEscalationLadder;
  unconsciousVerbalTics: UnconsciousVerbalTics;
}

export interface ParagraphPatternStats {
  sentenceCount: number;
  wordCount: number;
  percentage: number;
  purpose: string;
}

export interface ParagraphBreathingPattern {
  shortBurst: ParagraphPatternStats;
  mediumFlow: ParagraphPatternStats;
  longForm: ParagraphPatternStats;
  naturalPattern: string;
}

export interface EnergyPhase {
  level: string; // low|medium|high|peak
  duration: string; // sentences X-Y
  markers: string[];
}

export interface EnergyWavePattern {
  opening: EnergyPhase;
  buildup: EnergyPhase;
  peak: EnergyPhase;
  resolution: EnergyPhase;
  waveShape: string; // gradual|sharp|rolling|explosive
}

export interface ContentRhythmMapping {
  paragraphBreathingPattern: ParagraphBreathingPattern;
  energyWavePattern: EnergyWavePattern;
}

export interface InstantReplicationFormula {
  [key: string]: unknown; // Accept flexible shapes for 30/60/90s formulas
}

export interface PatternFrequencyGuide {
  mustInclude: {
    everyScript: string[];
    everyParagraph: string[];
    every3Sentences: string[];
    every5Sentences: string[];
  };
  ratios: {
    hookTypeDistribution: {
      primary: number;
      secondary: number;
      tertiary: number;
    };
    sentencePatternDistribution: {
      patternA: number;
      patternB: number;
      patternC: number;
    };
    bridgeFrequency: string; // 1 per X sentences
    ticFrequency: string; // 1 per X sentences
  };
}

export interface AuthenticityVerification {
  checklist: {
    hookMatchesTop2: boolean;
    bridgeWordsCorrectFrequency: boolean;
    sentencePatternsRotated: boolean;
    adjectiveCombosMatch: boolean;
    energyProgressionFollowed: boolean;
    unconsciousTicsInserted: boolean;
    conjunctionHierarchyRespected: boolean;
    paragraphLengthsMatch: boolean;
  };
  qualityMetrics: {
    patternMatchScore: number;
    hookSimilarity: number;
    bridgeAccuracy: number;
    sentencePatterns: number;
    vocabularyMatch: number;
    rhythmReplication: number;
    overallScore: number;
  };
  redFlags: string[];
}

export interface SampleOutputAnnotation {
  sentence: string;
  patternUsed: string;
  bridgeUsed: string;
  emphasisLevel: string;
}

export interface SampleOutputParagraph {
  generatedText: string;
  annotatedBreakdown: SampleOutputAnnotation[];
}

export interface ForensicVoiceAnalysis {
  metadata: VoiceAnalysisMetadata;
  hookEngineering: HookEngineeringSection;
  sentenceArchitecturePatterns: SentenceArchitecturePatterns;
  microLanguageFingerprint: MicroLanguageFingerprint;
  contentRhythmMapping: ContentRhythmMapping;
  instantReplicationFormula: InstantReplicationFormula;
  patternFrequencyGuide: PatternFrequencyGuide;
  authenticityVerification: AuthenticityVerification;
  sampleOutputParagraph: SampleOutputParagraph;
  // Allow arbitrary additional fields from the model without breaking
  [key: string]: unknown;
}

// Script generation types (Prompt 2)
export type ScriptLength = "short" | "medium" | "long";

export interface GeneratedScriptMetadata {
  topic: string;
  requestedLength: ScriptLength;
  actualWordCount: number;
  estimatedDuration: number;
  generatedAt: string;
  patternSourceConfidence: number;
  scriptId?: string;
  analysisId?: string;
  creatorName?: string;
}

export interface GeneratedScript {
  metadata: GeneratedScriptMetadata;
  scriptConstruction: unknown;
  patternTracking: unknown;
  qualityControl: unknown;
  finalOutput: {
    rawScript: string;
    annotatedScript: Array<{ line: string; annotations: Record<string, unknown> }>;
    speakingVersion: unknown;
    performanceNotes: string[];
  };
}
