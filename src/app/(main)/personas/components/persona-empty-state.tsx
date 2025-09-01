// Empty state component for personas

"use client";

import React from "react";

import { User, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PersonaEmptyStateProps {
  hasPersonas: boolean;
  onAddPersona: () => void;
}

export function PersonaEmptyState({ hasPersonas, onAddPersona }: PersonaEmptyStateProps) {
  return (
    <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-12 text-center">
      <User className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
      <h3 className="mb-2 text-lg font-medium text-neutral-900">
        {hasPersonas ? "No personas match your filter" : "No personas yet"}
      </h3>
      <p className="mb-6 text-neutral-600">
        {hasPersonas
          ? "Try adjusting your filter settings"
          : "Create your first persona by analyzing a creator's voice patterns"}
      </p>
      <Button onClick={onAddPersona} variant="soft" className="gap-2">
        <Plus className="h-4 w-4" />
        Create Your First Persona
      </Button>
    </div>
  );
}
