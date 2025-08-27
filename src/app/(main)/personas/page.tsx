"use client";

import React, { useState } from "react";
import { Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  CreatorPersonaGrid, 
  type CreatorPersona 
} from "@/components/creator-personas/creator-persona-card";

// Mock data for personas
const mockPersonas: CreatorPersona[] = [
  {
    id: "1",
    name: "Tech Educator",
    initials: "TE", 
    followers: "125K",
    lastEdited: "2 days ago",
    avatarVariant: "light"
  },
  {
    id: "2", 
    name: "Fitness Coach",
    initials: "FC",
    followers: "89K", 
    lastEdited: "1 week ago",
    avatarVariant: "dark"
  },
  {
    id: "3",
    name: "Food Creator", 
    initials: "FC",
    followers: "203K",
    lastEdited: "3 days ago", 
    avatarVariant: "outlined"
  }
];

const yourPersonas: CreatorPersona[] = [
  {
    id: "4",
    name: "My Tech Style",
    initials: "MT",
    followers: "12K",
    lastEdited: "1 day ago",
    avatarVariant: "light"
  }
];

// Tab component using underline style following the design system
interface TabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

function PersonaTabs({ activeTab, onTabChange, className }: TabsProps) {
  return (
    <div className={className}>
      <div className="flex items-center border-b border-neutral-200">
        <button
          onClick={() => onTabChange("personas")}
          className={`
            px-4 py-3 text-sm font-medium transition-all duration-150
            border-b-2 -mb-px relative
            ${activeTab === "personas" 
              ? "text-neutral-900 border-neutral-900" 
              : "text-neutral-600 border-transparent hover:text-neutral-900 hover:border-neutral-300"
            }
          `}
        >
          Personas
        </button>
        <button
          onClick={() => onTabChange("your-personas")}
          className={`
            px-4 py-3 text-sm font-medium transition-all duration-150
            border-b-2 -mb-px relative
            ${activeTab === "your-personas"
              ? "text-neutral-900 border-neutral-900"
              : "text-neutral-600 border-transparent hover:text-neutral-900 hover:border-neutral-300"
            }
          `}
        >
          Your Personas
        </button>
      </div>
    </div>
  );
}

export default function PersonasPage() {
  const [activeTab, setActiveTab] = useState("personas");
  const [filterValue, setFilterValue] = useState("all");

  // Handle persona click
  const handlePersonaClick = (personaId: string) => {
    console.log("Clicked persona:", personaId);
    // TODO: Navigate to persona detail or open edit modal
  };

  // Handle add new persona
  const handleAddPersona = () => {
    console.log("Add new persona clicked");
    // TODO: Open create persona modal/form
  };

  // Get current personas based on active tab
  const currentPersonas = activeTab === "personas" ? mockPersonas : yourPersonas;

  // Filter personas based on filter value
  const filteredPersonas = currentPersonas.filter(persona => {
    if (filterValue === "all") return true;
    if (filterValue === "recent") {
      return persona.lastEdited.includes("day") || persona.lastEdited.includes("days");
    }
    if (filterValue === "popular") {
      const followers = parseInt(persona.followers.replace(/[^\d]/g, ""));
      return followers > 100;
    }
    return true;
  });

  return (
    <>
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Personas</h1>
          <p className="text-neutral-600 mt-1">Write scripts like your favorite Creators</p>
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
              <DropdownMenuItem onClick={() => setFilterValue("all")}>
                All Personas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterValue("recent")}>
                Recently Edited
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterValue("popular")}>
                Most Popular
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleAddPersona} variant="soft" className="gap-2">
            <Plus className="h-4 w-4" />
            New Persona
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <PersonaTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mb-6"
      />

      {/* Content Section */}
      <div className="mt-6">
        <CreatorPersonaGrid
          personas={filteredPersonas}
          onPersonaClick={handlePersonaClick}
          onAddClick={handleAddPersona}
        />
      </div>
    </>
  );
}