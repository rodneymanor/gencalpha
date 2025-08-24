"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { UnifiedSlideout, useSlideout } from "@/components/ui/unified-slideout";
import { VideoInsightsPanel } from "@/components/video-insights-panel/video-insights-panel";
import { processScriptComponents } from "@/hooks/use-script-analytics";
import { VideoInsights } from "@/types/video-insights";

/**
 * Test page for VideoInsightsPanel integration with UnifiedSlideout
 * This demonstrates the modular approach where content handles its own header
 */
export default function TestVideoInsights() {
  const { isOpen, open, close } = useSlideout(false);

  // Mock video insights data for testing
  const sampleVideoInsights: VideoInsights = {
    id: "sample-video-1",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=600&fit=crop&crop=face",
    title: "How to Create Viral TikTok Content in 2025",
    scriptData: {
      id: "sample-script-1",
      title: "Viral TikTok Content Script",
      fullScript: `Stop scrolling! Did you know that 90% of viewers decide whether to keep watching in the first 3 seconds? Here's the secret that top creators don't want you to know...

I used to struggle with viewer retention too. My videos would get views but people would drop off immediately. Then I discovered this framework that changed everything. Let me show you exactly how it works...

The key is to structure your content in four parts: First, grab attention with a pattern interrupt. Second, build a bridge that creates relatability. Third, deliver massive value in a concise, actionable format. And finally, guide your viewer to take the next step. 

When you combine these elements with authentic storytelling and clear visuals, your engagement rates will skyrocket. This exact formula helped me go from 100 views to 100K in just 30 days.

Save this for your next video! Follow for more content creation tips that actually work. What type of videos are you creating? Let me know in the comments!`,
      components: processScriptComponents([
        {
          id: "hook-1",
          type: "hook",
          label: "Attention Grabber",
          content: "Stop scrolling! Did you know that 90% of viewers decide whether to keep watching in the first 3 seconds? Here's the secret that top creators don't want you to know...",
          icon: "H",
        },
        {
          id: "bridge-1",
          type: "bridge", 
          label: "Relatability Bridge",
          content: "I used to struggle with viewer retention too. My videos would get views but people would drop off immediately. Then I discovered this framework that changed everything. Let me show you exactly how it works...",
          icon: "B",
        },
        {
          id: "nugget-1",
          type: "nugget",
          label: "Golden Nugget",
          content: "The key is to structure your content in four parts: First, grab attention with a pattern interrupt. Second, build a bridge that creates relatability. Third, deliver massive value in a concise, actionable format. And finally, guide your viewer to take the next step.",
          icon: "G",
        },
        {
          id: "value-1",
          type: "value",
          label: "Value Proposition", 
          content: "When you combine these elements with authentic storytelling and clear visuals, your engagement rates will skyrocket. This exact formula helped me go from 100 views to 100K in just 30 days.",
          icon: "V",
        },
        {
          id: "cta-1",
          type: "cta",
          label: "Call to Action",
          content: "Save this for your next video! Follow for more content creation tips that actually work. What type of videos are you creating? Let me know in the comments!",
          icon: "C",
        },
      ]),
      metrics: {
        totalWords: 185,
        totalDuration: 28,
        avgWordsPerSecond: 6.6,
        readabilityScore: 82,
        engagementScore: 89,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ["viral", "tiktok", "content-creation", "engagement"],
      metadata: {
        platform: "tiktok",
        genre: "educational",
        targetAudience: "content-creators",
      },
    },
    metadata: {
      title: "How to Create Viral TikTok Content in 2025",
      duration: 28,
      resolution: "1080x1920",
      format: "mp4",
      platform: "tiktok",
      viewCount: 125400,
      likeCount: 8900,
      commentCount: 245,
      shareCount: 1200,
      uploadDate: new Date("2025-01-15"),
      tags: ["viral", "tiktok", "contentcreator", "tips", "2025", "engagement"],
      description: "Learn the exact framework that helped me go from 100 views to 100K in 30 days. This step-by-step guide reveals the secret structure that top creators use to create viral content consistently.",
      author: {
        name: "@ContentCreatorPro",
        verified: true,
      },
    },
    suggestions: {
      hooks: [
        {
          id: "hook-question",
          type: "question",
          content: "What if I told you that one simple change to your first 3 seconds could 10x your views?",
          strength: "high",
          rationale: "Questions create psychological curiosity gaps that viewers feel compelled to fill",
          estimatedEngagement: 85,
        },
        {
          id: "hook-statistic",
          type: "statistic",
          content: "89% of viral videos use this exact opening pattern - and most creators have no idea",
          strength: "high",
          rationale: "Statistics provide credibility and create urgency through scarcity",
          estimatedEngagement: 82,
        },
        {
          id: "hook-statement",
          type: "statement",
          content: "This is the difference between 100 views and 100,000 views",
          strength: "medium",
          rationale: "Clear contrast statements work well but lack emotional hook",
          estimatedEngagement: 72,
        },
      ],
      content: [
        {
          id: "improve-opening",
          type: "improvement",
          target: "opening",
          suggestion: "Consider adding a visual pattern interrupt in the first frame to complement the verbal hook",
          impact: "high",
          effort: "medium",
        },
        {
          id: "add-testimonial",
          type: "addition", 
          target: "middle",
          suggestion: "Include a brief success story or before/after comparison to strengthen credibility",
          impact: "medium",
          effort: "low",
        },
        {
          id: "restructure-cta",
          type: "restructure",
          target: "closing",
          suggestion: "Move the 'follow' CTA earlier and end with a question to boost comments",
          impact: "medium",
          effort: "low",
        },
      ],
    },
    analysis: {
      readability: {
        score: 82,
        grade: "8th Grade",
        complexity: "medium",
        sentenceLength: {
          average: 12.4,
          longest: 28,
          shortest: 3,
        },
        wordComplexity: {
          simple: 165,
          complex: 20,
          percentage: 89.2,
        },
        recommendations: [
          "Excellent use of conversational tone",
          "Consider breaking up the longest sentence for better flow",
          "Strong use of action words and clear language",
        ],
      },
      engagement: {
        hookStrength: 89,
        paceVariation: 76,
        emotionalTone: {
          positive: 72,
          negative: 8,
          neutral: 20,
        },
        callToActionStrength: 85,
        retentionPotential: 88,
        predictedDropoffPoints: [
          {
            timestamp: 8.5,
            reason: "Transition could be smoother between hook and bridge",
            confidence: 0.72,
          },
          {
            timestamp: 22.1,
            reason: "Dense information section - consider adding visual break",
            confidence: 0.68,
          },
        ],
      },
      seo: {
        keywordDensity: [
          { word: "content", count: 8, density: 4.3 },
          { word: "creators", count: 6, density: 3.2 },
          { word: "viral", count: 5, density: 2.7 },
          { word: "engagement", count: 4, density: 2.2 },
          { word: "framework", count: 3, density: 1.6 },
        ],
        titleOptimization: {
          score: 85,
          suggestions: [
            "Consider adding year (2025) for recency",
            "Add emotional trigger words like 'secret' or 'proven'",
          ],
        },
        descriptionOptimization: {
          score: 78,
          suggestions: [
            "Include relevant hashtags in description",
            "Add call-to-action in description",
            "Mention specific results/metrics",
          ],
        },
        hashtagSuggestions: [
          "viral",
          "contentcreator", 
          "tiktoktips",
          "socialmedia",
          "engagement",
          "creator",
          "viral2025",
          "contentmarketing",
        ],
      },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const handleCopy = (content: string, componentType?: string) => {
    console.log(`Copied ${componentType ?? "content"}:`, content);
    // Here you could add analytics tracking, notifications, etc.
  };

  const handleDownload = (videoInsights: VideoInsights) => {
    console.log("Downloaded video insights:", videoInsights.title);
    // Here you could add analytics tracking
  };

  const handleVideoPlay = () => {
    console.log("Video started playing");
    // Here you could add video analytics tracking
  };

  const handleVideoPause = () => {
    console.log("Video paused");
    // Here you could add video analytics tracking
  };

  return (
    <div className="p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-neutral-900">
            Video Insights Panel Test
          </h1>
          <p className="text-neutral-600">
            This test page demonstrates the VideoInsightsPanel component integration with the UnifiedSlideout system.
            The panel includes video player, transcript, components, metadata, suggestions, and analysis tabs.
          </p>
        </div>

        <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100/50 p-6">
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">Features Demonstrated</h2>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li>• <strong>Video Player:</strong> 9:16 aspect ratio with playback controls</li>
            <li>• <strong>Transcript View:</strong> Full script with copy functionality</li>
            <li>• <strong>Components View:</strong> Individual script components with metrics</li>
            <li>• <strong>Metadata:</strong> Video statistics and engagement metrics</li>
            <li>• <strong>Suggestions:</strong> Hook ideas and content improvements</li>
            <li>• <strong>Analysis:</strong> Readability, engagement, and SEO analysis</li>
            <li>• <strong>Exact Styling:</strong> Matches ScriptPanel design patterns</li>
            <li>• <strong>Responsive Design:</strong> Works across all screen sizes</li>
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100/50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-neutral-900">Video Stats</h3>
            <div className="space-y-1 text-xs text-neutral-600">
              <div>Views: {sampleVideoInsights.metadata.viewCount?.toLocaleString()}</div>
              <div>Likes: {sampleVideoInsights.metadata.likeCount?.toLocaleString()}</div>
              <div>Comments: {sampleVideoInsights.metadata.commentCount}</div>
              <div>Duration: {sampleVideoInsights.metadata.duration}s</div>
            </div>
          </div>

          <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100/50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-neutral-900">Analysis Scores</h3>
            <div className="space-y-1 text-xs text-neutral-600">
              <div>Readability: {sampleVideoInsights.analysis.readability.score}/100</div>
              <div>Hook Strength: {sampleVideoInsights.analysis.engagement.hookStrength}/100</div>
              <div>Retention: {sampleVideoInsights.analysis.engagement.retentionPotential}/100</div>
              <div>CTA Strength: {sampleVideoInsights.analysis.engagement.callToActionStrength}/100</div>
            </div>
          </div>
        </div>

        <Button onClick={open} className="w-full">
          Open Video Insights Panel
        </Button>

        <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-4">
          <h3 className="mb-2 font-medium text-neutral-900">Usage Code:</h3>
          <pre className="overflow-x-auto rounded-[var(--radius-button)] bg-neutral-100 p-3 text-xs text-neutral-600">
{`import { UnifiedSlideout, useSlideout } from "@/components/ui/unified-slideout";
import { VideoInsightsPanel } from "@/components/video-insights-panel";

function MyComponent() {
  const { isOpen, open, close } = useSlideout();
  
  return (
    <>
      <Button onClick={open}>Show Video Insights</Button>
      
      <UnifiedSlideout
        isOpen={isOpen}
        onClose={close}
        config={{
          showHeader: false,  // Let VideoInsightsPanel handle its own header
          width: "lg"
        }}
      >
        <VideoInsightsPanel
          videoInsights={videoInsights}
          onCopy={handleCopy}
          onDownload={handleDownload}
          onVideoPlay={handleVideoPlay}
          onVideoPause={handleVideoPause}
          onClose={close}
        />
      </UnifiedSlideout>
    </>
  );
}`}
          </pre>
        </div>
      </div>

      {/* The actual slideout implementation */}
      <UnifiedSlideout
        isOpen={isOpen}
        onClose={close}
        config={{
          showHeader: false, // No header - let VideoInsightsPanel handle it
          width: "lg", // 600px width for comfortable viewing
          variant: "artifact", // Claude-style visual treatment
          showCloseButton: true, // VideoInsightsPanel has its own close button
          backdrop: false, // Non-modal behavior
          position: "right",
          modal: false,
          animationType: "claude",
          adjustsContent: true,
        }}
      >
        <VideoInsightsPanel
          videoInsights={sampleVideoInsights}
          onCopy={handleCopy}
          onDownload={handleDownload}
          onVideoPlay={handleVideoPlay}
          onVideoPause={handleVideoPause}
          onClose={close}
          showDownload={true}
          showMetrics={true}
        />
      </UnifiedSlideout>
    </div>
  );
}