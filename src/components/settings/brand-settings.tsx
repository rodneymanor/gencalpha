"use client";

import { useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/auth-context";
import { RSS_FEEDS, CATEGORY_KEYWORDS, type Category } from "@/lib/rss-service";

interface BrandSettings {
  userId: string;
  selectedCategories: Category[];
  customKeywords: string[];
  updatedAt: string;
}

export function BrandSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<BrandSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  // Category information for display
  const categoryInfo = {
    ai: {
      label: "Artificial Intelligence",
      description: "AI, machine learning, and technology trends",
      icon: "🤖",
    },
    fitness: {
      label: "Fitness & Health",
      description: "Workout routines, nutrition, and wellness tips",
      icon: "💪",
    },
    celebrities: {
      label: "Celebrities & Entertainment",
      description: "Celebrity news, entertainment, and pop culture",
      icon: "⭐",
    },
    business: {
      label: "Business & Finance",
      description: "Startups, funding, market trends, and economics",
      icon: "💼",
    },
    gaming: {
      label: "Gaming",
      description: "Video games, esports, and gaming industry news",
      icon: "🎮",
    },
  };

  // Load user brand settings
  useEffect(() => {
    if (user) {
      loadBrandSettings();
    }
  }, [user]);

  const loadBrandSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/user/brand-settings");

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
          setSelectedCategories(data.settings.selectedCategories || []);
        } else {
          // No settings found, start with empty
          setSelectedCategories([]);
        }
      }
    } catch (error) {
      console.error("Error loading brand settings:", error);
      setSelectedCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveBrandSettings = async () => {
    if (!user) return;

    try {
      setIsSaving(true);

      const settingsToSave: Omit<BrandSettings, "updatedAt"> = {
        userId: user.uid,
        selectedCategories,
        customKeywords: [], // For future expansion
      };

      const response = await fetch("/api/user/brand-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settingsToSave),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSettings(data.settings);
          // Show success message or toast
          console.log("Brand settings saved successfully");
        }
      }
    } catch (error) {
      console.error("Error saving brand settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoryToggle = (category: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 animate-pulse rounded-[var(--radius-button)] bg-neutral-200" />
        <div className="h-32 animate-pulse rounded-[var(--radius-card)] bg-neutral-200" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Brand Settings</h2>
        <p className="mt-1 text-neutral-600">
          Choose the topics that are relevant to your brand to get personalized content suggestions.
        </p>
      </div>

      {/* Category Selection */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-lg font-semibold text-neutral-900">Content Categories</h3>
            <p className="text-sm text-neutral-600">
              Select the categories that align with your brand and content strategy.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(Object.keys(RSS_FEEDS) as Category[]).map((category) => {
              const info = categoryInfo[category];
              const isSelected = selectedCategories.includes(category);
              const keywordCount = CATEGORY_KEYWORDS[category]?.length || 0;

              return (
                <div
                  key={category}
                  className={`cursor-pointer rounded-[var(--radius-card)] border-2 p-4 transition-all duration-200 ${
                    isSelected
                      ? "border-primary-500 bg-primary-50"
                      : "border-neutral-200 bg-neutral-50 hover:border-neutral-300"
                  } `}
                  onClick={() => handleCategoryToggle(category)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox checked={isSelected} onChange={() => handleCategoryToggle(category)} className="mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-lg">{info.icon}</span>
                        <h4 className="font-medium text-neutral-900">{info.label}</h4>
                      </div>
                      <p className="mb-2 text-sm text-neutral-600">{info.description}</p>
                      <Badge variant="secondary" className="text-xs">
                        {keywordCount} keywords
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Categories Preview */}
          {selectedCategories.length > 0 && (
            <div className="bg-primary-50 border-primary-200 mt-6 rounded-[var(--radius-card)] border p-4">
              <h4 className="text-primary-900 mb-2 font-medium">Selected Categories</h4>
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((category) => (
                  <Badge key={category} variant="default" className="bg-primary-600 text-white">
                    {categoryInfo[category].icon} {categoryInfo[category].label}
                  </Badge>
                ))}
              </div>
              <p className="text-primary-700 mt-2 text-sm">
                You'll receive trending content suggestions from these categories in your input dropdown.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveBrandSettings}
          disabled={isSaving}
          className="rounded-[var(--radius-button)] bg-neutral-900 text-neutral-50 hover:bg-neutral-800"
        >
          {isSaving ? "Saving..." : "Save Brand Settings"}
        </Button>
      </div>
    </div>
  );
}
