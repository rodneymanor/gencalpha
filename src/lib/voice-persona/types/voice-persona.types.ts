/**
 * Voice Persona Analysis Types
 * Comprehensive type definitions for social media voice persona analysis and replication
 */

// Platform types
export type SocialPlatform = "tiktok" | "instagram";

// User identifier for persona analysis
export interface UserIdentifier {
  handle: string;
  platform: SocialPlatform;
  userId?: string;
}

// Speech pattern analysis types
export interface SpeechPatterns {
  baseline: {
    defaultRhythm: string;
    typicalEnergy: "low" | "medium" | "high";
    energyDescription: string;
    sentenceStructure: "short" | "varied" | "complex";
  };
  emotionalStates: {
    excited: {
      patternChanges: string;
      markerPhrases: string[];
      energySpike: string;
    };
    explaining: {
      structure: "step-by-step" | "circular" | "branching";
      transitionWords: string[];
      complexityManagement: string;
    };
  };
  signatureElements: {
    randomInsertions: string[];
    fillerPatterns: string[];
    catchphrases: {
      opening: string[];
      closing: string[];
    };
  };
}

// Pattern mapping matrix element
export interface PatternElement {
  element: string;
  frequency: string;
  examples: string[];
  context: string;
}

// Pattern mapping matrix
export interface PatternMappingMatrix {
  primaryHook: PatternElement;
  bridgePhrase: PatternElement;
  energyEscalator: PatternElement;
  personalReference: PatternElement;
  audienceAddress: PatternElement;
  questionPattern: PatternElement;
}

// Voice profile structure
export interface VoiceProfile {
  hooks: string[];
  bridges: Record<string, number>; // phrase -> frequency
  energyWave: string;
  sentencePatterns: string[];
  signatureElements: string[];
  vocabularyFingerprint: string[];
  rhythmPattern: string;
}

// Generation parameters
export interface GenerationParameters {
  optimalLength: number; // in seconds
  authenticityThreshold: number;
  patternRotation: "sequential" | "weighted" | "random";
  hookRatio: {
    primary: number;
    secondary: number;
  };
  sentenceDistribution: {
    short: number;
    medium: number;
    long: number;
  };
}

// Authenticity metrics
export interface AuthenticityMetrics {
  hookAccuracy: {
    weight: number;
    score: number;
    check: string;
  };
  bridgeFrequency: {
    weight: number;
    score: number;
    check: string;
  };
  sentencePatterns: {
    weight: number;
    score: number;
    check: string;
  };
  vocabularyMatch: {
    weight: number;
    score: number;
    check: string;
  };
  rhythmReplication: {
    weight: number;
    score: number;
    check: string;
  };
  overallScore: number;
}

// Complete persona profile
export interface PersonaProfile {
  personaId: string;
  userIdentifier: UserIdentifier;
  analysisDate: string;
  voiceProfile: VoiceProfile;
  speechPatterns: SpeechPatterns;
  patternMapping: PatternMappingMatrix;
  generationParameters: GenerationParameters;
  metadata: {
    videosAnalyzed: number;
    totalTranscriptLength: number;
    analysisVersion: string;
    lastUpdated: string;
  };
}

// Script generation input
export interface ScriptGenerationInput {
  personaId: string;
  topic: string;
  targetLength: number; // in seconds
  style?: "hook-heavy" | "educational" | "conversational" | "energetic";
  customInstructions?: string;
}

// Generated script structure
export interface GeneratedScript {
  id: string;
  personaId: string;
  topic: string;
  script: string;
  structure: {
    hook: string; // 0-3 seconds
    bridge: string; // 3-5 seconds
    coreMessage: string; // 5-20 seconds
    escalation: string; // 20-25 seconds
    close: string; // 25-30 seconds
  };
  authenticity: AuthenticityMetrics;
  metadata: {
    generatedAt: string;
    targetLength: number;
    actualLength: number;
    wordCount: number;
  };
}

// Video analysis data
export interface VideoAnalysisData {
  videoId: string;
  url: string;
  transcript: string;
  duration: number;
  engagement?: {
    views: number;
    likes: number;
    comments: number;
  };
  metadata: {
    capturedAt: string;
    platform: SocialPlatform;
  };
}

// User feed analysis result
export interface UserFeedAnalysis {
  userIdentifier: UserIdentifier;
  videos: VideoAnalysisData[];
  totalVideos: number;
  processedVideos: number;
  failedVideos: number;
  analysisStarted: string;
  analysisCompleted?: string;
  status: "processing" | "completed" | "failed";
}

// Rules engine configuration
export interface RulesConfig {
  strictRules: {
    never: string[];
    always: string[];
  };
  patternConstraints: {
    hookRotationRatio: number[];
    bridgeFrequencyMin: number;
    signatureElementsRequired: number;
  };
  qualityThresholds: {
    minAuthenticityScore: number;
    maxDeviationFromOriginal: number;
  };
}

// Persona analysis configuration
export interface PersonaAnalysisConfig {
  batchSize: number;
  maxVideos: number;
  cacheTTL: number; // in seconds
  rateLimit: {
    requestsPerMinute: number;
    burstLimit: number;
  };
  analysis: {
    minTranscriptLength: number;
    patternSensitivity: "low" | "medium" | "high";
    enableEmotionalAnalysis: boolean;
  };
}

// Error types for persona analysis
export enum PersonaAnalysisError {
  USER_NOT_FOUND = "USER_NOT_FOUND",
  INSUFFICIENT_CONTENT = "INSUFFICIENT_CONTENT",
  TRANSCRIPTION_FAILED = "TRANSCRIPTION_FAILED",
  ANALYSIS_TIMEOUT = "ANALYSIS_TIMEOUT",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  INVALID_PLATFORM = "INVALID_PLATFORM",
  NETWORK_ERROR = "NETWORK_ERROR",
}

// API response types
export interface PersonaAnalysisResult {
  success: boolean;
  personaProfile?: PersonaProfile;
  error?: {
    code: PersonaAnalysisError;
    message: string;
    details?: any;
  };
  metadata: {
    processingTime: number;
    videosProcessed: number;
    requestId: string;
  };
}

// Script generation result
export interface ScriptGenerationResult {
  success: boolean;
  script?: GeneratedScript;
  error?: {
    code: string;
    message: string;
  };
  metadata: {
    generationTime: number;
    requestId: string;
  };
}
