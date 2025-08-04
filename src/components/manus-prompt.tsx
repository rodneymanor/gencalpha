"use client";

import React, { useState, useEffect } from "react";

import { ArrowUp, Link, AlertCircle, CheckCircle2, Loader2, Bot, Globe, Pencil } from "lucide-react";

import { PersonaSelector, PersonaType } from "@/components/chatbot/persona-selector";
import HelpNotificationsButtons from "@/components/help-notifications-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SlidingSwitch, SlidingSwitchOption } from "@/components/ui/sliding-switch";
import { useAuth } from "@/contexts/auth-context";
import { useResizableLayout } from "@/contexts/resizable-layout-context";
import { scrapeVideoUrl } from "@/lib/unified-video-scraper";
import { cn } from "@/lib/utils";
import { detectURL, URLDetectionResult } from "@/lib/utils/url-detector";

type InputMode = 'writer' | 'global' | 'notes';

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
  // console.log("💬 ManusPrompt: Component initialized with props:", {
  //   greeting,
  //   subtitle,
  //   placeholder,
  //   className,
  //   hasOnSubmit: !!onSubmit
  // });

  const { user, userProfile } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>("MiniBuddy");
  const [inputMode, setInputMode] = useState<InputMode>("writer");
  const [urlDetection, setUrlDetection] = useState<URLDetectionResult | null>(null);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const { toggleChatbotPanel } = useResizableLayout();

  // Input mode options for sliding switch
  const modeOptions: SlidingSwitchOption[] = [
    { value: 'writer', icon: <Bot size={16} /> },
    { value: 'global', icon: <Globe size={16} /> },
    { value: 'notes', icon: <Pencil size={16} /> },
  ];

  const handleModeChange = (index: number, option: SlidingSwitchOption) => {
    setInputMode(option.value as InputMode);
  };

  // Get placeholder text based on input mode
  const getPlaceholder = () => {
    if (urlDetection) return "Video URL detected! Press Enter to process...";
    
    switch (inputMode) {
      case 'writer':
        return "Give Gen.C a topic to script...";
      case 'global':
        return "What would you like to know or explore?";
      case 'notes':
        return "Capture your thoughts and ideas...";
      default:
        return placeholder;
    }
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
  const handleVideoProcess = async () => {
    if (!urlDetection || !urlDetection.isSupported) return;

    setIsProcessingVideo(true);
    try {
      // Process video URL using unified video scraper
      const result = await scrapeVideoUrl(urlDetection.url);

      if (result) {
        // Create a formatted message with video transcription
        const message = `Here's the transcription from the ${urlDetection.platform} video:\n\n**Title:** ${result.title}\n**Author:** @${result.author}\n\n**Transcript:**\n${result.description || "No transcript available - this video may not have spoken content."}`;

        // Open the chatbot panel with the transcription and selected persona
        toggleChatbotPanel(message, selectedPersona);

        // Call the optional onSubmit callback
        onSubmit?.(message, selectedPersona);

        // Clear the input and detection
        setPrompt("");
        setUrlDetection(null);
      }
    } catch (error) {
      console.error("Error processing video:", error);
      // Show error message to user
      const errorMessage = `Failed to process ${urlDetection.platform} video: ${error instanceof Error ? error.message : "Unknown error"}`;

      // Open chatbot panel with error message
      toggleChatbotPanel(errorMessage, selectedPersona);
      onSubmit?.(errorMessage, selectedPersona);
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
    toggleChatbotPanel(prompt.trim(), selectedPersona);

    // Call the optional onSubmit callback with the prompt and persona
    onSubmit?.(prompt.trim(), selectedPersona);

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

  // console.log("💬 ManusPrompt: Rendering with state:", {
  //   prompt: prompt.length > 0 ? `${prompt.length} chars` : "empty",
  //   selectedPersona,
  //   urlDetection: urlDetection?.platform || null,
  //   isProcessingVideo,
  //   user: user?.displayName || "not logged in"
  // });

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
      <div className="bg-background rounded-3xl border shadow-md">
        <div className="flex max-h-72 flex-col space-y-3 py-3">
          <div className="relative overflow-y-auto px-4">
            <Textarea
              rows={1}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder()}
              className={cn(
                "resize-none border-0 bg-transparent focus-visible:ring-0 pb-12", // Always add bottom padding for mode switcher
                urlDetection && "pb-16", // Extra padding when URL detection is shown
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

            {/* Input Mode Selector - positioned in bottom left */}
            <div className="absolute bottom-2 left-3">
              <SlidingSwitch
                options={modeOptions}
                onChange={handleModeChange}
                defaultValue={0}
                className="h-8"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 px-3">
            <HelpNotificationsButtons />

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

      {/* Persona Selector */}
      <div className="space-y-3">
        <div className="text-center">
          <span className="text-foreground text-sm font-medium">Choose your assistant:</span>
        </div>
        <PersonaSelector
          selectedPersona={selectedPersona}
          onPersonaChange={setSelectedPersona}
          className="justify-center"
        />
      </div>
    </div>
  );
};

export default ManusPrompt;
