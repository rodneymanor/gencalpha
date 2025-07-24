export interface Idea {
  id: string;
  title: string;
  content: string;
  source: "instagram" | "tiktok" | "youtube" | "blog" | "manual" | "voice";
  sourceUrl?: string;
  excerpt: string;
  createdAt: string;
  wordCount: number;
  tags: string[];
}
