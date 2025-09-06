import type { ScriptFormattingComponent } from "../types/script-writer-types";

import { DEFAULT_VALUES } from "./constants";

/**
 * Helper function to format script components into markdown
 * Extracted from lines 440-453
 */
export function formatScriptWithComponents(components: ScriptFormattingComponent[]): string {
  if (!components || components.length === 0) return "";

  const formatted = components
    .map((component) => {
      // Get the label and content using nullish coalescing
      const label = component.label ?? component.type ?? "Content";
      const content = component.content ?? "";

      // Format as markdown heading (## format required by InteractiveScript)
      return `## ${label}\n${content}`;
    })
    .join("\n\n");

  return formatted;
}

/**
 * Extracts a title from the script content
 * Consolidates title extraction logic from lines 267-269
 */
export function extractScriptTitle(script: string, fallbackTitle: string): string {
  const lines = script.split("\n");
  const firstLine = lines.find((line) => line.trim() && !line.startsWith("**"));
  return firstLine?.trim() ?? fallbackTitle;
}

/**
 * Creates a basic transcript structure when components are not available
 * Extracted from line 131
 */
export function createFallbackTranscript(rawTranscript?: string, fullScript?: string): string {
  const content = rawTranscript ?? fullScript ?? DEFAULT_VALUES.FALLBACK_CONTENT;
  return `## Transcript\n${content}`;
}

/**
 * Calculates word count from BlockNote content structure
 * Extracted from lines 356-371
 */
export function calculateWordCount(content: any): number {
  if (!content || !Array.isArray(content)) {
    return 0;
  }

  let count = 0;
  content.forEach((block: any) => {
    if (block.type === "paragraph" && block.content) {
      block.content.forEach((item: any) => {
        if (item.type === "text" && item.text) {
          count += item.text.split(/\s+/).filter((word: string) => word.length > 0).length;
        }
      });
    }
  });

  return count;
}
