"use client";

import React, { useState, useEffect } from "react";

import { RefreshCw, Bookmark } from "lucide-react";

import { GhostCard } from "@/app/(main)/dashboard/ai-ghostwriter/_components/ghost-card";
import { generateGhostWritingCards } from "@/app/(main)/dashboard/ai-ghostwriter/_components/ghost-card-generator";
import type { GhostWritingCard } from "@/app/(main)/dashboard/ai-ghostwriter/_components/types";
import { Button } from "@/components/ui/button";
import { ClarityLoader } from "@/components/ui/loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Simple toast replacement
const useToast = () => ({
  toast: ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    if (variant === "destructive") {
      alert(`❌ ${title}: ${description}`);
    } else {
      alert(`✅ ${title}: ${description}`);
    }
  },
});

export default function IdeasGhostwriterPage() {
  const [ghostCards, setGhostCards] = useState<GhostWritingCard[]>([]);
  const [savedCards, setSavedCards] = useState<GhostWritingCard[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("trending");
  const { toast } = useToast();

  // Load user's onboarding topics
  useEffect(() => {
    const savedTopics = localStorage.getItem("onboarding-topics");
    if (savedTopics) {
      const topics = JSON.parse(savedTopics);
      setSelectedTopics(topics);
      setGhostCards(generateGhostWritingCards(topics));
    } else {
      const defaultTopics = ["beauty", "fitness", "travel", "food"];
      setSelectedTopics(defaultTopics);
      setGhostCards(generateGhostWritingCards(defaultTopics));
    }
  }, []);

  // Load saved cards
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("saved-ghost-cards") ?? "[]");
    setSavedCards(saved);
  }, []);

  const generateNewIdeas = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setGhostCards(generateGhostWritingCards(selectedTopics));
    setLoading(false);
  };

  const generateScript = async (card: GhostWritingCard) => {
    try {
      const response = await fetch("/api/script/speed-write", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea: card.hook,
          length: "60",
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
          description: "Your script has been generated successfully.",
        });
      } else {
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
      const savedCards = JSON.parse(localStorage.getItem("saved-ghost-cards") ?? "[]");
      const isAlreadySaved = savedCards.some((saved: GhostWritingCard) => saved.id === card.id);

      if (isAlreadySaved) {
        const updatedCards = savedCards.filter((saved: GhostWritingCard) => saved.id !== card.id);
        localStorage.setItem("saved-ghost-cards", JSON.stringify(updatedCards));
        setSavedCards(updatedCards);
        toast({
          title: "Card Removed!",
          description: "Card has been removed from your saved collection.",
        });
      } else {
        const updatedCards = [...savedCards, { ...card, savedAt: new Date().toISOString() }];
        localStorage.setItem("saved-ghost-cards", JSON.stringify(updatedCards));
        setSavedCards(updatedCards);
        toast({
          title: "Card Saved!",
          description: "Card has been saved to your collection.",
        });
      }
    } catch (error) {
      console.error("Error saving card:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error saving card. Please try again.",
      });
    }
  };

  const isCardSaved = (cardId: string) => {
    return savedCards.some((saved) => saved.id === cardId);
  };

  // Get trending cards (first 6 cards)
  const trendingCards = ghostCards.slice(0, 6);
  const displayCards = activeTab === "trending" ? trendingCards : savedCards;

  return (
    <div className="bg-background min-h-screen font-sans">
      <div className="px-6 pt-6 pb-8">
        {/* Header Section */}
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-semibold md:text-3xl">AI Ghostwriter</h1>
          </div>
          <Button onClick={generateNewIdeas} disabled={loading} className="flex items-center gap-2">
            {loading ? <ClarityLoader size="inline" /> : <RefreshCw className="h-4 w-4" />}
            {loading ? "Refreshing..." : "Refresh ideas"}
          </Button>
        </div>

        {/* Subheading */}
        <p className="text-muted-foreground mb-6">Generate viral content ideas based on your topics</p>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="border-border h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="trending"
              className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 pb-3 data-[state=active]:border-b-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Trending Templates
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="data-[state=active]:border-primary flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 pb-3 data-[state=active]:border-b-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Bookmark className="h-4 w-4" />
              Saved Ideas
            </TabsTrigger>
          </TabsList>

          {/* Trending Templates Content */}
          <TabsContent value="trending" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="bg-card border-border animate-pulse rounded-[var(--radius-card)] border p-4"
                  >
                    <div className="space-y-3">
                      <div className="bg-muted h-4 w-3/4 rounded"></div>
                      <div className="bg-muted h-3 w-1/2 rounded"></div>
                      <div className="space-y-2">
                        <div className="bg-muted h-3 rounded"></div>
                        <div className="bg-muted h-3 w-5/6 rounded"></div>
                        <div className="bg-muted h-3 w-4/6 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {trendingCards.map((card) => (
                  <GhostCard
                    key={card.id}
                    card={card}
                    onGenerateScript={generateScript}
                    onSave={saveCard}
                    isSaved={isCardSaved(card.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Saved Ideas Content */}
          <TabsContent value="saved" className="mt-6">
            {savedCards.length === 0 ? (
              <div className="py-12 text-center">
                <Bookmark className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <h3 className="mb-2 text-lg font-medium">No saved ideas yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start saving your favorite content ideas from the Trending Templates tab.
                </p>
                <Button onClick={() => setActiveTab("trending")} variant="secondary">
                  Browse Trending Templates
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {savedCards.map((card) => (
                  <GhostCard
                    key={card.id}
                    card={card}
                    onGenerateScript={generateScript}
                    onSave={saveCard}
                    isSaved={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
