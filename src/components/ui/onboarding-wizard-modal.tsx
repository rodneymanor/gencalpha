"use client";

import { useState, useEffect } from "react";

import {
  TrendingUp,
  Hash,
  CheckCircle2,
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Rocket,
  Target,
  Lightbulb,
  Users,
  Zap
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ClarityLoader } from "@/components/ui/loading";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { ClientOnboardingService } from "@/lib/services/client-onboarding-service";
import { cn } from "@/lib/utils";

// Content data structures
const CONTENT_TOPICS = {
  lifestyle_wellness: {
    name: "Lifestyle & Wellness",
    description: "Content focused on personal improvement, health, and daily routines",
    icon: "🌿",
    subtopics: [
      "Morning/Evening Routines",
      "Mental Health & Self-Care",
      "Fitness & Home Workouts",
      "Healthy Recipes & Nutrition",
      "Productivity & Time Management",
      "Mindfulness & Meditation",
      "Sleep Optimization",
      "Habit Building"
    ],
    trending_hashtags: ["#selfcare", "#morningroutine", "#healthylifestyle", "#mindfulness", "#wellness", "#productivity", "#mentalhealth", "#habitbuilding"]
  },
  beauty_fashion: {
    name: "Beauty & Fashion",
    description: "Beauty tutorials, fashion trends, and style inspiration",
    icon: "💄",
    subtopics: [
      "Makeup Tutorials & GRWM",
      "Skincare Routines & Reviews",
      "Fashion Hauls & Try-Ons",
      "Hair Care & Styling",
      "Nail Art & Manicures",
      "Outfit Ideas & Styling Tips",
      "Product Reviews & Unboxing",
      "Beauty Transformations"
    ],
    trending_hashtags: ["#makeup", "#skincare", "#fashion", "#ootd", "#grwm", "#beauty", "#haircare", "#nailart"]
  },
  entertainment_comedy: {
    name: "Entertainment & Comedy",
    description: "Humorous content, skits, and entertaining performances",
    icon: "🎭",
    subtopics: [
      "Comedy Skits & Parodies",
      "Reaction Videos",
      "Pranks & Challenges",
      "POV & Storytelling",
      "Voice Acting & Characters",
      "Memes & Viral Trends",
      "Behind-the-Scenes Content",
      "Relatable Humor"
    ],
    trending_hashtags: ["#comedy", "#funny", "#pov", "#skit", "#relatable", "#viral", "#meme", "#entertainment"]
  },
  food_cooking: {
    name: "Food & Cooking",
    description: "Recipe creation, cooking tutorials, and food content",
    icon: "🍳",
    subtopics: [
      "Quick & Easy Recipes",
      "Baking & Desserts",
      "Healthy Meal Prep",
      "International Cuisine",
      "Food Reviews & Tastings",
      "Cooking Techniques & Tips",
      "Dietary Restrictions (Vegan, Keto, etc.)",
      "Food Styling & Photography"
    ],
    trending_hashtags: ["#food", "#recipe", "#cooking", "#baking", "#foodie", "#mealprep", "#healthyeating", "#yummy"]
  },
  education_diy: {
    name: "Educational & DIY",
    description: "Teaching, tutorials, and how-to content",
    icon: "📚",
    subtopics: [
      "Study Tips & Methods",
      "Language Learning",
      "DIY Crafts & Projects",
      "Tech Tips & Tutorials",
      "Life Skills & Adulting",
      "Historical Facts & Stories",
      "Science Experiments",
      "Art & Creative Techniques"
    ],
    trending_hashtags: ["#diy", "#tutorial", "#education", "#learning", "#studytips", "#lifehacks", "#howto", "#crafts"]
  },
  business_finance: {
    name: "Business & Finance",
    description: "Entrepreneurship, money management, and career advice",
    icon: "💼",
    subtopics: [
      "Personal Finance Tips",
      "Investing & Stocks",
      "Entrepreneurship & Startups",
      "Career Development",
      "Side Hustles & Passive Income",
      "Budgeting & Saving",
      "Digital Marketing",
      "Freelancing & Remote Work"
    ],
    trending_hashtags: ["#business", "#finance", "#investing", "#entrepreneur", "#money", "#career", "#sidehustle", "#personalfinance"]
  },
  travel_adventure: {
    name: "Travel & Adventure",
    description: "Travel experiences, destinations, and adventure content",
    icon: "✈️",
    subtopics: [
      "Destination Highlights",
      "Travel Tips & Hacks",
      "Budget Travel",
      "Food & Culture Exploration",
      "Adventure Sports",
      "Solo Travel Experiences",
      "Travel Photography",
      "Road Trips & Local Exploration"
    ],
    trending_hashtags: ["#travel", "#wanderlust", "#adventure", "#explore", "#vacation", "#roadtrip", "#solotravel", "#backpacking"]
  },
  technology_gaming: {
    name: "Technology & Gaming",
    description: "Tech reviews, gaming content, and digital innovation",
    icon: "🎮",
    subtopics: [
      "Product Reviews & Unboxing",
      "Gaming Highlights & Tips",
      "Tech News & Trends",
      "App Reviews & Recommendations",
      "Gadget Comparisons",
      "Gaming Setup Tours",
      "Software Tutorials",
      "AI & Future Tech"
    ],
    trending_hashtags: ["#tech", "#gaming", "#gadgets", "#technology", "#ai", "#software", "#techreview", "#innovation"]
  },
  pets_animals: {
    name: "Pets & Animals",
    description: "Pet care, animal content, and wildlife education",
    icon: "🐾",
    subtopics: [
      "Pet Training & Care Tips",
      "Cute Pet Moments",
      "Animal Facts & Education",
      "Pet Product Reviews",
      "Wildlife & Nature",
      "Veterinary Advice",
      "Pet Adoption Stories",
      "Animal Rescue Content"
    ],
    trending_hashtags: ["#pets", "#animals", "#dogs", "#cats", "#petcare", "#wildlife", "#animalrescue", "#pettraining"]
  },
  fitness_sports: {
    name: "Fitness & Sports",
    description: "Workout routines, sports content, and athletic performance",
    icon: "💪",
    subtopics: [
      "Home Workout Routines",
      "Sports Highlights & Analysis",
      "Nutrition for Athletes",
      "Gym Tips & Form Checks",
      "Yoga & Flexibility",
      "Strength Training",
      "Cardio & Endurance",
      "Recovery & Wellness"
    ],
    trending_hashtags: ["#fitness", "#workout", "#gym", "#sports", "#health", "#training", "#bodybuilding", "#yoga"]
  }
};

