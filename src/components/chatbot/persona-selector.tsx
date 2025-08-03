"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PersonaType = "Scribo" | "MiniBuddy" | "StoryBuddy" | "HookBuddy" | "MVBB";

interface PersonaSelectorProps {
  selectedPersona: PersonaType;
  onPersonaChange: (persona: PersonaType) => void;
  className?: string;
}

const PERSONAS: Array<{ key: PersonaType; label: string; tooltip?: string }> = [
  { key: "Scribo", label: "Scribo" },
  { key: "MiniBuddy", label: "MiniBuddy" },
  { key: "StoryBuddy", label: "StoryBuddy" },
  { key: "HookBuddy", label: "HookBuddy" },
  { key: "MVBB", label: "MVBB", tooltip: "MiniValueBombBuddy" },
];

export function PersonaSelector({ 
  selectedPersona, 
  onPersonaChange, 
  className 
}: PersonaSelectorProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {PERSONAS.map(({ key, label, tooltip }) => (
        <Button
          key={key}
          variant={selectedPersona === key ? "default" : "outline"}
          size="sm"
          onClick={() => onPersonaChange(key)}
          className={cn(
            "rounded-full px-4 py-1 text-xs font-medium transition-all",
            selectedPersona === key 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "hover:bg-accent hover:text-accent-foreground"
          )}
          title={tooltip}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}