"use client";

import { useState } from "react";

import Image from "next/image";

import { Play, BarChart3, Brain, Sparkles } from "lucide-react";

import { SlideoutWrapper } from "@/components/standalone/slideout-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { FloatingVideoAnalyzer } from "./_components/floating-video-analyzer";
import { VideoAnalyzerHeader } from "./_components/video-analyzer-header";
import { VideoAnalyzerSlideout } from "./_components/video-analyzer-slideout";

export default function TestVideoAnalyzerPage() {
  const [floatingOpen, setFloatingOpen] = useState(false);

  // Sample video data using the provided Instagram reel
  const sampleVideo = {
    id: "test-video-1",
    url: "https://www.instagram.com/reel/DFHBn9ivItf/",
    title: "Sample Instagram Reel",
    thumbnailUrl:
      "https://scontent-lax3-1.cdninstagram.com/v/t51.29350-15/468655748_1087615096363547_5446736584726089938_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=18de74&_nc_ohc=7-9QrwKNwl0Q7kNvgGO8HA7&_nc_zt=23&_nc_ht=scontent-lax3-1.cdninstagram.com&edm=ACx9VUEBAAAA&oh=00_AYCwS7VU8kKQ7QE7XHpCVJtOGwdOa7jR4xw6V6_Z1qfZbQ&oe=6760FBCF",
    transcript:
      "Welcome to today's video where we'll be discussing the latest trends in social media marketing. First, let's talk about the importance of authentic content. Authenticity has become the cornerstone of successful social media strategies. When you create content that genuinely reflects your brand's values and personality, your audience can sense that authenticity. This builds trust, which is invaluable in today's digital landscape. Next, we need to understand the power of storytelling. Every piece of content should tell a story. Whether it's a simple product showcase or a behind-the-scenes look at your company, narrative structure helps your audience connect emotionally with your brand. Finally, consistency is key. Regular posting schedules, consistent visual branding, and a cohesive voice across all platforms help establish your brand's presence and keep your audience engaged.",
    components: {
      hook: "Welcome to today's video where we'll be discussing the latest trends in social media marketing.",
      bridge: "First, let's talk about the importance of authentic content and how it builds trust with your audience.",
      nugget:
        "Authenticity has become the cornerstone of successful social media strategies - when you create content that genuinely reflects your brand's values, your audience can sense that authenticity and trust is built.",
      wta: "Make sure to implement these three key strategies in your next social media campaign and watch your engagement soar!",
    },
    metadata: {
      author: "marketing_guru",
      description:
        "Discover the top 3 social media marketing trends that are transforming how brands connect with their audiences. Learn actionable strategies you can implement today! #SocialMediaMarketing #ContentStrategy #DigitalMarketing #BrandAuthenticity",
      platform: "instagram",
      duration: 45,
    },
    metrics: {
      likes: 12500,
      comments: 342,
      saves: 1890,
      shares: 567,
    },
    hashtags: ["SocialMediaMarketing", "ContentStrategy", "DigitalMarketing", "BrandAuthenticity"],
    addedAt: new Date().toISOString(),
    deepAnalysis: {
      contentThemes: [
        "Authenticity in brand messaging",
        "Storytelling techniques for engagement",
        "Consistency in brand voice and visual identity",
        "Building trust through genuine content",
        "Emotional connection with audience",
      ],
      targetAudience: "Social media managers, content creators, marketing professionals, small business owners",
      emotionalTriggers: [
        "Trust and reliability",
        "Professional growth and success",
        "Audience connection and engagement",
        "Brand authenticity and values",
      ],
      scriptStructure: {
        introduction: "Hook grabs attention with promise of valuable marketing insights",
        body: "Three-part structure covering authenticity, storytelling, and consistency",
        conclusion: "Call-to-action encouraging implementation of strategies",
      },
      visualElements: [
        "Clean, professional background setup",
        "Engaging hand gestures and body language",
        "Direct eye contact with camera",
        "Consistent lighting and framing",
      ],
      performanceFactors: [
        "Clear, authoritative delivery",
        "Structured content presentation",
        "Actionable advice format",
        "Professional yet approachable tone",
      ],
      recommendedImprovements: [
        "Add specific examples or case studies",
        "Include visual aids or graphics",
        "Create shorter, more digestible segments",
        "Add interactive elements or questions",
      ],
    },
  };

  // Define custom slideout options for video analyzer
  const videoAnalyzerOptions = [
    {
      key: "video-analyzer",
      label: "Video Analysis",
      component: <VideoAnalyzerSlideout video={sampleVideo} />,
    },
  ];

  // Custom header for video analyzer with creator info
  const customHeaderActions = <VideoAnalyzerHeader video={sampleVideo} />;

  return (
    <SlideoutWrapper
      customOptions={videoAnalyzerOptions}
      customHeaderActions={customHeaderActions}
      defaultSelectedOption="video-analyzer"
      openEvents={["video-analyzer:open"]}
      closeEvents={["video-analyzer:close"]}
      slideoutWidth="wide"
      slideout={null}
    >
      <div className="bg-background min-h-screen p-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-foreground mb-4 text-3xl font-bold">Video Analyzer Slideout Test</h1>
            <p className="text-muted-foreground text-lg">
              Compare floating vs right slideout panels for the video analyzer
            </p>
          </div>

          {/* Sample Video Card */}
          <div className="mb-8">
            <Card className="mx-auto max-w-md">
              <CardContent className="p-6">
                <div className="mb-4 aspect-[9/16] overflow-hidden rounded-[var(--radius-card)] bg-black">
                  <Image
                    src={sampleVideo.thumbnailUrl}
                    alt="Video thumbnail"
                    width={280}
                    height={500}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-foreground font-semibold">@{sampleVideo.metadata.author}</h3>
                  <p className="text-muted-foreground line-clamp-2 text-sm">{sampleVideo.metadata.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Play className="h-4 w-4" />
                      {sampleVideo.metrics.likes.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4" />
                      {sampleVideo.metrics.comments.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Test Buttons */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Floating Slideout */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 text-center">
                  <div className="bg-primary/10 text-primary mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-foreground mb-2 text-xl font-semibold">Floating Slideout</h3>
                  <p className="text-muted-foreground text-sm">
                    Right-side floating panel with backdrop blur, similar to the current video slideout
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="text-muted-foreground text-sm">
                    <strong>Pros:</strong>
                    <ul className="mt-1 ml-4 list-disc space-y-1">
                      <li>Familiar pattern to users</li>
                      <li>Maintains page context</li>
                      <li>Easy to dismiss</li>
                      <li>Good for quick analysis</li>
                    </ul>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    <strong>Cons:</strong>
                    <ul className="mt-1 ml-4 list-disc space-y-1">
                      <li>Limited vertical space</li>
                      <li>May feel cramped on mobile</li>
                      <li>Overlays content behind</li>
                    </ul>
                  </div>
                  <Button onClick={() => setFloatingOpen(true)} className="w-full" size="lg">
                    Test Floating Slideout
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Right Slideout Panel */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 text-center">
                  <div className="bg-secondary/10 text-secondary mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                    <Brain className="h-6 w-6" />
                  </div>
                  <h3 className="text-foreground mb-2 text-xl font-semibold">Right Slideout Panel</h3>
                  <p className="text-muted-foreground text-sm">
                    Right-side panel that slides in from the edge, part of page layout (no overlay)
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="text-muted-foreground text-sm">
                    <strong>Pros:</strong>
                    <ul className="mt-1 ml-4 list-disc space-y-1">
                      <li>Part of page layout (no overlay)</li>
                      <li>Smooth slide animation</li>
                      <li>Content area resizes responsively</li>
                      <li>Always attached to right edge</li>
                    </ul>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    <strong>Cons:</strong>
                    <ul className="mt-1 ml-4 list-disc space-y-1">
                      <li>Reduces main content width</li>
                      <li>May feel cramped on smaller screens</li>
                      <li>Fixed panel size</li>
                    </ul>
                  </div>
                  <Button
                    onClick={() => {
                      // Trigger the video analyzer slideout open event
                      window.dispatchEvent(new CustomEvent("video-analyzer:open"));
                    }}
                    className="w-full"
                    size="lg"
                    variant="secondary"
                  >
                    Test Slideout Panel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Notes */}
          <div className="mt-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-foreground mb-3 text-lg font-semibold">Test Instructions</h3>
                <div className="text-muted-foreground space-y-2 text-sm">
                  <p>
                    <strong>1.</strong> Click each button to test the different slideout patterns
                  </p>
                  <p>
                    <strong>2.</strong> Pay attention to the user experience, space utilization, and overall feel
                  </p>
                  <p>
                    <strong>3.</strong> Consider how each would work for different use cases:
                  </p>
                  <ul className="mt-1 ml-6 list-disc space-y-1">
                    <li>Quick video insights and analysis</li>
                    <li>Deep-dive content analysis</li>
                    <li>Script component breakdown</li>
                    <li>Performance metrics review</li>
                  </ul>
                  <p>
                    <strong>4.</strong> Test on different screen sizes if possible
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Video Analyzer Component */}
      <FloatingVideoAnalyzer isOpen={floatingOpen} onClose={() => setFloatingOpen(false)} video={sampleVideo} />
    </SlideoutWrapper>
  );
}
