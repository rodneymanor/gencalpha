"use client";

import React, { useState, useEffect } from "react";

import { Plus, Filter } from "lucide-react";

import { CreatorPersonaGrid, type CreatorPersona } from "@/components/creator-personas/creator-persona-card";
import { NewPersonaModal } from "@/components/creator-personas/new-persona-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { personaStorage, type StoredPersona } from "@/lib/services/persona-storage";

// Mock data for personas
const mockPersonas: CreatorPersona[] = [
  {
    id: "1",
    name: "Tech Educator",
    initials: "TE",
    followers: "125K",
    lastEdited: "2 days ago",
    avatarVariant: "light",
  },
  {
    id: "2",
    name: "Fitness Coach",
    initials: "FC",
    followers: "89K",
    lastEdited: "1 week ago",
    avatarVariant: "dark",
  },
  {
    id: "3",
    name: "Food Creator",
    initials: "FC",
    followers: "203K",
    lastEdited: "3 days ago",
    avatarVariant: "outlined",
  },
];

// Placeholder for default user personas - removed since we're loading from storage
// const yourPersonas: CreatorPersona[] = [];

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
          className={`relative -mb-px border-b-2 px-4 py-3 text-sm font-medium transition-all duration-150 ${
            activeTab === "personas"
              ? "border-neutral-900 text-neutral-900"
              : "border-transparent text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
          } `}
        >
          Personas
        </button>
        <button
          onClick={() => onTabChange("your-personas")}
          className={`relative -mb-px border-b-2 px-4 py-3 text-sm font-medium transition-all duration-150 ${
            activeTab === "your-personas"
              ? "border-neutral-900 text-neutral-900"
              : "border-transparent text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
          } `}
        >
          Your Personas
        </button>
      </div>
    </div>
  );
}

// Helper function to get relative time
const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins === 0) return "just now";
      return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;
    }
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  } else if (diffDays === 1) {
    return "yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }
};

export default function PersonasPage() {
  const [activeTab, setActiveTab] = useState("personas");
  const [filterValue, setFilterValue] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [personas] = useState(mockPersonas);
  const [userPersonas, setUserPersonas] = useState<CreatorPersona[]>([]);

  // Load stored personas on mount
  useEffect(() => {
    const loadStoredPersonas = () => {
      const stored = personaStorage.getAll();
      const convertedPersonas: CreatorPersona[] = stored.map((sp: StoredPersona) => ({
        id: sp.personaId,
        name: sp.name,
        initials: sp.initials,
        followers: sp.followers,
        lastEdited: sp.lastUsed ? `Used ${getRelativeTime(sp.lastUsed)}` : `Created ${getRelativeTime(sp.createdAt)}`,
        avatarVariant: "light" as const,
      }));
      setUserPersonas(convertedPersonas);
    };

    loadStoredPersonas();
    // Set up a listener for storage changes in case another tab updates
    window.addEventListener("storage", loadStoredPersonas);
    return () => window.removeEventListener("storage", loadStoredPersonas);
  }, []);

  // Handle persona click
  const handlePersonaClick = (personaId: string) => {
    console.log("Clicked persona:", personaId);
    // TODO: Navigate to persona detail or open edit modal
  };

  // Handle add new persona
  const handleAddPersona = () => {
    setIsModalOpen(true);
  };

  // Handle persona creation
  const handlePersonaCreated = (newPersona: StoredPersona) => {
    console.log("New persona created:", newPersona);

    // Save to localStorage
    const storedPersona: StoredPersona = {
      personaId: newPersona.personaId,
      username: newPersona.username,
      platform: newPersona.platform,
      name: newPersona.name,
      initials: newPersona.initials,
      followers: newPersona.followers,
      avatar: newPersona.avatar,
      voiceProfile: newPersona.voiceProfile,
      createdAt: newPersona.createdAt || new Date().toISOString(),
      metadata: newPersona.metadata,
    };
    personaStorage.save(storedPersona);

    // Add the new persona to the user's personas list
    const createdPersona: CreatorPersona = {
      id: newPersona.personaId,
      name: newPersona.name,
      initials: newPersona.initials,
      followers: newPersona.followers,
      lastEdited: "just now",
      avatarVariant: "light",
    };
    setUserPersonas([createdPersona, ...userPersonas]);
    setActiveTab("your-personas");
  };

  // Get current personas based on active tab
  const currentPersonas = activeTab === "personas" ? personas : userPersonas;

  // Filter personas based on filter value
  const filteredPersonas = currentPersonas.filter((persona) => {
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
          <p className="mt-1 text-neutral-600">Write scripts like your favorite Creators</p>
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
              <DropdownMenuItem onClick={() => setFilterValue("all")}>All Personas</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterValue("recent")}>Recently Edited</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterValue("popular")}>Most Popular</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleAddPersona} variant="soft" className="gap-2">
            <Plus className="h-4 w-4" />
            New Persona
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <PersonaTabs activeTab={activeTab} onTabChange={setActiveTab} className="mb-6" />

      {/* Content Section */}
      <div className="mt-6">
        <CreatorPersonaGrid
          personas={filteredPersonas}
          onPersonaClick={handlePersonaClick}
          onAddClick={handleAddPersona}
        />
      </div>

      {/* New Persona Modal */}
      <NewPersonaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPersonaCreated={handlePersonaCreated}
      />
    </>
  );
}
