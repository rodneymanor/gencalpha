"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  SkeletonPageLayout,
  SkeletonChatPage,
  SkeletonVideoGrid,
  SkeletonChatList,
  ThinkingIndicator,
  ProgressivePageLoader,
  DataProgressiveLoader,
  ProgressiveContentLoader,
  useProgressiveLoading
} from "@/components/ui/loading";

export default function LoadingDemoPage() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const { stage, isLoading, startLoading, finishLoading, reset } = useProgressiveLoading();

  const demos = [
    {
      id: "page-skeleton",
      title: "Page Skeleton",
      description: "Full page skeleton layout with header, sidebar, and content",
      component: <SkeletonPageLayout />
    },
    {
      id: "chat-skeleton", 
      title: "Chat Skeleton",
      description: "Chat interface skeleton with sidebar and message area",
      component: <SkeletonChatPage />
    },
    {
      id: "video-grid",
      title: "Video Grid Skeleton",
      description: "Video grid loading with aspect ratio preserved",
      component: <SkeletonVideoGrid count={6} />
    },
    {
      id: "chat-messages",
      title: "Chat Messages Skeleton", 
      description: "Individual chat messages with avatars and text",
      component: <SkeletonChatList count={4} />
    },
    {
      id: "thinking",
      title: "AI Thinking Indicator",
      description: "Bouncing dots for AI processing states",
      component: (
        <div className="space-y-4 p-8">
          <ThinkingIndicator message="Analyzing your request" />
          <ThinkingIndicator message="Generating response" />
          <ThinkingIndicator message="" />
        </div>
      )
    }
  ];

  const SimulatedContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Content Loaded!</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Card {i}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This is the actual content that loaded after the skeleton.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Claude-Style Loading System</h1>
        <p className="text-muted-foreground text-lg">
          Demonstrate skeleton screens and progressive loading - no spinners allowed!
        </p>
      </div>

      {/* Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Skeleton Screen Demos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {demos.map(demo => (
              <Button
                key={demo.id}
                variant={activeDemo === demo.id ? "default" : "outline"}
                onClick={() => setActiveDemo(activeDemo === demo.id ? null : demo.id)}
                className="justify-start text-left h-auto p-3 flex-col items-start"
              >
                <span className="font-medium">{demo.title}</span>
                <span className="text-xs text-muted-foreground">{demo.description}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progressive Loading Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Progressive Loading Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={startLoading}
              disabled={isLoading}
            >
              Start Progressive Load
            </Button>
            <Button 
              onClick={finishLoading}
              variant="outline"
              disabled={!isLoading}
            >
              Finish Loading
            </Button>
            <Button 
              onClick={reset}
              variant="ghost"
            >
              Reset
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Current stage: <strong>{stage}</strong>
          </div>

          <div className="border rounded-lg p-4 min-h-[200px]">
            <ProgressiveContentLoader
              isLoading={isLoading}
              type="content"
              skeletonCount={4}
            >
              <SimulatedContent />
            </ProgressiveContentLoader>
          </div>
        </CardContent>
      </Card>

      {/* Data Loading Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Data Progressive Loader</CardTitle>
        </CardHeader>
        <CardContent>
          <DataProgressiveLoader
            data={activeDemo ? demos.find(d => d.id === activeDemo) : null}
            isLoading={false}
            skeleton={
              <div className="space-y-4">
                <div className="skeleton h-8 w-48" />
                <div className="skeleton h-32 w-full" />
              </div>
            }
          >
            {(demo) => (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">{demo.title}</h3>
                <p className="text-muted-foreground">{demo.description}</p>
                <div className="border rounded-lg p-4 bg-muted/20">
                  {demo.component}
                </div>
              </div>
            )}
          </DataProgressiveLoader>
        </CardContent>
      </Card>

      {/* Full Page Progressive Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Full Page Progressive Loader</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            This would typically wrap your entire page component for route transitions.
          </p>
          <div className="border rounded-lg overflow-hidden" style={{ height: "400px" }}>
            <ProgressivePageLoader type="page" duration={2000}>
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Page Fully Loaded!</h2>
                <p>This content appeared after the progressive loading sequence.</p>
              </div>
            </ProgressivePageLoader>
          </div>
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Loading System Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-green-600 mb-2">✅ Do This</h4>
              <ul className="space-y-2 text-sm">
                <li>• Use skeleton screens for layout loading</li>
                <li>• Show thinking dots for AI processing</li>
                <li>• Match skeleton shape to content</li>
                <li>• Use progressive disclosure</li>
                <li>• Maintain spatial awareness</li>
                <li>• Provide immediate visual feedback</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-red-600 mb-2">❌ Don't Do This</h4>
              <ul className="space-y-2 text-sm">
                <li>• Don't use spinners or loading wheels</li>
                <li>• Don't show generic "Loading..." text</li>
                <li>• Don't block the entire interface</li>
                <li>• Don't use progress bars for unknown duration</li>
                <li>• Don't show blank screens</li>
                <li>• Don't jarring transitions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}