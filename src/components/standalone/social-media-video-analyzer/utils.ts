import type { Platform, VideoData } from "./types";

export function detectPlatform(url: string): Platform | null {
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("youtube.com/shorts")) return "youtube";
  return null;
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return `${num}`;
}

export function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/[.?!]\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (/[.?!]$/.test(t) ? t : `${t}.`));
}

export function extractKeyTopics(text: string): string[] {
  const common = new Set([
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
    "from",
    "up",
    "about",
    "into",
    "through",
    "during",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "what",
    "which",
    "who",
    "when",
    "where",
    "why",
    "how",
    "all",
    "each",
    "every",
    "your",
    "my",
    "his",
    "her",
    "its",
    "our",
    "their",
    "here",
    "so",
  ]);
  const words = text.toLowerCase().split(/\W+/).filter(Boolean);
  const freq = new Map<string, number>();
  for (const w of words) {
    if (w.length > 3 && !common.has(w)) {
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }
  }
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([w]) => w);
}

function syllablesApprox(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 1;
  let count = 0;
  let prevVowel = false;
  for (const ch of w) {
    const isVowel = "aeiou".includes(ch);
    if (isVowel && !prevVowel) count++;
    prevVowel = isVowel;
  }
  if (w.endsWith("e") && count > 1) count--;
  return Math.max(1, count);
}

export function analyzeTranscriptBasic(transcript: string, durationSec: number) {
  const words = transcript.split(/\s+/).filter(Boolean);
  const sentences = transcript.split(/[.?!]+/).filter((s) => s.trim().length > 0);
  const wordCount = words.length;
  const sentenceCount = Math.max(1, sentences.length);
  const avgWordsPerSentence = wordCount / sentenceCount;
  const syllableCount = words.reduce((acc, w) => acc + syllablesApprox(w), 0);
  const avgSyllablesPerWord = syllableCount / Math.max(1, wordCount);

  const gradeLevel = calcGradeLevel(avgWordsPerSentence, avgSyllablesPerWord);
  const readingEase = clampReadingEase(calcReadingEase(avgWordsPerSentence, avgSyllablesPerWord));
  const speakingWpm = Math.round((wordCount / Math.max(1, durationSec)) * 60);
  const gradeLabel = gradeLabelFromLevel(gradeLevel);
  const easeText = easeTextFromScore(readingEase);

  return {
    wordCount,
    avgWordsPerSentence: Number(avgWordsPerSentence.toFixed(1)),
    readingEase,
    easeText,
    gradeLabel,
    speakingWpm,
    keyTopics: extractKeyTopics(transcript),
  };
}

function calcGradeLevel(avgWordsPerSentence: number, avgSyllablesPerWord: number) {
  return Math.max(0, Math.round(0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59));
}

function calcReadingEase(avgWordsPerSentence: number, avgSyllablesPerWord: number) {
  return 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
}

function clampReadingEase(score: number) {
  return Math.round(Math.max(0, Math.min(100, score)));
}

function gradeLabelFromLevel(gradeLevel: number) {
  if (gradeLevel < 1) return "K";
  if (gradeLevel === 1) return "1st";
  if (gradeLevel === 2) return "2nd";
  if (gradeLevel === 3) return "3rd";
  if (gradeLevel <= 12) return `${gradeLevel}th`;
  if (gradeLevel <= 16) return "College";
  return "Graduate";
}

function easeTextFromScore(score: number) {
  if (score >= 90) return "Very Easy";
  if (score >= 80) return "Easy";
  if (score >= 70) return "Fairly Easy";
  if (score >= 60) return "Standard";
  if (score >= 50) return "Fairly Difficult";
  if (score >= 30) return "Difficult";
  return "Very Difficult";
}

export const sampleData: VideoData = {
  platform: "tiktok",
  videoUrl: "https://www.tiktok.com/@example/video/123456",
  creator: { name: "Sarah Johnson", handle: "@sarahcreates", avatarUrl: null },
  title: "The productivity hack that changed my life",
  durationSec: 37,
  metrics: { likes: 12345, comments: 321, shares: 210, saves: 580, views: 250000, engagementRate: 0.075 },
  content: {
    format: "talking-head",
    hook: "Stop scrolling—this changes your workflow",
    hookIdeas: [
      "You're wasting time doing X wrong",
      "The 10-second trick that changed everything",
      "Before you try Z, watch this first",
    ],
    caption: "Here's the exact setup I use to save 2 hours every day...",
    contentIdeas: [
      "Duet with reaction to show real-time results",
      "Remix with side-by-side comparison demo",
      "Turn into carousel with step-by-step guide",
    ],
    transcript:
      "Welcome to this comprehensive tutorial where I'll show you the exact setup I use to save 2 hours every day. First, let's talk about why most people fail at productivity. The key is to understand that your current workflow is probably built on outdated assumptions. What worked five years ago doesn't work today. The tools have changed, the technology has evolved, and most importantly, our understanding of human psychology has improved dramatically. So here's what you need to do: Start by auditing your current workflow. Write down every single task you do in a typical day. Yes, everything. Even the small stuff like checking email or responding to messages.",
  },
};
