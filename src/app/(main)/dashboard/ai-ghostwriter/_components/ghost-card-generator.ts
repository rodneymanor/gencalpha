import type { GhostWritingCard, Topic } from "./types";

export const availableTopics: Topic[] = [
  {
    id: "beauty",
    name: "Beauty & Cosmetics",
    description: "Natural beauty, skincare routines, makeup tutorials, and product reviews.",
  },
  {
    id: "fashion",
    name: "Fashion & Style",
    description: "Outfit inspiration, style tips, sustainable fashion, and trend analysis.",
  },
  {
    id: "travel",
    name: "Travel & Adventure",
    description: "Destination guides, travel tips, and cultural experiences.",
  },
  {
    id: "food",
    name: "Food & Cooking",
    description: "Recipe tutorials, cooking hacks, restaurant reviews, and food challenges.",
  },
  {
    id: "fitness",
    name: "Fitness & Wellness",
    description: "Workout routines, nutrition advice, wellness tips, and health transformations.",
  },
  {
    id: "pets",
    name: "Pets & Animals",
    description: "Pet care tips, training advice, and heartwarming animal stories.",
  },
  {
    id: "tech",
    name: "Technology",
    description: "Tech reviews, productivity tips, and digital lifestyle content.",
  },
  {
    id: "business",
    name: "Business & Entrepreneurship",
    description: "Business tips, startup stories, and entrepreneurial advice.",
  },
];

// Sample ghost writing cards based on topics
export const generateGhostWritingCards = (topics: string[]): GhostWritingCard[] => {
  const cardTemplates = [
    {
      title: "Morning Routine That Changed My Life",
      concept: "Share a transformative morning routine",
      hook: "I used to hit snooze 5 times every morning until I discovered this one habit...",
      bridgeText: "Here's the simple routine that transformed my entire day and productivity:",
      goldenNugget: "Start with 5 minutes of intentional breathing before checking your phone",
      callToAction: "Try this for 7 days and tell me how you feel!",
      category: "problem" as const,
      difficulty: "easy" as const,
    },
    {
      title: "Why Everyone Gets This Wrong",
      concept: "Address a common misconception",
      hook: "Stop doing this immediately - you're actually making it worse...",
      bridgeText: "I see everyone making this same mistake, and it's holding them back:",
      goldenNugget: "Quality over quantity always wins in the long run",
      callToAction: "Save this post and share it with someone who needs to hear this",
      category: "excuse" as const,
      difficulty: "medium" as const,
    },
    {
      title: "The Question That Changes Everything",
      concept: "Ask a thought-provoking question",
      hook: "What if I told you everything you know about this is wrong?",
      bridgeText: "This one question completely shifted my perspective:",
      goldenNugget: "Instead of asking 'how can I do more?' ask 'how can I do better?'",
      callToAction: "What's one thing you're going to do differently this week?",
      category: "question" as const,
      difficulty: "hard" as const,
    },
  ];

  const cards: GhostWritingCard[] = [];

  topics.forEach((topicId) => {
    const topic = availableTopics.find((t) => t.id === topicId);
    if (!topic) return;

    cardTemplates.forEach((template, templateIndex) => {
      const cardId = `${topicId}-${templateIndex}`;
      const card: GhostWritingCard = {
        id: cardId,
        title: `${template.title} (${topic.name})`,
        concept: template.concept,
        hook: template.hook,
        bridgeText: template.bridgeText,
        goldenNugget: template.goldenNugget,
        callToAction: template.callToAction,
        topic: topic.name,
        category: template.category,
        engagement: {
          likes: Math.floor(Math.random() * 10000) + 1000,
          comments: Math.floor(Math.random() * 500) + 50,
          shares: Math.floor(Math.random() * 1000) + 100,
        },
        estimatedDuration: ["30 seconds", "45 seconds", "1 minute"][templateIndex],
        difficulty: template.difficulty,
        trending: Math.random() > 0.7,
      };
      cards.push(card);
    });
  });

  return cards.slice(0, 12); // Limit to 12 cards for better UX
};
