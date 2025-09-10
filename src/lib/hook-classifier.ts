// Simple heuristic hook classifier mapping hook text to a category used in prompts
// Categories align with our hook examples: "speed" | "educational" | "viral"

export type HookCategory = "speed" | "educational" | "viral";

export function classifyHook(hook: string | undefined | null): HookCategory | undefined {
  if (!hook) return undefined;
  const text = String(hook).trim().toLowerCase();
  if (!text) return undefined;

  // Viral indicators: sensational phrasing, challenges, personal stories with dramatic language
  const viralPatterns = [
    /you won't believe/,
    /blow your mind|mind[- ]?blown/,
    /changed everything/,
    /i tried .* (for|in) \d+/,
    /hack|secret|insider/,
    /everyone'?s talking|nobody talks/,
    /the (most|craziest|wildest)/,
  ];
  if (viralPatterns.some((r) => r.test(text))) return "viral";

  // Educational indicators: questions, research, breakdowns, how/why framing
  const educationalPatterns = [
    /ever wondered|did you know/,
    /let me break down|step[- ]?by[- ]?step|in simple terms/,
    /research shows|the science behind/,
    /here'?s what|here is what .* don'?t understand/,
    /how to |why /,
  ];
  if (educationalPatterns.some((r) => r.test(text)) || /\?$/.test(text)) return "educational";

  // Speed indicators: direct, contrarian, mistake/stop patterns, imperative
  const speedPatterns = [
    /stop /,
    /the (biggest|critical) mistake/,
    /before you /,
    /here'?s (why|how)/,
    /most people (don'?t|get .* wrong)/,
    /^(do|don'?t|never|always|start|pick|use)\b/,
  ];
  if (speedPatterns.some((r) => r.test(text))) return "speed";

  // Fallback: choose based on tone heuristics
  if (text.includes("how") || text.includes("why")) return "educational";
  return "speed";
}

