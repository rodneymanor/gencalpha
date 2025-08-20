"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { UnifiedSlideout, useSlideout } from "@/components/ui/unified-slideout";
import { processScriptComponents } from "@/hooks/use-script-analytics";
import { ScriptData } from "@/types/script-panel";

import { ScriptPanel } from "./script-panel";

/**
 * Example implementation showing how to integrate ScriptPanel with UnifiedSlideout
 * This demonstrates the modular approach where content handles its own header
 */
export function ScriptPanelExample() {
  const { isOpen, open, close } = useSlideout(false);

  // Example script data
  const sampleScriptData: ScriptData = {
    id: "sample-script-1",
    title: "Content Creation Tips Video Script",
    fullScript: `Stop scrolling! Did you know that 90% of viewers decide whether to keep watching in the first 3 seconds? Here's the secret that top creators don't want you to know...

I used to struggle with viewer retention too. My videos would get views but people would drop off immediately. Then I discovered this framework that changed everything. Let me show you exactly how it works...

The key is to structure your content in four parts: First, grab attention with a pattern interrupt. Second, build a bridge that creates relatability. Third, deliver massive value in a concise, actionable format. And finally, guide your viewer to take the next step. When you combine these elements with authentic storytelling and clear visuals, your engagement rates will skyrocket. This exact formula helped me go from 100 views to 100K in just 30 days.

Save this for your next video! Follow for more content creation tips that actually work. What type of videos are you creating? Let me know in the comments!`,
    components: processScriptComponents([
      {
        id: "hook-1",
        type: "hook",
        label: "Hook",
        content:
          "Stop scrolling! Did you know that 90% of viewers decide whether to keep watching in the first 3 seconds? Here's the secret that top creators don't want you to know...",
        icon: "H",
      },
      {
        id: "bridge-1",
        type: "bridge",
        label: "Bridge",
        content:
          "I used to struggle with viewer retention too. My videos would get views but people would drop off immediately. Then I discovered this framework that changed everything. Let me show you exactly how it works...",
        icon: "B",
      },
      {
        id: "nugget-1",
        type: "nugget",
        label: "Golden Nugget",
        content:
          "The key is to structure your content in four parts: First, grab attention with a pattern interrupt. Second, build a bridge that creates relatability. Third, deliver massive value in a concise, actionable format. And finally, guide your viewer to take the next step. When you combine these elements with authentic storytelling and clear visuals, your engagement rates will skyrocket. This exact formula helped me go from 100 views to 100K in just 30 days.",
        icon: "G",
      },
      {
        id: "cta-1",
        type: "cta",
        label: "Call to Action",
        content:
          "Save this for your next video! Follow for more content creation tips that actually work. What type of videos are you creating? Let me know in the comments!",
        icon: "C",
      },
    ]),
    metrics: {
      totalWords: 161,
      totalDuration: 24,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ["content-creation", "video-tips", "engagement"],
    metadata: {
      platform: "tiktok",
      genre: "educational",
      targetAudience: "content-creators",
    },
  };

  const handleCopy = (content: string, componentType?: string) => {
    console.log(`Copied ${componentType ?? "content"}:`, content);
    // Here you could add analytics tracking, notifications, etc.
  };

  const handleDownload = (scriptData: ScriptData) => {
    console.log("Downloaded script:", scriptData.title);
    // Here you could add analytics tracking
  };

  return (
    <div className="p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-foreground mb-2 text-2xl font-bold">Script Panel Integration Example</h1>
          <p className="text-muted-foreground">
            This example demonstrates how to integrate the ScriptPanel component with the UnifiedSlideout system using
            the modular approach where content handles its own header and layout.
          </p>
        </div>

        <div className="bg-muted/50 border-border rounded-[var(--radius-card)] border p-6">
          <h2 className="text-foreground mb-3 text-lg font-semibold">Features Demonstrated</h2>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li>
              • <strong>Modular Content:</strong> ScriptPanel handles its own header, tabs, and layout
            </li>
            <li>
              • <strong>No Default Header:</strong> UnifiedSlideout shows no header when showHeader=false
            </li>
            <li>
              • <strong>Full Height:</strong> Content component takes full slideout height
            </li>
            <li>
              • <strong>Copy Functionality:</strong> Individual components and full script copying
            </li>
            <li>
              • <strong>Download Support:</strong> Script export in multiple formats
            </li>
            <li>
              • <strong>Script Analytics:</strong> Word count and duration calculation
            </li>
            <li>
              • <strong>Responsive Design:</strong> Works across all screen sizes
            </li>
          </ul>
        </div>

        <Button onClick={open} className="w-full">
          Open Script Panel
        </Button>

        <div className="bg-card border-border rounded-[var(--radius-card)] border p-4">
          <h3 className="text-foreground mb-2 font-medium">Usage Code:</h3>
          <pre className="text-muted-foreground bg-muted overflow-x-auto rounded-[var(--radius-button)] p-3 text-xs">
            {`import { UnifiedSlideout, useSlideout } from "@/components/ui/unified-slideout";
import { ScriptPanel } from "@/components/script-panel";

function MyComponent() {
  const { isOpen, open, close } = useSlideout();
  
  return (
    <>
      <Button onClick={open}>Show Script</Button>
      
      <UnifiedSlideout
        isOpen={isOpen}
        onClose={close}
        config={{
          showHeader: false,  // Let ScriptPanel handle its own header
          width: "lg"
        }}
      >
        <ScriptPanel
          scriptData={scriptData}
          onCopy={handleCopy}
          onDownload={handleDownload}
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
          showHeader: false, // No header - let ScriptPanel handle it
          width: "lg", // 600px width for comfortable reading
          variant: "artifact", // Claude-style visual treatment
          showCloseButton: true, // ScriptPanel has its own close button
          backdrop: false, // Non-modal behavior
          position: "right",
          modal: false,
        }}
      >
        <ScriptPanel
          scriptData={sampleScriptData}
          onCopy={handleCopy}
          onDownload={handleDownload}
          onClose={close}
          showDownload={true}
          showMetrics={true}
        />
      </UnifiedSlideout>
    </div>
  );
}

export default ScriptPanelExample;
