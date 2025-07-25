"use client";

import { TweetStyleComposer } from "@/components/writing-panel/tweet-style-composer";

export default function TestTweetComposerPage() {
  return (
    <div className="bg-background min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Tweet-Style Composer for Short Form Videos</h1>
          <p className="text-muted-foreground">
            A TweetHunter-inspired interface optimized for short form video content creation and scheduling.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Main composer */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Video Script Composer</h2>
            <TweetStyleComposer />
          </div>

          {/* Feature showcase */}
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-medium">Key Features</h3>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>
                  • <strong>280 character limit</strong> optimized for short form video scripts
                </li>
                <li>
                  • <strong>Thread detection</strong> - automatically detects multi-part content
                </li>
                <li>
                  • <strong>4 tab interface</strong> - Compose, Drafts, Scheduled, Sent
                </li>
                <li>
                  • <strong>Real-time character count</strong> with visual feedback
                </li>
                <li>
                  • <strong>Scheduling interface</strong> with date/time picker
                </li>
                <li>
                  • <strong>Queue management</strong> for batch scheduling
                </li>
                <li>
                  • <strong>Advanced options</strong> for platform selection
                </li>
                <li>
                  • <strong>Auto-save functionality</strong> with visual indicators
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium">Usage Guide</h3>
              <div className="text-muted-foreground space-y-3 text-sm">
                <div>
                  <strong>Compose Tab:</strong> Write your video script with real-time character counting. Skip 3 lines
                  to create thread content.
                </div>
                <div>
                  <strong>Drafts Tab:</strong> View and manage saved drafts. Edit or delete as needed.
                </div>
                <div>
                  <strong>Scheduled Tab:</strong> See all queued content with scheduled times. Edit scheduling as
                  needed.
                </div>
                <div>
                  <strong>Sent Tab:</strong> Review all posted content with timestamps and performance tracking.
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium">Thread Support</h3>
              <p className="text-muted-foreground text-sm">
                The composer automatically detects thread content when you skip multiple lines. Perfect for creating
                multi-part video series or storytelling content.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
