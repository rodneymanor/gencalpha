// Header component for personas page

"use client";

import React from "react";

import { Plus, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PersonaHeaderProps {
  onFilterChange: (filter: string) => void;
  onAddPersona: () => void;
}

export function PersonaHeader({ onFilterChange, onAddPersona }: PersonaHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Your Personas</h1>
        <p className="mt-1 text-neutral-600">Voice profiles created from creator analysis</p>
      </div>
      <div className="flex gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onFilterChange("all")}>All Personas</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("recent")}>Recently Created</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("used")}>Recently Used</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={onAddPersona} variant="soft" className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Persona
        </Button>
      </div>
    </div>
  );
}
