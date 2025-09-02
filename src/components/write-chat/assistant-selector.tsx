"use client";

import React from "react";

import { FileText, Lightbulb, Layers, Target, Fish, Zap, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Keep AssistantType for backward compatibility, but add ActionType for new approach
export type AssistantType = "Scribo" | "MiniBuddy" | "StoryBuddy" | "HookBuddy" | "MVBB";
export type ActionType =
  | "generate-hooks"
  | "content-ideas"
  | "if-then-script"
  | "problem-solution"
  | "tutorial-script"
  | "value-bombs";

interface ContentActionSelectorProps {
  onActionTrigger: (action: ActionType, prompt: string) => void;
  className?: string;
  mode?: "actions" | "assistants";
  // New props for input handling
  inputValue?: string;
  onInputFocus?: () => void;
  selectedAction?: ActionType | null;
  onActionSelect?: (action: ActionType) => void;
  // Legacy props for backward compatibility
  selectedAssistant?: AssistantType | null;
  onAssistantChange?: (assistant: AssistantType) => void;
  showCallout?: boolean;
}

// Legacy interface for backward compatibility
interface AssistantSelectorProps {
  selectedAssistant: AssistantType | null;
  onAssistantChange: (assistant: AssistantType) => void;
  className?: string;
  showCallout?: boolean;
}

// New direct action system
export const CONTENT_ACTIONS: Array<{
  key: ActionType;
  label: string;
  icon: React.ReactNode;
  description: string;
  prompt: string;
  category: "generators" | "templates";
}> = [
  // Generators - Direct deliverables
  {
    key: "generate-hooks",
    label: "Generate 10 Hooks",
    icon: <Fish className="h-4 w-4" />,
    description: "Get 10 attention-grabbing hooks for your content idea",
    prompt:
      "Generate 10 compelling hooks for this content idea. Make them scroll-stopping, curiosity-driven, and platform-optimized. Format them as a numbered list with brief explanations of why each hook works.",
    category: "generators",
  },
  {
    key: "content-ideas",
    label: "10 Content Ideas",
    icon: <Lightbulb className="h-4 w-4" />,
    description: "Get 10 related content ideas to expand your topic",
    prompt:
      "Generate 10 content ideas related to this topic. Make them specific, actionable, and varied in format (tutorials, tips, stories, etc). Include a brief description for each idea.",
    category: "generators",
  },
  {
    key: "value-bombs",
    label: "10 Value Tips",
    icon: <Zap className="h-4 w-4" />,
    description: "Get 10 high-value, actionable tips for your audience",
    prompt:
      "Generate 10 high-value, actionable tips related to this topic. Make them specific, immediately useful, and something your audience can implement right away. Format as clear, concise points.",
    category: "generators",
  },
  // Templates - Structured scripts
  {
    key: "if-then-script",
    label: '"If You... Then Do This"',
    icon: <ArrowRight className="h-4 w-4" />,
    description: "Problem-solution script template",
    prompt:
      'Create an "If you [problem], then do this [solution]" script format. Structure it as: Hook → Problem identification → Clear solution → Call to action. Make it conversational and direct.',
    category: "templates",
  },
  {
    key: "problem-solution",
    label: "Problem → Solution",
    icon: <Target className="h-4 w-4" />,
    description: "Value-driven content structure",
    prompt:
      "Create a problem-solution script. Structure: Hook → Identify pain point → Present solution → Explain benefits → Call to action. Make it compelling and benefit-focused.",
    category: "templates",
  },
  {
    key: "tutorial-script",
    label: "Step-by-Step Tutorial",
    icon: <Layers className="h-4 w-4" />,
    description: "Educational content structure",
    prompt:
      "Create a step-by-step tutorial script. Structure: Hook → What they'll learn → Step 1, 2, 3... → Recap → Call to action. Make each step clear and actionable.",
    category: "templates",
  },
];

// Legacy assistants for backward compatibility
export const ASSISTANTS: Array<{
  key: AssistantType;
  label: string;
  tooltip?: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    key: "Scribo",
    label: "Scribo",
    icon: <FileText className="h-3 w-3" />,
    description:
      "Professional script writer focused on creating polished, well-structured content with clear narratives and strong calls-to-action.",
  },
  {
    key: "MiniBuddy",
    label: "MiniBuddy",
    icon: <FileText className="h-3 w-3" />,
    description:
      "Your friendly AI assistant that helps with quick script ideas, brainstorming, and general writing support for any content type.",
  },
  {
    key: "StoryBuddy",
    label: "StoryBuddy",
    icon: <FileText className="h-3 w-3" />,
    description:
      "Master storyteller specializing in emotional narratives, character development, and compelling story arcs that captivate audiences.",
  },
  {
    key: "HookBuddy",
    label: "HookBuddy",
    icon: <Fish className="h-3 w-3" />,
    description:
      "Expert at crafting irresistible opening hooks and attention-grabbing introductions that stop the scroll and draw viewers in.",
  },
  {
    key: "MVBB",
    label: "Value Bomb",
    tooltip: "MiniValueBombBuddy",
    icon: <Zap className="h-3 w-3" />,
    description:
      "Delivers high-impact, valuable content packed with actionable insights and tips that provide immediate value to your audience.",
  },
];

