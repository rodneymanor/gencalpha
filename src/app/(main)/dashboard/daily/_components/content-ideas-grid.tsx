"use client";

import React from "react";

import { Heart, Share2, Bookmark, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ContentIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  videoUrl?: string;
  thumbnail?: string;
  duration?: string;
  likes: number;
  shares: number;
  isBookmarked: boolean;
  height: "short" | "medium" | "tall";
}

const contentIdeas: ContentIdea[] = [
  {
    id: "1",
    title: "Morning Routine That Changed My Life",
    description:
      "5 simple habits that transformed my productivity and mindset. Start your day with intention and watch everything change.",
    category: "Lifestyle",
    duration: "0:45",
    likes: 1240,
    shares: 89,
    isBookmarked: false,
    height: "medium",
  },
  {
    id: "2",
    title: "Secret Ingredients for Viral Content",
    description:
      "The 3 psychological triggers that make content irresistible. Used by top creators to get millions of views.",
    category: "Creator Tips",
    duration: "1:20",
    likes: 2100,
    shares: 156,
    isBookmarked: true,
    height: "tall",
  },
  {
    id: "3",
    title: "60-Second Business Idea",
    description: "Turn your phone into a money-making machine with this simple strategy.",
    category: "Business",
    duration: "1:00",
    likes: 890,
    shares: 67,
    isBookmarked: false,
    height: "short",
  },
  {
    id: "4",
    title: "Why Everyone is Wrong About Success",
    description:
      "The uncomfortable truth about achievement that no one talks about. This mindset shift will change everything you thought you knew.",
    category: "Mindset",
    duration: "2:15",
    likes: 3400,
    shares: 234,
    isBookmarked: true,
    height: "tall",
  },
  {
    id: "5",
    title: "Cook Like a Pro in 30 Seconds",
    description: "One technique that will level up every dish you make.",
    category: "Food",
    duration: "0:30",
    likes: 567,
    shares: 43,
    isBookmarked: false,
    height: "short",
  },
  {
    id: "6",
    title: "The Psychology of First Impressions",
    description:
      "What people decide about you in the first 7 seconds and how to control it. Body language secrets from FBI interrogators.",
    category: "Psychology",
    duration: "1:45",
    likes: 1890,
    shares: 178,
    isBookmarked: false,
    height: "medium",
  },
  {
    id: "7",
    title: "Investment Mistake Costing You Thousands",
    description: "The one thing 90% of investors do wrong that destroys their returns.",
    category: "Finance",
    duration: "1:10",
    likes: 1456,
    shares: 123,
    isBookmarked: true,
    height: "medium",
  },
  {
    id: "8",
    title: "Ancient Memory Technique",
    description:
      "How Greek philosophers memorized entire books using this simple method. Still works today for studying, presentations, and more.",
    category: "Education",
    duration: "2:30",
    likes: 2234,
    shares: 189,
    isBookmarked: false,
    height: "tall",
  },
];

export function ContentIdeasGrid() {
  const [bookmarkedItems, setBookmarkedItems] = React.useState<Set<string>>(
    new Set(contentIdeas.filter((item) => item.isBookmarked).map((item) => item.id)),
  );

  const toggleBookmark = (id: string) => {
    setBookmarkedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="columns-1 gap-4 space-y-4 sm:columns-2 md:gap-6 md:space-y-6 lg:columns-3 xl:columns-4 2xl:columns-5">
      {contentIdeas.map((idea) => (
        <div
          key={idea.id}
          className={cn(
            "bg-card group mb-4 cursor-pointer break-inside-avoid overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md",
            idea.height === "short" && "h-48",
            idea.height === "medium" && "h-64",
            idea.height === "tall" && "h-80",
          )}
        >
          {/* Thumbnail/Video Preview */}
          <div className="from-primary/20 to-accent/20 relative flex h-32 items-center justify-center bg-gradient-to-br">
            <Play className="text-primary/70 group-hover:text-primary h-8 w-8 transition-colors" />
            {idea.duration && (
              <div className="absolute right-2 bottom-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                {idea.duration}
              </div>
            )}
            <div className="bg-primary/90 text-primary-foreground absolute top-2 left-2 rounded-full px-2 py-1 text-xs">
              {idea.category}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3 p-4">
            <h3 className="text-foreground group-hover:text-primary line-clamp-2 font-semibold transition-colors">
              {idea.title}
            </h3>
            <p className="text-muted-foreground line-clamp-3 text-sm">{idea.description}</p>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-muted-foreground flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{idea.likes.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="h-4 w-4" />
                  <span>{idea.shares}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark(idea.id);
                }}
              >
                <Bookmark
                  className={cn(
                    "h-4 w-4 transition-colors",
                    bookmarkedItems.has(idea.id)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground hover:text-primary",
                  )}
                />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
