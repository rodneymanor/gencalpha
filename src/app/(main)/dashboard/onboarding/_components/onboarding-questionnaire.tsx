"use client";

import React, { useState } from "react";

import { Search, X, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Topic {
  id: string;
  name: string;
  description: string;
}

const availableTopics: Topic[] = [
  {
    id: "beauty",
    name: "Beauty & Cosmetics",
    description:
      "Natural beauty, skincare routines, makeup tutorials, and product reviews. High engagement with beauty enthusiasts seeking authentic recommendations.",
  },
  {
    id: "fashion",
    name: "Fashion & Style",
    description:
      "Outfit inspiration, style tips, sustainable fashion, and trend analysis. Perfect for building a community around personal expression.",
  },
  {
    id: "travel",
    name: "Travel & Adventure",
    description:
      "Destination guides, travel tips, and cultural experiences. Create wanderlust-inspiring content that drives booking decisions.",
  },
  {
    id: "food",
    name: "Food & Cooking",
    description:
      "Recipe tutorials, cooking hacks, restaurant reviews, and food challenges. One of the most viral content categories with massive engagement.",
  },
  {
    id: "fitness",
    name: "Fitness & Wellness",
    description:
      "Workout routines, nutrition advice, wellness tips, and health transformations. Build a supportive community focused on healthy living.",
  },
  {
    id: "pets",
    name: "Pets & Animals",
    description:
      "Pet care tips, training advice, cute animal content, and product recommendations. Highly engaged pet-loving communities.",
  },
  {
    id: "home",
    name: "Home & DIY",
    description:
      "Interior design inspiration, DIY projects, organization tips, and home improvement guides. Perfect for creative lifestyle content.",
  },
  {
    id: "finance",
    name: "Personal Finance",
    description:
      "Budgeting tips, investment advice, financial literacy, and money-saving strategies. Growing audience seeking financial education.",
  },
  {
    id: "sustainability",
    name: "Sustainable Living",
    description:
      "Eco-friendly products, green lifestyle tips, zero-waste solutions, and environmental awareness. Appeals to conscious consumers.",
  },
];

export function OnboardingQuestionnaire() {
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [customTopic, setCustomTopic] = useState("");

  const filteredTopics = availableTopics.filter(
    (topic) =>
      topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  };

  const addCustomTopic = () => {
    if (customTopic.trim()) {
      const customId = `custom-${Date.now()}`;
      // In a real app, you'd add this to your topics list
      setSelectedTopics((prev) => new Set([...prev, customId]));
      setCustomTopic("");
    }
  };

  const handleSubmit = () => {
    // Handle form submission
    console.log("Selected topics:", Array.from(selectedTopics));
  };

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4 text-center">
          <h1 className="text-foreground text-4xl font-bold md:text-5xl">Welcome to Gen C</h1>
          <h2 className="text-primary text-xl font-semibold md:text-2xl">Configure your personal AI</h2>
        </div>

        {/* Main Form */}
        <div className="bg-card space-y-6 rounded-lg border p-6 md:p-8">
          <div className="space-y-2">
            <h3 className="text-foreground text-2xl font-semibold">Define your topics</h3>
            <p className="text-muted-foreground">What do you want to post about?</p>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="Type in or search for topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Custom Topic Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Add a custom topic..."
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCustomTopic()}
            />
            <Button onClick={addCustomTopic} disabled={!customTopic.trim()} variant="outline">
              Add
            </Button>
          </div>

          {/* Topic Pills */}
          <div className="space-y-4">
            <h4 className="text-foreground text-lg font-medium">Suggestions:</h4>
            <div className="flex flex-wrap gap-3">
              {filteredTopics.map((topic) => (
                <Tooltip key={topic.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => toggleTopic(topic.id)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all hover:scale-105",
                        selectedTopics.has(topic.id)
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-accent",
                      )}
                    >
                      {selectedTopics.has(topic.id) && <Check className="h-3 w-3" />}
                      {topic.name}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="text-sm">{topic.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Selected Topics Display */}
          {selectedTopics.size > 0 && (
            <div className="space-y-3">
              <h4 className="text-foreground text-lg font-medium">Selected Topics ({selectedTopics.size}):</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedTopics).map((topicId) => {
                  const topic = availableTopics.find((t) => t.id === topicId);
                  if (!topic) return null;

                  return (
                    <div
                      key={topicId}
                      className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm"
                    >
                      {topic.name}
                      <button onClick={() => toggleTopic(topicId)} className="hover:bg-primary/20 rounded-full p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSubmit} disabled={selectedTopics.size === 0} size="lg" className="px-8">
              Continue Setup
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
