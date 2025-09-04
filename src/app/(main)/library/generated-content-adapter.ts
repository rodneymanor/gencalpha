// Generated Content Adapter
// Transforms scripts, hooks, and content ideas from Firestore to LibraryItem format

import { ContentIdea } from "@/app/api/content/ideas/route";
import { Hook } from "@/app/api/hooks/route";
import { Script } from "@/types/script";

import { LibraryItem } from "./types";

/**
 * Helper function to detect if content contains numbered hooks pattern
 */
function detectHooksPattern(content: string): boolean {
  if (!content) return false;

  // Check if content has multiple numbered items (at least 3 to be considered hooks)
  const numberedPattern = /^\d+[.)]\s+.+$/gm;
  const matches = content.match(numberedPattern);
  return matches ? matches.length >= 3 : false;
}

/**
 * Helper function to parse numbered content into structured items
 */
function parseNumberedContent(content: string): Array<{ number: number; text: string }> | null {
  if (!content) return null;

  const lines = content.split("\n").filter((line) => line.trim());
  const items: Array<{ number: number; text: string }> = [];

  lines.forEach((line) => {
    // Match patterns: "1. Text" or "1) Text" or just numbered lines
    const match = line.match(/^(\d+)[.)\s]+(.+)$/);
    if (match) {
      const [, numberStr, text] = match;
      items.push({
        number: parseInt(numberStr, 10),
        text: text.trim(),
      });
    }
  });

  return items.length > 0 ? items : null;
}

/**
 * Check if script is a hooks type based on various indicators
 */
function isHooksScript(script: Script): boolean {
  // Check explicit category/type
  if (script.category === "generate-hooks" || script.elements?.type === "generate-hooks") {
    return true;
  }
  // Check tags
  if (script.tags?.some((tag) => tag === "generator:generate-hooks")) {
    return true;
  }
  // Check title and content pattern
  const titleHasHook = script.title?.toLowerCase().includes("hook") || script.title?.toLowerCase().includes("10 ");
  return titleHasHook && detectHooksPattern(script.content);
}

/**
 * Check if script is an ideas type based on various indicators
 */
function isIdeasScript(script: Script): boolean {
  // Check explicit category/type
  if (script.category === "content-ideas" || script.elements?.type === "content-ideas") {
    return true;
  }
  if (script.category === "value-bombs" || script.elements?.type === "value-bombs") {
    return true;
  }
  // Check tags
  if (script.tags?.some((tag) => tag === "generator:content-ideas" || tag === "generator:value-bombs")) {
    return true;
  }
  // Check title and content pattern
  const titleHasIdea = script.title?.toLowerCase().includes("idea") || script.title?.toLowerCase().includes("content");
  return titleHasIdea && detectHooksPattern(script.content);
}

/**
 * Determine category and parse items for a script
 */
function determineScriptCategoryAndItems(script: Script): {
  category: LibraryItem["category"];
  parsedItems: Array<{ number: number; text: string }> | null | undefined;
} {
  let category: LibraryItem["category"] = "script";
  let parsedItems = script.elements?.items;

  // Determine category
  if (isHooksScript(script)) {
    category = "hooks";
  } else if (isIdeasScript(script)) {
    category = "idea";
  }

  // Parse content if no structured items exist and we detected a generator type
  if (!parsedItems && script.content && category !== "script") {
    parsedItems = parseNumberedContent(script.content);
  }

  return { category, parsedItems };
}

/**
 * Transforms a Script to a LibraryItem
 */
// eslint-disable-next-line complexity
export function scriptToLibraryItem(script: Script): LibraryItem {
  // Determine status based on script status
  const statusMap: Record<string, LibraryItem["status"]> = {
    draft: "draft",
    published: "published",
    scheduled: "reviewing",
    archived: "archived",
  };

  // Determine category and parse items
  const { category, parsedItems } = determineScriptCategoryAndItems(script);

  return {
    id: `script-${script.id}`,
    title: script.title || "Untitled Script",
    description: script.summary || script.content?.substring(0, 200) + "...",
    type: "document",
    category: category,
    status: statusMap[script.status] || "draft",
    author: {
      id: script.userId,
      name: script.authors || "Unknown Author",
    },
    tags: [
      "generated",
      "script",
      ...(script.tags || []),
      ...(script.platform ? [script.platform] : []),
      ...(script.approach ? [script.approach] : []),
    ].filter(Boolean),
    createdAt: new Date(script.createdAt),
    updatedAt: new Date(script.updatedAt),
    lastAccessedAt: script.viewedAt ? new Date(script.viewedAt) : undefined,
    size: script.content?.length ? script.content.length * 2 : undefined,
    duration: script.duration ? parseInt(script.duration) : undefined,
    viewCount: script.performance?.views || 0,
    rating: undefined,
    progress: undefined,
    url: `/scripts/${script.id}`, // Link to view/edit the script
    thumbnail: undefined,
    collaborators: [],
    metadata: {
      wordCount: script.wordCount,
      format: "Script",
      language: "English",
      characterCount: script.characterCount,
      targetLength: script.targetLength,
      voice: script.voice,
      originalIdea: script.originalIdea,
      isThread: script.isThread,
      threadParts: script.threadParts,
      scheduledDate: script.scheduledDate,
      // Store actual script content in metadata for library access
      scriptContent: script.content,
      // Include structured items if available (for generators) - use parsed items for legacy records
      items: parsedItems ?? script.elements?.items,
      generatorType:
        script.elements?.type ??
        script.category ??
        (category === "hooks" ? "generate-hooks" : category === "idea" ? "content-ideas" : undefined),
    },
  };
}

