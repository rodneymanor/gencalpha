"use client";

import { FileText, Bot, BookOpen, Fish, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PersonaType = "Scribo" | "MiniBuddy" | "StoryBuddy" | "HookBuddy" | "MVBB";

interface PersonaSelectorProps {
  selectedPersona: PersonaType;
  onPersonaChange: (persona: PersonaType) => void;
  className?: string;
}

const PERSONAS: Array<{ key: PersonaType; label: string; tooltip?: string; icon: React.ReactNode }> = [
  { key: "Scribo", label: "Scribo", icon: <FileText className="h-3 w-3" /> },
  { key: "MiniBuddy", label: "MiniBuddy", icon: <Bot className="h-3 w-3" /> },
  { key: "StoryBuddy", label: "StoryBuddy", icon: <BookOpen className="h-3 w-3" /> },
  { key: "HookBuddy", label: "HookBuddy", icon: <Fish className="h-3 w-3" /> },
  { key: "MVBB", label: "Value Bomb", tooltip: "MiniValueBombBuddy", icon: <Zap className="h-3 w-3" /> },
];

export function PersonaSelector({ selectedPersona, onPersonaChange, className }: PersonaSelectorProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {PERSONAS.map(({ key, label, tooltip, icon }) => (
        <Button
          key={key}
          variant={selectedPersona === key ? "default" : "outline"}
          size="sm"
          onClick={() => onPersonaChange(key)}
          className={cn(
            "gap-1.5 rounded-full px-4 py-1 text-xs font-medium transition-all",
            selectedPersona === key
              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
              : "hover:bg-accent hover:text-accent-foreground",
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
