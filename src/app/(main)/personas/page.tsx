"use client";

import React, { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import { Plus, Filter, Loader2, User } from "lucide-react";

import { CreatorPersonaGrid, type CreatorPersona } from "@/components/creator-personas/creator-persona-card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Interface for persona data from Firestore
interface FirestorePersona {
  id: string;
  name: string;
  description?: string;
  platform?: string;
  username?: string;
  voiceStyle?: string;
  distinctiveness?: string;
  complexity?: string;
  usageCount?: number;
  lastUsedAt?: string | null;
  createdAt: string;
  updatedAt: string;
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
  const router = useRouter();
  const [filterValue, setFilterValue] = useState("all");
  const [userPersonas, setUserPersonas] = useState<CreatorPersona[]>([]);
  const [loading, setLoading] = useState(true);

  // Load personas from Firestore
  useEffect(() => {
    const loadPersonas = async () => {
      try {
        setLoading(true);

        // Fetch personas from API
        const response = await fetch("/api/personas/list", {
          headers: {
            "x-api-key": "test-internal-secret-123", // Test key for development
          },
        });

        const data = await response.json();

        // Handle successful response even if no personas exist
        if (response.ok && data.success) {
          // Convert Firestore personas to CreatorPersona format
          const convertedPersonas: CreatorPersona[] = (data.personas || []).map((p: FirestorePersona) => {
            // Generate initials from name
            const initials = p.name
              .split(" ")
              .map((word) => word[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return {
              id: p.id,
              name: p.name,
              initials,
              followers: p.username ? `@${p.username}` : p.platform || "TikTok",
              lastEdited: p.lastUsedAt
                ? `Used ${getRelativeTime(p.lastUsedAt)}`
                : `Created ${getRelativeTime(p.createdAt)}`,
              avatarVariant: "light" as const,
            };
          });

          setUserPersonas(convertedPersonas);
        } else {
          // If API call fails, set empty array instead of showing error
          // This allows users to still see the UI and create their first persona
          console.warn("Could not fetch personas, showing empty state:", data.error);
          setUserPersonas([]);
        }
      } catch (err) {
        // Even on network errors, show empty state instead of error
        console.error("Error loading personas:", err);
        setUserPersonas([]);
      } finally {
        setLoading(false);
      }
    };

    loadPersonas();
  }, []);

  // Handle persona click
  const handlePersonaClick = (personaId: string) => {
    console.log("Clicked persona:", personaId);
    // TODO: Navigate to persona detail or use persona in script generation
  };

  // Handle add new persona - navigate to test page
  const handleAddPersona = () => {
    router.push("/test-tiktok-user-feed");
  };

  // Filter personas based on filter value
  const filteredPersonas = userPersonas.filter((persona) => {
    if (filterValue === "all") return true;
    if (filterValue === "recent") {
      return (
        persona.lastEdited.includes("day") ||
        persona.lastEdited.includes("hour") ||
        persona.lastEdited.includes("min") ||
        persona.lastEdited.includes("just now")
      );
    }
    if (filterValue === "used") {
      return persona.lastEdited.includes("Used");
    }
    return true;
  });

  return (
    <>
      {/* Header Section */}
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
              <DropdownMenuItem onClick={() => setFilterValue("all")}>All Personas</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterValue("recent")}>Recently Created</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterValue("used")}>Recently Used</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleAddPersona} variant="soft" className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Persona
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
          </div>
        ) : filteredPersonas.length === 0 ? (
          <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-12 text-center">
            <User className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
            <h3 className="mb-2 text-lg font-medium text-neutral-900">
              {userPersonas.length === 0 ? "No personas yet" : "No personas match your filter"}
            </h3>
            <p className="mb-6 text-neutral-600">
              {userPersonas.length === 0
                ? "Create your first persona by analyzing a creator's voice patterns"
                : "Try adjusting your filter settings"}
            </p>
            <Button onClick={handleAddPersona} variant="soft" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Persona
            </Button>
          </div>
        ) : (
          <CreatorPersonaGrid
            personas={filteredPersonas}
            onPersonaClick={handlePersonaClick}
            onAddClick={handleAddPersona}
          />
        )}
      </div>
    </>
  );
}
