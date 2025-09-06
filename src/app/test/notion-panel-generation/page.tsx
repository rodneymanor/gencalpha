"use client";

import React, { useState } from "react";

import dynamic from "next/dynamic";

import {
  ChevronsRight,
  Maximize,
  Minimize,
  FileText,
  Sparkles,
  Check,
  Clock,
  AlertCircle,
  Copy,
  Download,
} from "lucide-react";

import { NotionPanel } from "@/components/panels/notion";

// Dynamically import BlockNote to avoid SSR issues
const BlockNoteEditor = dynamic(() => import("@/components/editor/block-note-editor"), {
  ssr: false,
  loading: () => <div className="h-20 animate-pulse rounded bg-neutral-100" />,
});

// Generation status options
const GENERATION_STATUSES = [
  { label: "Hooks Ready", color: "success" },
  { label: "Script Ready", color: "success" },
  { label: "Content Ready", color: "success" },
  { label: "Hooks + Script", color: "warning" },
  { label: "Script + Content", color: "warning" },
  { label: "All Generated", color: "success" },
  { label: "Pending", color: "default" },
  { label: "Processing", color: "warning" },
  { label: "Failed", color: "error" },
];

export default function NotionPanelGenerationTest() {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isNewIdea, setIsNewIdea] = useState(false);
  const [panelWidth, setPanelWidth] = useState(600);
  const [title, setTitle] = useState("Content Generation Idea");
  const [editorContent, setEditorContent] = useState("");
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);

  // Properties including URL and generation status
  const [properties, setProperties] = useState([
    {
      id: "1",
      type: "url" as const,
      name: "URL",
      value: "",
      icon: "link",
    },
    {
      id: "2",
      type: "status" as const,
      name: "Generation",
      value: GENERATION_STATUSES[0],
      icon: "burst",
    },
  ]);

  const cycleStatus = () => {
    const nextIndex = (currentStatusIndex + 1) % GENERATION_STATUSES.length;
    setCurrentStatusIndex(nextIndex);
    setProperties((prev) =>
      prev.map((prop) => {
        if (prop.id === "2" && prop.type === "status") {
          return { ...prop, value: GENERATION_STATUSES[nextIndex] };
        }
        return prop;
      }),
    );
  };

  const handlePropertyChange = async (id: string, value: string | { label: string; color: string }) => {
    setProperties((prev) => prev.map((prop) => (prop.id === id ? { ...prop, value } : prop)));

    // If URL field is updated, fetch the page title
    if (id === "1" && typeof value === "string" && value) {
      try {
        // Try to fetch the title from the URL
        const response = await fetch("/api/fetch-title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: value }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.title) {
            setTitle(data.title);
          }
        } else {
          // Fallback: extract domain name as title
          try {
            const url = new URL(value);
            const domain = url.hostname.replace("www.", "");
            setTitle(domain.charAt(0).toUpperCase() + domain.slice(1));
          } catch {
            // If URL is invalid, keep the current title
          }
        }
      } catch (error) {
        console.error("Error fetching title:", error);
        // Fallback: use URL hostname as title
        try {
          const url = new URL(value);
          const domain = url.hostname.replace("www.", "");
          setTitle(domain.charAt(0).toUpperCase() + domain.slice(1));
        } catch {
          // If URL is invalid, keep the current title
        }
      }
    }
  };

  const getStatusIcon = (status: string) => {
    if (status.includes("Ready") || status === "All Generated") return <Check className="h-4 w-4" />;
    if (status === "Processing") return <Clock className="h-4 w-4" />;
    if (status === "Failed") return <AlertCircle className="h-4 w-4" />;
    return <Sparkles className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Main Content Area - Responsive to panel */}
      <div
        className="p-8 transition-all duration-300"
        style={{
          marginRight: isPanelOpen && !isFullScreen ? `${panelWidth}px` : "0",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-4 text-3xl font-bold text-neutral-900">Generation Status Panel Test</h1>
          <p className="mb-8 text-neutral-600">Test different generation status states for content ideas.</p>

          {/* Test Controls */}
          <div className="mb-6 rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-soft-drop)]">
            <h2 className="mb-4 text-xl font-semibold text-neutral-900">Status Controls</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                className="rounded-[var(--radius-button)] bg-neutral-900 px-4 py-2 text-neutral-50 transition-colors duration-150 hover:bg-neutral-800"
              >
                {isPanelOpen ? "Close Panel" : "Open Panel"}
              </button>
              <button
                onClick={() => {
                  setIsNewIdea(!isNewIdea);
                  if (!isNewIdea) {
                    setTitle("");
                    setProperties([
                      { id: "1", type: "url" as const, name: "URL", value: "", icon: "link" },
                      { id: "2", type: "status" as const, name: "Generation", value: "", icon: "burst" },
                    ]);
                  } else {
                    setTitle("Content Generation Idea");
                    setProperties([
                      { id: "1", type: "url" as const, name: "URL", value: "", icon: "link" },
                      {
                        id: "2",
                        type: "status" as const,
                        name: "Generation",
                        value: GENERATION_STATUSES[0],
                        icon: "burst",
                      },
                    ]);
                  }
                }}
                className="bg-success-500 hover:bg-success-600 rounded-[var(--radius-button)] px-4 py-2 text-white transition-colors duration-150"
              >
                {isNewIdea ? "Exit New Idea Mode" : "New Idea Mode"}
              </button>
              <button
                onClick={cycleStatus}
                className="bg-primary-500 hover:bg-primary-600 rounded-[var(--radius-button)] px-4 py-2 text-white transition-colors duration-150"
                disabled={isNewIdea}
              >
                Cycle Status
              </button>
              <div className="flex items-center gap-2 rounded-[var(--radius-button)] bg-neutral-100 px-3 py-2">
                {getStatusIcon(GENERATION_STATUSES[currentStatusIndex].label)}
                <span className="text-sm font-medium text-neutral-700">
                  Current: {GENERATION_STATUSES[currentStatusIndex].label}
                </span>
              </div>
            </div>
          </div>

          {/* Status Options Preview */}
          <div className="mb-6 rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-soft-drop)]">
            <h2 className="mb-4 text-xl font-semibold text-neutral-900">Available Statuses</h2>
            <div className="grid grid-cols-3 gap-3">
              {GENERATION_STATUSES.map((status, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentStatusIndex(index);
                    setProperties((prev) =>
                      prev.map((prop) => {
                        if (prop.id === "2" && prop.type === "status") {
                          return { ...prop, value: status };
                        }
                        return prop;
                      }),
                    );
                  }}
                  className={`flex items-center gap-2 rounded-[var(--radius-button)] px-3 py-2 text-sm font-medium transition-all duration-150 ${
                    currentStatusIndex === index
                      ? "bg-neutral-900 text-neutral-50"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  } `}
                >
                  {getStatusIcon(status.label)}
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sample Content Cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: "Hook Ideas", status: "Hooks Ready" },
              { title: "Script Draft", status: "Script Ready" },
              { title: "Visual Content", status: "Content Ready" },
              { title: "Complete Package", status: "All Generated" },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-soft-drop)] transition-all duration-300"
                style={{
                  transform: isPanelOpen ? "scale(0.98)" : "scale(1)",
                  transitionDelay: `${i * 50}ms`,
                }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-neutral-400" />
                  <h3 className="font-medium text-neutral-900">{item.title}</h3>
                </div>
                <p className="mb-3 text-sm text-neutral-600">Sample content for {item.title.toLowerCase()}.</p>
                <div className="bg-success-100 text-success-900 border-success-200 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs">
                  <div className="bg-success-600 h-2 w-2 rounded-full" />
                  {item.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide-out Panel Container */}
      <div
        className={`fixed top-0 right-0 h-full transition-all duration-300 ${isPanelOpen ? "visible" : "invisible delay-300"} `}
        style={{
          width: isFullScreen ? "100vw" : `${panelWidth}px`,
          zIndex: 1000,
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Panel Content with slide animation */}
        <div
          className={`h-full transform bg-white shadow-[var(--shadow-soft-drop)] transition-transform duration-300 ${isPanelOpen ? "translate-x-0" : "translate-x-full"} `}
          style={{
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPanelOpen(false)}
                className="rounded-[var(--radius-button)] p-1.5 transition-colors duration-150 hover:bg-neutral-100"
              >
                <ChevronsRight className="h-4 w-4 text-neutral-600" />
              </button>
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="rounded-[var(--radius-button)] p-1.5 transition-colors duration-150 hover:bg-neutral-100"
              >
                {isFullScreen ? (
                  <Minimize className="h-4 w-4 text-neutral-600" />
                ) : (
                  <Maximize className="h-4 w-4 text-neutral-600" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-2">
              {/* Copy and Download buttons */}
              <div className="flex items-center overflow-hidden rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50">
                <button
                  onClick={() => {
                    // Copy functionality would go here
                    console.log("Copy clicked");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors duration-150 hover:bg-neutral-100"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </button>
                <div className="h-5 w-px bg-neutral-200" />
                <button
                  onClick={() => {
                    // Download functionality would go here
                    console.log("Download clicked");
                  }}
                  className="px-2 py-1.5 text-neutral-700 transition-colors duration-150 hover:bg-neutral-100"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* NotionPanel Component */}
          <div className="h-[calc(100%-57px)] overflow-hidden">
            <NotionPanel
              title={title}
              onTitleChange={setTitle}
              properties={properties}
              onPropertyChange={handlePropertyChange}
              showPageControls={true}
              width={isFullScreen ? undefined : panelWidth}
              onWidthChange={isFullScreen ? undefined : setPanelWidth}
              minWidth={400}
              maxWidth={900}
              isOpen={isPanelOpen}
              isNewIdea={isNewIdea}
              placeholder="Enter text or type / for commands"
              tabData={
                isNewIdea
                  ? undefined
                  : {
                      video: (
                        <div className="space-y-4">
                          <div className="flex aspect-video items-center justify-center rounded-[var(--radius-card)] bg-neutral-900">
                            <span className="text-neutral-400">Video Player Placeholder</span>
                          </div>
                          <div className="text-sm text-neutral-600">
                            Video content would be displayed here with playback controls.
                          </div>
                        </div>
                      ),
                      transcript: (
                        <div className="prose prose-neutral max-w-none">
                          <h3>Video Transcript</h3>
                          <p className="text-neutral-600">[00:00] Introduction to the topic...</p>
                          <p className="text-neutral-600">[00:15] Main points discussed...</p>
                          <p className="text-neutral-600">[00:45] Key insights and takeaways...</p>
                        </div>
                      ),
                      components: (
                        <div className="space-y-3">
                          <div className="rounded-[var(--radius-card)] bg-neutral-100 p-3">
                            <div className="mb-1 text-sm font-medium">Hook Component</div>
                            <div className="text-xs text-neutral-600">Opening hook to grab attention</div>
                          </div>
                          <div className="rounded-[var(--radius-card)] bg-neutral-100 p-3">
                            <div className="mb-1 text-sm font-medium">Main Content</div>
                            <div className="text-xs text-neutral-600">Core message and value proposition</div>
                          </div>
                          <div className="rounded-[var(--radius-card)] bg-neutral-100 p-3">
                            <div className="mb-1 text-sm font-medium">Call to Action</div>
                            <div className="text-xs text-neutral-600">Engagement prompt for viewers</div>
                          </div>
                        </div>
                      ),
                      metadata: (
                        <div className="space-y-2">
                          <div className="flex justify-between border-b border-neutral-200 py-2">
                            <span className="text-sm text-neutral-600">Duration</span>
                            <span className="text-sm font-medium">2:45</span>
                          </div>
                          <div className="flex justify-between border-b border-neutral-200 py-2">
                            <span className="text-sm text-neutral-600">Format</span>
                            <span className="text-sm font-medium">16:9 Vertical</span>
                          </div>
                          <div className="flex justify-between border-b border-neutral-200 py-2">
                            <span className="text-sm text-neutral-600">Platform</span>
                            <span className="text-sm font-medium">TikTok, Instagram Reels</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-sm text-neutral-600">Created</span>
                            <span className="text-sm font-medium">2 hours ago</span>
                          </div>
                        </div>
                      ),
                      suggestions: (
                        <div className="space-y-3">
                          <div className="bg-success-50 border-success-200 rounded-[var(--radius-card)] border p-3">
                            <div className="text-success-900 mb-1 text-sm font-medium">✓ Strong opening hook</div>
                            <div className="text-success-700 text-xs">
                              The first 3 seconds effectively capture attention
                            </div>
                          </div>
                          <div className="bg-warning-50 border-warning-200 rounded-[var(--radius-card)] border p-3">
                            <div className="text-warning-900 mb-1 text-sm font-medium">⚠ Consider adding captions</div>
                            <div className="text-warning-700 text-xs">85% of viewers watch with sound off</div>
                          </div>
                          <div className="bg-primary-50 border-primary-200 rounded-[var(--radius-card)] border p-3">
                            <div className="text-primary-900 mb-1 text-sm font-medium">💡 Try a pattern interrupt</div>
                            <div className="text-primary-700 text-xs">
                              Add a visual change at 0:30 to maintain engagement
                            </div>
                          </div>
                        </div>
                      ),
                      analysis: (
                        <div className="space-y-4">
                          <div>
                            <h4 className="mb-2 text-sm font-medium">Engagement Metrics</h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="h-2 flex-1 rounded-full bg-neutral-200">
                                  <div className="bg-success-500 h-2 rounded-full" style={{ width: "85%" }} />
                                </div>
                                <span className="text-xs text-neutral-600">85% Hook Rate</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="h-2 flex-1 rounded-full bg-neutral-200">
                                  <div className="bg-primary-500 h-2 rounded-full" style={{ width: "72%" }} />
                                </div>
                                <span className="text-xs text-neutral-600">72% Retention</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="mb-2 text-sm font-medium">Content Score</h4>
                            <div className="text-success-600 text-2xl font-bold">8.5/10</div>
                            <div className="text-xs text-neutral-600">Based on platform best practices</div>
                          </div>
                        </div>
                      ),
                    }
              }
              defaultTab="video"
            >
              {isNewIdea && (
                <div className="min-h-[400px]">
                  <div className="text-base text-neutral-400">Enter text or type / for commands</div>
                  <div className="mt-4 text-sm text-neutral-300">
                    This is where the BlockNote editor would be integrated.
                  </div>
                </div>
              )}
            </NotionPanel>
          </div>
        </div>
      </div>
    </div>
  );
}
