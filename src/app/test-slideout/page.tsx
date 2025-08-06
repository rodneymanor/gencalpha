"use client";

import { FloatingVideoPlayer, useFloatingVideo, ResponsiveLayout } from '@/components/video/video-slideout-player';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

export default function TestSlideoutPage() {
  const { isOpen, currentVideo, openVideo, closeVideo } = useFloatingVideo();

  const testVideoData = {
    id: 'test-1',
    title: 'Amazing React Tips That Will Blow Your Mind!',
    url: 'https://www.youtube.com/embed/wA_24AIXqgM',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=600&fit=crop',
    duration: '2:15',
    views: '847K',
    platform: 'tiktok' as const,
    author: 'CodeMaster Pro',
    followers: '2.3M'
  };

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">Floating Video Player Test</h1>
          
          <div className="space-y-6">
            <div className="bg-card p-6 rounded-[var(--radius-card)] border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">Floating Video Player Demo</h2>
              <p className="text-muted-foreground mb-4">
                Click the button below to open a floating video player. The player appears as a standalone floating window 
                in the top-right corner, and the page content adjusts responsively to accommodate it naturally.
              </p>
              
              <Button 
                onClick={() => openVideo(testVideoData)}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Open Floating Player
              </Button>
            </div>

            <div className="bg-card p-6 rounded-[var(--radius-card)] border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-3">Features Tested</h3>
              <ul className="space-y-2 text-muted-foreground">
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

            <div className="bg-card p-6 rounded-[var(--radius-card)] border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-3">Content Area</h3>
              <p className="text-muted-foreground mb-4">
                This content will adjust and reflow naturally when the floating player opens, demonstrating responsive integration.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-[var(--radius-card)]">
                  <h4 className="font-medium text-foreground mb-2">Sample Card 1</h4>
                  <p className="text-sm text-muted-foreground">
                    This card will adjust naturally when the floating player appears.
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-[var(--radius-card)]">
                  <h4 className="font-medium text-foreground mb-2">Sample Card 2</h4>
                  <p className="text-sm text-muted-foreground">
                    Notice how the layout reflows responsively around the floating element.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <FloatingVideoPlayer
            isOpen={isOpen}
            onClose={closeVideo}
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            videoData={currentVideo || undefined}
          />
        </div>
      </div>
    </ResponsiveLayout>
  );
}