// New Content Action Selector - The main component
export function ContentActionSelector({
  onActionTrigger,
  className,
  inputValue = "",
  onInputFocus,
  selectedAction,
  onActionSelect,
}: ContentActionSelectorProps) {
  const generators = CONTENT_ACTIONS.filter((action) => action.category === "generators");
  const templates = CONTENT_ACTIONS.filter((action) => action.category === "templates");

  const handleActionClick = (action: ActionType, prompt: string) => {
    const hasInput = inputValue.trim().length > 0;

    if (!hasInput) {
      // No input - focus the input field and select this action
      onInputFocus?.();
      onActionSelect?.(action);
      return;
    }

    // Has input - trigger the action
    onActionTrigger(action, prompt);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Quick Generators */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-neutral-700">Quick Generators</h3>
        <div className="flex flex-wrap gap-2">
          {generators.map((action) => {
            const isSelected = selectedAction === action.key;
            const hasInput = inputValue.trim().length > 0;

            return (
              <Button
                key={action.key}
                variant="outline"
                size="sm"
                onClick={() => handleActionClick(action.key, action.prompt)}
                className={cn(
                  "gap-2 rounded-[var(--radius-button)] px-4 py-2 text-sm font-medium transition-all",
                  isSelected && !hasInput
                    ? "border-primary-500 text-primary-800 bg-primary-100 hover:bg-primary-150"
                    : "border-primary-200 text-primary-700 hover:bg-primary-50 hover:border-primary-300",
                  "shadow-sm hover:shadow-md",
                )}
                title={action.description}
              >
                {action.icon}
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Script Templates */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-neutral-700">Script Templates</h3>
        <div className="flex flex-wrap gap-2">
          {templates.map((action) => {
            const isSelected = selectedAction === action.key;
            const hasInput = inputValue.trim().length > 0;

            return (
              <Button
                key={action.key}
                variant="outline"
                size="sm"
                onClick={() => handleActionClick(action.key, action.prompt)}
                className={cn(
                  "gap-2 rounded-[var(--radius-button)] px-4 py-2 text-sm font-medium transition-all",
                  isSelected && !hasInput
                    ? "hover:bg-neutral-150 border-neutral-500 bg-neutral-100 text-neutral-800"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300",
                  "shadow-sm hover:shadow-md",
                )}
                title={action.description}
              >
                {action.icon}
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Dynamic tip based on state */}
      <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-4">
        {selectedAction && inputValue.trim().length === 0 ? (
          <p className="text-xs text-neutral-600">
            💡 <strong>Ready to go!</strong> Now enter your topic or idea above, then press Enter or click the action
            again to generate content.
          </p>
        ) : (
          <p className="text-xs text-neutral-600">
            💡 <strong>Tip:</strong> Enter your topic or idea above, then select an action to generate specific content.
            Once you have a script, quick actions will appear in chat to help you refine it.
          </p>
        )}
      </div>
    </div>
  );
}

// Legacy Assistant Selector for backward compatibility
export function AssistantSelector({
  selectedAssistant,
  onAssistantChange,
  className,
  showCallout = false,
}: AssistantSelectorProps) {
  // Legacy - deprecated functionality
  const selectedAssistantData = null;

  // Show callout when assistant is selected and showCallout is true
  if (false) { // Disabled - use PersonaSelector instead
    return (
      <div className={cn("space-y-4", className)}>
        <div className="bg-card border-border rounded-[var(--radius-card)] border p-6 shadow-[var(--shadow-soft-drop)]">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div
                className="bg-secondary/10 flex h-12 w-12 items-center justify-center rounded-[var(--radius-button)]"
                style={{ backgroundColor: "hsl(var(--secondary, var(--foreground)) / 0.1)" }}
              >
                <div className="text-secondary text-xl">
                  {React.cloneElement(selectedAssistantData.icon as React.ReactElement, {
                    className: "h-6 w-6",
                    style: { color: "hsl(var(--secondary, var(--foreground)))" },
                  })}
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="mb-2 flex items-center space-x-2">
                <h3 className="text-foreground font-semibold">Legacy Assistant (Deprecated)</h3>
              </div>
              <p className="text-muted-foreground text-sm">AssistantSelector is deprecated. Use PersonaSelector instead.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {ASSISTANTS.map(({ key, label, tooltip, icon }) => (
        <Button
          key={key}
          variant="soft"
          size="sm"
          onClick={() => console.warn('AssistantSelector is deprecated')}
          className={cn(
            "gap-1.5 rounded-[var(--radius-button)] !bg-transparent px-4 py-1 text-xs font-medium transition-all",
            "border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800 opacity-50",
          )}
          disabled
          title={tooltip}
        >
          {icon}
          {label}
        </Button>
      ))}
    </div>
  );
}

// Export for backward compatibility
export { ContentActionSelector as ActionSelector };
