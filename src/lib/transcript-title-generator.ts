/**
 * Utility functions for generating meaningful titles from transcript content
 */

/**
 * Generate a title from transcript content using the first meaningful words
 * @param transcript - The transcript content
 * @param maxWords - Maximum number of words to include (default: 8)
 * @param platform - Platform name to use as fallback (optional)
 * @returns Generated title
 */
export function generateTitleFromTranscript(transcript: string, maxWords: number = 8, platform?: string): string {
  if (!transcript || typeof transcript !== "string") {
    return platform ? `${platform} Transcript` : "Video Transcript";
  }

  // Clean up the transcript
  const cleanedTranscript = transcript
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\[[^\]]*\]/g, "") // Remove timestamp markers like [0:30]
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanedTranscript) {
    return platform ? `${platform} Transcript` : "Video Transcript";
  }

  // Split into words and filter out common filler words/interjections
  const fillerWords = new Set([
    "um",
    "uh",
    "ah",
    "eh",
    "like",
    "you know",
    "so",
    "well",
    "okay",
    "ok",
    "actually",
    "basically",
    "literally",
    "obviously",
    "definitely",
    "totally",
    "hey",
    "hi",
    "hello",
    "welcome",
    "thanks",
    "thank you",
    "please",
  ]);

  const words = cleanedTranscript
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => {
      // Remove punctuation for filtering
      const cleanWord = word.replace(/[^\w]/g, "");
      return cleanWord.length > 1 && !fillerWords.has(cleanWord);
    });

  if (words.length === 0) {
    return platform ? `${platform} Transcript` : "Video Transcript";
  }

  // Get the first meaningful words, but preserve original capitalization
  const originalWords = cleanedTranscript.split(/\s+/);
  const meaningfulOriginalWords = [];
  let meaningfulCount = 0;

  for (const originalWord of originalWords) {
    const cleanWord = originalWord.toLowerCase().replace(/[^\w]/g, "");

    if (cleanWord.length > 1 && !fillerWords.has(cleanWord)) {
      meaningfulOriginalWords.push(originalWord);
      meaningfulCount++;

      if (meaningfulCount >= maxWords) {
        break;
      }
    }
  }

  if (meaningfulOriginalWords.length === 0) {
    return platform ? `${platform} Transcript` : "Video Transcript";
  }

  // Join the words and clean up punctuation
  let title = meaningfulOriginalWords.join(" ");

  // Remove trailing punctuation except for question marks and exclamation points
  title = title.replace(/[.,;:]+$/, "");

  // Ensure the first letter is capitalized
  title = title.charAt(0).toUpperCase() + title.slice(1);

  // Add ellipsis if we truncated the content
  if (originalWords.length > meaningfulOriginalWords.length) {
    // Don't add ellipsis if title already ends with punctuation
    if (!/[.!?]$/.test(title)) {
      title += "...";
    }
  }

  return title;
}

/**
 * Generate a title specifically for YouTube transcripts
 * @param transcript - The transcript content
 * @param videoTitle - Original video title (optional fallback)
 * @returns Generated title
 */
export function generateYouTubeTitleFromTranscript(transcript: string, videoTitle?: string): string {
  const generated = generateTitleFromTranscript(transcript, 10, "YouTube");

  // If we couldn't generate a meaningful title and we have the original video title,
  // use that as a fallback
  if ((generated === "YouTube Transcript" || generated.includes("YouTube Transcript")) && videoTitle) {
    return videoTitle;
  }

  return generated;
}

/**
 * Generate a title specifically for TikTok transcripts
 * @param transcript - The transcript content
 * @returns Generated title
 */
export function generateTikTokTitleFromTranscript(transcript: string): string {
  return generateTitleFromTranscript(transcript, 6, "TikTok");
}

/**
 * Generate a title specifically for Instagram transcripts
 * @param transcript - The transcript content
 * @returns Generated title
 */
export function generateInstagramTitleFromTranscript(transcript: string): string {
  return generateTitleFromTranscript(transcript, 6, "Instagram");
}
