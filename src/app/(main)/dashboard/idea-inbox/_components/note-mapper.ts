import type { Idea, DatabaseNote } from "./types";

/**
 * Maps a database note to an Idea for the Idea Inbox
 */
export function mapNoteToIdea(note: DatabaseNote): Idea {
  // Generate excerpt from content
  const generateExcerpt = (content: string): string => {
    return content.replace(/\n/g, " ").substring(0, 150).trim() + (content.length > 150 ? "..." : "");
  };

  // Calculate word count
  const getWordCount = (content: string): number => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  };

  // Determine source based on note data
  const determineSource = (note: DatabaseNote): Idea["source"] => {
    // Check if it has YouTube metadata
    if (note.metadata?.videoId) {
      return "youtube";
    }

    // Check tags for social media sources
    if (note.tags.includes("instagram")) {
      return "instagram";
    }
    if (note.tags.includes("tiktok")) {
      return "tiktok";
    }
    if (note.tags.includes("blog")) {
      return "blog";
    }

    // Check if it's a voice note
    if (note.type === "voice" || note.audioUrl) {
      return "voice";
    }

    // Map database source to Idea source
    if (note.source === "import") {
      return "import";
    }
    if (note.source === "inbox") {
      return "inbox";
    }

    // Default to manual
    return "manual";
  };

  // Get source URL if available
  const getSourceUrl = (note: DatabaseNote): string | undefined => {
    if (note.metadata?.videoUrl) {
      return note.metadata.videoUrl;
    }
    return undefined;
  };

  return {
    id: note.id,
    title: note.title,
    content: note.content,
    source: determineSource(note),
    sourceUrl: getSourceUrl(note),
    excerpt: generateExcerpt(note.content),
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
    wordCount: getWordCount(note.content),
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
