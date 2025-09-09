"use client";

import { useEffect, useState } from "react";

import { CheckCircle2, PencilLine, Save, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { OnboardingSelections } from "@/components/ui/onboarding-wizard-modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SkeletonMainContent } from "@/components/ui/skeleton-screens";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { useAuth } from "@/contexts/auth-context";
import { useBrandSettingsFlag } from "@/hooks/use-feature-flag";
import { RSS_FEEDS, CATEGORY_KEYWORDS, type Category } from "@/lib/rss-service";
import { ClientOnboardingService } from "@/lib/services/client-onboarding-service";
import { cn } from "@/lib/utils";

interface BrandSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BrandSettings {
  userId: string;
  selectedCategories: Category[];
  customKeywords: string[];
  updatedAt: string;
}

// Duplicate minimal constants – ideally import from a shared file
const CONTENT_TYPES = [
  { id: "educational", name: "Educational/Tutorial", icon: "🎓" },
  { id: "entertainment", name: "Entertainment/Comedy", icon: "😂" },
  { id: "lifestyle", name: "Lifestyle/Personal", icon: "✨" },
  { id: "reviews", name: "Product Reviews", icon: "⭐" },
  { id: "bts", name: "Behind-the-Scenes", icon: "🎬" },
  { id: "trends", name: "Challenges/Trends", icon: "🔥" },
];

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

export function BrandSettingsModal({ open, onOpenChange }: BrandSettingsModalProps) {
  const isBrandSettingsEnabled = useBrandSettingsFlag();
  const { user } = useAuth();
  const [selections, setSelections] = useState<OnboardingSelections | null>(null);
  const [brandSettings, setBrandSettings] = useState<BrandSettings | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [pending, setPending] = useState(false);
  const [isLoadingBrand, setIsLoadingBrand] = useState(true);

  // If feature flag is disabled, don't render the modal
  if (!isBrandSettingsEnabled) {
    return null;
  }

  // Load brand settings
  const loadBrandSettings = async () => {
    try {
      setIsLoadingBrand(true);
      const response = await fetch("/api/user/brand-settings");

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          setBrandSettings(data.settings);
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
      setIsLoadingBrand(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    // Fetch saved selections and brand settings
    Promise.all([
      ClientOnboardingService.getSelections()
        .then(setSelections)
        .catch((err) => console.error("Failed to load selections", err)),
      user ? loadBrandSettings() : Promise.resolve(),
    ]);
  }, [open, user]);

  const toggleContentType = (id: string) => {
    if (!selections) return;
    const current = selections.contentTypes;
    const updated = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id];
    setSelections({ ...selections, contentTypes: updated });
  };

  const handleCategoryToggle = (category: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  };

  const saveBrandSettings = async () => {
    if (!user) return;

    try {
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
          setBrandSettings(data.settings);
        }
      }
    } catch (error) {
      console.error("Error saving brand settings:", error);
    }
  };

  const save = async () => {
    if (!selections) return;
    setPending(true);
    try {
      // Save both content types and brand settings
      await Promise.all([
        ClientOnboardingService.saveSelections(selections),
        saveBrandSettings(),
      ]);
      setEditMode(false);
    } catch (e) {
      console.error(e);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-0 overflow-hidden">
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>Brand Preferences</DialogTitle>
          </VisuallyHidden>
        </DialogHeader>

        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b">
          <h2 className="text-xl font-semibold">Brand Preferences</h2>
          {editMode ? (
            <div className="flex gap-2">
              <Button size="sm" onClick={save} disabled={pending}>
                <Save className="mr-1 size-4" /> Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditMode(false)}
                disabled={pending}
              >
                <X className="mr-1 size-4" /> Cancel
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => setEditMode(true)}>
              <PencilLine className="mr-1 size-4" /> Edit
            </Button>
          )}
        </div>

        {!selections || isLoadingBrand ? (
          <div className="p-6">
            <SkeletonMainContent />
          </div>
        ) : (
          <ScrollArea className="h-[70vh] px-6 pb-6 space-y-8">
            {/* Content Types Section */}
            <section className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-900">Content Types</h3>
              {editMode ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {CONTENT_TYPES.map((type) => {
                    const selected = selections.contentTypes.includes(type.id);
                    return (
                      <Card
                        key={type.id}
                        className={cn(
                          "p-4 cursor-pointer text-center space-y-2 border-2 transition-all",
                          selected
                            ? "border-primary-500 bg-primary-50"
                            : "border-neutral-200 hover:border-neutral-300"
                        )}
                        onClick={() => toggleContentType(type.id)}
                      >
                        <span className="text-3xl">{type.icon}</span>
                        <p className="text-sm font-medium text-neutral-900">{type.name}</p>
                        {selected && <CheckCircle2 className="mx-auto size-4 text-primary-600" />}
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selections.contentTypes.map((id) => {
                    const type = CONTENT_TYPES.find((t) => t.id === id);
                    if (!type) return null;
                    return (
                      <Badge key={id} variant="default" className="bg-primary-600 text-white">
                        {type.icon} {type.name}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Brand Categories Section */}
            <section className="space-y-4 border-t border-neutral-200 pt-6">
              <div>
                <h3 className="text-lg font-medium text-neutral-900">Brand Categories</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Select categories that align with your brand for personalized content suggestions.
                </p>
              </div>

              {editMode ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {(Object.keys(RSS_FEEDS) as Category[]).map((category) => {
                    const info = categoryInfo[category];
                    const isSelected = selectedCategories.includes(category);
                    const keywordCount = CATEGORY_KEYWORDS[category]?.length || 0;

                    return (
                      <div
                        key={category}
                        className={cn(
                          "cursor-pointer rounded-[var(--radius-card)] border-2 p-4 transition-all duration-200",
                          isSelected
                            ? "border-primary-500 bg-primary-50"
                            : "border-neutral-200 bg-neutral-50 hover:border-neutral-300"
                        )}
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
              ) : (
                <div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedCategories.map((category) => (
                      <Badge key={category} variant="default" className="bg-primary-600 text-white">
                        {categoryInfo[category].icon} {categoryInfo[category].label}
                      </Badge>
                    ))}
                  </div>
                  {selectedCategories.length > 0 && (
                    <div className="bg-primary-50 border-primary-200 rounded-[var(--radius-card)] border p-4">
                      <p className="text-primary-700 text-sm">
                        You'll receive trending content suggestions from these categories in your input dropdown.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
