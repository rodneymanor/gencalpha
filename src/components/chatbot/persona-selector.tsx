"use client";

import React from "react";

import { FileText, Bot, BookOpen, Fish, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AssistantType = "Scribo" | "MiniBuddy" | "StoryBuddy" | "HookBuddy" | "MVBB";

interface AssistantSelectorProps {
  selectedAssistant: AssistantType | null;
  onAssistantChange: (assistant: AssistantType) => void;
  className?: string;
  showCallout?: boolean;
}

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
    icon: <Bot className="h-3 w-3" />,
    description:
      "Your friendly AI assistant that helps with quick script ideas, brainstorming, and general writing support for any content type.",
  },
  {
    key: "StoryBuddy",
    label: "StoryBuddy",
    icon: <BookOpen className="h-3 w-3" />,
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

export function AssistantSelector({
  selectedAssistant,
  onAssistantChange,
  className,
  showCallout = false,
}: AssistantSelectorProps) {
  const selectedAssistantData = selectedAssistant ? ASSISTANTS.find((p) => p.key === selectedAssistant) : null;

  // Show callout when assistant is selected and showCallout is true
  if (showCallout && selectedAssistantData) {
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
                <h3 className="text-foreground font-semibold">{selectedAssistantData.label} Assistant Active</h3>
              </div>
              <p className="text-muted-foreground text-sm">{selectedAssistantData.description}</p>
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
          onClick={() => onAssistantChange(key)}
          className={cn(
            "gap-1.5 rounded-full !bg-transparent px-4 py-1 text-xs font-medium transition-all",
            selectedAssistant === key
              ? "border-primary text-primary hover:bg-primary/5"
              : "border-border hover:bg-accent hover:text-accent-foreground",
          )}
          title={tooltip}
        >
          {icon}
          {label}
        </Button>
      ))}
    </div>
  );
}