const CONTENT_TYPES = [
  { id: "educational", name: "Educational/Tutorial", icon: "🎓" },
  { id: "entertainment", name: "Entertainment/Comedy", icon: "😂" },
  { id: "lifestyle", name: "Lifestyle/Personal", icon: "✨" },
  { id: "reviews", name: "Product Reviews", icon: "⭐" },
  { id: "bts", name: "Behind-the-Scenes", icon: "🎬" },
  { id: "trends", name: "Challenges/Trends", icon: "🔥" }
];

const PLATFORMS = [
  { id: "tiktok", name: "TikTok", icon: "🎵", color: "#FF0050" },
  { id: "instagram", name: "Instagram Reels", icon: "📸", color: "#E4405F" },
  { id: "youtube", name: "YouTube Shorts", icon: "▶️", color: "#FF0000" },
  { id: "all", name: "All Platforms", icon: "🌐", color: "#6366F1" }
];

// Wizard step component signatures
interface StepProps {
  next(): void;
  back(): void;
  selections: OnboardingSelections;
  updateSelections: (update: Partial<OnboardingSelections>) => void;
}

// Type representing all user picks
export interface OnboardingSelections {
  contentTypes: string[];
  mainTopics: string[];
  subtopics: string[];
  customTopics: string[];
  platforms: string[];
  specificInterest?: string;
}

const DEFAULT_SELECTIONS: OnboardingSelections = {
  contentTypes: [],
  mainTopics: [],
  subtopics: [],
  customTopics: [],
  platforms: [],
  specificInterest: undefined,
};

// Steps config
const steps = [
  "welcome",
  "content_type",
  "topics",
  "subtopics",
  "custom",
  "platforms",
  "summary",
] as const;

type StepKey = (typeof steps)[number];

// Step Components -------------------------------------------------

