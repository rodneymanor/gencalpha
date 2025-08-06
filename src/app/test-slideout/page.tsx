"use client";

import { VideoSlideoutPlayer, useVideoSlideout } from '@/components/video/video-slideout-player';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

export default function TestSlideoutPage() {
  const { isOpen, currentVideo, openSlideout, closeSlideout } = useVideoSlideout();

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
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Video Slideout Player Test</h1>
        
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-[var(--radius-card)] border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Component Demo</h2>
            <p className="text-muted-foreground mb-4">
              Click the button below to test the floating video slideout player. The player will slide in from the right 
              and push the content to make room rather than overlay it.
            </p>
            
            <Button 
              onClick={() => openSlideout(testVideoData)}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Open Video Slideout
            </Button>
          </div>

          <div className="bg-card p-6 rounded-[var(--radius-card)] border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-3">Features Tested</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>✅ Slides in from right with smooth ease-out transition</li>
              <li>✅ Pushes content instead of overlaying</li>
              <li>✅ Responsive design (different sizes on mobile/desktop)</li>
              <li>✅ Expandable/collapsible functionality</li>
              <li>✅ Proper Clarity Design System styling</li>
              <li>✅ Keyboard support (ESC to close)</li>
              <li>✅ Integration with VideoInspirationPlayer</li>
            </ul>
          </div>

          <div className="bg-card p-6 rounded-[var(--radius-card)] border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-3">Content Area</h3>
            <p className="text-muted-foreground mb-4">
              This content will be pushed to the left when the slideout opens, demonstrating the non-overlay behavior.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-[var(--radius-card)]">
                <h4 className="font-medium text-foreground mb-2">Sample Card 1</h4>
                <p className="text-sm text-muted-foreground">
                  This card will move smoothly when the slideout opens.
                </p>
              </div>
              <div className="bg-muted p-4 rounded-[var(--radius-card)]">
                <h4 className="font-medium text-foreground mb-2">Sample Card 2</h4>
                <p className="text-sm text-muted-foreground">
                  Watch how the layout adjusts responsively.
                </p>
              </div>
            </div>
          </div>
        </div>

        <VideoSlideoutPlayer
          isOpen={isOpen}
          onClose={closeSlideout}
          videoData={currentVideo || undefined}
        />
      </div>
    </div>
  );
}