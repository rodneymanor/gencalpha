"use client";

import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FloatingVideoPlayer, useFloatingVideo, ResponsiveLayout } from "@/components/video/video-slideout-player";
import { Video } from "@/lib/collections";

export default function TestSlideoutPage() {
  const { isOpen, currentVideo, openVideo, closeVideo } = useFloatingVideo();

  const testVideoData = {
    id: "test-1",
    title: "Amazing React Tips That Will Blow Your Mind!",
    originalUrl: "https://www.youtube.com/embed/wA_24AIXqgM",
    iframeUrl: "https://www.youtube.com/embed/wA_24AIXqgM",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=600&fit=crop",
    duration: 135,
    platform: "tiktok" as const,
    caption:
      "Amazing React Tips That Will Blow Your Mind! Learn these pro techniques that will transform your React development workflow. From state management to performance optimization, discover the secrets that senior developers don't want you to know!",
    transcript:
      "Hey developers! Today I'm sharing the top React tips that will completely change how you write components. First, let's talk about custom hooks - they're game changers for code reusability. Next, we'll dive into performance optimization with React.memo and useMemo. Finally, I'll show you advanced patterns that will make your code cleaner and more maintainable.",
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
  } as Video;

  return (
    <ResponsiveLayout>
      <div className="bg-background min-h-screen p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-foreground mb-8 text-3xl font-bold">Floating Video Player Test</h1>

          <div className="space-y-6">
            <div className="bg-card border-border rounded-[var(--radius-card)] border p-6">
              <h2 className="text-foreground mb-4 text-xl font-semibold">Floating Video Player Demo</h2>
              <p className="text-muted-foreground mb-4">
                Click the button below to open a floating video player. The player appears as a standalone floating
                window in the top-right corner, and the page content adjusts responsively to accommodate it naturally.
              </p>

              <Button onClick={() => openVideo(testVideoData)} className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Open Floating Player
              </Button>
            </div>

            <div className="bg-card border-border rounded-[var(--radius-card)] border p-6">
              <h3 className="text-foreground mb-3 text-lg font-semibold">Features Tested</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>✅ Appears as floating window in top-right corner</li>
                <li>✅ Integrates naturally with page layout (content adjusts)</li>
                <li>✅ Responsive design (adaptive on mobile/desktop)</li>
                <li>✅ Expandable/collapsible functionality</li>
                <li>✅ Proper Clarity Design System styling</li>
                <li>✅ Keyboard support (ESC to close)</li>
                <li>✅ Smooth transitions and animations</li>
                <li>✅ VideoInspirationPlayer integration</li>
              </ul>
            </div>

            <div className="bg-card border-border rounded-[var(--radius-card)] border p-6">
              <h3 className="text-foreground mb-3 text-lg font-semibold">Content Area</h3>
              <p className="text-muted-foreground mb-4">
                This content will adjust and reflow naturally when the floating player opens, demonstrating responsive
                integration.
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="bg-muted rounded-[var(--radius-card)] p-4">
                  <h4 className="text-foreground mb-2 font-medium">Sample Card 1</h4>
                  <p className="text-muted-foreground text-sm">
                    This card will adjust naturally when the floating player appears.
                  </p>
                </div>
                <div className="bg-muted rounded-[var(--radius-card)] p-4">
                  <h4 className="text-foreground mb-2 font-medium">Sample Card 2</h4>
                  <p className="text-muted-foreground text-sm">
                    Notice how the layout reflows responsively around the floating element.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <FloatingVideoPlayer isOpen={isOpen} onClose={closeVideo} video={currentVideo ?? testVideoData} />
        </div>
      </div>
    </ResponsiveLayout>
  );
}