/**
 * Create hook metadata from Hook object
 */
function createHookMetadata(hook: Hook) {
  const hooksArray = hook.hooks || [];
  return {
    hookCount: hooksArray.length,
    topRating: hook.topHook?.rating,
    averageRating: hooksArray.length > 0 ? hooksArray.reduce((sum, h) => sum + h.rating, 0) / hooksArray.length : 0,
    focusTypes: [...new Set(hooksArray.map((h) => h.focus))],
    hooks: hook.hooks,
    topHook: hook.topHook,
  };
}

/**
 * Transforms a Hook generation to a LibraryItem
 */
export function hookToLibraryItem(hook: Hook): LibraryItem {
  // Get the best hook from the generation
  const bestHook = hook.topHook?.text || hook.hooks?.[0]?.text || "Generated Hooks";

  // Create a description from the hooks
  const description = hook.hooks
    ?.map((h, i) => `${i + 1}. ${h.text} (${h.focus}, ${h.rating}/100)`)
    .join("\n")
    .substring(0, 300);

  return {
    id: `hook-${hook.id}`,
    title: `Hooks: ${bestHook.substring(0, 50)}${bestHook.length > 50 ? "..." : ""}`,
    description: description || "Generated hook variations",
    type: "note",
    category: "hooks",
    status: "published", // Hooks are immediately ready to use
    author: {
      id: hook.userId,
      name: "AI Generated",
    },
    tags: ["generated", "hooks", ...hook.hooks.map((h) => h.focus)].filter(Boolean),
    createdAt: new Date(hook.createdAt),
    updatedAt: new Date(hook.createdAt),
    lastAccessedAt: undefined,
    size: JSON.stringify(hook.hooks).length,
    duration: undefined,
    viewCount: 0,
    rating: hook.topHook?.rating ? hook.topHook.rating / 20 : undefined, // Convert 0-100 to 1-5
    progress: undefined,
    url: `/hooks/${hook.id}`,
    thumbnail: undefined,
    collaborators: [],
    metadata: createHookMetadata(hook),
  };
}

/**
 * Transforms a ContentIdea to a LibraryItem
 */
export function contentIdeaToLibraryItem(idea: ContentIdea): LibraryItem {
  // Extract a title from the ideas text
  const firstLine = idea.ideas?.split("\n")[0] || "Content Ideas";
  const title = firstLine.replace(/^[#\s]+/, "").substring(0, 100);

  return {
    id: `idea-${idea.id}`,
    title: title || "Generated Content Ideas",
    description: idea.ideas?.substring(0, 300) + (idea.ideas?.length > 300 ? "..." : ""),
    type: "note",
    category: "idea",
    status: "published", // Ideas are immediately ready to use
    author: {
      id: idea.userId,
      name: "AI Generated",
    },
    tags: ["generated", "content-ideas", ...(idea.sourceUrl ? ["from-url"] : [])].filter(Boolean),
    createdAt: new Date(idea.createdAt),
    updatedAt: new Date(idea.updatedAt),
    lastAccessedAt: undefined,
    size: idea.ideas?.length ? idea.ideas.length * 2 : undefined,
    duration: undefined,
    viewCount: 0,
    rating: undefined,
    progress: undefined,
    url: `/ideas/${idea.id}`,
    thumbnail: undefined,
    collaborators: [],
    metadata: {
      wordCount: idea.ideas?.split(" ").length,
      format: "Ideas",
      language: "English",
      sourceUrl: idea.sourceUrl,
      transcriptLength: idea.transcript?.length,
    },
  };
}

/**
 * Transforms arrays of generated content to LibraryItems
 */
export function scriptsToLibraryItems(scripts: Script[]): LibraryItem[] {
  return scripts.map(scriptToLibraryItem);
}

export function hooksToLibraryItems(hooks: Hook[]): LibraryItem[] {
  return hooks.map(hookToLibraryItem);
}

export function contentIdeasToLibraryItems(ideas: ContentIdea[]): LibraryItem[] {
  return ideas.map(contentIdeaToLibraryItem);
}
