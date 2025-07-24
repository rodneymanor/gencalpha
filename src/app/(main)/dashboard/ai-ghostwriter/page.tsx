"use client";

import React, { useState, useEffect } from "react";

import { Wand2, Sparkles, RefreshCw, BookOpen, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { GhostCard } from "./_components/ghost-card";
import { generateGhostWritingCards, availableTopics } from "./_components/ghost-card-generator";
import type { GhostWritingCard } from "./_components/types";

// Simple toast replacement (would normally use a toast library)
const useToast = () => ({
  toast: ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    if (variant === "destructive") {
      alert(`❌ ${title}: ${description}`);
    } else {
      alert(`✅ ${title}: ${description}`);
    }
  },
});

export default function AIGhostwriterPage() {
  const [ghostCards, setGhostCards] = useState<GhostWritingCard[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  // Load user's onboarding topics (in real app, this would come from API/localStorage)
  useEffect(() => {
    const savedTopics = localStorage.getItem("onboarding-topics");
    if (savedTopics) {
      const topics = JSON.parse(savedTopics);
      setSelectedTopics(topics);
      setGhostCards(generateGhostWritingCards(topics));
    } else {
      // Default topics if no onboarding completed
      const defaultTopics = ["beauty", "fitness", "travel", "food"];
      setSelectedTopics(defaultTopics);
      setGhostCards(generateGhostWritingCards(defaultTopics));
    }
  }, []);

  const generateNewCards = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setGhostCards(generateGhostWritingCards(selectedTopics));
    setLoading(false);
  };

  const generateScript = async (card: GhostWritingCard) => {
    try {
      // Call the script generation API
      const response = await fetch("/api/script/speed-write", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Note: In a real app, you'd include authentication headers
        },
        body: JSON.stringify({
          idea: card.hook,
          length: "60", // Default to 60 seconds
          ideaData: {
            concept: card.concept,
            hookTemplate: card.category,
            peqCategory: card.category,
            sourceText: card.goldenNugget,
            targetAudience: card.topic,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Generated script:", result);
        toast({
          title: "Script Generated!",
          description: "Your script has been generated successfully. Check the console for details.",
        });
      } else {
        console.error("Script generation failed:", response.statusText);
        toast({
          variant: "destructive",
          title: "Generation Failed",
          description: "Script generation failed. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error generating script:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error generating script. Please try again.",
      });
    }
  };

  const saveCard = async (card: GhostWritingCard) => {
    try {
      // Save to localStorage for now (in real app, save to database)
      const savedCards = JSON.parse(localStorage.getItem("saved-ghost-cards") ?? "[]");
      const updatedCards = [...savedCards, { ...card, savedAt: new Date().toISOString() }];
      localStorage.setItem("saved-ghost-cards", JSON.stringify(updatedCards));

      toast({
        title: "Card Saved!",
        description: "Ghost writing card has been saved to your collection.",
      });
    } catch (error) {
      console.error("Error saving card:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error saving card. Please try again.",
      });
    }
  };

  const [savedCards, setSavedCards] = useState<GhostWritingCard[]>([]);

  // Load saved cards on component mount
  useEffect(() => {
    if (activeTab === "saved") {
      const saved = JSON.parse(localStorage.getItem("saved-ghost-cards") ?? "[]");
      setSavedCards(saved);
    }
  }, [activeTab]);

  const filteredCards =
    activeTab === "saved"
      ? savedCards
      : ghostCards.filter((card) => {
          if (activeTab === "all") return true;
          if (activeTab === "trending") return card.trending;
          return card.category === activeTab;
        });

  return (
    <div className="container mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-3">
            <Wand2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Ghostwriter</h1>
            <p className="text-muted-foreground">Generate viral content ideas based on your topics</p>
          </div>
        </div>

        {/* Stats and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-muted-foreground text-sm">{ghostCards.length} ideas generated</div>
            <div className="flex items-center gap-2">
              {selectedTopics.slice(0, 3).map((topicId) => {
                const topic = availableTopics.find((t) => t.id === topicId);
                return topic ? (
                  <Badge key={topicId} variant="secondary" className="text-xs">
                    {topic.name}
                  </Badge>
                ) : null;
              })}
              {selectedTopics.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{selectedTopics.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          <Button onClick={generateNewCards} disabled={loading} className="gap-2">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Generating..." : "Generate New Ideas"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All Ideas</TabsTrigger>
          <TabsTrigger value="trending" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="problem">Problems</TabsTrigger>
          <TabsTrigger value="excuse">Excuses</TabsTrigger>
          <TabsTrigger value="question">Questions</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <Card key={`skeleton-${index}`} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                    <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 rounded bg-gray-200"></div>
                      <div className="h-3 w-5/6 rounded bg-gray-200"></div>
                      <div className="h-3 w-4/6 rounded bg-gray-200"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCards.map((card) => (
                <GhostCard key={card.id} card={card} onGenerateScript={generateScript} onSave={saveCard} />
              ))}
            </div>
          )}

          {!loading && filteredCards.length === 0 && (
            <div className="py-12 text-center">
              <BookOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-medium">No ideas found</h3>
              <p className="text-muted-foreground mb-4">No ghost writing ideas match your current filter.</p>
              <Button onClick={() => setActiveTab("all")} variant="outline">
                View All Ideas
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
