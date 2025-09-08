"use client";

import React from "react";

import { Plus, AtSign, Pencil, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

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
  selected?: boolean;
  selectable?: boolean;
  onEdit?: (personaId: string) => void;
  onDelete?: (personaId: string) => void;
}

interface AddPersonaCardProps {
  onClick?: () => void;
  className?: string;
}

// Individual Persona Card Component
export function CreatorPersonaCard({ persona, onClick, className, selected = false, selectable = false, onEdit, onDelete }: CreatorPersonaCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.(persona.id);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.(persona.id);
    }
  };

  // Avatar style variants using Tailwind classes with dark mode support
  const avatarStyles = {
    light: "bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100",
    dark: "bg-neutral-900 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-900",
    outlined:
      "bg-transparent text-neutral-900 border-2 border-neutral-900 dark:text-neutral-100 dark:border-neutral-100",
  };

  const avatarVariant = persona.avatarVariant ?? "light";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "group flex cursor-pointer flex-col text-left",
        "rounded-[var(--radius-card)] focus:outline-hidden focus:ring-2 focus:ring-brand-400 focus:ring-offset-2",
        "transition-all duration-200",
        className,
      )}
    >
      {/* Card Container */}
      <div
        className={cn(
          "border bg-card",
          selected ? "border-brand-500 bg-brand-50" : "border-neutral-200",
          "rounded-[var(--radius-card)] p-5 transition-all duration-200",
          !selected && "hover:border-neutral-300 hover:shadow-[var(--shadow-soft-drop)]",
        )}
      >
        {/* Header */}
        <div className="mb-4 flex items-center gap-4">
          <div
            className={cn(
              "h-12 w-12 rounded-[10px]",
              "flex items-center justify-center text-lg font-semibold",
              avatarStyles[avatarVariant],
            )}
          >
            {persona.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-neutral-900">{persona.name}</div>
            <div className="mt-0.5 flex items-center gap-1 truncate text-xs text-neutral-600">
              <AtSign className="h-3.5 w-3.5 text-neutral-500" />
              <span className="truncate">{persona.followers}</span>
            </div>
          </div>
          {selectable && (
            <Checkbox
              checked={selected}
              onCheckedChange={() => onClick?.(persona.id)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              className={cn(
                "size-4 rounded-[var(--radius-button)]",
                selected ? "bg-brand-500 border-brand-500" : "border-neutral-300"
              )}
            />
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2 border-t border-neutral-200 pt-4">
          <button
            className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-button)] border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(persona.id);
            }}
          >
            <Pencil className="h-4 w-4" /> Edit
          </button>
          <button
            className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-button)] border border-destructive-200 bg-neutral-50 px-3 py-2 text-sm font-medium text-destructive-600 transition-colors duration-150 hover:bg-destructive-50"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(persona.id);
            }}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Add New Persona Card Component
export function AddPersonaCard({ onClick, className }: AddPersonaCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "group flex cursor-pointer flex-col gap-2.5 text-left",
        "rounded-[var(--radius-card)] outline-2 outline-offset-2 outline-transparent",
        "transition-all duration-200",
        "hover:outline-primary-300/30 focus:outline-primary-300/70",
        className,
      )}
    >
      {/* Add Container */}
      <div
        className={cn(
          "relative flex h-[164px] items-center justify-center",
          "border-2 border-dashed border-neutral-300 bg-transparent",
          "dark:border-neutral-600",
          "rounded-[var(--radius-card)]",
          "transition-all duration-300 ease-out",
          "group-hover:border-neutral-400 group-hover:bg-neutral-50",
          "dark:group-hover:border-neutral-500 dark:group-hover:bg-neutral-800",
        )}
      >
        <Plus className="h-8 w-8 text-neutral-500 dark:text-neutral-400" />
      </div>

      {/* Add Info */}
      <div className="px-0.5">
        <div className="text-sm font-normal tracking-tight text-neutral-600 dark:text-neutral-400">Add new persona</div>
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
  selectedId?: string;
  selectable?: boolean;
  onPersonaSelect?: (personaId: string) => void;
}

export function CreatorPersonaGrid({ personas, onPersonaClick, onAddClick, className, selectedId, selectable = false, onPersonaSelect }: CreatorPersonaGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        "grid-cols-[repeat(auto-fill,minmax(240px,1fr))]",
        "sm:grid-cols-2",
        className,
      )}
    >
      {personas.map((persona) => {
        const handle = (id: string) => {
          onPersonaSelect?.(id);
          onPersonaClick?.(id);
        };
        return (
          <CreatorPersonaCard
            key={persona.id}
            persona={persona}
            onClick={handle}
            selected={selectedId === persona.id}
            selectable={selectable}
            onEdit={(id) => onPersonaClick?.(id)}
            onDelete={() => { /* no-op by default; wire up in page if needed */ }}
          />
        );
      })}
      <AddPersonaCard onClick={onAddClick} />
    </div>
  );
}