const StepWelcome = ({ next }: StepProps) => (
  <div className="flex flex-col items-center justify-center space-y-8 py-8">
    <div className="relative">
      <div className="absolute inset-0 animate-pulse bg-primary/20 rounded-full blur-3xl" />
      <Rocket className="relative size-24 text-primary" />
    </div>

    <div className="text-center space-y-4 max-w-lg">
      <h1 className="text-4xl font-bold text-foreground">
        Welcome to Gen&nbsp;C Alpha
      </h1>
      <p className="text-muted-foreground text-lg">
        Your AI-powered short-form video assistant. Let's personalize your experience
        to help you create viral content that resonates with your audience.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mt-8">
      <Card className="p-4 text-center space-y-2 bg-card/50 backdrop-blur">
        <Target className="size-8 text-primary mx-auto" />
        <h3 className="font-semibold">Discover Trends</h3>
        <p className="text-sm text-muted-foreground">Find viral content in your niche</p>
      </Card>
      <Card className="p-4 text-center space-y-2 bg-card/50 backdrop-blur">
        <Lightbulb className="size-8 text-primary mx-auto" />
        <h3 className="font-semibold">Get Ideas</h3>
        <p className="text-sm text-muted-foreground">AI-powered content suggestions</p>
      </Card>
      <Card className="p-4 text-center space-y-2 bg-card/50 backdrop-blur">
        <TrendingUp className="size-8 text-primary mx-auto" />
        <h3 className="font-semibold">Track Performance</h3>
        <p className="text-sm text-muted-foreground">Monitor trending hashtags</p>
      </Card>
    </div>

    <Button onClick={next} size="lg" className="group">
      Get Started
      <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
    </Button>
  </div>
);

