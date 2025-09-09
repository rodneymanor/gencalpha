"use client";

import React, { useEffect, useState } from "react";

import { Plus, Loader2 } from "lucide-react";

import { PersonaApiService } from "@/app/(main)/personas/services/api";
import { CreatorPersonaGrid, type CreatorPersona } from "@/components/creator-personas/creator-persona-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { UserManagementService } from "@/lib/user-management";

// Type definitions for brand voice and content data
interface BrandVoice {
  id: string;
  title: string;
  source: string;
  icon: string;
}

// Knowledge Base types removed (feature not ready)

interface TopicPillar {
  title: string;
  description: string;
  examples: string;
}

interface TopicData {
  emoji: string;
  name: string;
  coreMessage: string;
  personality: string;
  keywords: string[];
  pillars: TopicPillar[];
}

interface BrandHubProps {
  initialBrandVoices?: BrandVoice[];
  onSaveSettings?: (settings: any) => void;
}

const BrandHub: React.FC<BrandHubProps> = ({ initialBrandVoices = [], onSaveSettings }) => {
  // State management for the component
  const [activeSection, setActiveSection] = useState<"content-settings" | "brand-voice">("brand-voice");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<"Personal" | "Business" | "Agency/Freelancer">("Personal");
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [brandVoices, setBrandVoices] = useState<BrandVoice[]>(initialBrandVoices);
  const { user } = useAuth();
  const [personas, setPersonas] = useState<CreatorPersona[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [isSavingPersona, setIsSavingPersona] = useState(false);

  // Add Voice (Persona) modal + form state
  const [isAddVoiceOpen, setIsAddVoiceOpen] = useState(false);
  const [creatorInput, setCreatorInput] = useState<string>("");
  const [creatorPlatform, setCreatorPlatform] = useState<"tiktok" | "youtube" | "instagram" | "other">("tiktok");
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [generatedMetadata, setGeneratedMetadata] = useState<{
    name: string;
    description: string;
    tags: string[];
  } | null>(null);
  const [personaName, setPersonaName] = useState("");
  const [personaDescription, setPersonaDescription] = useState("");
  const [personaTags, setPersonaTags] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  const reloadPersonas = async () => {
    try {
      const list = await PersonaApiService.loadPersonas();
      const converted: CreatorPersona[] = list.map((p: any) => {
        const initials = (p.name || "?")
          .split(" ")
          .map((w: string) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        return {
          id: p.id,
          name: p.name,
          initials,
          followers: p.username ? `@${p.username}` : (p.platform ?? "TikTok"),
          lastEdited: p.lastUsedAt ? `Used ${new Date(p.lastUsedAt).toLocaleDateString()}` : "Recently added",
          avatarVariant: "light",
        };
      });
      setPersonas(converted);
    } catch (e) {
      console.error("Failed to reload personas", e);
    }
  };

  // Topic configuration data following the numbered variant system
  const topicData: Record<string, TopicData> = {
    ai: {
      emoji: "🤖",
      name: "Artificial Intelligence",
      coreMessage: "AI isn't replacing you - it's waiting for you to lead with it",
      personality: "The approachable tech translator - breaking down complex AI concepts with enthusiasm and patience",
      keywords: ["AI tools", "ChatGPT", "automation", "prompt engineering", "workflow"],
      pillars: [
        {
          title: "Master Class Moments",
          description: "Deep-dive tutorials on specific AI tools with step-by-step implementation guides",
          examples: "Complete ChatGPT workflow setup, Building custom GPTs, Advanced prompting",
        },
        {
          title: "AI in 60 Seconds",
          description: "Lightning-fast demonstrations of AI solving real problems",
          examples: "5-second email rewrites, Instant presentation outlines, One-prompt solutions",
        },
        {
          title: "The AI Reality Check",
          description: "Debunking myths and showing what AI actually can and can't do",
          examples: "AI won't take your job but..., The truth about AI limitations",
        },
        {
          title: "This Week in AI",
          description: "Breaking down the latest AI releases and what they mean for you",
          examples: "New ChatGPT features explained, Tool of the week, Industry disruptions",
        },
        {
          title: "AI Transformation Stories",
          description: "Real people achieving incredible results with AI",
          examples: "From 60-hour to 30-hour work weeks, Small business AI wins",
        },
      ],
    },
    content: {
      emoji: "📱",
      name: "Content Creation",
      coreMessage: "Your unique perspective is your unfair advantage - stop copying and start creating",
      personality:
        "The encouraging coach who's been there - sharing wins and failures with transparency and infectious energy",
      keywords: ["content creation", "Instagram growth", "TikTok strategy", "viral content", "creator economy"],
      pillars: [
        {
          title: "Creator Deep Dives",
          description: "Comprehensive breakdowns of successful content strategies and why they work",
          examples: "Analyzing viral videos frame by frame, 30-day content calendar creation",
        },
        {
          title: "Growth Hacks in 30",
          description: "Bite-sized tactics you can implement immediately",
          examples: "Hook formulas that work, Best posting times revealed, Caption templates",
        },
        {
          title: "Creator Economics 101",
          description: "Understanding the business side of content creation",
          examples: "How the algorithm really works, Platform changes explained",
        },
        {
          title: "What's Working Now",
          description: "Real-time updates on platform changes and trending formats",
          examples: "This week's trending audio, New feature tutorials, Algorithm updates",
        },
        {
          title: "Creator Spotlight",
          description: "Success stories and mindset shifts from the creator journey",
          examples: "From 0 to 100K in 6 months, Finding your content niche",
        },
      ],
    },
    productivity: {
      emoji: "⚡",
      name: "Business Productivity",
      coreMessage: "Productivity isn't about doing more - it's about doing what matters",
      personality: "The no-BS efficiency expert who gets things done - practical, direct, but always supportive",
      keywords: ["productivity", "time management", "business systems", "workflow optimization", "automation"],
      pillars: [
        {
          title: "System Blueprints",
          description: "Complete productivity system implementations from start to finish",
          examples: "Building your weekly planning system, Creating SOPs for delegation",
        },
        {
          title: "2-Minute Optimizations",
          description: "Instant productivity wins you can implement right now",
          examples: "Email templates that save hours, The 2-minute rule, Quick decisions",
        },
        {
          title: "Productivity Psychology",
          description: "Understanding why we procrastinate and how to overcome it",
          examples: "The myth of multitasking, Energy vs time management",
        },
        {
          title: "Tools That Actually Work",
          description: "Testing and reviewing the latest productivity tools and methods",
          examples: "New app reviews, AI productivity tools, Trending frameworks tested",
        },
        {
          title: "The 4-Hour Success Stories",
          description: "Real entrepreneurs who transformed their productivity",
          examples: "From 80 to 40 hour weeks, Building a self-running business",
        },
      ],
    },
    nutrition: {
      emoji: "🥗",
      name: "Nutrition",
      coreMessage: "Nutrition isn't about perfection - it's about consistent, smart choices that fit your life",
      personality: "The approachable nutritionist friend - evidence-based but never preachy, realistic and encouraging",
      keywords: ["nutrition", "healthy eating", "meal prep", "gut health", "balanced diet"],
      pillars: [
        {
          title: "Nutrition Deep Science",
          description: "Breaking down complex nutrition research into actionable advice",
          examples: "Gut health masterclass, Understanding macros for energy",
        },
        {
          title: "60-Second Nutrition Wins",
          description: "Quick tips and swaps that make a big difference",
          examples: "5-minute breakfast ideas, Smart snack swaps, One-ingredient additions",
        },
        {
          title: "Nutrition Myths Busted",
          description: "Debunking common nutrition misconceptions with science",
          examples: "The truth about carbs, Protein myths decoded, Supplement facts",
        },
        {
          title: "Trending Diets Reviewed",
          description: "Honest analysis of popular nutrition trends",
          examples: "Intermittent fasting reality, New superfoods tested",
        },
        {
          title: "Food Freedom Stories",
          description: "Real transformations through sustainable nutrition",
          examples: "From diet prisoner to food freedom, Energy transformation stories",
        },
      ],
    },
  };

  // Event handlers using numbered variant progression for state changes
  const handleTopicSelect = (topicKey: string) => {
    setSelectedTopic(topicKey);
    setHasChanges(true);
  };

  const handleUserTypeSelect = (userType: "Personal" | "Business" | "Agency/Freelancer") => {
    setSelectedUserType(userType);
    setHasChanges(true);
  };

  const handleGoalToggle = (goal: string) => {
    const newGoals = new Set(selectedGoals);
    if (newGoals.has(goal)) {
      newGoals.delete(goal);
    } else {
      newGoals.add(goal);
    }
    setSelectedGoals(newGoals);
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    if (!hasChanges) return;
    try {
      const canonical = selectedTopic
        ? // map UI keys to canonical categories
          selectedTopic === "ai"
          ? "artificial-intelligence"
          : selectedTopic === "content"
            ? "content-creation"
            : selectedTopic === "productivity"
              ? "productivity"
              : selectedTopic === "nutrition"
                ? "nutrition"
                : selectedTopic
        : undefined;

      if (user) {
        await UserManagementService.updateUserProfile(user.uid, {
          contentTopic: canonical,
          contentUserType: selectedUserType,
          contentGoals: Array.from(selectedGoals),
        } as any);
      }

      const settings = {
        selectedTopic,
        selectedUserType,
        selectedGoals: Array.from(selectedGoals),
      };
      onSaveSettings?.(settings);
      setHasChanges(false);
    } catch (e) {
      console.error("Failed to save content settings", e);
    }
  };

  // Knowledge Base handlers removed (feature not ready)

  // Load user personas and current brand voice selection
  useEffect(() => {
    const loadPersonas = async () => {
      try {
        const list = await PersonaApiService.loadPersonas();
        const converted: CreatorPersona[] = list.map((p: any) => {
          const initials = (p.name || "?")
            .split(" ")
            .map((w: string) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
          return {
            id: p.id,
            name: p.name,
            initials,
            followers: p.username ? `@${p.username}` : (p.platform ?? "TikTok"),
            lastEdited: p.lastUsedAt ? `Used ${new Date(p.lastUsedAt).toLocaleDateString()}` : "Recently added",
            avatarVariant: "light",
          };
        });
        setPersonas(converted);
      } catch (e) {
        console.error("Failed to load personas", e);
      }
    };

    const loadCurrentSelection = async () => {
      try {
        if (!user) return;
        const profile = await UserManagementService.getUserProfile(user.uid);
        const brandPersonaId = (profile as any)?.brandPersonaId as string | undefined;
        if (brandPersonaId) setSelectedPersonaId(brandPersonaId);

        // Initialize selected topic from profile
        const contentTopic = (profile as any)?.contentTopic as string | undefined;
        if (contentTopic) {
          const cat = (contentTopic || "").toString().toLowerCase();
          const toUiKey = (c: string) => {
            if (c === "artificial-intelligence") return "ai";
            if (c === "content-creation") return "content";
            if (c === "productivity") return "productivity";
            if (c === "nutrition") return "nutrition";
            // no dedicated UI tile for business currently
            return undefined;
          };
          const uiKey = toUiKey(cat);
          if (uiKey && topicData[uiKey]) setSelectedTopic(uiKey);
        }
        const contentUserType = (profile as any)?.contentUserType as
          | "Personal"
          | "Business"
          | "Agency/Freelancer"
          | undefined;
        if (contentUserType) setSelectedUserType(contentUserType);
        const contentGoals = (profile as any)?.contentGoals as string[] | undefined;
        if (Array.isArray(contentGoals)) setSelectedGoals(new Set(contentGoals));
      } catch (e) {
        console.warn("Could not load current brand voice selection");
      }
    };

    loadPersonas();
    loadCurrentSelection();
  }, [user]);

  const handleSaveBrandVoice = async () => {
    if (!user || !selectedPersonaId) return;
    try {
      setIsSavingPersona(true);
      await UserManagementService.updateUserProfile(user.uid, { brandPersonaId: selectedPersonaId } as any);
      setHasChanges(false);
    } catch (e) {
      console.error("Failed to save brand voice", e);
    } finally {
      setIsSavingPersona(false);
    }
  };

  const handleImmediateSaveBrandVoice = async (personaId: string) => {
    if (!user) return;
    try {
      setSelectedPersonaId(personaId);
      setIsSavingPersona(true);
      await UserManagementService.updateUserProfile(user.uid, { brandPersonaId: personaId } as any);
      setHasChanges(false);
    } catch (e) {
      console.error("Failed to save brand voice", e);
    } finally {
      setIsSavingPersona(false);
    }
  };

  // Component rendering with numbered variant system
  return (
    <div className="bg-background flex h-full w-full flex-col">
      {/* Header with neutral-200 border using numbered variants */}
      <header className="bg-background flex shrink-0 items-center justify-between border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="bg-brand-500 flex h-6 w-6 items-center justify-center rounded-[var(--radius-button)] text-sm font-semibold text-white">
            C
          </div>
          <span className="text-sm font-medium text-neutral-900">Brand Hub</span>
        </div>
        {/* Actions on header right */}
        <div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Sidebar with neutral-50 background and numbered variant borders */}
        <aside className="w-60 shrink-0 overflow-y-auto border-r border-neutral-200 bg-neutral-50 p-4">
          <nav className="space-y-1">
            <div
              className={`flex cursor-pointer items-center rounded-[var(--radius-button)] px-3 py-2 text-sm font-normal transition-all duration-150 ${
                activeSection === "content-settings"
                  ? "bg-brand-500 text-white"
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
              onClick={() => setActiveSection("content-settings")}
            >
              <span className="mr-3 w-4 text-center">⚙</span>
              Content Settings
            </div>
            <div
              className={`flex cursor-pointer items-center rounded-[var(--radius-button)] px-3 py-2 text-sm font-normal transition-all duration-150 ${
                activeSection === "brand-voice"
                  ? "bg-brand-500 text-white"
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
              onClick={() => setActiveSection("brand-voice")}
            >
              <span className="mr-3 w-4 text-center">✎</span>
              Brand Voice
            </div>
          </nav>
        </aside>

        {/* Main content area fills modal space and scrolls independently */}
        <main className="bg-background h-full min-h-0 flex-1 overflow-y-auto overscroll-contain p-8">
          {/* Brand Voice Section */}
          {activeSection === "brand-voice" && (
            <section className="flex min-h-0 flex-col">
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <h1 className="text-2xl font-semibold text-neutral-900">Brand Voice</h1>
                  <button
                    className="bg-brand-600 hover:bg-brand-700 inline-flex items-center gap-2 rounded-[var(--radius-button)] px-3 py-2 text-sm font-medium text-white"
                    onClick={() => {
                      // reset modal state each time it opens
                      setCreatorInput("");
                      setCreatorPlatform("tiktok");
                      setAnalysisLoading(false);
                      setAnalysisError("");
                      setAnalysisResult(null);
                      setMetadataLoading(false);
                      setGeneratedMetadata(null);
                      setPersonaName("");
                      setPersonaDescription("");
                      setPersonaTags("");
                      setCreateLoading(false);
                      setCreateError("");
                      setIsAddVoiceOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Voice
                  </button>
                </div>
                <p className="text-sm text-neutral-600">Choose your brand voice by selecting a persona</p>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <CreatorPersonaGrid
                  personas={personas}
                  selectedId={selectedPersonaId ?? undefined}
                  selectable={true}
                  onPersonaSelect={(id) => {
                    setSelectedPersonaId(id);
                    setHasChanges(true);
                  }}
                  onPersonaClick={(id) => {
                    // Save immediately when the card (not edit/delete) is clicked
                    handleImmediateSaveBrandVoice(id);
                  }}
                />

                <div className="mt-6">
                  <button
                    className={`rounded-[var(--radius-button)] px-4 py-2 text-sm font-medium transition-all duration-150 ${
                      selectedPersonaId
                        ? "bg-brand-500 hover:bg-brand-600 cursor-pointer text-white"
                        : "cursor-not-allowed bg-neutral-300 text-neutral-500"
                    }`}
                    onClick={handleSaveBrandVoice}
                    disabled={!selectedPersonaId || isSavingPersona}
                  >
                    {isSavingPersona ? "Saving..." : "Set Brand Voice"}
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Knowledge Base removed (not ready) */}

          {/* Content Settings Section */}
          {activeSection === "content-settings" && (
            <section className="flex min-h-0 flex-col">
              <div className="mb-6">
                <h1 className="mb-2 text-2xl font-semibold text-neutral-900">What You Post About</h1>
                <p className="text-sm text-neutral-600">
                  Select your main content topic and configure your brand strategy
                </p>
              </div>
              {/* Scrollable content area for the entire panel */}
              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                {/* Topic Selector Grid with numbered variants */}
                <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {Object.entries(topicData).map(([key, topic]) => (
                    <div
                      key={key}
                      className={`cursor-pointer rounded-[var(--radius-card)] border-2 p-4 text-center transition-all duration-150 ${
                        selectedTopic === key
                          ? "border-neutral-600 bg-neutral-50"
                          : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
                      }`}
                      onClick={() => handleTopicSelect(key)}
                    >
                      <div className="mb-2 text-3xl">{topic.emoji}</div>
                      <div className="text-sm font-medium text-neutral-900">{topic.name}</div>
                    </div>
                  ))}
                </div>

                {/* Topic Details with numbered variant backgrounds */}
                {selectedTopic && (
                  <div className="mb-8 rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-6">
                    <div className="mb-6 flex items-center gap-3 border-b border-neutral-200 pb-4">
                      <span className="text-2xl">{topicData[selectedTopic].emoji}</span>
                      <h2 className="text-lg font-semibold text-neutral-900">{topicData[selectedTopic].name}</h2>
                    </div>

                    <div className="grid min-h-0 grid-cols-1 gap-6 lg:grid-cols-2">
                      {/* Left column: overview */}
                      <div className="space-y-5">
                        <div>
                          <div className="mb-2 text-xs font-medium tracking-wider text-neutral-500 uppercase">
                            Core Message
                          </div>
                          <div className="text-sm leading-relaxed text-neutral-900">
                            {topicData[selectedTopic].coreMessage}
                          </div>
                        </div>

                        <div>
                          <div className="mb-2 text-xs font-medium tracking-wider text-neutral-500 uppercase">
                            Brand Personality
                          </div>
                          <div className="text-sm leading-relaxed text-neutral-900">
                            {topicData[selectedTopic].personality}
                          </div>
                        </div>

                        <div>
                          <div className="mb-2 text-xs font-medium tracking-wider text-neutral-500 uppercase">
                            Keywords
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {topicData[selectedTopic].keywords.map((keyword, index) => (
                              <span
                                key={index}
                                className="rounded-[var(--radius-button)] bg-neutral-100 px-3 py-1 text-xs text-neutral-600"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right column: pillars with internal scroll */}
                      <div className="min-h-0">
                        <div className="mb-3 text-xs font-medium tracking-wider text-neutral-500 uppercase">
                          Content Pillars
                        </div>
                        <div className="grid max-h-[50vh] grid-cols-1 gap-3 overflow-auto pr-1 md:grid-cols-2">
                          {topicData[selectedTopic].pillars.map((pillar, index) => (
                            <div key={index} className="rounded-[var(--radius-button)] bg-neutral-100 p-4">
                              <div className="mb-2 text-sm font-semibold text-neutral-900">{pillar.title}</div>
                              <div className="mb-2 text-xs leading-relaxed text-neutral-600">{pillar.description}</div>
                              <div className="text-xs text-neutral-500 italic">Examples: {pillar.examples}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Goals Selection with numbered variant states */}
                <div className="mb-8">
                  <h2 className="mb-2 text-lg font-medium text-neutral-900">Your goals</h2>
                  <p className="mb-1 text-sm text-neutral-600">Select what are your goals with posting content</p>
                  <p className="mb-4 text-xs text-neutral-500">At least one goal must be selected</p>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {[
                      "📈 Grow my audience & go viral",
                      "🎓 Establish my authority & educate others",
                      "✨ Inspire & impact others",
                      "🎯 Attract more clients & increase sales",
                    ].map((goal) => (
                      <div
                        key={goal}
                        className={`flex cursor-pointer items-center gap-3 rounded-[var(--radius-button)] border p-4 transition-all duration-150 ${
                          selectedGoals.has(goal)
                            ? "border-neutral-600 bg-neutral-50"
                            : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
                        }`}
                        onClick={() => handleGoalToggle(goal)}
                      >
                        <div
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all duration-150 ${
                            selectedGoals.has(goal)
                              ? "border-neutral-600 bg-neutral-600 text-xs text-white"
                              : "border-neutral-300"
                          }`}
                        >
                          {selectedGoals.has(goal) && "✓"}
                        </div>
                        <span className="flex-1 text-sm text-neutral-900">{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save Button with numbered variant states */}
                <div className="pb-2">
                  <button
                    className={`rounded-[var(--radius-button)] px-4 py-2 text-sm font-medium transition-all duration-150 ${
                      hasChanges
                        ? "bg-brand-500 hover:bg-brand-600 cursor-pointer text-white"
                        : "cursor-not-allowed bg-neutral-300 text-neutral-500"
                    }`}
                    onClick={handleSaveSettings}
                    disabled={!hasChanges}
                  >
                    Save Content Settings
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Add Voice Modal */}
      <Dialog open={isAddVoiceOpen} onOpenChange={setIsAddVoiceOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Brand Voice</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Step 1: Creator profile */}
            <div>
              <div className="mb-2 text-sm font-medium text-neutral-900">Creator Profile</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <label className="mb-1 block text-xs font-medium text-neutral-600">Platform</label>
                  <select
                    className="focus:ring-brand-400 w-full rounded-[var(--radius-button)] border border-neutral-200 bg-white px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                    value={creatorPlatform}
                    onChange={(e) => setCreatorPlatform(e.target.value as any)}
                    disabled={analysisLoading || createLoading}
                  >
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                    <option value="instagram">Instagram</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-neutral-600">Username or Profile URL</label>
                  <input
                    type="text"
                    className="focus:ring-brand-400 w-full rounded-[var(--radius-button)] border border-neutral-200 bg-white px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                    placeholder="@creator or profile URL"
                    value={creatorInput}
                    onChange={(e) => setCreatorInput(e.target.value)}
                    disabled={analysisLoading || createLoading}
                  />
                </div>
              </div>
              <div className="mt-3">
                <button
                  className="inline-flex items-center gap-2 rounded-[var(--radius-button)] bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70"
                  onClick={async () => {
                    setAnalysisError("");
                    setGeneratedMetadata(null);
                    setAnalysisResult(null);
                    setMetadataLoading(false);
                    setPersonaName("");
                    setPersonaDescription("");
                    setPersonaTags("");

                    const raw = creatorInput.trim();
                    if (!raw) {
                      setAnalysisError("Please enter a username or profile URL");
                      return;
                    }

                    // For now, handle TikTok best; other platforms may require manual transcripts later
                    const username = raw.startsWith("@")
                      ? raw.slice(1)
                      : raw
                          .split("/")
                          .filter(Boolean)
                          .find((p) => p.startsWith("@"))
                          ?.slice(1) || raw;

                    setAnalysisLoading(true);
                    try {
                      // 1) Fetch creator feed
                      const feed = await PersonaApiService.fetchUserFeed(username, 20);

                      // 2) Take top N video URLs
                      const videoUrls: string[] = feed
                        .map((v: any) => v.playAddr || v.videoUrl || v.url)
                        .filter(Boolean)
                        .slice(0, 10);

                      if (!videoUrls.length) throw new Error("No videos found for this creator");

                      // 3) Transcribe (server API handles URL)
                      const transcripts: string[] = [];
                      for (const url of videoUrls.slice(0, 6)) {
                        try {
                          const t = await PersonaApiService.transcribeVideo(url);
                          if (t) transcripts.push(t);
                        } catch (e) {
                          console.warn("Transcript failed for one video, continuing", e);
                        }
                      }
                      if (transcripts.length < 3) throw new Error("Not enough transcripts. Try another creator.");

                      // 4) Analyze voice
                      const analysis = await PersonaApiService.analyzeVoicePatterns(transcripts);
                      setAnalysisResult(analysis);

                      // 5) Generate metadata to prefill
                      setMetadataLoading(true);
                      const meta = await PersonaApiService.generateMetadata(analysis);
                      setGeneratedMetadata(meta);
                      setPersonaName(meta.name || "");
                      setPersonaDescription(meta.description || "");
                      setPersonaTags((meta.tags || []).join(", "));
                    } catch (e: any) {
                      setAnalysisError(e?.message || "Failed to analyze voice. Please try again.");
                    } finally {
                      setMetadataLoading(false);
                      setAnalysisLoading(false);
                    }
                  }}
                  disabled={analysisLoading || createLoading}
                >
                  {analysisLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing…
                    </>
                  ) : (
                    "Analyze Voice"
                  )}
                </button>
                {analysisError && (
                  <div className="border-destructive-200 bg-destructive-50 text-destructive-700 mt-2 rounded-[var(--radius-button)] border px-3 py-2 text-sm">
                    {analysisError}
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Persona details (after metadata) */}
            <div className="rounded-[var(--radius-card)] border border-neutral-200 p-4">
              <div className="mb-3 text-sm font-medium text-neutral-900">Persona Details</div>
              {metadataLoading && (
                <div className="mb-3 inline-flex items-center gap-2 text-sm text-neutral-700">
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating suggestions…
                </div>
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-neutral-600">Persona Name</label>
                  <input
                    type="text"
                    className="focus:ring-brand-400 w-full rounded-[var(--radius-button)] border border-neutral-200 bg-white px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                    placeholder="e.g., Alex Hormozi Voice"
                    value={personaName}
                    onChange={(e) => setPersonaName(e.target.value)}
                    disabled={createLoading}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-neutral-600">Description</label>
                  <textarea
                    rows={3}
                    className="focus:ring-brand-400 w-full resize-none rounded-[var(--radius-button)] border border-neutral-200 bg-white px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                    placeholder="Brief description of the creator's style and focus"
                    value={personaDescription}
                    onChange={(e) => setPersonaDescription(e.target.value)}
                    disabled={createLoading}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-neutral-600">Tags (comma-separated)</label>
                  <input
                    type="text"
                    className="focus:ring-brand-400 w-full rounded-[var(--radius-button)] border border-neutral-200 bg-white px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                    placeholder="fitness, motivation, short-form, educational"
                    value={personaTags}
                    onChange={(e) => setPersonaTags(e.target.value)}
                    disabled={createLoading}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  className="bg-brand-600 hover:bg-brand-700 inline-flex items-center gap-2 rounded-[var(--radius-button)] px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
                  onClick={async () => {
                    setCreateError("");
                    if (!analysisResult) {
                      setCreateError("Run Analyze Voice first");
                      return;
                    }
                    if (!personaName.trim()) {
                      setCreateError("Please provide a persona name");
                      return;
                    }
                    setCreateLoading(true);
                    try {
                      const raw = creatorInput.trim();
                      const username = raw.startsWith("@")
                        ? raw.slice(1)
                        : raw
                            .split("/")
                            .filter(Boolean)
                            .find((p) => p.startsWith("@"))
                            ?.slice(1) || raw;
                      const res = await PersonaApiService.createPersona({
                        name: personaName.trim(),
                        description: personaDescription,
                        platform: creatorPlatform,
                        username,
                        analysis: analysisResult,
                        tags: personaTags
                          ? personaTags
                              .split(",")
                              .map((t) => t.trim())
                              .filter(Boolean)
                          : [],
                      });

                      // Refresh list and select new persona
                      await reloadPersonas();
                      if (res?.personaId) {
                        setSelectedPersonaId(res.personaId);
                        await handleImmediateSaveBrandVoice(res.personaId);
                      }
                      setIsAddVoiceOpen(false);
                    } catch (e: any) {
                      setCreateError(e?.message || "Failed to create persona");
                    } finally {
                      setCreateLoading(false);
                    }
                  }}
                  disabled={createLoading}
                >
                  {createLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    "Create Persona"
                  )}
                </button>
                {createError && (
                  <div className="border-destructive-200 bg-destructive-50 text-destructive-700 rounded-[var(--radius-button)] border px-3 py-2 text-sm">
                    {createError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrandHub;
