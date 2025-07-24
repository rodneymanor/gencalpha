export interface GhostWritingCard {
  id: string;
  title: string;
  concept: string;
  hook: string;
  bridgeText: string;
  goldenNugget: string;
  callToAction: string;
  topic: string;
  category: "problem" | "excuse" | "question";
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  estimatedDuration: string;
  difficulty: "easy" | "medium" | "hard";
  trending: boolean;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
}
