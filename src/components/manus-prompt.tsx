/* eslint-disable max-lines */
"use client";

import React, { useState, useEffect } from "react";

import { ArrowUp, Link, AlertCircle, CheckCircle2, Loader2, Bot, Globe, Pencil, X } from "lucide-react";

import { PersonaSelector, PersonaType } from "@/components/chatbot/persona-selector";
import { AdvancedSlidingSwitch, type ModeType, type SwitchOption } from "@/components/ui/advanced-sliding-switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { useResizableLayout } from "@/contexts/resizable-layout-context";
import { scrapeVideoUrl } from "@/lib/unified-video-scraper";
import { cn } from "@/lib/utils";
import { detectURL, URLDetectionResult } from "@/lib/utils/url-detector";

interface ManusPromptProps {
  greeting?: string;
  subtitle?: string;
  placeholder?: string;
  className?: string;
  onSubmit?: (prompt: string, persona: PersonaType) => void;
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
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(null);
  const [personaSelected, setPersonaSelected] = useState(false);
  const [urlDetection, setUrlDetection] = useState<URLDetectionResult | null>(null);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [activeMode, setActiveMode] = useState<ModeType>("ghost-write");
  const [showIdeaInbox, setShowIdeaInbox] = useState(false);
  const { toggleChatbotPanel } = useResizableLayout();

  // Get persona data for display
  const getPersonaData = (personaType: PersonaType) => {
    const personas = [
      { key: "Scribo", label: "Scribo", icon: "📝" },
      { key: "MiniBuddy", label: "MiniBuddy", icon: "🤖" },
      { key: "StoryBuddy", label: "StoryBuddy", icon: "📚" },
      { key: "HookBuddy", label: "HookBuddy", icon: "🎣" },
      { key: "MVBB", label: "Value Bomb", icon: "⚡" },
    ];
    return personas.find((p) => p.key === personaType);
  };

  // Get dynamic placeholder based on active mode
  const getDynamicPlaceholder = () => {
    if (showIdeaInbox) {
      return "Capture your ideas, thoughts, and inspiration here...";
    }

    switch (activeMode) {
      case "ghost-write":
        return "What do you want me to script?";
      case "web-search":
        return "Write a fact-based script...";
      default:
        return placeholder;
    }
  };

  const handlePersonaChange = (persona: PersonaType) => {
    setSelectedPersona(persona);
    setPersonaSelected(true);
  };

  const handleRemovePersona = () => {
    setPersonaSelected(false);
    setSelectedPersona(null); // Reset to no selection
  };

  const handleToggleIdeaInbox = () => {
    setShowIdeaInbox(!showIdeaInbox);
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
      icon: <Globe className="h-[18px] w-[18px]" />,
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

        // Open the chatbot panel with the transcription and selected persona
        toggleChatbotPanel(message, selectedPersona ?? "MiniBuddy");

        // Call the optional onSubmit callback
        if (onSubmit) {
          onSubmit(message, selectedPersona ?? "MiniBuddy");
        }

        // Clear the input and detection
        setPrompt("");
        setUrlDetection(null);
      }
    } catch (error) {
      console.error("Error processing video:", error);
      // Show error message to user
      const errorMessage = `Failed to process ${urlDetection.platform} video: ${error instanceof Error ? error.message : "Unknown error"}`;

      // Open chatbot panel with error message
      toggleChatbotPanel(errorMessage, selectedPersona ?? "MiniBuddy");
      if (onSubmit) {
        onSubmit(errorMessage, selectedPersona ?? "MiniBuddy");
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

    // Open the chatbot panel with the initial prompt and persona
    toggleChatbotPanel(prompt.trim(), selectedPersona ?? "MiniBuddy");

    // Call the optional onSubmit callback with the prompt and persona
    if (onSubmit) {
      onSubmit(prompt.trim(), selectedPersona ?? "MiniBuddy");
    }

    // Clear the input and detection
    setPrompt("");
    setUrlDetection(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

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

      {/* Input Card */}
      <div className="bg-card rounded-3xl border shadow-md">
        <div className="flex max-h-72 flex-col space-y-3 py-3">
          <div className="relative overflow-y-auto px-4">
            <Textarea
              rows={1}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={urlDetection ? "Video URL detected! Press Enter to process..." : getDynamicPlaceholder()}
              className={cn(
                "resize-none border-0 bg-transparent focus-visible:ring-0",
                urlDetection && "pb-12", // Add padding when URL detection is shown
              )}
            />

            {/* URL Detection Feedback */}
            {urlDetection && (
              <div className="bg-muted/80 border-border/50 absolute right-0 bottom-2 left-0 mx-3 flex items-center justify-between rounded-md border p-2 backdrop-blur-sm">
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
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Process Video"
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 px-3">
            {/* Idea Inbox Toggle Button */}
            <Button
              variant={showIdeaInbox ? "default" : "outline"}
              size="sm"
              onClick={handleToggleIdeaInbox}
              className={cn(
                "size-8 rounded-full p-0 transition-all",
                showIdeaInbox
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  : "hover:bg-accent hover:text-accent-foreground",
              )}
              title="Toggle Idea Inbox"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <AdvancedSlidingSwitch options={switchOptions} onChange={handleSwitchChange} disabled={showIdeaInbox} />

            {/* Persona Badge */}
            {personaSelected && (
              <Badge
                variant="secondary"
                className="bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20 ml-2 flex h-8 items-center rounded-[var(--radius-pill)] px-3 text-xs font-medium"
              >
                <span className="mr-2">{selectedPersona ? getPersonaData(selectedPersona)?.icon : ""}</span>
                {selectedPersona ? getPersonaData(selectedPersona)?.label : ""}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemovePersona}
                  className="hover:bg-destructive/20 hover:text-destructive ml-2 h-4 w-4 rounded-full p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            <span className="flex-1" />

            <Button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isProcessingVideo}
              className={cn(
                "size-9 rounded-full transition-colors",
                prompt.trim() && !isProcessingVideo
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted hover:bg-muted/80",
              )}
            >
              {isProcessingVideo ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Persona Selector or Idea Inbox Explanation */}
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
          <PersonaSelector
            selectedPersona={selectedPersona}
            onPersonaChange={handlePersonaChange}
            className="justify-center"
            showCallout={personaSelected}
          />
        )}
      </div>
    </div>
  );
};

export default ManusPrompt;
