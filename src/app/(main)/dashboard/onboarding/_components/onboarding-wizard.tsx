"use client";

import React, { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { Check, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OnboardingSelections } from "@/components/ui/onboarding-wizard-modal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/auth-context";
import { ClientOnboardingService } from "@/lib/services/client-onboarding-service";
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
      try {
        const selections = await ClientOnboardingService.getSelections();
        if (selections) {
          setSelectedTopics(new Set([...(selections.mainTopics ?? []), ...(selections.customTopics ?? [])]));
        }
      } catch (error) {
        console.error("Failed to load existing selections:", error);
      }
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

    try {
      const selections: OnboardingSelections = {
        contentTypes: [],
        mainTopics: [...selectedTopics],
        subtopics: [],
        customTopics: [],
        platforms: [],
      };

      await ClientOnboardingService.saveSelections(selections);
      setIsSaving(false);
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to save onboarding selections:", error);
      setIsSaving(false);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-foreground text-4xl font-bold md:text-5xl">Welcome to Gen C</h1>
          <h2 className="text-primary text-xl font-semibold md:text-2xl">Configure your personal AI</h2>
        </div>

        <div className="border-border bg-card rounded-xl border-[0.5px] p-6 shadow-sm transition-all duration-300 ease-out hover:border-[--border-subtle] hover:shadow-lg">
          {/* Search & add */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
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
            <h3 className="text-foreground text-lg font-medium">Suggestions</h3>
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
              <h3 className="text-foreground text-lg font-medium">Selected Topics ({selectedTopics.size})</h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedTopics).map((id) => (
                  <div
                    key={id}
                    className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-sm"
                  >
                    {id}
                    <button onClick={() => toggleTopic(id)} className="hover:bg-primary/20 rounded-full p-0.5">
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
