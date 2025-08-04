"use client";

import React, { useState, useEffect } from "react";

import { ArrowUp, Link, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import HelpNotificationsButtons from "@/components/help-notifications-buttons";
import { PersonaSelector, PersonaType } from "@/components/chatbot/persona-selector";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useResizableLayout } from "@/contexts/resizable-layout-context";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { detectURL, URLDetectionResult } from "@/lib/utils/url-detector";
import { scrapeVideoUrl } from "@/lib/unified-video-scraper";

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
  console.log("💬 ManusPrompt: Component initialized with props:", {
    greeting,
    subtitle,
    placeholder,
    className,
    hasOnSubmit: !!onSubmit
  });
  
  const { user, userProfile } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>("MiniBuddy");
  const [urlDetection, setUrlDetection] = useState<URLDetectionResult | null>(null);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const { toggleChatbotPanel } = useResizableLayout();

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
        const message = `Here's the transcription from the ${urlDetection.platform} video:\n\n**Title:** ${result.title}\n**Author:** @${result.author}\n\n**Transcript:**\n${result.description || 'No transcript available - this video may not have spoken content.'}`;
        
        // Open the chatbot panel with the transcription and selected persona
        toggleChatbotPanel(message, selectedPersona);
        
        // Call the optional onSubmit callback
        onSubmit?.(message, selectedPersona);
        
        // Clear the input and detection
        setPrompt("");
        setUrlDetection(null);
      }
    } catch (error) {
      console.error('Error processing video:', error);
      // Show error message to user
      const errorMessage = `Failed to process ${urlDetection.platform} video: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
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

  console.log("💬 ManusPrompt: Rendering with state:", {
    prompt: prompt.length > 0 ? `${prompt.length} chars` : "empty",
    selectedPersona,
    urlDetection: urlDetection?.platform || null,
    isProcessingVideo,
    user: user?.displayName || "not logged in"
  });

  return (
    <div className={cn("mx-auto my-24 w-full max-w-3xl min-w-[390px] space-y-4 px-5 text-base", className)}>
      {/* Header */}
      <header className="flex w-full items-end justify-between pb-4 pl-4">
        <h1 className="text-foreground text-4xl leading-10 font-bold tracking-tight">
          {greeting}{user && (userProfile?.displayName ?? user.displayName) && `, ${userProfile?.displayName ?? user.displayName}`}
          <br />
          <span className="text-muted-foreground">{subtitle}</span>
        </h1>
      </header>

      {/* Input Card */}
      <div className="bg-background rounded-3xl border shadow-md">
        <div className="flex max-h-72 flex-col space-y-3 py-3">
          <div className="overflow-y-auto px-4 relative">
            <Textarea
              rows={1}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={urlDetection ? "Video URL detected! Press Enter to process..." : placeholder}
              className={cn(
                "resize-none border-0 bg-transparent focus-visible:ring-0",
                urlDetection && "pb-12" // Add padding when URL detection is shown
              )}
            />
            
            {/* URL Detection Feedback */}
            {urlDetection && (
              <div className="absolute bottom-2 left-0 right-0 mx-3 flex items-center justify-between p-2 bg-muted/80 backdrop-blur-sm rounded-md border border-border/50">
                <div className="flex items-center gap-2">
                  <Link className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {urlDetection.platform.charAt(0).toUpperCase() + urlDetection.platform.slice(1)} {urlDetection.type}
                  </span>
                  {urlDetection.isSupported ? (
                    <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-500/80">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Supported
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
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
                    className="text-xs h-6 px-2"
                  >
                    {isProcessingVideo ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Process Video'
                    )}
                  </Button>
                )}
              </div>
            )}
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
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              {isProcessingVideo ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowUp className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Persona Selector */}
      <div className="space-y-3">
        <div className="text-center">
          <span className="text-sm font-medium text-foreground">Choose your assistant:</span>
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
