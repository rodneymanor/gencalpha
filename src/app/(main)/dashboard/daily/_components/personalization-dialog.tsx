"use client";

import React, { useState } from "react";

import { Settings, Search, Check, X, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Topic {
  id: string;
  name: string;
  description: string;
}

interface SocialAccount {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
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
    description: "Pet care tips, training advice, cute animal content, and product recommendations.",
  },
  {
    id: "home",
    name: "Home & DIY",
    description: "Interior design inspiration, DIY projects, organization tips, and home improvement guides.",
  },
  {
    id: "finance",
    name: "Personal Finance",
    description: "Budgeting tips, investment advice, financial literacy, and money-saving strategies.",
  },
  {
    id: "sustainability",
    name: "Sustainable Living",
    description: "Eco-friendly products, green lifestyle tips, zero-waste solutions, and environmental awareness.",
  },
];

export function PersonalizationDialog() {
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [tikTokAccounts, setTikTokAccounts] = useState<SocialAccount[]>([]);
  const [instagramAccounts, setInstagramAccounts] = useState<SocialAccount[]>([]);
  const [tikTokSearch, setTikTokSearch] = useState("");
  const [instagramSearch, setInstagramSearch] = useState("");
  const [topicSearch, setTopicSearch] = useState("");

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

  const addTikTokAccount = () => {
    if (tikTokSearch.trim()) {
      const newAccount: SocialAccount = {
        id: `tiktok-${Date.now()}`,
        username: tikTokSearch.trim(),
        displayName: tikTokSearch.trim(),
      };
      setTikTokAccounts((prev) => [...prev, newAccount]);
      setTikTokSearch("");
    }
  };

  const addInstagramAccount = () => {
    if (instagramSearch.trim()) {
      const newAccount: SocialAccount = {
        id: `instagram-${Date.now()}`,
        username: instagramSearch.trim(),
        displayName: instagramSearch.trim(),
      };
      setInstagramAccounts((prev) => [...prev, newAccount]);
      setInstagramSearch("");
    }
  };

  const removeAccount = (
    accounts: SocialAccount[],
    setAccounts: React.Dispatch<React.SetStateAction<SocialAccount[]>>,
    id: string,
  ) => {
    setAccounts(accounts.filter((account) => account.id !== id));
  };

  const filteredTopics = availableTopics.filter(
    (topic) =>
      topic.name.toLowerCase().includes(topicSearch.toLowerCase()) ||
      topic.description.toLowerCase().includes(topicSearch.toLowerCase()),
  );

  const handleSave = () => {
    // Here you would save to your preferences store or API
    console.log("Saving personalization:", {
      topics: Array.from(selectedTopics),
      tikTokAccounts,
      instagramAccounts,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground mt-2">
          <Settings className="mr-1 h-3 w-3" />
          Edit Personalization
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Personalize Your Content Experience</DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Topics Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Content Topics</h3>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search topics..."
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredTopics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => toggleTopic(topic.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    selectedTopics.has(topic.id)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "text-foreground border-border hover:border-primary/50 bg-white hover:bg-gray-50",
                  )}
                >
                  {selectedTopics.has(topic.id) && <Check className="h-3 w-3" />}
                  {topic.name}
                </button>
              ))}
            </div>
          </div>

          {/* TikTok Accounts Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Followed TikTok Accounts</h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Add TikTok username..."
                  value={tikTokSearch}
                  onChange={(e) => setTikTokSearch(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTikTokAccount()}
                />
              </div>
              <Button onClick={addTikTokAccount} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tikTokAccounts.map((account) => (
                <div
                  key={account.id}
                  className="inline-flex items-center gap-2 rounded-lg border border-pink-200 bg-pink-50 px-3 py-1 text-sm text-pink-800"
                >
                  @{account.username}
                  <button
                    onClick={() => removeAccount(tikTokAccounts, setTikTokAccounts, account.id)}
                    className="rounded-full p-0.5 hover:bg-pink-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Instagram Accounts Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Followed Instagram Accounts</h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Add Instagram username..."
                  value={instagramSearch}
                  onChange={(e) => setInstagramSearch(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addInstagramAccount()}
                />
              </div>
              <Button onClick={addInstagramAccount} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {instagramAccounts.map((account) => (
                <div
                  key={account.id}
                  className="inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1 text-sm text-purple-800"
                >
                  @{account.username}
                  <button
                    onClick={() => removeAccount(instagramAccounts, setInstagramAccounts, account.id)}
                    className="rounded-full p-0.5 hover:bg-purple-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <DialogTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </DialogTrigger>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
