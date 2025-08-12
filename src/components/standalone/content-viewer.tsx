"use client";

import React from "react";

import { ChevronDown, Copy, X } from "lucide-react";

import ContentIdeaSection from "@/components/standalone/content-idea-section";
import ExampleIdea from "@/components/standalone/example-idea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Type definitions
export interface ContentViewerProps {
  isSlideOutOpen?: boolean;
  onPublish?: () => void;
  onCopy?: () => void;
  onClose?: () => void;
  className?: string;
}

interface ToolbarButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "default" | "secondary" | "ghost" | "outline" | "destructive";
  className?: string;
}

// Toolbar Button Component (uses design-system Button)
const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, children, variant = "outline", className = "" }) => {
  return (
    <Button onClick={onClick} variant={variant} size="sm" className={cn("rounded-[var(--radius-button)]", className)}>
      {children}
    </Button>
  );
};

// Main Content Viewer Component
export const ContentViewer: React.FC<ContentViewerProps> = ({
  isSlideOutOpen = false,
  onPublish,
  onCopy,
  onClose,
  className = "",
}) => {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground flex h-full flex-col transition-all duration-300",
        isSlideOutOpen ? "lg:w-1/2" : "w-full",
        className,
      )}
    >
      {/* Toolbar */}
      <div className="bg-card border-border flex items-center justify-between border-b px-3 py-2">
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <div className="border-border flex items-center overflow-hidden rounded-[var(--radius-button)] border">
            <ToolbarButton variant="ghost" onClick={onCopy} className="rounded-none border-0">
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </ToolbarButton>
            <div className="bg-border h-8 w-px" />
            <Button variant="ghost" size="icon" className="rounded-none">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          <ToolbarButton variant="default" onClick={onPublish}>
            Publish
          </ToolbarButton>
          <Button onClick={onClose} variant="ghost" size="icon" className="rounded-[var(--radius-button)]">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-card flex-1 overflow-y-auto">
        <article className="mx-auto max-w-3xl px-6 py-8 lg:px-12">
          <div className="prose max-w-none">
            <h1 className="mb-6 text-2xl font-bold lg:text-3xl">
              AI Prompt: Generate 3 Fresh Content Ideas from Video Transcript
            </h1>

            <section className="mb-8">
              <h2 className="mt-8 mb-4 text-xl font-semibold">Instructions</h2>
              <p className="text-muted-foreground leading-relaxed">
                Analyze the provided video transcript and generate THREE unique content ideas that use the original as
                inspiration but take completely different approaches. Each idea should target the same audience but
                explore new angles, formats, or perspectives not covered in the original video.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mt-8 mb-4 text-xl font-semibold">Input Required</h2>
              <p>
                <strong className="font-semibold">Video Transcript:</strong> [Paste transcript here]
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mt-8 mb-4 text-xl font-semibold">Analysis Framework</h2>
              <p className="mb-4">First, identify from the transcript:</p>
              <ol className="list-inside list-decimal space-y-3">
                <li>
                  <strong className="font-semibold">Core Topic:</strong> What is the main subject?
                </li>
                <li>
                  <strong className="font-semibold">Key Concepts:</strong> What specific points, techniques, or ideas
                  are mentioned?
                </li>
                <li>
                  <strong className="font-semibold">Target Audience:</strong> Who would watch this content?
                </li>
                <li>
                  <strong className="font-semibold">Pain Points:</strong> What problems does the original video address?
                </li>
                <li>
                  <strong className="font-semibold">Unexplored Areas:</strong> What questions might viewers still have?
                </li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="mt-8 mb-4 text-xl font-semibold">Generate 3 Content Ideas</h2>
              <div className="space-y-8">
                <ContentIdeaSection
                  title="Idea 1: [Alternative Angle]"
                  approaches={[
                    {
                      title: "Flip the Perspective",
                      description:
                        "If the original is from an expert view, create beginner's journey content. If it's for beginners, create advanced applications.",
                    },
                    {
                      title: "Change the Context",
                      description:
                        "Apply the same principles to a completely different industry, use case, or demographic.",
                    },
                    {
                      title: "Contrarian Take",
                      description:
                        "Explore why the conventional wisdom might be wrong or when the advice doesn't apply.",
                    },
                  ]}
                />

                <ContentIdeaSection
                  title="Idea 2: [Expansion/Deep-Dive]"
                  approaches={[
                    {
                      title: "Microscope Method",
                      description: "Take one small detail mentioned briefly and expand it into comprehensive content.",
                    },
                    {
                      title: "Connecting the Dots",
                      description: "Link the topic to 2-3 related concepts not discussed in the original.",
                    },
                    {
                      title: "Case Study Application",
                      description: "Show real-world implementation with specific examples and results.",
                    },
                  ]}
                />

                <ContentIdeaSection
                  title="Idea 3: [Format Transformation]"
                  approaches={[
                    {
                      title: "Interactive Challenge",
                      description: "Turn the information into a 7-day/30-day challenge or interactive experiment.",
                    },
                    {
                      title: "Comparison Content",
                      description: "Compare multiple methods/tools/approaches related to the topic.",
                    },
                    {
                      title: "Troubleshooting Guide",
                      description: "Focus on common mistakes, failures, and how to fix them.",
                    },
                  ]}
                />
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mt-8 mb-4 text-xl font-semibold">Content Differentiation Checklist</h2>
              <p className="mb-4">Ensure each idea:</p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2 text-green-600">✓</span>
                  <span>Has a distinct angle from the original</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-600">✓</span>
                  <span>Provides new value to the same audience</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-600">✓</span>
                  <span>Can stand alone without watching the original</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-600">✓</span>
                  <span>Uses the transcript as inspiration, not as the main content</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-600">✓</span>
                  <span>Has a clear, specific focus rather than general coverage</span>
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mt-8 mb-4 text-xl font-semibold">Example Output Format</h2>
              <div className="bg-accent/40 rounded-[var(--radius-card)] p-6">
                <p>
                  <strong className="font-semibold">Original Video Topic:</strong> &quot;5 Tips for Better iPhone
                  Photography&quot;
                </p>

                <ExampleIdea
                  title="Idea 1: Budget Android Alternative"
                  format="Comparison video"
                  hook="I tried recreating viral iPhone photos with a $200 Android phone - here's what happened"
                  keyPoints={[
                    "Test each technique on budget devices",
                    "Workarounds for missing features",
                    "Cost-benefit analysis",
                  ]}
                />

                <ExampleIdea
                  title="Idea 2: The Science Behind the Tips"
                  format="Educational deep-dive"
                  hook="The physics of why these iPhone photography tricks actually work"
                  keyPoints={[
                    "Optical principles behind each technique",
                    "Why certain angles create better shots",
                    "Understanding sensor limitations",
                  ]}
                />

                <ExampleIdea
                  title="Idea 3: 30-Day Photo Challenge"
                  format="Challenge series"
                  hook="I used one iPhone photo tip every day for 30 days - the transformation is insane"
                  keyPoints={[
                    "Daily practice with progression tracking",
                    "Community engagement element",
                    "Before/after comparisons",
                  ]}
                />
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mt-8 mb-4 text-xl font-semibold">Additional Guidance</h2>
              <ul className="list-inside list-disc space-y-2">
                <li>Avoid simply summarizing or rehashing the original content</li>
                <li>Each idea should feel fresh even to someone who watched the original</li>
                <li>Consider different content lengths (shorts vs. long-form)</li>
                <li>Think about different platforms (what works on TikTok vs. YouTube vs. Instagram)</li>
                <li>Include potential for viewer engagement (comments, shares, saves)</li>
              </ul>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
};

export default ContentViewer;
