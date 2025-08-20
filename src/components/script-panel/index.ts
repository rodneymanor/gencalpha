/**
 * Script Panel Component Exports
 */

export { ScriptPanel, ScriptPanel as default } from "./script-panel";

// Re-export types for convenience
export type {
  ScriptData,
  ScriptComponent,
  ScriptComponentType,
  ScriptPanelProps,
  ScriptMetrics,
  ScriptTabConfig,
} from "@/types/script-panel";

// Re-export hooks
export { useScriptCopy } from "@/hooks/use-script-copy";
export { useScriptDownload } from "@/hooks/use-script-download";
export { useScriptAnalytics, calculateScriptMetrics, processScriptComponents } from "@/hooks/use-script-analytics";
