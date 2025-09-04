import React from "react";
import { Fish, Lightbulb, Layers, Target, ArrowRight, Zap } from "lucide-react";

export type ActionType =
  | "generate-hooks"
  | "content-ideas"
  | "if-then-script"
  | "problem-solution"
  | "tutorial-script"
  | "value-bombs";

export interface ContentAction {
  key: ActionType;
  label: string;
  icon: React.ReactNode;
  description: string;
  prompt: string;
  category: "generators" | "templates";
}

/**
 * Content actions for script generation
 * Moved from write-chat/assistant-selector to remove dependency
 */
export const CONTENT_ACTIONS: ContentAction[] = [
  // Generators - Direct deliverables
  {
    key: "generate-hooks",
    label: "Generate 10 Hooks",
    icon: React.createElement(Fish, { className: "h-4 w-4" }),
    description: "Get 10 attention-grabbing hooks for your content idea",
    prompt:
      "Generate 10 compelling hooks for this content idea. Make them scroll-stopping, curiosity-driven, and platform-optimized. Format them as a numbered list with brief explanations of why each hook works.",
    category: "generators",
  },
  {
    key: "content-ideas",
    label: "10 Content Ideas",
    icon: React.createElement(Lightbulb, { className: "h-4 w-4" }),
    description: "Get 10 related content ideas to expand your topic",
    prompt:
      "Generate 10 content ideas related to this topic. Make them specific, actionable, and varied in format (tutorials, tips, stories, etc). Include a brief description for each idea.",
    category: "generators",
  },
  {
    key: "value-bombs",
    label: "10 Value Tips",
    icon: React.createElement(Zap, { className: "h-4 w-4" }),
    description: "Get 10 high-value, actionable tips for your audience",
    prompt:
      "Generate 10 high-value, actionable tips related to this topic. Make them specific, immediately useful, and something your audience can implement right away. Format as clear, concise points.",
    category: "generators",
  },
  // Templates - Structured scripts
  {
    key: "if-then-script",
    label: '"If You... Then Do This"',
    icon: React.createElement(ArrowRight, { className: "h-4 w-4" }),
    description: "Problem-solution script template",
    prompt:
      'Create an "If you [problem], then do this [solution]" script format. Structure it as: Hook → Problem identification → Clear solution → Call to action. Make it conversational and direct.',
    category: "templates",
  },
  {
    key: "problem-solution",
    label: "Problem → Solution",
    icon: React.createElement(Target, { className: "h-4 w-4" }),
    description: "Value-driven content structure",
    prompt:
      "Create a problem-solution script. Structure: Hook → Identify pain point → Present solution → Explain benefits → Call to action. Make it compelling and benefit-focused.",
    category: "templates",
  },
  {
    key: "tutorial-script",
    label: "Step-by-Step Tutorial",
    icon: React.createElement(Layers, { className: "h-4 w-4" }),
    description: "Educational content structure",
    prompt:
      "Create a step-by-step tutorial script. Structure: Hook → What they'll learn → Step 1, 2, 3... → Recap → Call to action. Make each step clear and actionable.",
    category: "templates",
  },
];
