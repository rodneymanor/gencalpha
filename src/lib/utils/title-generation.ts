/**
 * Utility functions for generating production-ready titles for content
 */

export interface TitleGenerationOptions {
  maxLength?: number;
  includeType?: boolean;
  format?: "sentence" | "title-case" | "capitalize-first";
}

/**
 * Generate a smart title for a script based on input and metadata
 */
export function generateScriptTitle(
  input: string,
  type?: "speed" | "educational" | "viral",
  options: TitleGenerationOptions = {},
): string {
  const { maxLength = 50, includeType = true, format = "title-case" } = options;

  // Extract key topics from input
  const cleanInput = input.replace(/[^\w\s]/g, "").trim();
  const words = cleanInput.split(/\s+/).slice(0, 6); // Take first 6 words max

  let baseTitle = words.join(" ");

  // Truncate if too long
  if (baseTitle.length > (includeType ? maxLength - 15 : maxLength)) {
    baseTitle = baseTitle.substring(0, (includeType ? maxLength - 15 : maxLength) - 3) + "...";
  }

  // Add type prefix if requested
  if (includeType && type) {
    const typeMap = {
      speed: "Quick",
      educational: "Educational",
      viral: "Viral",
    };
    baseTitle = `${typeMap[type]} Script: ${baseTitle}`;
  }

  return formatTitle(baseTitle, format);
}

/**
 * Generate a title for content ideas
 */
export function generateContentIdeaTitle(
  idea: string,
  category?: string,
  options: TitleGenerationOptions = {},
): string {
  const { maxLength = 45, format = "title-case" } = options;

  // Extract main concept (first meaningful phrase)
  const cleanIdea = idea.replace(/[^\w\s]/g, "").trim();
  const words = cleanIdea.split(/\s+/).slice(0, 5);

  let title = words.join(" ");

  // Add category prefix if provided
  if (category && category !== "general") {
    title = `${category}: ${title}`;
  }

  // Truncate if needed
  if (title.length > maxLength) {
    title = title.substring(0, maxLength - 3) + "...";
  }

  return formatTitle(title, format);
}

/**
 * Validate and clean a generated title
 */
export function validateTitle(title: string): {
  isValid: boolean;
  errors: string[];
  cleanedTitle: string;
} {
  const errors: string[] = [];
  let cleanedTitle = title.trim();

  // Check length
  if (cleanedTitle.length < 5) {
    errors.push("Title too short (minimum 5 characters)");
  }
  if (cleanedTitle.length > 60) {
    errors.push("Title too long (maximum 60 characters)");
    cleanedTitle = cleanedTitle.substring(0, 57) + "...";
  }

  // Check for empty or generic titles
  const genericTitles = ["generated script", "new script", "untitled", "script", "content"];

  if (genericTitles.includes(cleanedTitle.toLowerCase())) {
    errors.push("Title is too generic");
  }

  // Clean up formatting
  cleanedTitle = cleanedTitle
    .replace(/\s+/g, " ") // Multiple spaces to single
    .replace(/[^\w\s:.-]/g, "") // Remove special characters except basic punctuation
    .trim();

  return {
    isValid: errors.length === 0,
    errors,
    cleanedTitle,
  };
}

/**
 * Format title according to specified style
 */
export function formatTitle(title: string, format: "sentence" | "title-case" | "capitalize-first"): string {
  switch (format) {
    case "sentence":
      return title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();

    case "title-case":
      return title.replace(/\b\w+/g, (word) => {
        // Don't capitalize articles, prepositions, and conjunctions unless they're first/last
        const lowercase = ["a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"];
        const isFirstOrLast = word === title.split(" ")[0] || word === title.split(" ").slice(-1)[0];

        if (!isFirstOrLast && lowercase.includes(word.toLowerCase())) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      });

    case "capitalize-first":
      return title.charAt(0).toUpperCase() + title.slice(1);

    default:
      return title;
  }
}

/**
 * Extract topic keywords from input text for title generation
 */
export function extractTopicKeywords(input: string, maxKeywords: number = 3): string[] {
  // Remove common stop words and extract meaningful terms
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "how",
    "what",
    "why",
    "when",
    "where",
    "who",
    "which",
    "about",
    "create",
    "make",
    "get",
    "help",
    "learn",
    "teach",
    "show",
    "tell",
    "give",
    "take",
    "find",
    "use",
    "know",
  ]);

  const words = input
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word))
    .slice(0, maxKeywords);

  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
}

/**
 * Generate title variants for A/B testing
 */
export function generateTitleVariants(baseTitle: string): string[] {
  const variants = [baseTitle];

  // Create different variations
  if (baseTitle.includes(":")) {
    const [prefix, suffix] = baseTitle.split(":");
    variants.push(suffix.trim()); // Remove prefix
    variants.push(`${suffix.trim()} - ${prefix.trim()}`); // Reverse order
  }

  // Add question format if appropriate
  if (
    !baseTitle.includes("?") &&
    (baseTitle.includes("how") || baseTitle.includes("what") || baseTitle.includes("why"))
  ) {
    variants.push(baseTitle + "?");
  }

  // Remove duplicates and return up to 3 variants
  return [...new Set(variants)].slice(0, 3);
}
