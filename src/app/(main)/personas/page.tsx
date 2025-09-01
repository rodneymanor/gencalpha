"use client";

import React, { useState, useEffect } from "react";

import { onAuthStateChanged } from "firebase/auth";
import { Plus, Filter, User } from "lucide-react";

import { SkeletonPersonaGrid, SkeletonPageHeader } from "@/components/ui/skeleton";

import { CreatorPersonaGrid, type CreatorPersona } from "@/components/creator-personas/creator-persona-card";
import { PersonaDetailsContent, type PersonaDetails } from "@/components/persona-details-panel/persona-details-content";
import { PersonaCreateContent } from "@/components/persona-details-panel/persona-create-content";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotionPanelWrapper from "@/components/panels/notion/NotionPanelWrapper";
import { type TabData, type CustomTabLabels } from "@/components/panels/notion/NotionPanel";
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

// Helper function to prepare tab data for NotionPanel
const getTabData = (persona: PersonaDetails | null): TabData => {
  if (!persona) return {};

  const tabs: TabData = {};

  // Overview tab - always available
  tabs.video = <PersonaDetailsContent persona={persona} activeTab="overview" />;

  // Voice Profile tab
  if (persona.analysis?.voiceProfile) {
    tabs.transcript = <PersonaDetailsContent persona={persona} activeTab="voice" />;
  }

  // Hooks tab
  if (persona.analysis?.hookReplicationSystem || persona.analysis?.allHooksExtracted) {
    tabs.components = <PersonaDetailsContent persona={persona} activeTab="hooks" />;
  }

  // Patterns tab
  if (persona.analysis?.linguisticFingerprint) {
    tabs.metadata = <PersonaDetailsContent persona={persona} activeTab="patterns" />;
  }

  // Script Rules tab
  if (persona.analysis?.scriptGenerationRules) {
    tabs.suggestions = <PersonaDetailsContent persona={persona} activeTab="rules" />;
  }

  // Usage tab - always available
  tabs.analysis = <PersonaDetailsContent persona={persona} activeTab="usage" />;

  return tabs;
};

