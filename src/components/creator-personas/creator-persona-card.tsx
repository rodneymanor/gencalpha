"use client";

import React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

// Types
export interface CreatorPersona {
  id: string;
  name: string;
  initials: string;
  followers: string;
  lastEdited: string;
  avatarVariant?: "light" | "dark" | "outlined";
}

interface CreatorPersonaCardProps {
  persona: CreatorPersona;
  onClick?: (personaId: string) => void;
  className?: string;
}

interface AddPersonaCardProps {
  onClick?: () => void;
  className?: string;
}

// Individual Persona Card Component
export function CreatorPersonaCard({ 
  persona, 
  onClick,
  className 
}: CreatorPersonaCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.(persona.id);
  };

  // Avatar style variants using Tailwind classes with dark mode support
  const avatarStyles = {
    light: "bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100",
    dark: "bg-neutral-900 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-900",
    outlined: "bg-transparent text-neutral-900 border-2 border-neutral-900 dark:text-neutral-100 dark:border-neutral-100"
  };

  const avatarVariant = persona.avatarVariant ?? "light";

  return (
    <button
      onClick={handleClick}
      className={cn(
        "group flex flex-col gap-2.5 cursor-pointer text-left",
        "outline-2 outline-transparent outline-offset-2 rounded-[var(--radius-card)]",
        "transition-all duration-200",
        "hover:outline-primary-300/30 focus:outline-primary-300/70",
        className
      )}
    >
      {/* Document Container */}
      <div className={cn(
        "relative h-[164px] flex justify-center items-end",
        "p-5 pb-0",
        "bg-neutral-50/20 border border-neutral-300/30",
        "dark:bg-neutral-800/20 dark:border-neutral-50/10",
        "rounded-[var(--radius-card)]",
        "transition-all duration-300 ease-out",
        "group-hover:bg-neutral-50/40 group-hover:border-neutral-300/40",
        "dark:group-hover:bg-neutral-800/40 dark:group-hover:border-neutral-50/15",
        "overflow-hidden"
      )}>
        {/* Document Preview */}
        <div className={cn(
          "relative w-[70%] max-w-[180px] h-[calc(100%-20px)]",
          "rounded-t-[var(--radius-card)]",
          "bg-gradient-to-b from-neutral-50 to-neutral-50/95",
          "dark:from-neutral-800 dark:to-neutral-800/95",
          "transition-all duration-300 ease-out",
          "shadow-[0_-5px_10px_-3px_rgba(0,0,0,0.08),0_-2px_4px_-2px_rgba(0,0,0,0.06)]",
          "dark:shadow-[0_-5px_10px_-3px_rgba(0,0,0,0.2),0_-2px_4px_-2px_rgba(0,0,0,0.15)]",
          "border border-b-0 border-neutral-200/15",
          "dark:border-neutral-50/10",
          "group-hover:-translate-y-1.5",
          "group-hover:shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.12),0_-4px_8px_-3px_rgba(0,0,0,0.08)]",
          "dark:group-hover:shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.3),0_-4px_8px_-3px_rgba(0,0,0,0.2)]"
        )}>
          {/* Document Content */}
          <div className="flex h-full w-full flex-col items-center justify-start p-5">
            {/* Avatar */}
            <div className={cn(
              "w-[42px] h-[42px] rounded-full",
              "flex items-center justify-center",
              "text-base font-semibold mb-3.5 flex-shrink-0",
              avatarStyles[avatarVariant]
            )}>
              {persona.initials}
            </div>
            
            {/* Script Lines */}
            <div className="flex flex-col items-center gap-1 w-full">
              {[85, 75, 80, 65, 70, 60].map((width, index) => (
                <div
                  key={`script-line-${width}`}
                  className="h-0.5 bg-neutral-200/60 dark:bg-neutral-50/10 rounded-[1px]"
                  style={{ width: `${width}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Creator Info */}
      <div className="px-0.5">
        <div className="text-sm font-normal text-neutral-900 dark:text-neutral-100 tracking-tight truncate">
          {persona.name}
        </div>
        <div className="mt-0.5 text-xs font-normal text-neutral-600 dark:text-neutral-400 tracking-tight truncate">
          {persona.followers} • {persona.lastEdited}
        </div>
      </div>
    </button>
  );
}

// Add New Persona Card Component
export function AddPersonaCard({ 
  onClick,
  className 
}: AddPersonaCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "group flex flex-col gap-2.5 cursor-pointer text-left",
        "outline-2 outline-transparent outline-offset-2 rounded-[var(--radius-card)]",
        "transition-all duration-200",
        "hover:outline-primary-300/30 focus:outline-primary-300/70",
        className
      )}
    >
      {/* Add Container */}
      <div className={cn(
        "relative h-[164px] flex items-center justify-center",
        "bg-transparent border-2 border-dashed border-neutral-300/30",
        "dark:border-neutral-50/10",
        "rounded-[var(--radius-card)]",
        "transition-all duration-300 ease-out",
        "group-hover:bg-neutral-50/10 group-hover:border-neutral-300/50",
        "dark:group-hover:bg-neutral-800/10 dark:group-hover:border-neutral-50/20"
      )}>
        <Plus className="w-8 h-8 text-neutral-500 dark:text-neutral-400" />
      </div>

      {/* Add Info */}
      <div className="px-0.5">
        <div className="text-sm font-normal text-neutral-600 dark:text-neutral-400 tracking-tight">
          Add new persona
        </div>
      </div>
    </button>
  );
}

// Main Grid Component
interface CreatorPersonaGridProps {
  personas: CreatorPersona[];
  onPersonaClick?: (personaId: string) => void;
  onAddClick?: () => void;
  className?: string;
}

export function CreatorPersonaGrid({
  personas,
  onPersonaClick,
  onAddClick,
  className
}: CreatorPersonaGridProps) {
  return (
    <div className={cn(
      "grid gap-5",
      "grid-cols-[repeat(auto-fill,minmax(260px,1fr))]",
      "md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] md:gap-4",
      "sm:grid-cols-2 sm:gap-3",
      className
    )}>
      {personas.map((persona) => (
        <CreatorPersonaCard
          key={persona.id}
          persona={persona}
          onClick={onPersonaClick}
        />
      ))}
      <AddPersonaCard onClick={onAddClick} />
    </div>
  );
}