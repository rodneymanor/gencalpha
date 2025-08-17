"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import { X, Heart, MessageCircle, Bookmark, Calendar, ChevronDown, ChevronUp, Play, ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { OverviewTab, ComponentsTab, AnalysisTab, TranscriptTab } from "./video-analysis-tabs";

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

interface TopBottomVideoAnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoData;
}

export function TopBottomVideoAnalyzer({ isOpen, onClose, video }: TopBottomVideoAnalyzerProps) {
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
    <div
      className={cn(
        "bg-background fixed inset-0 z-50",
        "transform transition-transform duration-500 ease-out",
        "translate-y-0",
      )}
    >
      {/* Header */}
      <div className="border-border bg-card flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-[var(--radius-button)]">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-foreground text-xl font-semibold">Deep Video Analysis</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-[var(--radius-button)]">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Side - Video Player */}
        <div className="flex w-1/3 items-center justify-center bg-black p-8">
          <div className="relative aspect-[9/16] h-full max-h-[600px] w-full max-w-[337px]">
            <Image
              src={video.thumbnailUrl}
              alt="Video thumbnail"
              width={337}
              height={600}
              className="h-full w-full rounded-[var(--radius-card)] object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Button size="icon" className="h-20 w-20 rounded-full bg-black/50 hover:bg-black/70">
                <Play className="h-10 w-10 text-white" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side - Analysis Content */}
        <div className="bg-background flex w-2/3 flex-col">
          <ScrollArea className="h-full">
            <div className="space-y-8 p-8">
              {/* Video Information */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">👤</div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold">@{video.metadata.author}</div>
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      {formatDate(video.addedAt)} • {video.metadata.duration}s
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-base leading-relaxed">
                    {getDescription()}
                    {video.metadata.description.length > 120 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="text-primary ml-2 h-auto p-0 text-sm hover:bg-transparent"
                      >
                        {isDescriptionExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            Show more
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      <span className="font-medium">{formatNumber(video.metrics.likes)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">{formatNumber(video.metrics.comments)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bookmark className="h-5 w-5 text-green-500" />
                      <span className="font-medium">{formatNumber(video.metrics.saves)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {video.hashtags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Analysis Content */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="components">Components</TabsTrigger>
                  <TabsTrigger value="analysis">Deep Analysis</TabsTrigger>
                  <TabsTrigger value="transcript">Transcript</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-6">
                  <OverviewTab video={video} />
                </TabsContent>

                <TabsContent value="components" className="mt-6">
                  <ComponentsTab video={video} />
                </TabsContent>

                <TabsContent value="analysis" className="mt-6 space-y-6">
                  <AnalysisTab video={video} />
                </TabsContent>

                <TabsContent value="transcript" className="mt-6">
                  <TranscriptTab video={video} />
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex gap-4 border-t pt-6">
                <Button size="lg" className="flex-1">
                  Remix Script
                </Button>
                <Button size="lg" variant="outline" className="flex-1">
                  Export Analysis
                </Button>
                <Button size="lg" variant="outline" className="flex-1">
                  Save to Collection
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
