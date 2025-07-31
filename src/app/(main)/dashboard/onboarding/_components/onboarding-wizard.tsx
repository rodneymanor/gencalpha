"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Check, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import {
  OnboardingSelections,
  getOnboardingSelections,
  saveOnboardingSelections,
} from "@/lib/onboarding-service";

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
      "Natural beauty, skincare routines, makeup tutorials, and product reviews.",
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
    description: "Pet care tips, cute animal content, and product recommendations.",
  },
];

export function OnboardingWizard() {
  const { user } = useAuth();
  const router = useRouter();

  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load existing selections (if any)
  useEffect(() => {
    if (!user) return;
    (async () => {
      const selections = await getOnboardingSelections(user.uid);
      setSelectedTopics(new Set([...(selections.mainTopics ?? []), ...(selections.customTopics ?? [])]));
    })();
  }, [user]);

  const filteredTopics = availableTopics.filter((topic) =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  const addCustomTopic = () => {
    if (customTopic.trim()) {
      setSelectedTopics((prev) => new Set([...prev, customTopic.trim()]));
      setCustomTopic("");
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    const selections: OnboardingSelections = {
      contentTypes: [],
      mainTopics: [...selectedTopics],
      subtopics: [],
      customTopics: [],
      platforms: [],
    };

    await saveOnboardingSelections(user.uid, selections);
    setIsSaving(false);

    router.push("/dashboard");
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold text-foreground md:text-5xl">Welcome to Gen C</h1>
          <h2 className="text-xl font-semibold text-primary md:text-2xl">Configure your personal AI</h2>
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-sm">
          {/* Search & add */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add a custom topic..."
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomTopic()}
              />
              <Button variant="outline" onClick={addCustomTopic} disabled={!customTopic.trim()}>
                Add
              </Button>
            </div>
          </div>

          {/* Suggestions */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium text-foreground">Suggestions</h3>
            <div className="flex flex-wrap gap-3">
              {filteredTopics.map((topic) => (
                <Tooltip key={topic.id}>
                  <TooltipTrigger asChild>
                    <button
                      className={cn(
                        "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                        selectedTopics.has(topic.id)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-accent",
                      )}
                      onClick={() => toggleTopic(topic.id)}
                    >
                      {selectedTopics.has(topic.id) && <Check className="h-3 w-3" />}
                      {topic.name}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-sm">
                    {topic.description}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Selected */}
          {selectedTopics.size > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="text-lg font-medium text-foreground">
                Selected Topics ({selectedTopics.size})
              </h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedTopics).map((id) => (
                  <div
                    key={id}
                    className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary"
                  >
                    {id}
                    <button
                      onClick={() => toggleTopic(id)}
                      className="rounded-full p-0.5 hover:bg-primary/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <Button onClick={handleSave} disabled={selectedTopics.size === 0 || isSaving} size="lg">
              {isSaving ? "Saving..." : "Save & Continue"}
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
