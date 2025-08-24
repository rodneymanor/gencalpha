"use client";

import { useEffect, useRef, useState } from "react";

import Image from "next/image";

import { X, Heart, MessageCircle, Bookmark, Calendar, ChevronDown, ChevronUp, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { ComponentsTab, AnalysisTab, TranscriptTab } from "./video-analysis-tabs";

interface VideoData {
  id: string;
  url: string;
  title: string;
  thumbnailUrl: string;
  transcript: string;
  components: {
    hook: string;
    bridge: string;
    nugget: string;
    wta: string;
  };
  metadata: {
    author: string;
    description: string;
    platform: string;
    duration: number;
  };
  metrics: {
    likes: number;
    comments: number;
    saves: number;
    shares: number;
  };
  hashtags: string[];
  addedAt: string;
  deepAnalysis: {
    contentThemes: string[];
    targetAudience: string;
    emotionalTriggers: string[];
    scriptStructure: {
      introduction: string;
      body: string;
      conclusion: string;
    };
    visualElements: string[];
    performanceFactors: string[];
    recommendedImprovements: string[];
  };
}

interface FloatingVideoAnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoData;
}

export function FloatingVideoAnalyzer({ isOpen, onClose, video }: FloatingVideoAnalyzerProps) {
  const slideoutRef = useRef<HTMLDivElement>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDescription = () => {
    const description = video.metadata.description;
    if (description.length <= 120) {
      return description;
    }
    return isDescriptionExpanded ? description : `${description.substring(0, 120)}...`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="bg-background/60 fixed inset-0 z-50 backdrop-blur-md transition-all duration-300 ease-out"
        onClick={onClose}
      />

      {/* Floating Slideout Panel */}
      <div
        ref={slideoutRef}
        className={cn(
          "fixed inset-y-4 right-4 z-50 w-full max-w-4xl",
          "bg-card overflow-hidden rounded-[var(--radius-card)]",
          "shadow-[var(--shadow-soft-drop)]",
          "transform transition-transform duration-300 ease-out",
          "translate-x-0",
          "flex",
        )}
      >
        {/* Left Side - Video Player */}
        <div className="flex w-2/5 items-center justify-center bg-black">
          <div className="relative aspect-[9/16] h-full max-h-[500px] w-full max-w-[280px]">
            <Image
              src={video.thumbnailUrl}
              alt="Video thumbnail"
              width={280}
              height={500}
              className="h-full w-full rounded-sm object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Button size="icon" className="h-16 w-16 rounded-full bg-black/50 hover:bg-black/70">
                <Play className="h-8 w-8 text-white" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side - Analysis Panel */}
        <div className="bg-background flex w-3/5 flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-foreground text-lg font-semibold">Video Analysis</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-[var(--radius-button)]">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="min-h-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-6 p-4">
                {/* Video Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full text-xs">👤</div>
                    <div>
                      <div className="text-sm font-semibold">@{video.metadata.author}</div>
                      <div className="text-muted-foreground flex items-center gap-2 text-xs">
                        <Calendar className="h-3 w-3" />
                        {formatDate(video.addedAt)}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm leading-relaxed">
                    {getDescription()}
                    {video.metadata.description.length > 120 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="text-primary ml-1 h-auto p-0 text-xs hover:bg-transparent"
                      >
                        {isDescriptionExpanded ? (
                          <>
                            <ChevronUp className="h-3 w-3" />
                            less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3" />
                            more
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span>{formatNumber(video.metrics.likes)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4 text-blue-500" />
                      <span>{formatNumber(video.metrics.comments)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bookmark className="h-4 w-4 text-green-500" />
                      <span>{formatNumber(video.metrics.saves)}</span>
                    </div>
                  </div>
                </div>

                {/* Analysis Tabs */}
                <Tabs defaultValue="components" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="components">Components</TabsTrigger>
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    <TabsTrigger value="transcript">Transcript</TabsTrigger>
                  </TabsList>

                  <TabsContent value="components" className="mt-4 space-y-4">
                    <div className="origin-top scale-90">
                      <ComponentsTab video={video} />
                    </div>
                  </TabsContent>

                  <TabsContent value="analysis" className="mt-4 space-y-4">
                    <div className="origin-top scale-90">
                      <AnalysisTab video={video} />
                    </div>
                  </TabsContent>

                  <TabsContent value="transcript" className="mt-4">
                    <div className="origin-top scale-90">
                      <TranscriptTab video={video} />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </>
  );
}
