"use client";

import { useState } from "react";

import { Copy, ExternalLink, Loader2, User, FileText, Download, Code, Plus, UserPlus } from "lucide-react";

interface TikTokVideo {
  id: string;
  description: string;
  playUrl: string;
  downloadUrl: string;
  cover: string;
  createTime: number;
  duration: number;
  stats: {
    diggCount: number;
    shareCount: number;
    commentCount: number;
    playCount: number;
  };
}

interface TikTokUserInfo {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  verified: boolean;
  stats: {
    videoCount: number;
    followerCount: number;
    followingCount: number;
  };
}

interface ApiResponse {
  success: boolean;
  userInfo?: TikTokUserInfo;
  videos?: TikTokVideo[];
  metadata?: {
    totalVideos: number;
    fetchedAt: string;
  };
  error?: string;
  details?: string;
}

interface TranscriptResult {
  url: string;
  transcript: string;
  error?: string;
}

interface VoiceAnalysis {
  voiceProfile: {
    distinctiveness: string;
    complexity: string;
    primaryStyle: string;
  };
  linguisticFingerprint: {
    avgSentenceLength: number;
    vocabularyTier: {
      simple: number;
      moderate: number;
      advanced: number;
    };
    topUniqueWords: string[];
    avoidedWords: string[];
    grammarQuirks: string[];
  };
  allHooksExtracted?: Array<{
    scriptNumber: number;
    originalHook: string;
    universalTemplate: string;
    type: string;
    trigger: string;
  }>;
  hookReplicationSystem?: {
    primaryHookType: string;
    hookTemplates: Array<{
      template: string;
      type: string;
      frequency: number;
      effectiveness: string;
      emotionalTrigger: string;
      realExamples: string[];
      newExamples: string[];
    }>;
    hookProgression: {
      structure: string;
      avgWordCount: number;
      timing: string;
      examples: string[];
    };
    hookRules: string[];
  };
  openingFormulas: Array<{
    pattern: string;
    frequency: number;
    emotionalTrigger: string;
    examples: string[];
  }>;
  transitionPhrases: {
    conceptBridges: string[];
    enumeration: string[];
    topicPivots: string[];
    softeners: string[];
  };
  rhetoricalDevices: Array<{
    device: string;
    pattern: string;
    examples: string[];
  }>;
  microPatterns: {
    fillers: string[];
    emphasisWords: string[];
    numberPatterns: string;
    timeReferences: string[];
  };
  persuasionFramework: {
    painPoints: string[];
    solutions: string[];
    credibility: string[];
    urgency: string[];
  };
  contentTemplates: Array<{
    type: string;
    structure: string;
    avgLength: string;
    examples: string[];
  }>;
  signatureMoves: Array<{
    move: string;
    description: string;
    frequency: string;
    placement: string;
    verbatim: string[];
  }>;
  scriptGenerationRules?: {
    mustInclude: string[];
    neverInclude: string[];
    optimalStructure: {
      hookSection: string;
      bodySection: string;
      closeSection: string;
    };
    formulaForNewScript: string;
    universalFormula?: string;
    detailedScriptFormula?: {
      [key: string]: string; // step1, step2, ... step14
    };
  };
}

