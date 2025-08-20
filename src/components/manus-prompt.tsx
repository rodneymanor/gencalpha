/* eslint-disable max-lines */
"use client";

import React, { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import { ArrowUp, Link, AlertCircle, CheckCircle2, Bot, Brain, Pencil, X, Mic, SlidersHorizontal } from "lucide-react";

import { AdvancedSlidingSwitch, type ModeType, type SwitchOption } from "@/components/ui/advanced-sliding-switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClarityLoader } from "@/components/ui/loading";
import { AssistantSelector, AssistantType } from "@/components/write-chat/persona-selector";
import { PromptComposer } from "@/components/write-chat/prompt-composer";
import { useAuth } from "@/contexts/auth-context";
import { auth } from "@/lib/firebase";
import { scrapeVideoUrl } from "@/lib/unified-video-scraper";
import { cn } from "@/lib/utils";
import { detectURL, URLDetectionResult } from "@/lib/utils/url-detector";

interface ManusPromptProps {
  greeting?: string;
  subtitle?: string;
  placeholder?: string;
  className?: string;
  onSubmit?: (prompt: string, assistant: AssistantType) => void;
}

// eslint-disable-next-line complexity
export const ManusPrompt: React.FC<ManusPromptProps> = ({
  greeting = "Hello",
  subtitle = "What will you script today?",
  placeholder = "Give Gen.C a topic to script...",
  className,
  onSubmit,
}) => {
  const { user, userProfile } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [selectedAssistant, setSelectedAssistant] = useState<AssistantType | null>(null);
  const [assistantSelected, setAssistantSelected] = useState(false);
  const [urlDetection, setUrlDetection] = useState<URLDetectionResult | null>(null);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [activeMode, setActiveMode] = useState<ModeType>("ghost-write");
  const [showIdeaInbox, setShowIdeaInbox] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [showListening, setShowListening] = useState(true);
  // chatbot panel sunset — no longer used
  const router = useRouter();

  // Get assistant data for display
  const getAssistantData = (assistantType: AssistantType) => {
    const assistants = [
      { key: "Scribo", label: "Scribo", icon: "📝" },
      { key: "MiniBuddy", label: "MiniBuddy", icon: "🤖" },
      { key: "StoryBuddy", label: "StoryBuddy", icon: "📚" },
      { key: "HookBuddy", label: "HookBuddy", icon: "🎣" },
      { key: "MVBB", label: "Value Bomb", icon: "⚡" },
    ];
    return assistants.find((p) => p.key === assistantType);
  };

  // Blinking animation for "listening" text
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setShowListening((prev) => !prev);
      }, 800); // Blink every 800ms
    } else {
      setShowListening(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Get dynamic placeholder based on active mode
  const getDynamicPlaceholder = () => {
    // Show blinking "listening" when recording
    if (isRecording) {
      return showListening ? "listening..." : "";
    }

    if (showIdeaInbox) {
      return "Capture your ideas, thoughts, and inspiration here...";
    }

    switch (activeMode) {
      case "ghost-write":
        return "What do you want me to script?";
      case "web-search":
        return "Perform a Deep Script analysis...";
      default:
        return placeholder;
    }
  };

  const handleAssistantChange = (assistant: AssistantType) => {
    setSelectedAssistant(assistant);
    setAssistantSelected(true);
  };

  const handleRemoveAssistant = () => {
    setAssistantSelected(false);
    setSelectedAssistant(null); // Reset to no selection
  };

  const handleToggleIdeaInbox = () => {
    setShowIdeaInbox(!showIdeaInbox);
  };

  const handleVoiceRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorder) {
        mediaRecorder.stop();
        setIsRecording(false);
      }
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const audioChunks: Blob[] = [];

        recorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
          await processVoiceRecording(audioBlob);

          // Stop all tracks to turn off microphone
          stream.getTracks().forEach((track) => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      } catch (error) {
        console.error("Error accessing microphone:", error);
        // Could show a toast notification here
      }
    }
  };

  const processVoiceRecording = async (audioBlob: Blob) => {
    try {
      // Get Firebase Auth token
      if (!auth?.currentUser) {
        console.error("Please sign in to use voice transcription");
        return;
      }

      const token = await auth.currentUser.getIdToken();

      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = Buffer.from(arrayBuffer).toString("base64");

      // Send to transcription API
      const response = await fetch("/api/transcribe/voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          audio: base64Audio,
          format: "wav",
        }),
      });

      const result = await response.json();

      if (result.success && result.transcription) {
        // Set the transcribed text in the prompt
        setPrompt(result.transcription);
      } else {
        console.error("Transcription failed:", result.error);
        // Could show a toast notification here
      }
    } catch (error) {
      console.error("Error processing voice recording:", error);
      // Could show a toast notification here
    }
  };

  // Switch options for the sliding switch
  const switchOptions: SwitchOption[] = [
    {
      value: "ghost-write",
      icon: <Bot className="h-[18px] w-[18px]" />,
      tooltip: "AI generates original scripts or text based on your input.",
    },
    {
      value: "web-search",
      icon: <Brain className="h-[18px] w-[18px]" />,
      tooltip: "Fetches real-world facts and data for grounding your content.",
    },
  ];

  // Handler for switch changes
  const handleSwitchChange = (index: number, option: SwitchOption) => {
    setActiveMode(option.value);
    console.log("Switch changed to:", option.value);
  };

  // URL Detection Effect
  useEffect(() => {
    const trimmedInput = prompt.trim();
    if (!trimmedInput) {
      setUrlDetection(null);
      return;
    }

    // Check if input contains a URL pattern
    const urlPattern = /https?:\/\/[^\s]+/i;
    const urlMatch = trimmedInput.match(urlPattern);

    if (urlMatch) {
      const detectedUrl = urlMatch[0];
      const detection = detectURL(detectedUrl);
      setUrlDetection(detection);
    } else {
      setUrlDetection(null);
    }
  }, [prompt]);

  // Handle video processing for supported URLs
  // eslint-disable-next-line complexity
  const handleVideoProcess = async () => {
    if (!urlDetection || !urlDetection.isSupported) return;

    setIsProcessingVideo(true);
    try {
      // Process video URL using unified video scraper
      const result = await scrapeVideoUrl(urlDetection.url);

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (result) {
        // Create a formatted message with video transcription
        const message = `Here's the transcription from the ${urlDetection.platform} video:\n\n**Title:** ${result.title}\n**Author:** @${result.author}\n\n**Transcript:**\n${result.description || "No transcript available - this video may not have spoken content."}`;

        // Redirect to /write with the transcription and selected assistant
        const params = new URLSearchParams({
          prompt: message,
          assistant: (selectedAssistant ?? "MiniBuddy") as string,
        });
        router.push(`/write?${params.toString()}`);

        // Call the optional onSubmit callback
        if (onSubmit) {
          onSubmit(message, selectedAssistant ?? "MiniBuddy");
        }

        // Clear the input and detection
        setPrompt("");
        setUrlDetection(null);
      }
    } catch (error) {
      console.error("Error processing video:", error);
      // Show error message to user
      const errorMessage = `Failed to process ${urlDetection.platform} video: ${error instanceof Error ? error.message : "Unknown error"}`;

      // Redirect to /write with error message
      const params = new URLSearchParams({
        prompt: errorMessage,
        assistant: (selectedAssistant ?? "MiniBuddy") as string,
      });
      router.push(`/write?${params.toString()}`);
      if (onSubmit) {
        onSubmit(errorMessage, selectedAssistant ?? "MiniBuddy");
      }
    } finally {
      setIsProcessingVideo(false);
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim() || isProcessingVideo) return;

    // If we detected a supported video URL, process it instead of regular submit
    if (urlDetection && urlDetection.isSupported) {
      await handleVideoProcess();
      return;
    }

    // Redirect to /write with the initial prompt and assistant
    const params = new URLSearchParams({
      prompt: prompt.trim(),
      assistant: (selectedAssistant ?? "MiniBuddy") as string,
    });
    router.push(`/write?${params.toString()}`);

    // Call the optional onSubmit callback with the prompt and assistant
    if (onSubmit) {
      onSubmit(prompt.trim(), selectedAssistant ?? "MiniBuddy");
    }

    // Clear the input and detection
    setPrompt("");
    setUrlDetection(null);
  };

  // Key handling now delegated inside PromptComposer

  return (
    <div className={cn("mx-auto my-24 w-full max-w-3xl min-w-[390px] space-y-4 px-5 text-base", className)}>
      {/* Header */}
      <header className="flex w-full items-end justify-between pb-4 pl-4">
        <h1 className="text-foreground text-4xl leading-10 font-bold tracking-tight">
          {greeting}
          {user &&
            (userProfile?.displayName ?? user.displayName) &&
            `, ${userProfile?.displayName ?? user.displayName}`}
          <br />
          <span className="text-muted-foreground">{subtitle}</span>
        </h1>
      </header>

      {/* Input Card using shared PromptComposer */}
      <PromptComposer
        value={prompt}
        onChange={setPrompt}
        placeholder={urlDetection ? "Video URL detected! Press Enter to process..." : getDynamicPlaceholder()}
        onSubmit={handleSubmit}
        isProcessing={isProcessingVideo}
        submitEnabled={Boolean(prompt.trim())}
        submitIcon={<ArrowUp className="size-4" />}
        footerBanner={
          urlDetection ? (
            <div className="bg-muted/80 border-border/50 flex items-center justify-between rounded-md border p-2 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Link className="text-muted-foreground h-4 w-4" />
                <span className="text-sm font-medium">
                  {urlDetection.platform.charAt(0).toUpperCase() + urlDetection.platform.slice(1)} {urlDetection.type}
                </span>
                {urlDetection.isSupported ? (
                  <Badge variant="default" className="bg-green-500 text-xs hover:bg-green-500/80">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Supported
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Coming Soon
                  </Badge>
                )}
              </div>
              {urlDetection.isSupported && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleVideoProcess}
                  disabled={isProcessingVideo}
                  className="h-6 px-2 text-xs"
                >
                  {isProcessingVideo ? (
                    <>
                      <span className="mr-1 inline-flex">
                        <ClarityLoader size="inline" />
                      </span>
                      Processing...
                    </>
                  ) : (
                    "Process Video"
                  )}
                </Button>
              )}
            </div>
          ) : undefined
        }
        leftControls={
          <>
            {/* Idea Inbox Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleIdeaInbox}
              className={cn(
                "hover:bg-accent hover:text-accent-foreground size-8 rounded-full p-0 transition-all",
                showIdeaInbox && "ring-ring ring-2 ring-offset-2",
              )}
              title="Toggle Idea Inbox"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="size-8" title="Settings">
              <SlidersHorizontal className="h-3 w-3" />
            </Button>
            <AdvancedSlidingSwitch options={switchOptions} onChange={handleSwitchChange} disabled={showIdeaInbox} />
            {assistantSelected && (
              <Badge
                variant="secondary"
                className="bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20 ml-2 flex h-8 items-center rounded-[var(--radius-pill)] px-3 text-xs font-medium"
              >
                <span className="mr-2">{selectedAssistant ? getAssistantData(selectedAssistant)?.icon : ""}</span>
                {selectedAssistant ? getAssistantData(selectedAssistant)?.label : ""}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveAssistant}
                  className="hover:bg-destructive/20 hover:text-destructive ml-2 h-4 w-4 rounded-full p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </>
        }
        rightControls={
          <Button
            onClick={prompt.trim() ? handleSubmit : handleVoiceRecording}
            disabled={isProcessingVideo}
            className={cn(
              "size-9 rounded-full transition-colors",
              prompt.trim() && !isProcessingVideo
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : isRecording
                  ? "animate-pulse bg-red-500 text-white hover:bg-red-600"
                  : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground border",
            )}
            title={prompt.trim() ? "Send message" : isRecording ? "Stop recording" : "Start voice recording"}
          >
            {isProcessingVideo ? (
              <ClarityLoader size="inline" />
            ) : prompt.trim() ? (
              <ArrowUp className="size-4" />
            ) : isRecording ? (
              <Mic className="size-4" />
            ) : (
              <Mic className="size-4" />
            )}
          </Button>
        }
      />

      {/* Assistant Selector or Idea Inbox Explanation */}
      <div className="space-y-3">
        {showIdeaInbox ? (
          <div className="bg-card border-border rounded-[var(--radius-card)] border p-6 shadow-[var(--shadow-soft-drop)]">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="bg-secondary/10 flex h-12 w-12 items-center justify-center rounded-[var(--radius-button)]">
                  <Pencil className="text-secondary h-6 w-6" />
                </div>
              </div>
              <div className="flex-1">
                <div className="mb-2 flex items-center space-x-2">
                  <h3 className="text-foreground font-semibold">Idea Inbox - Your Save Everything Hub</h3>
                </div>
                <p className="text-muted-foreground mb-4 text-sm">
                  Capture your ideas, thoughts, inspiration, and random sparks of creativity here. Think of this as your
                  digital notebook where nothing gets lost.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <div className="bg-primary/10 text-primary mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold">
                      1
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">Save Everything:</span> Jot down video ideas, hooks, story concepts,
                      or any creative thoughts
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="bg-primary/10 text-primary mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold">
                      2
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">Come Back Later:</span> Your ideas are automatically saved in your
                      Idea Inbox dashboard
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="bg-primary/10 text-primary mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold">
                      3
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">Turn into Scripts:</span> Transform any saved idea into a full
                      script with AI assistance
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <AssistantSelector
            selectedAssistant={selectedAssistant}
            onAssistantChange={handleAssistantChange}
            className="justify-center"
            showCallout={assistantSelected}
          />
        )}
      </div>
    </div>
  );
};

export default ManusPrompt;
