export type Platform = "tiktok" | "instagram" | "youtube";

export interface CreatorInfo {
  name: string;
  handle: string;
  avatarUrl: string | null;
}

export interface VideoMetrics {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  views: number;
  engagementRate: number; // 0..1
}

export interface VideoContentData {
  format: string;
  hook: string;
  hookIdeas: string[];
  caption: string;
  contentIdeas: string[];
  transcript: string;
}

export interface VideoData {
  platform: Platform;
  videoUrl: string;
  creator: CreatorInfo;
  title: string;
  durationSec: number;
  metrics: VideoMetrics;
  content: VideoContentData;
}

export interface VoiceSignature {
  tone: string;
  toneStrengthPercent: number; // 0..100
  register: string;
  registerPositionPercent: number; // 0..100
  energy: string;
  energyLevelDots: number; // 0..5
}

export interface LinguisticPatterns {
  dominantStructures: string[];
  signaturePhrases: string[];
  vocabulary: {
    complexity: string;
    uniqueWords: string;
    technicalTerms: string;
  };
}

export interface RhetoricalFramework {
  persuasionTechniques: string[];
  narrativeStyle: string;
}

export interface MicroElements {
  discourseMarkers: string[];
  cadencePattern: string;
}

export interface AnalysisData {
  voiceSignature: VoiceSignature;
  linguisticPatterns: LinguisticPatterns;
  rhetoricalFramework: RhetoricalFramework;
  microElements: MicroElements;
}

export interface SocialMediaVideoAnalyzerProps {
  className?: string;
  initialData?: VideoData;
  onExportProfile?: (analysis: AnalysisData) => void;
  onUseStyleForRescript?: (analysis: AnalysisData) => void;
}