export default function TikTokUserFeedTestPage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string>("");

  // Transcript scraper state
  const [transcriptUrls, setTranscriptUrls] = useState("");
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [transcriptResults, setTranscriptResults] = useState<TranscriptResult[]>([]);
  const [transcriptError, setTranscriptError] = useState("");
  const [currentProcessing, setCurrentProcessing] = useState({ current: 0, total: 0 });

  // Voice analysis state
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VoiceAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState("");
  const [manualTranscripts, setManualTranscripts] = useState("");

  // Persona creation state
  const [showPersonaForm, setShowPersonaForm] = useState(false);
  const [personaLoading, setPersonaLoading] = useState(false);
  const [personaSuccess, setPersonaSuccess] = useState("");
  const [personaError, setPersonaError] = useState("");
  const [personaForm, setPersonaForm] = useState({
    name: "",
    description: "",
    platform: "tiktok",
    username: "",
    tags: "",
  });
  const [generatedMetadata, setGeneratedMetadata] = useState<{
    title: string;
    description: string;
    suggestedTags: string[];
  } | null>(null);
  const [metadataLoading, setMetadataLoading] = useState(false);

  // Function to extract username from various TikTok URL formats
  const extractUsername = (input: string): string => {
    const trimmed = input.trim();

    // If it's already just a username (no URL), return as is
    if (!trimmed.includes("/") && !trimmed.includes(".")) {
      return trimmed.replace("@", ""); // Remove @ if present
    }

    try {
      // Handle various TikTok URL formats
      const url = new URL(trimmed);

      // Extract from different TikTok URL patterns:
      // https://www.tiktok.com/@username
      // https://tiktok.com/@username
      // https://www.tiktok.com/@username/video/123456789
      // https://vm.tiktok.com/shortcode/ (redirects, but we can't handle here)

      const pathSegments = url.pathname.split("/").filter(Boolean);

      // Look for username in path (starts with @)
      for (const segment of pathSegments) {
        if (segment.startsWith("@")) {
          return segment.substring(1); // Remove @ prefix
        }
      }

      // If no @username found, try to extract from subdomain or other patterns
      if (url.hostname.includes("tiktok.com")) {
        // For URLs like https://www.tiktok.com/discover or other patterns
        // Return empty string to trigger error
        return "";
      }
    } catch (e) {
      // Not a valid URL, treat as plain username
      return trimmed.replace("@", "");
    }

    return trimmed.replace("@", "");
  };

  // Function to fetch user feed data from API
  const fetchUserFeed = async () => {
    const rawInput = username.trim();
    if (!rawInput) {
      setError("Please enter a username or TikTok URL");
      return;
    }

    // Extract clean username from input
    const cleanUsername = extractUsername(rawInput);
    if (!cleanUsername) {
      setError(
        "Could not extract username from the provided input. Please enter a valid TikTok username or profile URL.",
      );
      return;
    }

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await fetch("/api/tiktok/user-feed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: cleanUsername,
          count: 20,
        }),
      });

      const data: ApiResponse = await res.json();
      setResponse(data);

      if (!data.success) {
        setError(data.error || "Failed to fetch user feed");
      }
    } catch (err) {
      setError("Network error occurred while fetching data");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Automated workflow: Username → Feed → Transcribe → Analyze
  const runAutomatedWorkflow = async () => {
    const rawInput = username.trim();
    if (!rawInput) {
      setError("Please enter a username or TikTok URL");
      return;
    }

    // Extract clean username from input
    const cleanUsername = extractUsername(rawInput);
    if (!cleanUsername) {
      setError(
        "Could not extract username from the provided input. Please enter a valid TikTok username or profile URL.",
      );
      return;
    }

    console.log("🚀 Starting automated workflow for:", cleanUsername);

    // Reset all states
    setLoading(true);
    setError("");
    setResponse(null);
    setTranscriptResults([]);
    setAnalysisResult(null);
    setTranscriptError("");
    setAnalysisError("");

    try {
      // Step 1: Fetch user feed
      console.log("📊 Step 1/4: Fetching user feed...");
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

      const feedData: ApiResponse = await feedResponse.json();
      setResponse(feedData);

      if (!feedData.success || !feedData.videos || feedData.videos.length === 0) {
        throw new Error(feedData.error || "No videos found in user feed");
      }

      console.log(`✅ Found ${feedData.videos.length} videos`);

      // Step 2: Transcribe videos (limit to 10 successful)
      console.log("🎯 Step 2/4: Transcribing videos (max 10)...");
      setTranscriptLoading(true);
      
      const videoUrls = feedData.videos
        .map((video) => video.playUrl || video.downloadUrl)
        .filter(Boolean);

      const transcriptResults: TranscriptResult[] = [];
      let successfulCount = 0;
      const maxSuccessful = 10;

      setCurrentProcessing({ current: 0, total: Math.min(videoUrls.length, maxSuccessful) });

      for (let i = 0; i < videoUrls.length && successfulCount < maxSuccessful; i++) {
        const videoUrl = videoUrls[i];
        setCurrentProcessing({ current: successfulCount + 1, total: maxSuccessful });

        try {
          console.log(`📹 Transcribing video ${i + 1}: ${videoUrl.substring(0, 50)}...`);
          
          const transcriptResponse = await fetch("/api/video/transcribe-from-url", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ videoUrl }),
          });

          const transcriptData = await transcriptResponse.json();

          if (transcriptData.success && transcriptData.transcript) {
            const result: TranscriptResult = {
              url: videoUrl,
              transcript: transcriptData.transcript,
            };
            transcriptResults.push(result);
            setTranscriptResults([...transcriptResults]);
            successfulCount++;
            console.log(`✅ Transcription ${successfulCount}/${maxSuccessful} complete`);
          } else {
            console.warn(`⚠️ Failed to transcribe video ${i + 1}:`, transcriptData.error);
          }
        } catch (error) {
          console.error(`❌ Error transcribing video ${i + 1}:`, error);
        }

        // Add delay between requests (except after the last one)
        if (successfulCount < maxSuccessful && i < videoUrls.length - 1) {
          console.log("⏳ Waiting 2 seconds before next transcription...");
          await delay(2000);
        }
      }

      setTranscriptLoading(false);
      setCurrentProcessing({ current: 0, total: 0 });

      if (transcriptResults.length < 3) {
        throw new Error(`Only ${transcriptResults.length} transcriptions succeeded. Need at least 3 for analysis.`);
      }

      console.log(`✅ Successfully transcribed ${transcriptResults.length} videos`);

      // Step 3: Analyze voice patterns
      console.log("🧠 Step 3/4: Analyzing voice patterns...");
      setAnalysisLoading(true);

      const validTranscripts = transcriptResults.map((result) => result.transcript);

      const analysisResponse = await fetch("/api/voice/analyze-patterns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcripts: validTranscripts }),
      });

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json();
        throw new Error(errorData.error || "Failed to analyze voice patterns");
      }

      const analysis = await analysisResponse.json();
      setAnalysisResult(analysis);
      setAnalysisLoading(false);

      console.log("✅ Voice analysis complete!");
      console.log("📊 Analysis summary:", {
        hooksExtracted: analysis.allHooksExtracted?.length || 0,
        scriptFormula: analysis.scriptGenerationRules?.detailedScriptFormula ? "Generated" : "Missing",
      });

      // Step 4: Generate persona title and description
      console.log("✨ Step 4/4: Generating persona title and description...");
      setMetadataLoading(true);

      try {
        const metadataResponse = await fetch("/api/personas/generate-metadata", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "test-internal-secret-123", // Use test API key for internal request
          },
          body: JSON.stringify({ voiceAnalysis: analysis }),
        });

        if (metadataResponse.ok) {
          const metadataData = await metadataResponse.json();
          if (metadataData.success) {
            setGeneratedMetadata({
              title: metadataData.title,
              description: metadataData.description,
              suggestedTags: metadataData.suggestedTags,
            });
            
            // Pre-fill persona form with generated data
            setPersonaForm(prev => ({
              ...prev,
              name: metadataData.title,
              description: metadataData.description,
              tags: metadataData.suggestedTags.join(", "),
              username: cleanUsername,
            }));
            
            console.log("✅ Persona metadata generated successfully!");
            console.log(`  Title: ${metadataData.title}`);
            console.log(`  Tags: ${metadataData.suggestedTags.join(", ")}`);
          }
        }
      } catch (metadataError) {
        console.error("⚠️ Failed to generate metadata:", metadataError);
        // Don't throw - this is optional enhancement
      } finally {
        setMetadataLoading(false);
      }

      // Auto-show persona form if analysis succeeded
      if (analysis) {
        setShowPersonaForm(true);
      }

    } catch (error) {
      console.error("❌ Workflow error:", error);
      setError(error instanceof Error ? error.message : "Workflow failed");
      setTranscriptLoading(false);
      setAnalysisLoading(false);
    } finally {
      setLoading(false);
      setCurrentProcessing({ current: 0, total: 0 });
    }
  };

  // Function to copy URL to clipboard
  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      // Simple feedback - could be enhanced with toast notification
      console.log("URL copied to clipboard");
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const downloadAnalysis = (format: "json" | "text") => {
    if (!analysisResult) return;

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === "json") {
      content = JSON.stringify(analysisResult, null, 2);
      filename = `voice-analysis-${Date.now()}.json`;
      mimeType = "application/json";
    } else {
      // Format as readable text
      content = formatAnalysisAsText(analysisResult);
      filename = `voice-analysis-${Date.now()}.txt`;
      mimeType = "text/plain";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatAnalysisAsText = (analysis: VoiceAnalysis): string => {
    let text = "=== VOICE PATTERN ANALYSIS ===\n\n";

    // Voice Profile
    text += "## VOICE PROFILE\n";
    text += `Distinctiveness: ${analysis.voiceProfile.distinctiveness}/10\n`;
    text += `Complexity: ${analysis.voiceProfile.complexity}\n`;
    text += `Primary Style: ${analysis.voiceProfile.primaryStyle}\n\n`;

    // Hook Replication System
    if (analysis.hookReplicationSystem) {
      text += "## HOOK REPLICATION SYSTEM\n";
      text += `Primary Hook Type: ${analysis.hookReplicationSystem.primaryHookType}\n\n`;

      text += "Hook Templates:\n";
      analysis.hookReplicationSystem.hookTemplates.forEach((template, i) => {
        text += `\n${i + 1}. ${template.type.toUpperCase()} (${template.effectiveness} effectiveness)\n`;
        text += `   Template: ${template.template}\n`;
        text += `   Example: ${template.realExamples[0]}\n`;
      });

      text += "\nHook Rules:\n";
      analysis.hookReplicationSystem.hookRules.forEach((rule) => {
        text += `• ${rule}\n`;
      });
      text += "\n";
    }

    // Linguistic Fingerprint
    text += "## LINGUISTIC FINGERPRINT\n";
    text += `Average Sentence Length: ${analysis.linguisticFingerprint.avgSentenceLength} words\n`;
    text += `Vocabulary Distribution: Simple ${analysis.linguisticFingerprint.vocabularyTier.simple}%, Moderate ${analysis.linguisticFingerprint.vocabularyTier.moderate}%, Advanced ${analysis.linguisticFingerprint.vocabularyTier.advanced}%\n`;
    text += `Top Unique Words: ${analysis.linguisticFingerprint.topUniqueWords.join(", ")}\n\n`;

    // Script Generation Rules
    if (analysis.scriptGenerationRules) {
      text += "## SCRIPT GENERATION FORMULA\n";
      text += "\nMust Include:\n";
      analysis.scriptGenerationRules.mustInclude.forEach((item) => {
        text += `✓ ${item}\n`;
      });
      text += "\nNever Include:\n";
      analysis.scriptGenerationRules.neverInclude.forEach((item) => {
        text += `✗ ${item}\n`;
      });
      text += `\nFormula: ${analysis.scriptGenerationRules.formulaForNewScript}\n`;
    }

    return text;
  };

  // Format number for display (e.g. 1000000 -> 1M)
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  // Delay utility function
  const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  // Extract individual video URLs from the user feed results
  const extractVideoUrls = (): string[] => {
    if (!response?.videos) return [];
    return response.videos.map((video) => video.playUrl || video.downloadUrl).filter(Boolean);
  };

  // Process transcripts for video URLs from the user feed
  const processTranscripts = async () => {
    // First, check if we have video URLs from the user feed
    const videoUrls = extractVideoUrls();

    // If no videos from user feed, try to parse manual input
    let urlsToProcess: string[] = [];

    if (videoUrls.length > 0) {
      urlsToProcess = videoUrls;
      console.log(`Using ${videoUrls.length} video URLs from the user feed`);
    } else {
      // Parse manual input as fallback
      urlsToProcess = transcriptUrls
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (urlsToProcess.length === 0) {
        setTranscriptError("Please fetch user videos first, or enter video URLs manually");
        return;
      }
    }

    console.log(`Processing ${urlsToProcess.length} video URLs for transcription`);

    setTranscriptLoading(true);
    setTranscriptError("");
    setTranscriptResults([]);
    setCurrentProcessing({ current: 0, total: urlsToProcess.length });

    const results: TranscriptResult[] = [];

    for (let i = 0; i < urlsToProcess.length; i++) {
      const videoUrl = urlsToProcess[i];
      setCurrentProcessing({ current: i + 1, total: urlsToProcess.length });

      try {
        console.log(`Processing video ${i + 1}/${urlsToProcess.length}: ${videoUrl}`);

        // Call the video transcription API
        const response = await fetch("/api/video/transcribe-from-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ videoUrl }),
        });

        const data = await response.json();

        if (data.success && data.transcript) {
          const result: TranscriptResult = {
            url: videoUrl,
            transcript: data.transcript,
          };
          results.push(result);
          setTranscriptResults([...results]);
        } else {
          const errorResult: TranscriptResult = {
            url: videoUrl,
            transcript: "",
            error: data.error || "Failed to transcribe video",
          };
          results.push(errorResult);
          setTranscriptResults([...results]);
        }
      } catch (error) {
        console.error(`Error processing ${videoUrl}:`, error);
        const errorResult: TranscriptResult = {
          url: videoUrl,
          transcript: "",
          error: "Network error or processing failed",
        };
        results.push(errorResult);
        setTranscriptResults([...results]);
      }

      // Add 2-second delay between requests (except for the last one)
      if (i < urlsToProcess.length - 1) {
        console.log(`Waiting 2 seconds before processing next video...`);
        await delay(2000);
      }
    }

    setTranscriptLoading(false);
    setCurrentProcessing({ current: 0, total: 0 });
    console.log(`✅ Completed processing ${urlsToProcess.length} videos`);
  };

  // Voice analysis function
  const analyzeVoicePatterns = async () => {
    let validTranscripts: string[] = [];

    // Use manual transcripts if provided, otherwise use auto-transcribed results
    if (manualTranscripts.trim()) {
      validTranscripts = manualTranscripts
        .split("\n---\n")
        .map((t) => t.trim())
        .filter((t) => t.length > 10); // Filter out very short entries
    } else {
      validTranscripts = transcriptResults
        .filter((result) => result.transcript && !result.error)
        .map((result) => result.transcript);
    }

    if (validTranscripts.length < 3) {
      setAnalysisError(
        `Need at least 3 transcripts to analyze voice patterns. ${manualTranscripts.trim() ? 'Separate transcripts with "---" on a new line.' : "Either paste transcripts manually or fetch them from videos."}`,
      );
      return;
    }

    setAnalysisLoading(true);
    setAnalysisError("");
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/voice/analyze-patterns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcripts: validTranscripts }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze voice patterns");
      }

      const analysis = await response.json();
      setAnalysisResult(analysis);
      console.log("✅ Voice analysis completed:", analysis);

      // Log critical fields for debugging
      console.log("📊 UI Received Analysis Structure:");
      console.log(
        `  - allHooksExtracted: ${analysis.allHooksExtracted ? analysis.allHooksExtracted.length : "NOT FOUND"} hooks`,
      );
      if (analysis.allHooksExtracted && analysis.allHooksExtracted.length > 0) {
        console.log("  - First hook sample:", analysis.allHooksExtracted[0]);
      }
      console.log(
        `  - detailedScriptFormula: ${analysis.scriptGenerationRules?.detailedScriptFormula ? Object.keys(analysis.scriptGenerationRules.detailedScriptFormula).length : "NOT FOUND"} steps`,
      );
      if (analysis.scriptGenerationRules?.detailedScriptFormula) {
        const steps = Object.keys(analysis.scriptGenerationRules.detailedScriptFormula);
        console.log(`  - Formula steps: ${steps.slice(0, 3).join(", ")}...`);
      }

    } catch (error) {
      console.error("Voice analysis error:", error);
      setAnalysisError(error instanceof Error ? error.message : "Failed to analyze voice patterns");
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Persona creation function
  const createPersona = async () => {
    if (!personaForm.name.trim() || !analysisResult) {
      setPersonaError("Please provide a persona name and ensure analysis results are available");
      return;
    }

    setPersonaLoading(true);
    setPersonaError("");
    setPersonaSuccess("");

    try {
      // For test page, use the internal API secret for authentication
      const response = await fetch("/api/personas/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "test-internal-secret-123", // Test API key for development
        },
        body: JSON.stringify({
          name: personaForm.name,
          description: personaForm.description,
          platform: personaForm.platform,
          username: personaForm.username,
          analysis: analysisResult,
          tags: personaForm.tags
            ? personaForm.tags
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t)
            : [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create persona");
      }

      const result = await response.json();
      setPersonaSuccess(`✅ Persona "${personaForm.name}" created successfully! ID: ${result.personaId}`);

      // Reset form
      setPersonaForm({
        name: "",
        description: "",
        platform: "tiktok",
        username: "",
        tags: "",
      });
      setShowPersonaForm(false);

      console.log("✅ Persona created:", result);

    } catch (error) {
      console.error("Persona creation error:", error);
      setPersonaError(error instanceof Error ? error.message : "Failed to create persona");
    } finally {
      setPersonaLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-neutral-900">TikTok Voice Analysis Workflow</h1>
          <p className="text-neutral-600">Analyze any TikTok creator's voice patterns and create a persona</p>
        </div>

        {/* Input Section */}
        <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-white p-6 shadow-[var(--shadow-soft-drop)]">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-neutral-700">
                TikTok Username or URL
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username, @username, or TikTok profile URL"
                className="focus:border-primary-400 focus:ring-primary-400 w-full rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50 px-3 py-2 transition-colors focus:ring-1 focus:outline-none"
                disabled={loading || transcriptLoading || analysisLoading}
              />
              <p className="mt-1 text-xs text-neutral-500">
                Supports: username, @username, https://www.tiktok.com/@username, or profile URLs
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={runAutomatedWorkflow}
                disabled={loading || transcriptLoading || analysisLoading || !username.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                {loading || transcriptLoading || analysisLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {loading && "Fetching Feed..."}
                    {transcriptLoading && `Transcribing ${currentProcessing.current}/${currentProcessing.total}...`}
                    {analysisLoading && "Analyzing Patterns..."}
                  </>
                ) : (
                  <>
                    ⚡ Run Complete Analysis
                  </>
                )}
              </button>
              
              <button
                onClick={fetchUserFeed}
                disabled={loading || transcriptLoading || analysisLoading || !username.trim()}
                className="flex items-center justify-center gap-2 rounded-[var(--radius-button)] bg-neutral-100 px-4 py-2 text-neutral-700 transition-colors duration-200 hover:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-50"
                title="Fetch feed only (manual process)"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Manual Mode"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Workflow Progress Indicator */}
        {(loading || transcriptLoading || analysisLoading || metadataLoading) && (
          <div className="rounded-[var(--radius-card)] border border-primary-200 bg-primary-50 p-4 shadow-[var(--shadow-soft-drop)]">
            <h3 className="mb-3 text-sm font-semibold text-primary-900">Workflow Progress</h3>
            <div className="space-y-2">
              <div className={`flex items-center gap-3 ${loading ? 'text-primary-700' : response ? 'text-success-600' : 'text-neutral-400'}`}>
                <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                  loading ? 'bg-primary-200 animate-pulse' : response ? 'bg-success-100' : 'bg-neutral-100'
                }`}>
                  {response ? '✓' : '1'}
                </div>
                <span className="text-sm font-medium">
                  Fetch User Feed
                  {loading && ' (in progress...)'}
                  {response && ` (${response.videos?.length || 0} videos found)`}
                </span>
              </div>
              
              <div className={`flex items-center gap-3 ${transcriptLoading ? 'text-primary-700' : transcriptResults.length > 0 ? 'text-success-600' : 'text-neutral-400'}`}>
                <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                  transcriptLoading ? 'bg-primary-200 animate-pulse' : transcriptResults.length > 0 ? 'bg-success-100' : 'bg-neutral-100'
                }`}>
                  {transcriptResults.length > 0 && !transcriptLoading ? '✓' : '2'}
                </div>
                <span className="text-sm font-medium">
                  Transcribe Videos
                  {transcriptLoading && ` (${currentProcessing.current}/${currentProcessing.total})`}
                  {!transcriptLoading && transcriptResults.length > 0 && ` (${transcriptResults.filter(r => !r.error).length} successful)`}
                </span>
              </div>
              
              <div className={`flex items-center gap-3 ${analysisLoading ? 'text-primary-700' : analysisResult ? 'text-success-600' : 'text-neutral-400'}`}>
                <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                  analysisLoading ? 'bg-primary-200 animate-pulse' : analysisResult ? 'bg-success-100' : 'bg-neutral-100'
                }`}>
                  {analysisResult ? '✓' : '3'}
                </div>
                <span className="text-sm font-medium">
                  Analyze Voice Patterns
                  {analysisLoading && ' (processing...)'}
                  {analysisResult && ' (complete)'}
                </span>
              </div>

              <div className={`flex items-center gap-3 ${metadataLoading ? 'text-primary-700' : generatedMetadata ? 'text-success-600' : 'text-neutral-400'}`}>
                <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                  metadataLoading ? 'bg-primary-200 animate-pulse' : generatedMetadata ? 'bg-success-100' : 'bg-neutral-100'
                }`}>
                  {generatedMetadata ? '✓' : '4'}
                </div>
                <span className="text-sm font-medium">
                  Generate Persona Details
                  {metadataLoading && ' (generating...)'}
                  {generatedMetadata && ` ("${generatedMetadata.title}")`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-destructive-50 border-destructive-200 rounded-[var(--radius-card)] border p-4">
            <p className="text-destructive-700 text-sm">{error}</p>
          </div>
        )}

        {/* Success Summary - Show when analysis is complete */}
        {analysisResult && !loading && !transcriptLoading && !analysisLoading && !metadataLoading && (
          <div className="rounded-[var(--radius-card)] border border-success-200 bg-success-50 p-6 shadow-[var(--shadow-soft-drop)]">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-success-100 p-2">
                <FileText className="h-6 w-6 text-success-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-success-900 mb-2">Voice Analysis Complete!</h3>
                <div className="space-y-2 text-sm text-success-700">
                  <p>✓ Analyzed {transcriptResults.filter(r => !r.error).length} video transcripts</p>
                  <p>✓ Extracted {analysisResult.allHooksExtracted?.length || 0} hook patterns</p>
                  <p>✓ Generated {analysisResult.scriptGenerationRules?.detailedScriptFormula ? '14-step' : ''} script formula</p>
                  {generatedMetadata && (
                    <p>✓ Created persona: "{generatedMetadata.title}"</p>
                  )}
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => {
                      const element = document.getElementById('persona-form');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex items-center gap-2 rounded-[var(--radius-button)] bg-success-600 px-4 py-2 text-white hover:bg-success-700 transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    Create Persona Now
                  </button>
                  <button
                    onClick={() => downloadAnalysis("json")}
                    className="flex items-center gap-2 rounded-[var(--radius-button)] bg-neutral-100 px-4 py-2 text-neutral-700 hover:bg-neutral-200 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download Analysis
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {response && response.success && (
          <div className="space-y-6">
            {/* User Info */}
            {response.userInfo && (
              <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-white p-6 shadow-[var(--shadow-soft-drop)]">
                <div className="flex items-start gap-4">
                  <img
                    src={response.userInfo.avatar}
                    alt={response.userInfo.nickname}
                    className="h-16 w-16 rounded-full bg-neutral-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "";
                      (e.target as HTMLImageElement).className =
                        "w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center";
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-neutral-900">{response.userInfo.nickname}</h2>
                      {response.userInfo.verified && <User className="text-primary-600 h-4 w-4" />}
                    </div>
                    <p className="text-neutral-600">@{response.userInfo.username}</p>
                    <div className="mt-2 flex gap-4 text-sm text-neutral-600">
                      <span>{formatNumber(response.userInfo.stats.videoCount)} videos</span>
                      <span>{formatNumber(response.userInfo.stats.followerCount)} followers</span>
                      <span>{formatNumber(response.userInfo.stats.followingCount)} following</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Video Count Summary */}
            <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-white p-4 shadow-[var(--shadow-soft-drop)]">
              <div className="text-center">
                <p className="text-neutral-600">
                  Found <span className="font-semibold text-neutral-900">{response.metadata?.totalVideos || 0}</span>{" "}
                  videos
                </p>
                {response.metadata?.fetchedAt && (
                  <p className="mt-1 text-sm text-neutral-500">
                    Fetched at {new Date(response.metadata.fetchedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Combined URLs Field */}
            {response.videos && response.videos.length > 0 && (
              <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-white p-6 shadow-[var(--shadow-soft-drop)]">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900">All Video URLs</h3>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        response
                          .videos!.map((video) => video.playUrl || video.downloadUrl)
                          .filter(Boolean)
                          .join("\n"),
                      )
                    }
                    className="flex items-center gap-1 rounded-[var(--radius-button)] bg-neutral-100 px-3 py-1 text-sm text-neutral-700 transition-colors hover:bg-neutral-200"
                  >
                    <Copy className="h-3 w-3" />
                    Copy All
                  </button>
                </div>
                <textarea
                  readOnly
                  value={response.videos
                    .map((video) => video.playUrl || video.downloadUrl)
                    .filter(Boolean)
                    .join("\n")}
                  className="h-32 w-full resize-none rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-sm"
                  placeholder="Video URLs will appear here..."
                />
              </div>
            )}

            {/* Individual Video URLs List */}
            {response.videos && response.videos.length > 0 && (
              <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-white p-6 shadow-[var(--shadow-soft-drop)]">
                <h3 className="mb-4 text-lg font-semibold text-neutral-900">Individual Videos</h3>
                <div className="space-y-3">
                  {response.videos.map((video, index) => {
                    // Prefer playUrl, fallback to downloadUrl
                    const videoUrl = video.playUrl || video.downloadUrl;

                    return (
                      <div
                        key={video.id}
                        className="rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50 p-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="text-sm font-medium text-neutral-700">#{index + 1}</span>
                            {video.cover && (
                              <img
                                src={video.cover}
                                alt="Video thumbnail"
                                className="h-8 w-8 flex-shrink-0 rounded bg-neutral-200 object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            {video.description && (
                              <p className="mb-2 line-clamp-2 text-sm text-neutral-600">{video.description}</p>
                            )}

                            {/* Single Video URL */}
                            <div className="mb-2 flex items-center gap-2">
                              <a
                                href={videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-700 flex-1 truncate font-mono text-sm hover:underline"
                              >
                                {videoUrl}
                              </a>
                              <div className="flex flex-shrink-0 gap-1">
                                <button
                                  onClick={() => copyToClipboard(videoUrl)}
                                  className="rounded p-1 transition-colors hover:bg-neutral-200"
                                  title="Copy URL"
                                >
                                  <Copy className="h-3 w-3 text-neutral-500" />
                                </button>
                                <a
                                  href={videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded p-1 transition-colors hover:bg-neutral-200"
                                  title="Open in new tab"
                                >
                                  <ExternalLink className="h-3 w-3 text-neutral-500" />
                                </a>
                              </div>
                            </div>

                            {/* Video Stats */}
                            <div className="flex gap-4 text-xs text-neutral-500">
                              <span>❤️ {formatNumber(video.stats.diggCount)}</span>
                              <span>💬 {formatNumber(video.stats.commentCount)}</span>
                              <span>📤 {formatNumber(video.stats.shareCount)}</span>
                              <span>▶️ {formatNumber(video.stats.playCount)}</span>
                              <span>⏱️ {video.duration}s</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transcript Scraper Section */}
        <div className="border-primary-200 mt-12 border-t-4 pt-8">
          <div className="mb-8 space-y-2 text-center">
            <h2 className="flex items-center justify-center gap-2 text-2xl font-semibold text-neutral-900">
              <FileText className="h-6 w-6" />
              TikTok Video Transcript Scraper
            </h2>
            <p className="text-neutral-600">
              Extract transcripts from TikTok videos using AI transcription (CDN → Gemini)
            </p>
          </div>

          {/* Input Section */}
          <div className="mb-6 rounded-[var(--radius-card)] border border-neutral-200 bg-white p-6 shadow-[var(--shadow-soft-drop)]">
            <div className="space-y-4">
              <div>
                <label htmlFor="transcript-urls" className="mb-2 block text-sm font-medium text-neutral-700">
                  Video Processing Options
                </label>

                {response?.videos && response.videos.length > 0 ? (
                  <div className="bg-primary-50 border-primary-200 mb-3 rounded-[var(--radius-button)] border p-3">
                    <p className="text-primary-700 text-sm font-medium">
                      ✅ Ready to process {response.videos.length} videos from the user feed above
                    </p>
                    <p className="text-primary-600 mt-1 text-xs">
                      Click "Extract Transcripts" to transcribe all videos from the fetched user feed
                    </p>
                  </div>
                ) : (
                  <textarea
                    id="transcript-urls"
                    rows={4}
                    value={transcriptUrls}
                    onChange={(e) => setTranscriptUrls(e.target.value)}
                    placeholder="Alternative: Paste video CDN URLs here, one per line:&#10;https://v45.tiktokcdn-eu.com/...&#10;https://v15m.tiktokcdn-eu.com/..."
                    className="focus:border-primary-400 focus:ring-primary-400 w-full resize-none rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-sm transition-colors focus:ring-1 focus:outline-none"
                    disabled={transcriptLoading}
                  />
                )}

                <p className="mt-1 text-xs text-neutral-500">
                  Downloads videos from CDN → Sends to Gemini AI for transcription → 5-second delays between requests
                </p>
              </div>

              <button
                onClick={processTranscripts}
                disabled={transcriptLoading || (extractVideoUrls().length === 0 && !transcriptUrls.trim())}
                className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-neutral-900 px-4 py-2 text-neutral-50 transition-colors duration-200 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                {transcriptLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing {currentProcessing.current}/{currentProcessing.total}...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Extract Transcripts
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Processing Status */}
          {transcriptLoading && (
            <div className="bg-primary-50 border-primary-200 mb-6 rounded-[var(--radius-card)] border p-4">
              <div className="mb-2 flex items-center gap-2">
                <Loader2 className="text-primary-600 h-4 w-4 animate-spin" />
                <p className="text-primary-700 font-medium">
                  Processing video {currentProcessing.current} of {currentProcessing.total}
                </p>
              </div>
              <div className="bg-primary-200 h-2 w-full rounded-full">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentProcessing.current / currentProcessing.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {transcriptError && (
            <div className="bg-destructive-50 border-destructive-200 mb-6 rounded-[var(--radius-card)] border p-4">
              <p className="text-destructive-700 text-sm">{transcriptError}</p>
            </div>
          )}

          {/* Results Display */}
          {transcriptResults.length > 0 && (
            <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-white p-6 shadow-[var(--shadow-soft-drop)]">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Transcript Results ({transcriptResults.length})
                </h3>
                <button
                  onClick={() =>
                    copyToClipboard(
                      transcriptResults
                        .map(
                          (result, index) =>
                            `Video ${index + 1}: ${result.url}\n${result.error ? `Error: ${result.error}` : `Transcript: ${result.transcript}`}\n---`,
                        )
                        .join("\n\n"),
                    )
                  }
                  className="flex items-center gap-1 rounded-[var(--radius-button)] bg-neutral-100 px-3 py-1 text-sm text-neutral-700 transition-colors hover:bg-neutral-200"
                >
                  <Copy className="h-3 w-3" />
                  Copy All
                </button>
              </div>

              <div className="space-y-4">
                {transcriptResults.map((result, index) => (
                  <div
                    key={index}
                    className="rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50 p-4"
                  >
                    <div className="mb-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-neutral-700">Video {index + 1}</h4>
                        <button
                          onClick={() => copyToClipboard(result.error ? `Error: ${result.error}` : result.transcript)}
                          className="rounded p-1 transition-colors hover:bg-neutral-200"
                          title="Copy transcript"
                        >
                          <Copy className="h-3 w-3 text-neutral-500" />
                        </button>
                      </div>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 text-xs break-all hover:underline"
                      >
                        {result.url}
                      </a>
                    </div>

                    {result.error ? (
                      <div className="text-destructive-600 bg-destructive-50 border-destructive-200 rounded border p-2 text-sm">
                        <strong>Error:</strong> {result.error}
                      </div>
                    ) : (
                      <div className="text-sm text-neutral-700">
                        <strong>Transcript:</strong>
                        <div className="mt-1 max-h-48 overflow-y-auto rounded border border-neutral-200 bg-white p-2 font-mono text-xs whitespace-pre-wrap">
                          {result.transcript}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Voice Analysis Section */}
        <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-white p-6 shadow-[var(--shadow-soft-drop)]">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-neutral-900">
              <FileText className="h-5 w-5" />
              Voice Pattern Analysis
            </h2>
            <div className="flex gap-2">
              {analysisResult && (
                <>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(analysisResult, null, 2))}
                    className="flex items-center gap-2 rounded-[var(--radius-button)] bg-neutral-100 px-3 py-2 text-neutral-700 transition-colors hover:bg-neutral-200"
                    title="Copy JSON"
                  >
                    <Code className="h-4 w-4" />
                    Copy JSON
                  </button>
                  <button
                    onClick={() => downloadAnalysis("text")}
                    className="flex items-center gap-2 rounded-[var(--radius-button)] bg-neutral-100 px-3 py-2 text-neutral-700 transition-colors hover:bg-neutral-200"
                    title="Download as Text"
                  >
                    <Download className="h-4 w-4" />
                    Text
                  </button>
                  <button
                    onClick={() => downloadAnalysis("json")}
                    className="flex items-center gap-2 rounded-[var(--radius-button)] bg-neutral-100 px-3 py-2 text-neutral-700 transition-colors hover:bg-neutral-200"
                    title="Download as JSON"
                  >
                    <Download className="h-4 w-4" />
                    JSON
                  </button>
                </>
              )}
              <button
                onClick={analyzeVoicePatterns}
                disabled={
                  analysisLoading ||
                  (!manualTranscripts.trim() && transcriptResults.filter((r) => r.transcript && !r.error).length < 3)
                }
                className="bg-primary-500 hover:bg-primary-600 flex items-center gap-2 rounded-[var(--radius-button)] px-4 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {analysisLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Voice Patterns"
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="manualTranscripts" className="mb-2 block text-sm font-medium text-neutral-700">
                Manual Transcripts (Optional)
              </label>
              <textarea
                id="manualTranscripts"
                value={manualTranscripts}
                onChange={(e) => setManualTranscripts(e.target.value)}
                placeholder={`Paste your transcripts here, separated by "---" on a new line. For example:

This is the first transcript about something interesting...

---

This is the second transcript with different content...

---

This is the third transcript...`}
                className="focus:ring-primary-500 focus:border-primary-500 h-48 w-full resize-none rounded-[var(--radius-button)] border border-neutral-200 p-3 text-sm focus:ring-2 focus:outline-none"
              />
              <p className="mt-1 text-xs text-neutral-500">
                If provided, these transcripts will be used instead of auto-generated ones. Separate each transcript
                with "---" on a new line.
              </p>
            </div>

            <p className="text-neutral-600">
              Analyze transcripts to identify voice patterns, hooks, and signature phrases. Requires at least 3
              transcripts.
            </p>
          </div>

          {analysisError && (
            <div className="bg-destructive-50 text-destructive-700 border-destructive-200 mb-4 rounded-[var(--radius-button)] border p-3">
              {analysisError}
            </div>
          )}

          {analysisResult && (
            <div className="space-y-6">
              {/* Voice Profile */}
              <div className="rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50 p-4">
                <h3 className="mb-3 font-medium text-neutral-900">Voice Profile</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-neutral-600">Distinctiveness</div>
                    <div className="font-medium">{analysisResult.voiceProfile.distinctiveness}/10</div>
                  </div>
                  <div>
                    <div className="text-neutral-600">Complexity</div>
                    <div className="font-medium capitalize">{analysisResult.voiceProfile.complexity}</div>
                  </div>
                  <div>
                    <div className="text-neutral-600">Primary Style</div>
                    <div className="font-medium capitalize">{analysisResult.voiceProfile.primaryStyle}</div>
                  </div>
                </div>
              </div>

              {/* Linguistic Fingerprint */}
              <div className="rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50 p-4">
                <h3 className="mb-3 font-medium text-neutral-900">Linguistic Fingerprint</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-neutral-600">Avg Sentence Length</div>
                      <div className="font-medium">{analysisResult.linguisticFingerprint.avgSentenceLength} words</div>
                    </div>
                    <div>
                      <div className="text-neutral-600">Simple Vocab</div>
                      <div className="font-medium">{analysisResult.linguisticFingerprint.vocabularyTier.simple}%</div>
                    </div>
                    <div>
                      <div className="text-neutral-600">Moderate Vocab</div>
                      <div className="font-medium">{analysisResult.linguisticFingerprint.vocabularyTier.moderate}%</div>
                    </div>
                    <div>
                      <div className="text-neutral-600">Advanced Vocab</div>
                      <div className="font-medium">{analysisResult.linguisticFingerprint.vocabularyTier.advanced}%</div>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-neutral-600">Top Unique Words</div>
                    <div className="text-sm">
                      {analysisResult.linguisticFingerprint.topUniqueWords.map((word, i) => (
                        <span
                          key={i}
                          className="bg-primary-100 text-primary-700 mr-2 mb-1 inline-block rounded px-2 py-1"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                  {analysisResult.linguisticFingerprint.grammarQuirks.length > 0 && (
                    <div>
                      <div className="mb-1 text-neutral-600">Grammar Quirks</div>
                      <div className="space-y-1 text-sm">
                        {analysisResult.linguisticFingerprint.grammarQuirks.map((quirk, i) => (
                          <div key={i} className="text-neutral-700">
                            • {quirk}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* All Extracted Hooks (NEW) */}
              {analysisResult.allHooksExtracted && analysisResult.allHooksExtracted.length > 0 && (
                <div className="bg-brand-50 border-brand-200 rounded-[var(--radius-button)] border p-4">
                  <h3 className="mb-3 font-medium text-neutral-900">
                    📌 All Extracted Hooks ({analysisResult.allHooksExtracted.length} Total)
                  </h3>
                  <div className="space-y-2">
                    {analysisResult.allHooksExtracted.map((hook, i) => (
                      <div key={i} className="rounded border border-neutral-200 bg-white p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-brand-700 text-xs font-bold">Script #{hook.scriptNumber}</span>
                          <span className="bg-primary-100 text-primary-700 rounded px-2 py-1 text-xs">
                            {hook.type} • {hook.trigger}
                          </span>
                        </div>
                        <div className="mb-2 text-sm font-medium text-neutral-900">"{hook.originalHook}"</div>
                        <div className="text-primary-700 rounded bg-neutral-100 p-2 font-mono text-sm">
                          Template: {hook.universalTemplate}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hook Replication System */}
              {analysisResult.hookReplicationSystem && (
                <div className="bg-primary-50 border-primary-200 rounded-[var(--radius-button)] border p-4">
                  <h3 className="mb-3 font-medium text-neutral-900">🎯 Hook Replication System</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Primary Hook Type:</span>
                      <span className="bg-primary-100 rounded px-3 py-1 font-medium capitalize">
                        {analysisResult.hookReplicationSystem.primaryHookType}
                      </span>
                    </div>

                    <div>
                      <h4 className="mb-2 text-sm font-medium text-neutral-700">Hook Templates (Copy & Reuse)</h4>
                      <div className="space-y-2">
                        {analysisResult.hookReplicationSystem.hookTemplates.map((template, i) => (
                          <div key={i} className="rounded border border-neutral-200 bg-white p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-primary-600 text-xs font-medium">
                                {template.type.toUpperCase()}
                              </span>
                              <span className="text-xs text-neutral-500">
                                {template.effectiveness} effectiveness • {template.frequency}% usage
                              </span>
                            </div>
                            <div className="mb-2 rounded bg-neutral-100 p-2 font-mono text-sm">{template.template}</div>
                            <div className="text-xs text-neutral-600">
                              <strong>Real:</strong> {template.realExamples[0]}
                            </div>
                            {template.newExamples?.[0] && (
                              <div className="text-success-600 mt-1 text-xs">
                                <strong>New Topic:</strong> {template.newExamples[0]}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2 text-sm font-medium text-neutral-700">Hook Rules</h4>
                      <ul className="space-y-1 text-sm">
                        {analysisResult.hookReplicationSystem.hookRules.map((rule, i) => (
                          <li key={i} className="text-neutral-700">
                            • {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Opening Formulas */}
              <div className="rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50 p-4">
                <h3 className="mb-3 font-medium text-neutral-900">Opening Formulas</h3>
                <div className="space-y-3">
                  {analysisResult.openingFormulas.map((formula, index) => (
                    <div key={index} className="rounded-[var(--radius-button)] border border-neutral-200 bg-white p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-sm font-medium capitalize">{formula.emotionalTrigger} Trigger</div>
                        <div className="text-xs text-neutral-600">{formula.frequency}% frequency</div>
                      </div>
                      <div className="mb-2 rounded bg-neutral-50 p-2 font-mono text-sm text-neutral-700">
                        {formula.pattern}
                      </div>
                      <div className="text-xs text-neutral-600">
                        <strong>Examples:</strong> {formula.examples.join(" • ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transition Phrases */}
              <div className="rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50 p-4">
                <h3 className="mb-3 font-medium text-neutral-900">Transition Phrases</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="mb-2 text-neutral-600">Concept Bridges</div>
                    <div className="space-y-1">
                      {analysisResult.transitionPhrases.conceptBridges.map((phrase, i) => (
                        <div key={i} className="rounded bg-white px-2 py-1 text-xs">
                          &quot;{phrase}&quot;
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-neutral-600">Enumeration</div>
                    <div className="space-y-1">
                      {analysisResult.transitionPhrases.enumeration.map((phrase, i) => (
                        <div key={i} className="rounded bg-white px-2 py-1 text-xs">
                          &quot;{phrase}&quot;
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Micro Patterns */}
              <div className="rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50 p-4">
                <h3 className="mb-3 font-medium text-neutral-900">Micro Patterns</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="mb-2 text-neutral-600">Fillers</div>
                    <div>{analysisResult.microPatterns.fillers.join(", ")}</div>
                  </div>
                  <div>
                    <div className="mb-2 text-neutral-600">Emphasis Words</div>
                    <div>{analysisResult.microPatterns.emphasisWords.join(", ")}</div>
                  </div>
                  <div>
                    <div className="mb-2 text-neutral-600">Number Patterns</div>
                    <div className="capitalize">{analysisResult.microPatterns.numberPatterns}</div>
                  </div>
                  <div>
                    <div className="mb-2 text-neutral-600">Time References</div>
                    <div>{analysisResult.microPatterns.timeReferences.join(", ")}</div>
                  </div>
                </div>
              </div>

              {/* Signature Moves */}
              {analysisResult.signatureMoves.length > 0 && (
                <div className="rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50 p-4">
                  <h3 className="mb-3 font-medium text-neutral-900">Signature Moves</h3>
                  <div className="space-y-3">
                    {analysisResult.signatureMoves.map((move, index) => (
                      <div
                        key={index}
                        className="rounded-[var(--radius-button)] border border-neutral-200 bg-white p-3"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="text-sm font-medium">{move.move}</div>
                          <div className="text-xs text-neutral-600">
                            {move.frequency} • {move.placement}
                          </div>
                        </div>
                        <div className="mb-2 text-sm text-neutral-700">{move.description}</div>
                        <div className="text-xs text-neutral-600">
                          <strong>Examples:</strong> {move.verbatim.join(" • ")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Script Generation Rules */}
              {analysisResult.scriptGenerationRules && (
                <div className="bg-success-50 border-success-200 rounded-[var(--radius-button)] border p-4">
                  <h3 className="mb-3 font-medium text-neutral-900">📝 Script Generation Formula</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-success-700 mb-2 text-sm font-medium">✅ Must Include</h4>
                        <ul className="space-y-1 text-xs">
                          {analysisResult.scriptGenerationRules.mustInclude.map((item, i) => (
                            <li key={i} className="text-neutral-700">
                              • {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-destructive-700 mb-2 text-sm font-medium">❌ Never Include</h4>
                        <ul className="space-y-1 text-xs">
                          {analysisResult.scriptGenerationRules.neverInclude.map((item, i) => (
                            <li key={i} className="text-neutral-700">
                              • {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2 text-sm font-medium text-neutral-700">Optimal Structure</h4>
                      <div className="space-y-2 rounded bg-white p-3 text-sm">
                        <div className="flex">
                          <span className="text-primary-600 min-w-[100px] font-medium">Hook:</span>
                          <span className="text-neutral-700">
                            {analysisResult.scriptGenerationRules.optimalStructure.hookSection}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="text-primary-600 min-w-[100px] font-medium">Body:</span>
                          <span className="text-neutral-700">
                            {analysisResult.scriptGenerationRules.optimalStructure.bodySection}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="text-primary-600 min-w-[100px] font-medium">Close:</span>
                          <span className="text-neutral-700">
                            {analysisResult.scriptGenerationRules.optimalStructure.closeSection}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2 text-sm font-medium text-neutral-700">Step-by-Step Formula</h4>
                      <div className="rounded bg-white p-3 font-mono text-sm text-neutral-700">
                        {analysisResult.scriptGenerationRules.universalFormula ||
                          analysisResult.scriptGenerationRules.formulaForNewScript}
                      </div>
                    </div>

                    {/* Detailed Script Formula (NEW) */}
                    {analysisResult.scriptGenerationRules.detailedScriptFormula && (
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-neutral-700">
                          🎬 Detailed Script Formula (14 Steps)
                        </h4>
                        <div className="max-h-96 space-y-2 overflow-y-auto rounded bg-white p-3">
                          {Object.entries(analysisResult.scriptGenerationRules.detailedScriptFormula).map(
                            ([step, instruction]) => (
                              <div key={step} className="border-success-400 border-l-4 py-1 pl-3">
                                <div className="text-success-700 text-xs font-bold uppercase">{step}</div>
                                <div className="text-sm text-neutral-800">{instruction}</div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Add Persona Button */}
              <div className="mt-6 border-t border-neutral-200 pt-6">
                <button
                  onClick={() => setShowPersonaForm(!showPersonaForm)}
                  className="bg-primary-600 hover:bg-primary-700 flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] px-4 py-3 text-white transition-colors duration-200"
                >
                  <UserPlus className="h-4 w-4" />
                  {showPersonaForm ? "Hide Persona Form" : "Add as Persona"}
                </button>
              </div>

              {/* Persona Creation Form */}
              {showPersonaForm && (
                <div id="persona-form" className="bg-brand-50 border-brand-200 mt-4 rounded-[var(--radius-card)] border p-6">
                  <h3 className="mb-4 text-lg font-semibold text-neutral-900">Create New Persona</h3>
                  
                  {/* Display generated metadata as suggestion */}
                  {generatedMetadata && (
                    <div className="mb-4 rounded-[var(--radius-button)] border border-brand-300 bg-brand-100 p-3">
                      <p className="text-sm text-brand-800">
                        <span className="font-medium">AI Suggestion:</span> Form pre-filled with generated persona details
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Name Field */}
                    <div>
                      <label htmlFor="persona-name" className="mb-2 block text-sm font-medium text-neutral-700">
                        Persona Name *
                      </label>
                      <input
                        id="persona-name"
                        type="text"
                        value={personaForm.name}
                        onChange={(e) => setPersonaForm({ ...personaForm, name: e.target.value })}
                        placeholder="e.g., Alex Fitness Coach, Sarah Marketing Expert"
                        className="focus:border-primary-400 focus:ring-primary-400 w-full rounded-[var(--radius-button)] border border-neutral-200 bg-white px-3 py-2 transition-colors focus:ring-1 focus:outline-none"
                        disabled={personaLoading}
                      />
                    </div>

                    {/* Description Field */}
                    <div>
                      <label htmlFor="persona-description" className="mb-2 block text-sm font-medium text-neutral-700">
                        Description
                      </label>
                      <textarea
                        id="persona-description"
                        value={personaForm.description}
                        onChange={(e) => setPersonaForm({ ...personaForm, description: e.target.value })}
                        placeholder="Brief description of this creator's style and content focus"
                        rows={3}
                        className="focus:border-primary-400 focus:ring-primary-400 w-full resize-none rounded-[var(--radius-button)] border border-neutral-200 bg-white px-3 py-2 transition-colors focus:ring-1 focus:outline-none"
                        disabled={personaLoading}
                      />
                    </div>

                    {/* Platform and Username */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="persona-platform" className="mb-2 block text-sm font-medium text-neutral-700">
                          Platform
                        </label>
                        <select
                          id="persona-platform"
                          value={personaForm.platform}
                          onChange={(e) => setPersonaForm({ ...personaForm, platform: e.target.value })}
                          className="focus:border-primary-400 focus:ring-primary-400 w-full rounded-[var(--radius-button)] border border-neutral-200 bg-white px-3 py-2 transition-colors focus:ring-1 focus:outline-none"
                          disabled={personaLoading}
                        >
                          <option value="tiktok">TikTok</option>
                          <option value="youtube">YouTube</option>
                          <option value="instagram">Instagram</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="persona-username" className="mb-2 block text-sm font-medium text-neutral-700">
                          Username
                        </label>
                        <input
                          id="persona-username"
                          type="text"
                          value={personaForm.username}
                          onChange={(e) => setPersonaForm({ ...personaForm, username: e.target.value })}
                          placeholder="@username"
                          className="focus:border-primary-400 focus:ring-primary-400 w-full rounded-[var(--radius-button)] border border-neutral-200 bg-white px-3 py-2 transition-colors focus:ring-1 focus:outline-none"
                          disabled={personaLoading}
                        />
                      </div>
                    </div>

                    {/* Tags Field */}
                    <div>
                      <label htmlFor="persona-tags" className="mb-2 block text-sm font-medium text-neutral-700">
                        Tags (comma-separated)
                      </label>
                      <input
                        id="persona-tags"
                        type="text"
                        value={personaForm.tags}
                        onChange={(e) => setPersonaForm({ ...personaForm, tags: e.target.value })}
                        placeholder="fitness, motivation, quick-tips, educational"
                        className="focus:border-primary-400 focus:ring-primary-400 w-full rounded-[var(--radius-button)] border border-neutral-200 bg-white px-3 py-2 transition-colors focus:ring-1 focus:outline-none"
                        disabled={personaLoading}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={createPersona}
                        disabled={personaLoading || !personaForm.name.trim()}
                        className="bg-success-600 hover:bg-success-700 flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-button)] px-4 py-2 text-white transition-colors duration-200 disabled:cursor-not-allowed disabled:bg-neutral-300"
                      >
                        {personaLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Create Persona
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setShowPersonaForm(false)}
                        disabled={personaLoading}
                        className="rounded-[var(--radius-button)] bg-neutral-100 px-4 py-2 text-neutral-700 transition-colors duration-200 hover:bg-neutral-200 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Success/Error Messages */}
                    {personaSuccess && (
                      <div className="bg-success-50 border-success-200 rounded-[var(--radius-button)] border p-3">
                        <p className="text-success-700 text-sm">{personaSuccess}</p>
                      </div>
                    )}

                    {personaError && (
                      <div className="bg-destructive-50 border-destructive-200 rounded-[var(--radius-button)] border p-3">
                        <p className="text-destructive-700 text-sm">{personaError}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
