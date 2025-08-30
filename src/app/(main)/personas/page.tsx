"use client";

import React, { useState, useEffect, useRef } from "react";

import { onAuthStateChanged } from "firebase/auth";
import { Plus, Filter, Loader2, User, ChevronUp, Sparkles, AlertCircle } from "lucide-react";

import { CreatorPersonaGrid, type CreatorPersona } from "@/components/creator-personas/creator-persona-card";
import { PersonaDetailsPanel, type PersonaDetails } from "@/components/persona-details-panel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UnifiedSlideout, ClaudeArtifactConfig } from "@/components/ui/unified-slideout";
import { auth } from "@/lib/firebase";

// Interface for persona data from Firestore
interface FirestorePersona {
  id: string;
  name: string;
  description?: string;
  platform?: string;
  username?: string;
  voiceStyle?: string;
  distinctiveness?: string;
  complexity?: string;
  usageCount?: number;
  lastUsedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Helper function to get relative time
const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins === 0) return "just now";
      return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;
    }
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  } else if (diffDays === 1) {
    return "yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }
};

export default function PersonasPage() {
  const [filterValue, setFilterValue] = useState("all");
  const [userPersonas, setUserPersonas] = useState<CreatorPersona[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState<PersonaDetails | null>(null);
  const [personasData, setPersonasData] = useState<FirestorePersona[]>([]);

  // Persona creation state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [personaUsername, setPersonaUsername] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<{
    step: string;
    current: number;
    total: number;
  } | null>(null);
  const [analysisError, setAnalysisError] = useState<string>("");
  const formRef = useRef<HTMLDivElement>(null);

  // Load personas from Firestore
  useEffect(() => {
    // Wait for auth state to be ready
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadPersonas();
      } else {
        setLoading(false);
        setUserPersonas([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle persona click
  const handlePersonaClick = (personaId: string) => {
    console.log("Clicked persona:", personaId);
    // Find the full persona data
    const persona = personasData.find((p) => p.id === personaId);
    if (persona) {
      setSelectedPersona({
        id: persona.id,
        name: persona.name,
        description: persona.description,
        platform: persona.platform,
        username: persona.username,
        analysis: (persona as any).analysis,
        tags: (persona as any).tags,
        status: (persona as any).status,
        createdAt: persona.createdAt,
        updatedAt: persona.updatedAt,
        usageCount: persona.usageCount,
        lastUsedAt: persona.lastUsedAt ?? undefined,
        voiceStyle: persona.voiceStyle,
        distinctiveness: persona.distinctiveness,
        complexity: persona.complexity,
        hasHookSystem: (persona as any).hasHookSystem,
        hasScriptRules: (persona as any).hasScriptRules,
        signatureMoveCount: (persona as any).signatureMoveCount,
      });
    }
  };

  // Handle add new persona - show slide-down form
  const handleAddPersona = () => {
    setShowCreateForm(!showCreateForm);
    setAnalysisError("");
    if (!showCreateForm) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  };

  // Extract username from various TikTok URL formats
  const extractUsername = (input: string): string => {
    const trimmed = input.trim();

    // If it's already just a username (no URL), return as is
    if (!trimmed.includes("/") && !trimmed.includes(".")) {
      return trimmed.replace("@", ""); // Remove @ if present
    }

    try {
      const url = new URL(trimmed);
      const pathSegments = url.pathname.split("/").filter(Boolean);

      // Look for username in path (starts with @)
      for (const segment of pathSegments) {
        if (segment.startsWith("@")) {
          return segment.substring(1); // Remove @ prefix
        }
      }

      return "";
    } catch {
      // Not a valid URL, treat as plain username
      return trimmed.replace("@", "");
    }
  };

  // Run complete analysis workflow
  const runCompleteAnalysis = async () => {
    const rawInput = personaUsername.trim();
    if (!rawInput) {
      setAnalysisError("Please enter a username or TikTok URL");
      return;
    }

    const cleanUsername = extractUsername(rawInput);
    if (!cleanUsername) {
      setAnalysisError(
        "Could not extract username from the provided input. Please enter a valid TikTok username or profile URL.",
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError("");
    setAnalysisProgress({ step: "Fetching user feed", current: 1, total: 4 });

    try {
      // Get Firebase Auth token
      if (!auth.currentUser) {
        throw new Error("Please sign in to create personas");
      }
      const token = await auth.currentUser.getIdToken();

      // Step 1: Fetch user feed
      setAnalysisProgress({ step: "Fetching videos from TikTok", current: 1, total: 4 });
      const feedResponse = await fetch("/api/tiktok/user-feed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: cleanUsername,
          count: 20,
        }),
      });

      const feedData = await feedResponse.json();
      if (!feedData.success || !feedData.videos || feedData.videos.length === 0) {
        throw new Error(feedData.error ?? "No videos found for this user");
      }

      // Step 2: Transcribe videos
      setAnalysisProgress({ step: "Transcribing videos (this may take a minute)", current: 2, total: 4 });
      const videoUrls = feedData.videos
        .slice(0, 10) // Limit to 10 videos
        .map((video: any) => video.playUrl ?? video.downloadUrl)
        .filter(Boolean);

      const transcriptResults = [];
      for (let i = 0; i < videoUrls.length; i++) {
        try {
          const transcriptResponse = await fetch("/api/video/transcribe-from-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ videoUrl: videoUrls[i] }),
          });

          const transcriptData = await transcriptResponse.json();
          if (transcriptData.success && transcriptData.transcript) {
            transcriptResults.push(transcriptData.transcript);
          }

          // Stop after 10 successful transcriptions
          if (transcriptResults.length >= 10) break;
        } catch (error) {
          console.error(`Failed to transcribe video ${i + 1}:`, error);
        }
      }

      if (transcriptResults.length < 3) {
        throw new Error("Not enough videos could be transcribed. Please try another creator.");
      }

      // Step 3: Analyze voice patterns
      setAnalysisProgress({ step: "Analyzing voice patterns and style", current: 3, total: 4 });
      const analysisResponse = await fetch("/api/voice/analyze-patterns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcripts: transcriptResults }),
      });

      if (!analysisResponse.ok) {
        throw new Error("Failed to analyze voice patterns");
      }

      const voiceAnalysis = await analysisResponse.json();

      // Step 4: Create persona with metadata
      setAnalysisProgress({ step: "Creating persona profile", current: 4, total: 4 });

      // Generate metadata
      const metadataResponse = await fetch("/api/personas/generate-metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ voiceAnalysis }),
      });

      let personaName = "";
      let personaDescription = "";
      let personaTags: string[] = [];

      if (metadataResponse.ok) {
        const metadataData = await metadataResponse.json();
        if (metadataData.success) {
          personaName = metadataData.title;
          personaDescription = metadataData.description;
          personaTags = metadataData.suggestedTags;
        }
      }

      // Create the persona
      const createResponse = await fetch("/api/personas/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: personaName ?? `${cleanUsername} Voice`,
          description: personaDescription ?? `Voice persona based on @${cleanUsername}'s content style`,
          platform: "tiktok",
          username: cleanUsername,
          analysis: voiceAnalysis,
          tags: personaTags,
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || "Failed to create persona");
      }

      await createResponse.json();

      // Success! Refresh the personas list
      setShowCreateForm(false);
      setPersonaUsername("");

      // Reload personas to show the new one
      await loadPersonas();
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalysisError(error instanceof Error ? error.message : "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(null);
    }
  };

  // Load personas from Firestore
  const loadPersonas = async () => {
    try {
      setLoading(true);

      // Get Firebase Auth token
      if (!auth.currentUser) {
        console.log("No authenticated user, skipping personas load");
        setLoading(false);
        setUserPersonas([]);
        return;
      }

      const token = await auth.currentUser.getIdToken();

      // Fetch personas from API
      const response = await fetch("/api/personas/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      // Handle successful response even if no personas exist
      if (response.ok && data.success) {
        // Store the full personas data for the slideout
        setPersonasData(data.personas || []);

        // Convert Firestore personas to CreatorPersona format
        const convertedPersonas: CreatorPersona[] = (data.personas || []).map((p: FirestorePersona) => {
          // Generate initials from name
          const initials = p.name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          return {
            id: p.id,
            name: p.name,
            initials,
            followers: p.username ? `@${p.username}` : (p.platform ?? "TikTok"),
            lastEdited: p.lastUsedAt
              ? `Used ${getRelativeTime(p.lastUsedAt)}`
              : `Created ${getRelativeTime(p.createdAt)}`,
            avatarVariant: "light" as const,
          };
        });

        setUserPersonas(convertedPersonas);
      } else {
        // If API call fails, set empty array instead of showing error
        // This allows users to still see the UI and create their first persona
        console.warn("Could not fetch personas, showing empty state:", data.error);
        setUserPersonas([]);
      }
    } catch (err) {
      // Even on network errors, show empty state instead of error
      console.error("Error loading personas:", err);
      setUserPersonas([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter personas based on filter value
  const filteredPersonas = userPersonas.filter((persona) => {
    if (filterValue === "all") return true;
    if (filterValue === "recent") {
      return (
        persona.lastEdited.includes("day") ||
        persona.lastEdited.includes("hour") ||
        persona.lastEdited.includes("min") ||
        persona.lastEdited.includes("just now")
      );
    }
    if (filterValue === "used") {
      return persona.lastEdited.includes("Used");
    }
    return true;
  });

  return (
    <>
      {/* Main content wrapper that will be adjusted when slideout opens */}
      <div className="min-h-screen transition-all duration-300" id="personas-main-content">
        <div className="container mx-auto p-6">
          {/* Header Section */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Your Personas</h1>
              <p className="mt-1 text-neutral-600">Voice profiles created from creator analysis</p>
            </div>
            <div className="flex gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterValue("all")}>All Personas</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterValue("recent")}>Recently Created</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterValue("used")}>Recently Used</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={handleAddPersona} variant="soft" className="gap-2">
                {showCreateForm ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide Form
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create New Persona
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Slide-down Create Form */}
          <div
            ref={formRef}
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              showCreateForm ? "mb-6 max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="border-primary-200 from-primary-50 to-brand-50 rounded-[var(--radius-card)] border-2 bg-gradient-to-br p-6 shadow-[var(--shadow-soft-drop)]">
              <div className="mb-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
                  <Sparkles className="text-primary-600 h-5 w-5" />
                  Create Voice Persona from TikTok
                </h3>
                <p className="mt-1 text-sm text-neutral-600">
                  Analyze a creator's voice patterns to generate scripts in their style
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="persona-username" className="mb-2 block text-sm font-medium text-neutral-700">
                    TikTok Username or Profile URL
                  </label>
                  <input
                    id="persona-username"
                    type="text"
                    value={personaUsername}
                    onChange={(e) => setPersonaUsername(e.target.value)}
                    placeholder="Enter @username or TikTok profile URL"
                    className="focus:border-primary-400 focus:ring-primary-400 w-full rounded-[var(--radius-button)] border border-neutral-200 bg-white px-3 py-2 transition-colors focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-100"
                    disabled={isAnalyzing}
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    We&apos;ll analyze their recent videos to capture their unique voice and style
                  </p>
                </div>

                {/* Progress indicator */}
                {isAnalyzing && analysisProgress && (
                  <div className="border-primary-200 bg-primary-50 rounded-[var(--radius-button)] border p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Loader2 className="text-primary-600 h-4 w-4 animate-spin" />
                      <span className="text-primary-700 text-sm font-medium">{analysisProgress.step}</span>
                    </div>
                    <div className="bg-primary-200 h-2 w-full rounded-full">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(analysisProgress.current / analysisProgress.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-primary-600 mt-2 text-xs">
                      Step {analysisProgress.current} of {analysisProgress.total} • This may take about a minute
                    </p>
                  </div>
                )}

                {/* Error display */}
                {analysisError && (
                  <div className="border-destructive-200 bg-destructive-50 rounded-[var(--radius-button)] border p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="text-destructive-600 mt-0.5 h-4 w-4" />
                      <p className="text-destructive-700 text-sm">{analysisError}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={runCompleteAnalysis}
                    disabled={isAnalyzing || !personaUsername.trim()}
                    className="bg-primary-600 hover:bg-primary-700 flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-button)] px-4 py-2.5 text-white transition-all duration-200 disabled:cursor-not-allowed disabled:bg-neutral-300"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing Creator...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Analyze & Create Persona
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setPersonaUsername("");
                      setAnalysisError("");
                    }}
                    disabled={isAnalyzing}
                    className="rounded-[var(--radius-button)] bg-neutral-100 px-4 py-2.5 text-neutral-700 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
              </div>
            ) : filteredPersonas.length === 0 ? (
              <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-12 text-center">
                <User className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
                <h3 className="mb-2 text-lg font-medium text-neutral-900">
                  {userPersonas.length === 0 ? "No personas yet" : "No personas match your filter"}
                </h3>
                <p className="mb-6 text-neutral-600">
                  {userPersonas.length === 0
                    ? "Create your first persona by analyzing a creator's voice patterns"
                    : "Try adjusting your filter settings"}
                </p>
                <Button onClick={handleAddPersona} variant="soft" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Persona
                </Button>
              </div>
            ) : (
              <CreatorPersonaGrid
                personas={filteredPersonas}
                onPersonaClick={handlePersonaClick}
                onAddClick={handleAddPersona}
              />
            )}
          </div>
        </div>
      </div>

      {/* Persona Details Slideout */}
      <UnifiedSlideout
        isOpen={!!selectedPersona}
        onClose={() => setSelectedPersona(null)}
        config={{
          ...ClaudeArtifactConfig,
          showHeader: false,
          showCloseButton: false,
          adjustsContent: true,
          backdrop: false,
          modal: false,
          width: "lg",
        }}
      >
        <PersonaDetailsPanel
          persona={selectedPersona}
          onClose={() => setSelectedPersona(null)}
          onCopy={(content, type) => {
            console.log(`Copied ${type}:`, content);
          }}
        />
      </UnifiedSlideout>
    </>
  );
}