export default function PersonasPage() {
  const [filterValue, setFilterValue] = useState("all");
  const [userPersonas, setUserPersonas] = useState<CreatorPersona[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState<PersonaDetails | null>(null);
  const [personasData, setPersonasData] = useState<FirestorePersona[]>([]);

  // Persona creation state
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<{
    step: string;
    current: number;
    total: number;
  } | null>(null);
  const [analysisError, setAnalysisError] = useState<string>("");

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

  // Handle add new persona - show NotionPanel
  const handleAddPersona = () => {
    setShowCreatePanel(true);
    setAnalysisError("");
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
  const runCompleteAnalysis = async (input: string | string[], mode: 'profile' | 'videos') => {
    // Handle profile mode
    if (mode === 'profile') {
      const rawInput = typeof input === 'string' ? input : input[0];
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
        throw new Error(errorData.error ?? "Failed to create persona");
      }

      await createResponse.json();

      // Success! Refresh the personas list
      setShowCreatePanel(false);

      // Reload personas to show the new one
      await loadPersonas();
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalysisError(error instanceof Error ? error.message : "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(null);
    }
    }

    // Handle videos mode
    if (mode === 'videos') {
      const videoUrls = Array.isArray(input) ? input : [input];
      const validUrls = videoUrls.filter(url => url && url.trim());
      
      if (validUrls.length === 0) {
        setAnalysisError("Please provide at least one video URL");
        return;
      }

      setIsAnalyzing(true);
      setAnalysisError("");
      setAnalysisProgress({ step: "Processing video URLs", current: 1, total: 5 });

      try {
        // Get Firebase Auth token
        if (!auth.currentUser) {
          throw new Error("Please sign in to create personas");
        }
        const token = await auth.currentUser.getIdToken();

        // Step 1: Add videos to queue for processing
        setAnalysisProgress({ step: "Adding videos to processing queue", current: 1, total: 5 });
        
        const jobIds = [];
        for (let i = 0; i < validUrls.length; i++) {
          try {
            const queueResponse = await fetch("/api/video/add-to-queue", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                videoUrl: validUrls[i],
                userId: auth.currentUser.uid
              }),
            });

            const queueData = await queueResponse.json();
            if (queueData.success && queueData.job) {
              jobIds.push(queueData.job.id);
            }
          } catch (error) {
            console.error(`Failed to queue video ${i + 1}:`, error);
          }
        }

        if (jobIds.length === 0) {
          throw new Error("Could not process any videos. Please check the URLs and try again.");
        }

        // Step 2: Wait for videos to be processed and get CDN links
        setAnalysisProgress({ step: "Fetching video data from social platforms", current: 2, total: 5 });
        
        // Poll for job completion
        const processedVideos = [];
        const maxAttempts = 60; // 60 seconds timeout
        for (const jobId of jobIds) {
          let attempts = 0;
          let jobComplete = false;
          
          while (attempts < maxAttempts && !jobComplete) {
            const statusResponse = await fetch(`/api/video/processing-status?jobId=${jobId}`);
            const statusData = await statusResponse.json();
            
            if (statusData.job?.status === 'completed' && statusData.job?.result) {
              processedVideos.push(statusData.job.result);
              jobComplete = true;
            } else if (statusData.job?.status === 'failed') {
              console.error(`Job ${jobId} failed:`, statusData.job.error);
              jobComplete = true;
            } else {
              // Wait 1 second before checking again
              await new Promise(resolve => setTimeout(resolve, 1000));
              attempts++;
            }
          }
        }

        if (processedVideos.length === 0) {
          throw new Error("Could not process any videos. Please try again.");
        }

        // Step 3: Upload to Bunny.net and get transcriptions
        setAnalysisProgress({ step: "Uploading videos for transcription", current: 3, total: 5 });
        
        const transcriptResults = [];
        for (const video of processedVideos) {
          try {
            // Get the CDN URL from the processed video data
            const cdnUrl = video.data?.playUrl || video.data?.downloadUrl;
            if (!cdnUrl) continue;

            // Upload to Bunny and transcribe
            const transcriptResponse = await fetch("/api/video/transcribe-from-url", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ videoUrl: cdnUrl }),
            });

            const transcriptData = await transcriptResponse.json();
            if (transcriptData.success && transcriptData.transcript) {
              transcriptResults.push(transcriptData.transcript);
            }
          } catch (error) {
            console.error(`Failed to transcribe video:`, error);
          }
        }

        if (transcriptResults.length < 1) {
          throw new Error("Could not transcribe any videos. Please check the URLs and try again.");
        }

        // Step 4: Analyze voice patterns
        setAnalysisProgress({ step: "Analyzing voice patterns and style", current: 4, total: 5 });
        const analysisResponse = await fetch("/api/voice/analyze-patterns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcripts: transcriptResults }),
        });

        if (!analysisResponse.ok) {
          throw new Error("Failed to analyze voice patterns");
        }

        const voiceAnalysis = await analysisResponse.json();

        // Step 5: Create persona with metadata
        setAnalysisProgress({ step: "Creating persona profile", current: 5, total: 5 });

        // Generate metadata
        const metadataResponse = await fetch("/api/personas/generate-metadata", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ voiceAnalysis }),
        });

        let personaName = "Custom Voice";
        let personaDescription = "Voice persona created from selected videos";
        let personaTags: string[] = [];

        if (metadataResponse.ok) {
          const metadataData = await metadataResponse.json();
          if (metadataData.success) {
            personaName = metadataData.title || "Custom Voice";
            personaDescription = metadataData.description || "Voice persona created from selected videos";
            personaTags = metadataData.suggestedTags || [];
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
            name: personaName,
            description: personaDescription,
            platform: "custom",
            username: "Custom Collection",
            analysis: voiceAnalysis,
            tags: personaTags,
          }),
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          throw new Error(errorData.error ?? "Failed to create persona");
        }

        await createResponse.json();

        // Success! Close panel and refresh
        setShowCreatePanel(false);
        await loadPersonas();
      } catch (error) {
        console.error("Analysis error:", error);
        setAnalysisError(error instanceof Error ? error.message : "Analysis failed. Please try again.");
      } finally {
        setIsAnalyzing(false);
        setAnalysisProgress(null);
      }
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
        setPersonasData(data.personas ?? []);

        // Convert Firestore personas to CreatorPersona format
        const convertedPersonas: CreatorPersona[] = (data.personas ?? []).map((p: FirestorePersona) => {
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
                <Plus className="h-4 w-4" />
                Create New Persona
              </Button>
            </div>
          </div>


          {/* Content Section */}
          <div className="mt-6">
            {loading ? (
              <SkeletonPersonaGrid count={6} />
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

      {/* Persona Details Panel using NotionPanelWrapper */}
      <NotionPanelWrapper
        isOpen={!!selectedPersona}
        onClose={() => {
          setSelectedPersona(null);
        }}
        title={selectedPersona?.name || ''}
        showPageControls={false}
        showHeaderControls={true}
        width={600}
        isNewIdea={false}
        onCopy={() => {
          if (selectedPersona) {
            const dataStr = JSON.stringify(selectedPersona.analysis, null, 2);
            navigator.clipboard.writeText(dataStr);
            console.log('Copied persona analysis');
          }
        }}
        onDownload={() => {
          if (selectedPersona) {
            const dataStr = JSON.stringify(selectedPersona, null, 2);
            const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
            const exportFileDefaultName = `persona-${selectedPersona.name.toLowerCase().replace(/\s+/g, "-")}.json`;
            
            const linkElement = document.createElement("a");
            linkElement.setAttribute("href", dataUri);
            linkElement.setAttribute("download", exportFileDefaultName);
            linkElement.click();
            console.log('Downloaded persona data');
          }
        }}
        tabData={getTabData(selectedPersona)}
        defaultTab={'video'}
        customTabLabels={{
          video: 'Overview',
          transcript: 'Voice',
          components: 'Hooks',
          metadata: 'Patterns',
          suggestions: 'Rules',
          analysis: 'Usage'
        } as CustomTabLabels}
        footer={
          selectedPersona && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-600">Inspired by</span>
                <span className="text-sm font-medium text-neutral-900">
                  @{selectedPersona.username || 'Unknown Creator'}
                </span>
              </div>
              <div className="text-xs text-neutral-500">
                {selectedPersona.platform || 'TikTok'} • {selectedPersona.usageCount || 0} uses
              </div>
            </div>
          )
        }
      >
        {/* Content is now handled by tabData */}
      </NotionPanelWrapper>

      {/* Create Persona Panel */}
      <NotionPanelWrapper
        isOpen={showCreatePanel}
        onClose={() => {
          setShowCreatePanel(false);
          setAnalysisError("");
          setIsAnalyzing(false);
          setAnalysisProgress(null);
        }}
        title="Create Voice Persona"
        showPageControls={false}
        showHeaderControls={true}
        width={600}
        isNewIdea={false}
        tabData={{
          video: (
            <PersonaCreateContent
              activeTab="profile"
              onAnalyze={runCompleteAnalysis}
              isAnalyzing={isAnalyzing}
              analysisProgress={analysisProgress}
              analysisError={analysisError}
            />
          ),
          transcript: (
            <PersonaCreateContent
              activeTab="videos"
              onAnalyze={runCompleteAnalysis}
              isAnalyzing={isAnalyzing}
              analysisProgress={analysisProgress}
              analysisError={analysisError}
            />
          ),
        }}
        defaultTab={'video'}
        customTabLabels={{
          video: 'From Profile',
          transcript: 'From Videos',
        } as CustomTabLabels}
      >
        {/* Content is handled by tabData */}
      </NotionPanelWrapper>
    </>
  );
}
