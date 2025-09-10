"use client";

import React, { useState, useEffect } from "react";

import { onAuthStateChanged } from "firebase/auth";

// Components
import { CreatorPersonaGrid, type CreatorPersona } from "@/components/creator-personas/creator-persona-card";
import { type PersonaDetails } from "@/components/persona-details-panel/persona-details-content";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { SkeletonPersonaGrid } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { auth } from "@/lib/firebase";

import { PersonaCreatePanel } from "./components/persona-create-panel";
import { PersonaDetailsPanel } from "./components/persona-details-panel";
import { PersonaEmptyState } from "./components/persona-empty-state";
import { PersonaHeader } from "./components/persona-header";
// Services
import { PersonaAnalysisService } from "./services/analysis";
import { PersonaApiService } from "./services/api";
// Types and Utils
import type { FirestorePersona, AnalysisProgress, AnalysisMode } from "./types";
import { getRelativeTime } from "./utils";

export default function PersonasPage() {
  const { userProfile } = useAuth();
  // State management
  const [filterValue, setFilterValue] = useState("all");
  const [userPersonas, setUserPersonas] = useState<CreatorPersona[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState<PersonaDetails | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [descModalOpen, setDescModalOpen] = useState(false);
  const [descPersona, setDescPersona] = useState<{ id: string; name: string; description?: string } | null>(null);
  const [personasData, setPersonasData] = useState<FirestorePersona[]>([]);

  // Persona creation state
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress | null>(null);
  const [analysisError, setAnalysisError] = useState<string>("");

  // Load personas on auth state change
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      setUserPersonas([]);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadPersonas();
      } else {
        setLoading(false);
        setUserPersonas([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load personas from Firestore
  const loadPersonas = async () => {
    try {
      setLoading(true);
      const personas = await PersonaApiService.loadPersonas();

      // Store the full personas data for the slideout
      setPersonasData(personas);

      // Convert Firestore personas to CreatorPersona format
      const convertedPersonas: CreatorPersona[] = personas.map((p: FirestorePersona) => {
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
          followers: p.username ? `@${p.username}` : (p.platform ?? "TikTok"),
          lastEdited: p.lastUsedAt
            ? `Used ${getRelativeTime(p.lastUsedAt)}`
            : `Created ${getRelativeTime(p.createdAt)}`,
          avatarVariant: "light" as const,
          status: (p as any).status,
          creationStatus: (p as any).creationStatus,
        };
      });

      setUserPersonas(convertedPersonas);

      // Default select "aron sogi" if present, else first
      const defaultByName = convertedPersonas.find((p) => p.name?.toLowerCase?.().trim() === "aron sogi");
      const defaultId = defaultByName?.id ?? convertedPersonas[0]?.id ?? null;
      setSelectedId((prev) => prev ?? defaultId);
    } catch (err) {
      console.error("Error loading personas:", err);
      setUserPersonas([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle persona click
  const handlePersonaClick = (personaId: string) => {
    console.log("Clicked persona:", personaId);
    const persona = personasData.find((p) => p.id === personaId);
    if (!persona) return;

    // Always open the description modal first
    setSelectedPersona(null);
    setDescPersona({ id: persona.id, name: persona.name, description: persona.description });
    setDescModalOpen(true);
  };

  const openFullDetails = () => {
    if (!descPersona) return;
    const persona = personasData.find((p) => p.id === descPersona.id);
    if (!persona) return;
    setSelectedPersona({
      id: persona.id,
      name: persona.name,
      description: persona.description,
      platform: persona.platform,
      username: persona.username,
      analysis: persona.analysis,
      tags: persona.tags,
      status: persona.status,
      createdAt: persona.createdAt,
      updatedAt: persona.updatedAt,
      usageCount: persona.usageCount,
      lastUsedAt: persona.lastUsedAt ?? undefined,
      voiceStyle: persona.voiceStyle,
      distinctiveness: persona.distinctiveness,
      complexity: persona.complexity,
      hasHookSystem: persona.hasHookSystem,
      hasScriptRules: persona.hasScriptRules,
      signatureMoveCount: persona.signatureMoveCount,
    });
    setDescModalOpen(false);
  };

  // Handle add new persona
  const handleAddPersona = () => {
    setShowCreatePanel(true);
    setAnalysisError("");
  };

  // Run complete analysis workflow
  const runCompleteAnalysis = async (input: string | string[], mode: AnalysisMode) => {
    setIsAnalyzing(true);
    setAnalysisError("");

    try {
      await PersonaAnalysisService.runCompleteAnalysis(input, mode, (progress) => setAnalysisProgress(progress));

      // Success! Refresh the personas list
      setShowCreatePanel(false);
      await loadPersonas();
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalysisError(error instanceof Error ? error.message : "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(null);
    }
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
      {/* Main content wrapper */}
      <div className="min-h-screen bg-neutral-50 transition-all duration-300" id="personas-main-content">
        <div className="container mx-auto p-6">
          {/* Header Section */}
          <PersonaHeader onFilterChange={setFilterValue} onAddPersona={handleAddPersona} />

          {/* Content Section */}
          <div className="mt-6">
            {loading ? (
              <SkeletonPersonaGrid count={6} />
            ) : filteredPersonas.length === 0 ? (
              <PersonaEmptyState hasPersonas={userPersonas.length > 0} onAddPersona={handleAddPersona} />
            ) : (
              <CreatorPersonaGrid
                personas={filteredPersonas}
                onPersonaClick={handlePersonaClick}
                onAddClick={handleAddPersona}
                selectedId={selectedId ?? undefined}
                selectable={true}
                onPersonaSelect={(id) => setSelectedId(id)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Persona Details Panel (Super Admin only) */}
      <PersonaDetailsPanel persona={selectedPersona} onClose={() => setSelectedPersona(null)} />

      {/* Description Dialog (Normal users) */}
      <Dialog open={descModalOpen} onOpenChange={setDescModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{descPersona?.name ?? "Persona"}</DialogTitle>
            <DialogDescription>Persona description</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-1">
            {descPersona?.description ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-neutral-700">{descPersona.description}</p>
            ) : (
              <p className="text-sm text-neutral-500">No description available for this persona.</p>
            )}
          </div>
          {userProfile?.role === "super_admin" && (
            <DialogFooter>
              <Button variant="secondary" onClick={() => setDescModalOpen(false)}>
                Close
              </Button>
              <Button onClick={openFullDetails}>View Full Details</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Persona Panel */}
      <PersonaCreatePanel
        isOpen={showCreatePanel}
        onClose={() => {
          setShowCreatePanel(false);
          setAnalysisError("");
          setIsAnalyzing(false);
          setAnalysisProgress(null);
        }}
        onAnalyze={runCompleteAnalysis}
        isAnalyzing={isAnalyzing}
        analysisProgress={analysisProgress}
        analysisError={analysisError}
      />
    </>
  );
}
