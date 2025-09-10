// Type definitions for script display components
export interface ScriptSection {
  type: "hook" | "bridge" | "golden-nugget" | "wta";
  label: string;
  timeRange: string;
  dialogue: string;
  action: string;
}

export interface VideoScript {
  id: number;
  title: string;
  duration: string;
  sections: ScriptSection[];
  spanRows?: boolean;
  status?: "loading" | "ready" | "error";
  statusText?: string;
  hookCategory?: "speed" | "educational" | "viral" | string;
  hookTypeId?: "problem" | "benefit" | "curiosity" | "question" | "story" | string;
  hookTypeLabel?: string;
  hookStyleId?: "question" | "statistic" | "story" | "provocative" | "direct" | "contrarian" | string;
  hookStyleLabel?: string;
}
