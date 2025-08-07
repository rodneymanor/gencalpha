// Hashtag utilities
// - Responsible for extracting hashtags from text content

export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map((tag) => tag.substring(1)) : [];
}
