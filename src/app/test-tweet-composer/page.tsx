"use client";

import { TweetStyleComposer } from "@/components/writing-panel/tweet-style-composer";

export default function TestTweetComposerPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tweet-Style Composer for Short Form Videos</h1>
          <p className="text-muted-foreground">
            A TweetHunter-inspired interface optimized for short form video content creation and scheduling.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main composer */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Video Script Composer</h2>
            <TweetStyleComposer />
          </div>
          
          {/* Feature showcase */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Key Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>280 character limit</strong> optimized for short form video scripts</li>
                <li>• <strong>Thread detection</strong> - automatically detects multi-part content</li>
                <li>• <strong>4 tab interface</strong> - Compose, Drafts, Scheduled, Sent</li>
                <li>• <strong>Real-time character count</strong> with visual feedback</li>
                <li>• <strong>Scheduling interface</strong> with date/time picker</li>
                <li>• <strong>Queue management</strong> for batch scheduling</li>
                <li>• <strong>Advanced options</strong> for platform selection</li>
                <li>• <strong>Auto-save functionality</strong> with visual indicators</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Usage Guide</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <strong>Compose Tab:</strong> Write your video script with real-time character counting. Skip 3 lines to create thread content.
                </div>
                <div>
                  <strong>Drafts Tab:</strong> View and manage saved drafts. Edit or delete as needed.
                </div>
                <div>
                  <strong>Scheduled Tab:</strong> See all queued content with scheduled times. Edit scheduling as needed.
                </div>
                <div>
                  <strong>Sent Tab:</strong> Review all posted content with timestamps and performance tracking.
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Thread Support</h3>
              <p className="text-sm text-muted-foreground">
                The composer automatically detects thread content when you skip multiple lines. 
                Perfect for creating multi-part video series or storytelling content.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}