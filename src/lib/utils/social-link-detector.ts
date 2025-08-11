/*
  Social media link detection utility
  - Detects TikTok, Instagram, generic URLs, or plain text
  - Extracts useful fields like username, postId, contentType
*/

export type DetectedType = "tiktok" | "instagram" | "other_url" | "text";

export interface DetectedExtracted {
  username?: string;
  postId?: string;
  contentType?: string; // video, reel, post, profile, live, story, etc.
}

export interface DetectionResult {
  type: DetectedType;
  url: string | null;
  extracted: DetectedExtracted;
}

// Safe, bounded URL regex avoiding catastrophic backtracking
// eslint-disable-next-line security/detect-unsafe-regex, no-useless-escape
const URL_GLOBAL_REGEX = /((?:https?:\/\/)?(?:[\w-]+\.)+[\w.-]+(?:\/[\w\-._~:/?#\[\]@!$&'()*+,;=%]*)?)/gi;

// Known domains
const TIKTOK_DOMAINS = ["tiktok.com", "m.tiktok.com", "www.tiktok.com", "vm.tiktok.com", "vt.tiktok.com"];
const INSTAGRAM_DOMAINS = ["instagram.com", "www.instagram.com", "m.instagram.com", "instagr.am"]; // include short domain

function safeParseUrl(candidate: string): URL | null {
  const trimmed = candidate.trim();
  if (!trimmed) return null;
  try {
    // Prepend protocol if missing
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    return new URL(withProtocol);
  } catch {
    return null;
  }
}

function isTikTokHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return TIKTOK_DOMAINS.some((d) => host === d || host.endsWith(`.${d.replace(/^www\./, "")}`));
}

function isInstagramHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return INSTAGRAM_DOMAINS.some((d) => host === d || host.endsWith(`.${d.replace(/^www\./, "")}`));
}

function classifyTikTok(url: URL): DetectedExtracted {
  // Path examples:
  // /@username/video/1234567890
  // /@username/live
  // /@username
  // /t/short
  const parts = url.pathname.split("/").filter(Boolean);
  // Profile style starts with @
  const first = parts[0] ?? "";
  if (first.startsWith("@")) {
    const username = first.slice(1);
    const second = parts[1];
    if (second === "video" && parts[2]) {
      return { username, postId: parts[2], contentType: "video" };
    }
    if (second === "live") {
      return { username, contentType: "live" };
    }
    // Profile
    return { username, contentType: "profile" };
  }
  // Short links like vm.tiktok.com/... often redirect; best-effort
  return { contentType: "link" };
}

function classifyInstagram(url: URL): DetectedExtracted {
  // Path examples:
  // /p/ABC123/
  // /reel/ABC123/
  // /reels/ABC123/
  // /stories/username/1234567890/
  // /tv/ABC123/
  // /username/
  const parts = url.pathname.split("/").filter(Boolean);
  const first = parts[0]?.toLowerCase() ?? "";

  if (["p", "reel", "reels", "tv"].includes(first) && parts[1]) {
    const mapType: Record<string, string> = { p: "post", reel: "reel", reels: "reel", tv: "igtv" };
    return { postId: parts[1], contentType: mapType[first] };
  }

  if (first === "stories" && parts[1]) {
    const username = parts[1];
    const postId = parts[2];
    return { username, postId, contentType: "story" };
  }

  // profile fallback
  if (parts[0] && !["explore", "accounts", "about", "directory"].includes(first)) {
    return { username: parts[0], contentType: "profile" };
  }

  return { contentType: "link" };
}

export function detectSocialLink(input: string): DetectionResult {
  if (!input || !input.trim()) return { type: "text", url: null, extracted: {} };

  const matches = [...input.matchAll(URL_GLOBAL_REGEX)].map((m) => m[0]);
  if (matches.length === 0) return { type: "text", url: null, extracted: {} };

  // Find first valid URL candidate
  for (const candidate of matches) {
    const parsed = safeParseUrl(candidate);
    if (!parsed) continue;
    const hostname = parsed.hostname.toLowerCase();
    if (isTikTokHost(hostname)) {
      return { type: "tiktok", url: parsed.toString(), extracted: classifyTikTok(parsed) };
    }
    if (isInstagramHost(hostname)) {
      return { type: "instagram", url: parsed.toString(), extracted: classifyInstagram(parsed) };
    }
    // Generic URL
    return { type: "other_url", url: parsed.toString(), extracted: { contentType: "link" } };
  }

  return { type: "text", url: null, extracted: {} };
}

export function detectAllSocialLinks(input: string): DetectionResult[] {
  if (!input || !input.trim()) return [];
  const results: DetectionResult[] = [];
  const matches = [...input.matchAll(URL_GLOBAL_REGEX)].map((m) => m[0]);
  for (const candidate of matches) {
    const parsed = safeParseUrl(candidate);
    if (!parsed) continue;
    const hostname = parsed.hostname.toLowerCase();
    if (isTikTokHost(hostname)) {
      results.push({ type: "tiktok", url: parsed.toString(), extracted: classifyTikTok(parsed) });
      continue;
    }
    if (isInstagramHost(hostname)) {
      results.push({ type: "instagram", url: parsed.toString(), extracted: classifyInstagram(parsed) });
      continue;
    }
    results.push({ type: "other_url", url: parsed.toString(), extracted: { contentType: "link" } });
  }
  return results;
}
