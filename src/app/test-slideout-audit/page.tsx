"use client";

import { useState } from "react";
import { 
  Play, 
  FileText, 
  Settings, 
  MessageSquare, 
  Video, 
  Lightbulb, 
  Users, 
  Code,
  Grid3X3,
  Layers
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import remaining slideout components for testing
import { FloatingVideoPlayer, useFloatingVideo } from "@/components/video/video-slideout-player";
import SlideoutWrapper from "@/components/standalone/slideout-wrapper";
import { 
  UnifiedSlideout, 
  useSlideout, 
  ClaudeArtifactConfig,
  VideoSlideoutConfig, 
  MarkdownSlideoutConfig,
  ModalOverlayConfig,
  CompactSlideoutConfig
} from "@/components/ui/unified-slideout";
import { Video as VideoType } from "@/lib/collections";
import { SlideoutTestCard } from "./_components/slideout-test-card";
import { slideoutTypes } from "./_components/slideout-types-data";
import { AnalysisContent } from "./_components/analysis-content";
import { ActiveSlideouts } from "./_components/active-slideouts";

// Mock data
const mockVideo: VideoType = {
  id: "test-video-1",
  title: "Amazing React Tips That Will Blow Your Mind!",
  originalUrl: "https://www.youtube.com/embed/wA_24AIXqgM",
  iframeUrl: "https://www.youtube.com/embed/wA_24AIXqgM",
  thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=600&fit=crop",
  thumbnailUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=600&fit=crop",
  duration: 135,
  platform: "tiktok" as const,
  caption: "Amazing React Tips That Will Blow Your Mind! Learn these pro techniques that will transform your React development workflow.",
  transcript: "Hey developers! Today I'm sharing the top React tips that will completely change how you write components. First, let's talk about custom hooks - they're game changers for code reusability. Next, we'll dive into performance optimization with React.memo and useMemo. Finally, I'll show you advanced patterns that will make your code cleaner and more maintainable.",
  metrics: {
    views: 847000,
    likes: 45200,
    comments: 1250,
    shares: 8900,
    saves: 12300,
  },
  metadata: {
    originalUrl: "https://www.youtube.com/embed/wA_24AIXqgM",
    platform: "tiktok",
    downloadedAt: new Date().toISOString(),
    author: "CodeMaster Pro",
    duration: 135,
    description: "Amazing React Tips That Will Blow Your Mind!",
    hashtags: ["#react", "#javascript", "#webdev", "#coding", "#tips"],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  addedAt: new Date().toISOString(),
};

// mockMarkdown removed as MarkdownSlideout component was deleted

interface SlideoutTestState {
  slideoutWrapper: boolean;
  unified: boolean;
  claudeArtifact: boolean;
  modalOverlay: boolean;
  compact: boolean;
}

export default function SlideoutAuditPage() {
  const [activeSlideouts, setActiveSlideouts] = useState<SlideoutTestState>({
    slideoutWrapper: false,
    unified: false,
    claudeArtifact: false,
    modalOverlay: false,
    compact: false,
  });

  const { isOpen: floatingOpen, currentVideo, openVideo, closeVideo } = useFloatingVideo();

  const toggleSlideout = (key: keyof SlideoutTestState) => {
    setActiveSlideouts(prev => ({
      ...prev,
      // eslint-disable-next-line security/detect-object-injection
      [key]: !prev[key]
    }));
  };



  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-foreground mb-4 text-3xl font-bold">Slideout Panel Audit</h1>
          <p className="text-muted-foreground text-lg">
            Comprehensive test page for all slideout panel implementations in the app. 
            Click the buttons below to test each slideout pattern and identify consolidation opportunities.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">{slideoutTypes.length}</div>
              <div className="text-muted-foreground text-sm">Total Implementations</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">3</div>
              <div className="text-muted-foreground text-sm">Sheet-based</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">3</div>
              <div className="text-muted-foreground text-sm">Transform-based</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">1</div>
              <div className="text-muted-foreground text-sm">Unified Solution</div>
            </CardContent>
          </Card>
        </div>

        {/* Slideout Tests */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview & Tests</TabsTrigger>
            <TabsTrigger value="analysis">Technical Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {slideoutTypes.map((slideout) => (
                <SlideoutTestCard
                  key={slideout.id}
                  slideout={slideout}
                  isActive={Boolean(activeSlideouts[slideout.id as keyof SlideoutTestState])}
                  onToggle={() => toggleSlideout(slideout.id as keyof SlideoutTestState)}
                  onFloatingTest={() => openVideo(mockVideo)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <AnalysisContent />
          </TabsContent>
        </Tabs>

        {/* Active Slideouts */}
        <ActiveSlideouts
          activeSlideouts={activeSlideouts}
          onToggle={toggleSlideout}
          floatingOpen={floatingOpen}
          currentVideo={currentVideo}
          onCloseVideo={closeVideo}
        />
      </div>
    </div>
  );
}
