// Persona type definitions

export interface FirestorePersona {
  id: string;
  name: string;
  description?: string;
  platform?: string;
  username?: string;
  voiceStyle?: string;
  distinctiveness?: string;
  complexity?: string;
  usageCount?: number;
  lastUsedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  analysis?: any;
  tags?: string[];
  status?: string;
  hasHookSystem?: boolean;
  hasScriptRules?: boolean;
  signatureMoveCount?: number;
}

export interface AnalysisProgress {
  step: string;
  current: number;
  total: number;
}

export type AnalysisMode = "profile" | "videos";
