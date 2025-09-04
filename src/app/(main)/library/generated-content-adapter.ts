// Generated Content Adapter
// Transforms scripts, hooks, and content ideas from Firestore to LibraryItem format

import { Script } from "@/types/script";
import { Hook } from "@/app/api/hooks/route";
import { ContentIdea } from "@/app/api/content/ideas/route";

import { LibraryItem } from "./types";

/**
 * Transforms a Script to a LibraryItem
 */
export function scriptToLibraryItem(script: Script): LibraryItem {
  // Determine status based on script status
  const statusMap: Record<string, LibraryItem["status"]> = {
    draft: "draft",
    published: "published",
    scheduled: "reviewing",
    archived: "archived",
  };

  return {
    id: `script-${script.id}`,
    title: script.title || "Untitled Script",
    description: script.summary || script.content?.substring(0, 200) + "...",
    type: "document",
    category: "script",
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
    },
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
    tags: [
      "generated",
      "hooks",
      ...hook.hooks.map(h => h.focus),
    ].filter(Boolean),
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
    metadata: {
      hookCount: hook.hooks?.length || 0,
      topRating: hook.topHook?.rating,
      averageRating: hook.hooks?.reduce((sum, h) => sum + h.rating, 0) / (hook.hooks?.length || 1),
      focusTypes: [...new Set(hook.hooks?.map(h => h.focus))],
      // Store the full hooks array for retrieval
      hooks: hook.hooks,
      topHook: hook.topHook,
    },
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
    tags: [
      "generated",
      "content-ideas",
      ...(idea.sourceUrl ? ["from-url"] : []),
    ].filter(Boolean),
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