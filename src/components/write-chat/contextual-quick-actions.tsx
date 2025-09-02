"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  RotateCcw, 
  Copy, 
  Scissors, 
  Volume2, 
  Palette,
  ArrowUp,
  ArrowDown 
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActionType } from "./assistant-selector";

export interface ContextualAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
  category: "enhance" | "modify" | "format" | "utility";
  description?: string;
}

interface ContextualQuickActionsProps {
  contentType: "hooks" | "ideas" | "script" | "tips" | "general";
  onActionTrigger: (action: ActionType, prompt: string) => void;
  className?: string;
}

// Contextual actions based on content type
const CONTEXTUAL_ACTIONS: Record<string, ContextualAction[]> = {
  hooks: [
    {
      id: "shorter-hooks",
      label: "Make Shorter",
      icon: <Scissors className="h-3 w-3" />,
      prompt: "Make these hooks shorter and more punchy. Keep the impact but reduce word count.",
      category: "modify",
      description: "Condense hooks for better impact"
    },
    {
      id: "platform-hooks",
      label: "Optimize for TikTok",
      icon: <Volume2 className="h-3 w-3" />,
      prompt: "Optimize these hooks specifically for TikTok. Make them more casual, trendy, and scroll-stopping.",
      category: "format",
      description: "Tailor hooks for TikTok audience"
    },
    {
      id: "more-hooks",
      label: "Generate 10 More",
      icon: <ArrowUp className="h-3 w-3" />,
      prompt: "Generate 10 more hooks in a similar style to these, but with different angles and approaches.",
      category: "enhance",
      description: "Expand hook collection"
    },
    {
      id: "emotional-hooks",
      label: "Add Emotion",
      icon: <Zap className="h-3 w-3" />,
      prompt: "Rewrite these hooks to be more emotionally compelling. Add urgency, curiosity, or strong emotion.",
      category: "enhance",
      description: "Increase emotional impact"
    }
  ],
  ideas: [
    {
      id: "expand-ideas",
      label: "Expand with Details",
      icon: <ArrowUp className="h-3 w-3" />,
      prompt: "Expand each of these content ideas with specific details, angles, and execution tips.",
      category: "enhance",
      description: "Add depth to content ideas"
    },
    {
      id: "trending-angles",
      label: "Add Trending Angles",
      icon: <Palette className="h-3 w-3" />,
      prompt: "Add trending angles and formats to these content ideas. Include current social media trends.",
      category: "enhance",
      description: "Make ideas more current"
    },
    {
      id: "platform-specific",
      label: "Platform-Specific",
      icon: <Volume2 className="h-3 w-3" />,
      prompt: "Adapt these content ideas for specific platforms (TikTok, Instagram, YouTube) with platform-specific approaches.",
      category: "format",
      description: "Customize for platforms"
    },
    {
      id: "niche-down",
      label: "Niche Down",
      icon: <ArrowDown className="h-3 w-3" />,
      prompt: "Take these broad content ideas and make them more specific and niche-focused.",
      category: "modify",
      description: "Make ideas more targeted"
    }
  ],
  script: [
    {
      id: "shorter-script",
      label: "Make Shorter",
      icon: <Scissors className="h-3 w-3" />,
      prompt: "Make this script shorter while keeping the key message and impact. Aim for 60 seconds or less.",
      category: "modify",
      description: "Condense script length"
    },
    {
      id: "stronger-cta",
      label: "Stronger CTA",
      icon: <Zap className="h-3 w-3" />,
      prompt: "Rewrite the call-to-action to be more compelling and action-oriented.",
      category: "enhance",
      description: "Improve call-to-action"
    },
    {
      id: "add-storytelling",
      label: "Add Story",
      icon: <Palette className="h-3 w-3" />,
      prompt: "Add storytelling elements to make this script more engaging and relatable.",
      category: "enhance",
      description: "Incorporate narrative elements"
    },
    {
      id: "platform-adapt",
      label: "Adapt for Instagram",
      icon: <Volume2 className="h-3 w-3" />,
      prompt: "Adapt this script specifically for Instagram Reels with visual cues and platform-specific language.",
      category: "format",
      description: "Optimize for Instagram"
    }
  ],
  tips: [
    {
      id: "more-actionable",
      label: "More Actionable",
      icon: <Zap className="h-3 w-3" />,
      prompt: "Make these tips more actionable with specific steps and implementation guidance.",
      category: "enhance",
      description: "Add concrete steps"
    },
    {
      id: "beginner-friendly",
      label: "Beginner-Friendly",
      icon: <ArrowDown className="h-3 w-3" />,
      prompt: "Rewrite these tips to be more beginner-friendly with simple language and explanations.",
      category: "modify",
      description: "Simplify for beginners"
    },
    {
      id: "advanced-tips",
      label: "Advanced Version",
      icon: <ArrowUp className="h-3 w-3" />,
      prompt: "Create advanced versions of these tips for experienced users.",
      category: "enhance",
      description: "Elevate complexity"
    }
  ],
  general: [
    {
      id: "rewrite-tone",
      label: "Change Tone",
      icon: <Palette className="h-3 w-3" />,
      prompt: "Rewrite this content with a different tone (choose: casual, professional, friendly, or authoritative).",
      category: "modify",
      description: "Adjust writing tone"
    },
    {
      id: "add-examples",
      label: "Add Examples",
      icon: <ArrowUp className="h-3 w-3" />,
      prompt: "Add specific examples and case studies to illustrate the points in this content.",
      category: "enhance",
      description: "Include concrete examples"
    }
  ]
};

export function ContextualQuickActions({ 
  contentType, 
  onActionTrigger, 
  className 
}: ContextualQuickActionsProps) {
  const actions = CONTEXTUAL_ACTIONS[contentType] || CONTEXTUAL_ACTIONS.general;

  const handleActionClick = (action: ContextualAction) => {
    // Map contextual actions to ActionType for consistency
    const actionTypeMap: Record<string, ActionType> = {
      "more-hooks": "generate-hooks",
      "expand-ideas": "content-ideas",
      "more-actionable": "value-bombs",
      "shorter-script": "if-then-script",
      "stronger-cta": "problem-solution",
      "add-storytelling": "tutorial-script"
    };

    const actionType = actionTypeMap[action.id] || "content-ideas";
    onActionTrigger(actionType, action.prompt);
  };

  return (
    <div className={cn("flex flex-wrap gap-2 p-3 bg-neutral-50 rounded-[var(--radius-card)] border border-neutral-200", className)}>
      <div className="w-full mb-1">
        <p className="text-xs text-neutral-500 font-medium">Quick Actions:</p>
      </div>
      {actions.slice(0, 4).map((action) => (
        <Button
          key={action.id}
          variant="outline"
          size="sm"
          onClick={() => handleActionClick(action)}
          className={cn(
            "h-7 px-2 py-1 text-xs font-medium gap-1.5 rounded-[var(--radius-button)]",
            "border-neutral-300 text-neutral-700 bg-white",
            "hover:bg-neutral-100 hover:border-neutral-400",
            "transition-all duration-150"
          )}
          title={action.description}
        >
          {action.icon}
          {action.label}
        </Button>
      ))}
    </div>
  );
}

export default ContextualQuickActions;