const StepContentType = ({ next, selections, updateSelections }: StepProps) => {
  const toggleContentType = (typeId: string) => {
    const current = selections.contentTypes;
    const updated = current.includes(typeId)
      ? current.filter(id => id !== typeId)
      : [...current, typeId];
    updateSelections({ contentTypes: updated });
  };

  const isSelected = (typeId: string) => selections.contentTypes.includes(typeId);
  const canContinue = selections.contentTypes.length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">What type of content do you create?</h2>
        <p className="text-muted-foreground">Select all that apply to help us understand your style</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {CONTENT_TYPES.map(type => (
          <Card
            key={type.id}
            className={cn(
              "p-6 cursor-pointer transition-all hover:shadow-md",
              "border-2",
              isSelected(type.id)
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
            onClick={() => toggleContentType(type.id)}
          >
            <div className="text-center space-y-3">
              <span className="text-4xl">{type.icon}</span>
              <h3 className="font-medium text-sm">{type.name}</h3>
              {isSelected(type.id) && (
                <CheckCircle2 className="size-5 text-primary mx-auto" />
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={next} disabled={!canContinue}>
          Continue
          <ChevronRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  );
};

const StepTopics = ({ next, back, selections, updateSelections }: StepProps) => {
  const toggleTopic = (topicKey: string) => {
    const current = selections.mainTopics;
    if (current.includes(topicKey)) {
      updateSelections({ mainTopics: current.filter(k => k !== topicKey) });
    } else if (current.length < 5) {
      updateSelections({ mainTopics: [...current, topicKey] });
    }
  };

  const isSelected = (topicKey: string) => selections.mainTopics.includes(topicKey);
  const canContinue = selections.mainTopics.length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Choose your main content topics</h2>
        <p className="text-muted-foreground">
          Select up to 5 topics that best represent your content focus
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge variant={selections.mainTopics.length === 5 ? "destructive" : "secondary"}>
            {selections.mainTopics.length}/5 selected
          </Badge>
        </div>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(CONTENT_TOPICS).map(([key, topic]) => (
            <Card
              key={key}
              className={cn(
                "p-4 cursor-pointer transition-all hover:shadow-md",
                "border-2",
                isSelected(key)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50",
                selections.mainTopics.length >= 5 && !isSelected(key) && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => {
                if (selections.mainTopics.length < 5 || isSelected(key)) {
                  toggleTopic(key);
                }
              }}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{topic.icon}</span>
                    <div>
                      <h3 className="font-semibold">{topic.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {topic.description}
                      </p>
                    </div>
                  </div>
                  {isSelected(key) && (
                    <CheckCircle2 className="size-5 text-primary shrink-0" />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="flex justify-between">
        <Button variant="outline" onClick={back}>
          <ChevronLeft className="mr-2 size-4" />
          Back
        </Button>
        <Button onClick={next} disabled={!canContinue}>
          Continue
          <ChevronRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  );
};

const StepSubtopics = ({ next, back, selections, updateSelections }: StepProps) => {
  const toggleSubtopic = (subtopic: string) => {
    const current = selections.subtopics;
    const updated = current.includes(subtopic)
      ? current.filter(s => s !== subtopic)
      : [...current, subtopic];

    // Auto-assign specific interest based on subtopic selection
    let specificInterest = selections.specificInterest;
    if (subtopic === "AI & Future Tech") {
      if (updated.includes(subtopic)) {
        // User selected AI & Future Tech - set aitools as specific interest
        specificInterest = 'aitools';
      } else {
        // User deselected AI & Future Tech - clear specific interest if it was aitools
        if (selections.specificInterest === 'aitools') {
          specificInterest = undefined;
        }
      }
    }

    updateSelections({
      subtopics: updated,
      specificInterest: specificInterest
    });
  };

  const isSelected = (subtopic: string) => selections.subtopics.includes(subtopic);
  const canContinue = selections.subtopics.length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Refine your interests</h2>
        <p className="text-muted-foreground">
          Select specific subtopics within your chosen areas
        </p>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-6">
          {selections.mainTopics.map(topicKey => {
            const topic = CONTENT_TOPICS[topicKey as keyof typeof CONTENT_TOPICS];
            if (!topic) return null;

            return (
              <div key={topicKey} className="space-y-3">
                <div className="flex items-center gap-2 sticky top-0 bg-background py-2">
                  <span className="text-2xl">{topic.icon}</span>
                  <h3 className="font-semibold text-lg">{topic.name}</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {topic.subtopics.map(subtopic => (
                    <Badge
                      key={subtopic}
                      variant={isSelected(subtopic) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-sm",
                        "justify-start p-3 h-auto text-wrap",
                        isSelected(subtopic) && "ring-2 ring-primary ring-offset-2"
                      )}
                      onClick={() => toggleSubtopic(subtopic)}
                    >
                      {subtopic}
                      {isSelected(subtopic) && (
                        <CheckCircle2 className="ml-2 size-3" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="flex justify-between">
        <Button variant="outline" onClick={back}>
          <ChevronLeft className="mr-2 size-4" />
          Back
        </Button>
        <Button onClick={next} disabled={!canContinue}>
          Continue
          <ChevronRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  );
};

const StepCustom = ({ next, back, selections, updateSelections }: StepProps) => {
  const [inputValue, setInputValue] = useState("");

  const addCustomTopic = () => {
    const topic = inputValue.trim();
    if (topic && !selections.customTopics.includes(topic)) {
      updateSelections({ customTopics: [...selections.customTopics, topic] });
      setInputValue("");
    }
  };

  const removeCustomTopic = (topic: string) => {
    updateSelections({
      customTopics: selections.customTopics.filter(t => t !== topic)
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Add your unique niches</h2>
        <p className="text-muted-foreground">
          Add any custom topics or niches that aren't covered above (optional)
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter a custom topic or niche"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomTopic();
              }
            }}
            className="flex-1"
          />
          <Button onClick={addCustomTopic} disabled={!inputValue.trim()}>
            <Plus className="size-4" />
            Add
          </Button>
        </div>

        {selections.customTopics.length > 0 && (
          <div className="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-lg">
            {selections.customTopics.map(topic => (
              <Badge
                key={topic}
                variant="secondary"
                className="pl-3 pr-1 py-1.5 gap-2"
              >
                {topic}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                  onClick={() => removeCustomTopic(topic)}
                >
                  <X className="size-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={back}>
          <ChevronLeft className="mr-2 size-4" />
          Back
        </Button>
        <Button onClick={next}>
          Continue
          <ChevronRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  );
};

const StepPlatforms = ({ next, back, selections, updateSelections }: StepProps) => {
  const togglePlatform = (platformId: string) => {
    const current = selections.platforms;
    const updated = current.includes(platformId)
      ? current.filter(id => id !== platformId)
      : [...current, platformId];
    updateSelections({ platforms: updated });
  };

  const isSelected = (platformId: string) => selections.platforms.includes(platformId);
  const canContinue = selections.platforms.length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Where do you create content?</h2>
        <p className="text-muted-foreground">
          Select your primary platforms for optimized recommendations
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
        {PLATFORMS.map(platform => (
          <Card
            key={platform.id}
            className={cn(
              "p-6 cursor-pointer transition-all hover:shadow-md",
              "border-2 text-center space-y-3",
              isSelected(platform.id)
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
            onClick={() => togglePlatform(platform.id)}
          >
            <span className="text-4xl">{platform.icon}</span>
            <h3 className="font-medium text-sm">{platform.name}</h3>
            {isSelected(platform.id) && (
              <CheckCircle2 className="size-5 text-primary mx-auto" />
            )}
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={back}>
          <ChevronLeft className="mr-2 size-4" />
          Back
        </Button>
        <Button onClick={next} disabled={!canContinue}>
          Continue
          <ChevronRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  );
};

const StepSummary = ({ back, selections }: StepProps) => {
  const [isCompleting, setIsCompleting] = useState(false);

  const completeOnboarding = async () => {
    setIsCompleting(true);
    try {
      console.log("🔄 Starting onboarding save process...");
      console.log("📝 Selections to save:", selections);

      await ClientOnboardingService.saveSelections(selections);

      console.log("✅ Onboarding selections saved successfully!");

      // Close the modal after saving
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("❌ Failed to save onboarding selections", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : typeof error
      });
      // Don't reload if there's an error, so user can see the issue
      setIsCompleting(false);
    }
  };

  // Generate hashtag recommendations
  const generateHashtagRecommendations = () => {
    const allHashtags: string[] = [];
    selections.mainTopics.forEach(topicKey => {
      const topic = CONTENT_TOPICS[topicKey as keyof typeof CONTENT_TOPICS];
      if (topic?.trending_hashtags) {
        allHashtags.push(...topic.trending_hashtags);
      }
    });

    const uniqueHashtags = [...new Set(allHashtags)];
    return {
      primary: uniqueHashtags.slice(0, 5),
      secondary: uniqueHashtags.slice(5, 10),
      niche: uniqueHashtags.slice(10, 15)
    };
  };

  const hashtags = generateHashtagRecommendations();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse bg-primary/20 rounded-full blur-2xl" />
            <CheckCircle2 className="relative size-16 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">You're all set!</h2>
        <p className="text-muted-foreground">
          Here's your personalized content discovery setup
        </p>
      </div>

      <ScrollArea className="h-[350px] pr-4">
        <div className="space-y-6">
          {/* Content Profile */}
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Users className="size-5 text-primary" />
              Your Content Profile
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Content Types:</p>
                <div className="flex flex-wrap gap-2">
                  {selections.contentTypes.map(typeId => {
                    const type = CONTENT_TYPES.find(t => t.id === typeId);
                    return type ? (
                      <Badge key={typeId} variant="secondary">
                        {type.icon} {type.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Main Topics:</p>
                <div className="flex flex-wrap gap-2">
                  {selections.mainTopics.map(topicKey => {
                    const topic = CONTENT_TOPICS[topicKey as keyof typeof CONTENT_TOPICS];
                    return topic ? (
                      <Badge key={topicKey} variant="secondary">
                        {topic.icon} {topic.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Platforms:</p>
                <div className="flex flex-wrap gap-2">
                  {selections.platforms.map(platformId => {
                    const platform = PLATFORMS.find(p => p.id === platformId);
                    return platform ? (
                      <Badge key={platformId} variant="secondary">
                        {platform.icon} {platform.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>

              {selections.specificInterest && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Specific Interest:</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">
                      {selections.specificInterest}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Hashtag Recommendations */}
          {(hashtags.primary.length > 0 || hashtags.secondary.length > 0) && (
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Hash className="size-5 text-primary" />
                Recommended Hashtags
              </h3>

              <div className="space-y-4">
                {hashtags.primary.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Primary (Use in every post)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {hashtags.primary.map(tag => (
                        <Badge key={tag} variant="default">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {hashtags.secondary.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Secondary (Mix and match)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {hashtags.secondary.map(tag => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Dashboard Preview */}
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Zap className="size-5 text-primary" />
              Your Personalized Dashboard
            </h3>

            <div className="grid gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Trending Content</p>
                  <p className="text-sm text-muted-foreground">
                    Discover viral videos in your niches
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Hash className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Hashtag Tracker</p>
                  <p className="text-sm text-muted-foreground">
                    Monitor performance of your tags
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Lightbulb className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Content Ideas</p>
                  <p className="text-sm text-muted-foreground">
                    AI-generated suggestions for your next video
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </ScrollArea>

      <div className="flex justify-between">
        <Button variant="outline" onClick={back}>
          <ChevronLeft className="mr-2 size-4" />
          Back
        </Button>
        <Button
          onClick={completeOnboarding}
          disabled={isCompleting}
          className="group"
        >
          {isCompleting ? (
            <>
              <ClarityLoader size="inline" />
              <span className="ml-2">Setting up...</span>
            </>
          ) : (
            <>
              Start Creating!
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

const STEP_COMPONENTS: Record<StepKey, (p: StepProps) => JSX.Element> = {
  welcome: StepWelcome,
  content_type: StepContentType,
  topics: StepTopics,
  subtopics: StepSubtopics,
  custom: StepCustom,
  platforms: StepPlatforms,
  summary: StepSummary,
};

// Main Component -----------------------------------------------------------------------------

interface OnboardingWizardModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mode?: 'onboarding' | 'edit';
}

export function OnboardingWizardModal({
  open: externalOpen,
  onOpenChange,
  mode = 'onboarding'
}: OnboardingWizardModalProps = {}) {
  const [internalOpen, setInternalOpen] = useState(true);
  const [current, setCurrent] = useState<StepKey>(mode === 'edit' ? "content_type" : "welcome");
  const [selections, setSelections] = useState<OnboardingSelections>(DEFAULT_SELECTIONS);
  const [loading, setLoading] = useState(mode === 'edit');

  // Use external open state if provided, otherwise use internal
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  // Load existing selections in edit mode
  useEffect(() => {
    if (mode === 'edit' && isOpen) {
      loadExistingSelections();
    }
  }, [mode, isOpen]);

  const loadExistingSelections = async () => {
    try {
      setLoading(true);
      console.log('Loading existing selections for edit mode...');
      const existingSelections = await ClientOnboardingService.getSelections();
      if (existingSelections) {
        setSelections(existingSelections);
        console.log('✅ Loaded existing selections:', existingSelections);
      } else {
        console.log('📝 No existing selections found, using defaults');
      }
    } catch (error) {
      console.error('Failed to load existing selections:', error);
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = steps.indexOf(current);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const goto = (dir: "next" | "back") => {
    const idx = steps.indexOf(current);
    const nextIdx = dir === "next" ? Math.min(idx + 1, steps.length - 1) : Math.max(idx - 1, 0);
    setCurrent(steps[nextIdx]);
  };

  const updateSelections = (update: Partial<OnboardingSelections>) => {
    setSelections(prev => ({ ...prev, ...update }));
  };

  const Step = STEP_COMPONENTS[current];

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md">
          <DialogHeader>
            <VisuallyHidden>
              <DialogTitle>Loading Brand Settings</DialogTitle>
            </VisuallyHidden>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <ClarityLoader size="sm" />
              <p className="text-muted-foreground">Loading your brand settings...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[95vw] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl p-0 overflow-hidden">
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>Onboarding Wizard - Step {stepIndex + 1} of {steps.length}</DialogTitle>
          </VisuallyHidden>
        </DialogHeader>

        {/* Progress bar */}
        <div className="px-6 pt-6">
          <Progress value={progress} className="h-2" />
          <div className="mt-2 text-xs text-muted-foreground text-right">
            Step {stepIndex + 1} of {steps.length}
          </div>
        </div>

        {/* Step body */}
        <div className="px-6 pb-6">
          <Step
            next={() => goto("next")}
            back={() => goto("back")}
            selections={selections}
            updateSelections={updateSelections}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
