"use client";

import React, { useEffect, useState } from "react";

import { ArrowRight, Fish, Lightbulb, Zap, FileText, User, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Action types for content generation (preserved from assistant system)
type ActionType =
  | "generate-hooks"
  | "content-ideas"
  | "if-then-script"
  | "problem-solution"
  | "tutorial-script"
  | "value-bombs";

// Persona types - using the sophisticated persona system
export interface PersonaOption {
  id: string;
  name: string;
  description: string;
  voiceStyle?: string;
  distinctiveness?: string;
  usageCount?: number;
}

interface PersonaSelectorProps {
  selectedPersona?: PersonaOption | null;
  onPersonaSelect?: (persona: PersonaOption | null) => void;
  selectedAction?: ActionType | null;
  onActionSelect?: (action: ActionType | null) => void;
  onActionTrigger: (action: ActionType, prompt: string) => void;
  className?: string;
  inputValue?: string;
  onInputFocus?: () => void;
  showCallout?: boolean;
}

// Content actions (preserved from assistant system - these are valuable)
const CONTENT_ACTIONS: Array<{
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
    icon: <ArrowRight className="h-4 w-4" />,
    description: "Classic problem-solution script structure",
    prompt:
      "Create a problem-solution script with clear structure: Identify the problem → Agitate the pain → Present the solution → Call to action. Make it compelling and actionable.",
    category: "templates",
  },
  {
    key: "tutorial-script",
    label: "Tutorial Script",
    icon: <FileText className="h-4 w-4" />,
    description: "Step-by-step tutorial format",
    prompt:
      "Create a tutorial-style script with clear steps: Introduction → Step-by-step instructions → Tips for success → Call to action. Make it easy to follow and actionable.",
    category: "templates",
  },
];

// Main PersonaSelector component
export function PersonaSelector({
  selectedPersona,
  onPersonaSelect,
  selectedAction,
  onActionSelect,
  onActionTrigger,
  className,
  inputValue = "",
  onInputFocus,
  showCallout = true,
}: PersonaSelectorProps) {
  const [userPersonas, setUserPersonas] = useState<PersonaOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user's personas
  useEffect(() => {
    const loadPersonas = async () => {
      try {
        const response = await fetch("/api/personas/list", {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUserPersonas(data.personas || []);
          }
        }
      } catch (error) {
        console.error("Failed to load personas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPersonas();
  }, []);

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

  const handlePersonaClick = (persona: PersonaOption) => {
    const isSelected = selectedPersona?.id === persona.id;
    onPersonaSelect?.(isSelected ? null : persona);
  };

  return (
    <div className={cn("space-y-8", className)}>
      {/* Persona Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-neutral-600" />
          <h3 className="text-sm font-medium text-neutral-700">Choose Writing Voice (Optional)</h3>
        </div>

        {loading ? (
          <div className="text-sm text-neutral-500">Loading personas...</div>
        ) : userPersonas.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {userPersonas.map((persona) => {
              const isSelected = selectedPersona?.id === persona.id;

              return (
                <Button
                  key={persona.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePersonaClick(persona)}
                  className={cn(
                    "gap-2 rounded-[var(--radius-button)] px-4 py-2 text-sm font-medium transition-all",
                    isSelected
                      ? "border-primary-500 text-primary-800 bg-primary-100 hover:bg-primary-150"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50",
                    "shadow-sm hover:shadow-md",
                  )}
                  title={`Voice style: ${persona.voiceStyle || "Custom"} | ${persona.description}`}
                >
                  <Sparkles className="h-3 w-3" />
                  {persona.name}
                </Button>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-neutral-500">
            No personas created yet.{" "}
            <a href="/personas" className="text-primary-600 hover:text-primary-700 underline">
              Create your first persona
            </a>{" "}
            to get started.
          </div>
        )}
      </div>

      {/* Content Actions */}
      <div className="space-y-6">
        {/* Quick Generators */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-neutral-600" />
            <h3 className="text-sm font-medium text-neutral-700">Quick Generators</h3>
          </div>
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
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-neutral-600" />
            <h3 className="text-sm font-medium text-neutral-700">Script Templates</h3>
          </div>
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
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50",
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
      </div>

      {/* Dynamic tip based on state */}
      {showCallout && (
        <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-4">
          {selectedAction && inputValue.trim().length === 0 ? (
            <p className="text-xs text-neutral-600">
              <strong>Selected:</strong> {CONTENT_ACTIONS.find((a) => a.key === selectedAction)?.label}
              <br />
              Now enter your topic or idea above and press Enter to generate.
            </p>
          ) : selectedPersona && !selectedAction ? (
            <p className="text-xs text-neutral-600">
              <strong>Writing as:</strong> {selectedPersona.name}
              <br />
              Choose a generator/template above or just enter your script idea.
            </p>
          ) : (
            <p className="text-xs text-neutral-600">
              Choose a persona for voice styling, select a generator/template for structured content, or just enter your
              idea for a basic script.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Export for backward compatibility during transition
export type { ActionType };
export { CONTENT_ACTIONS };
