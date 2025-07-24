import type { Idea, DatabaseNote } from "./types";

/**
 * Check video URL for platform
 */
function getSourceFromVideoUrl(videoUrl: string): Idea["source"] | null {
  if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) return "youtube";
  if (videoUrl.includes("tiktok.com")) return "tiktok";
  if (videoUrl.includes("instagram.com")) return "instagram";
  return null;
}

/**
 * Check metadata for source hints
 */
function getSourceFromMetadata(note: DatabaseNote): Idea["source"] | null {
  if (note.metadata?.videoUrl) {
    return getSourceFromVideoUrl(note.metadata.videoUrl);
  }

  if (note.metadata?.videoId || note.metadata?.channelName) {
    return "youtube";
  }

  return null;
}

/**
 * Check tags for source hints
 */
function getSourceFromTags(tags: string[]): Idea["source"] | null {
  const lowerTags = tags.map((tag) => tag.toLowerCase());

  if (lowerTags.some((tag) => tag.includes("instagram") || tag.includes("ig"))) {
    return "instagram";
  }
  if (lowerTags.some((tag) => tag.includes("tiktok") || tag.includes("tt"))) {
    return "tiktok";
  }
  if (lowerTags.some((tag) => tag.includes("youtube") || tag.includes("yt"))) {
    return "youtube";
  }
  if (lowerTags.some((tag) => tag.includes("blog") || tag.includes("website") || tag.includes("web"))) {
    return "blog";
  }

  return null;
}

/**
 * Check content for source hints
 */
function getSourceFromContent(title: string, content: string): Idea["source"] | null {
  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();

  if (titleLower.includes("instagram") || contentLower.includes("instagram")) {
    return "instagram";
  }
  if (titleLower.includes("tiktok") || contentLower.includes("tiktok")) {
    return "tiktok";
  }
  if (titleLower.includes("youtube") || contentLower.includes("youtube")) {
    return "youtube";
  }

  return null;
}

/**
 * Extract text from paragraph objects
 */
function extractTextFromParagraphs(parsedArray: any[]): string {
  const textParts = parsedArray
    .filter((item) => item.type === "paragraph" && item.content)
    .map((item) => item.content)
    .join("\n\n");
  return textParts;
}

/**
 * Extract text from object with common fields
 */
function extractTextFromObject(parsed: any): string {
  if (parsed.transcript) return parsed.transcript;
  if (parsed.text) return parsed.text;
  if (parsed.content) return parsed.content;
  if (parsed.description) return parsed.description;
  return "";
}

/**
 * Parse content if it's JSON string, otherwise use as-is
 */
function parseContent(content: string): string {
  if (typeof content !== "string") return String(content);

  if (content.startsWith("{") || content.startsWith("[")) {
    try {
      const parsed = JSON.parse(content);

      if (Array.isArray(parsed)) {
        const text = extractTextFromParagraphs(parsed);
        if (text) return text;
      }

      const text = extractTextFromObject(parsed);
      if (text) return text;

      return JSON.stringify(parsed, null, 2);
    } catch {
      return content;
    }
  }
  return content;
}

/**
 * Maps a database note to an Idea for the Idea Inbox
 */
export function mapNoteToIdea(note: DatabaseNote): Idea {
  // Generate excerpt from content
  const generateExcerpt = (content: string): string => {
    const parsedContent = parseContent(content);
    return parsedContent.replace(/\n/g, " ").substring(0, 150).trim() + (parsedContent.length > 150 ? "..." : "");
  };

  // Calculate word count
  const getWordCount = (content: string): number => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  };

  // Determine source based on note data
  const determineSource = (note: DatabaseNote): Idea["source"] => {
    // Try metadata first
    const metadataSource = getSourceFromMetadata(note);
    if (metadataSource) return metadataSource;

    // Try tags
    const tagSource = getSourceFromTags(note.tags);
    if (tagSource) return tagSource;

    // Try content
    const contentSource = getSourceFromContent(note.title, note.content);
    if (contentSource) return contentSource;

    // Check if it's a voice note
    if (note.type === "voice" || note.audioUrl) {
      return "voice";
    }

    // Map database source to Idea source
    if (note.source === "import") return "import";
    if (note.source === "inbox") return "inbox";

    return "manual";
  };

  // Get source URL if available
  const getSourceUrl = (note: DatabaseNote): string | undefined => {
    if (note.metadata?.videoUrl) {
      return note.metadata.videoUrl;
    }
    return undefined;
  };

  const parsedContent = parseContent(note.content);

  return {
    id: note.id,
    title: note.title,
    content: parsedContent,
    source: determineSource(note),
    sourceUrl: getSourceUrl(note),
    excerpt: generateExcerpt(parsedContent),
    createdAt: note.createdAt instanceof Date ? note.createdAt.toISOString() : new Date(note.createdAt).toISOString(),
    updatedAt: note.updatedAt instanceof Date ? note.updatedAt.toISOString() : new Date(note.updatedAt).toISOString(),
    wordCount: getWordCount(parsedContent),
    tags: note.tags,
    type: note.type,
    starred: note.starred,
    metadata: note.metadata,
    audioUrl: note.audioUrl,
    duration: note.duration,
  };
}

/**
 * Maps multiple database notes to ideas
 */
export function mapNotesToIdeas(notes: DatabaseNote[]): Idea[] {
  return notes.map(mapNoteToIdea);
}
