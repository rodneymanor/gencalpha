"use client";

import React, { useState, useEffect } from "react";

import { onAuthStateChanged } from "firebase/auth";

// Components
import { CreatorPersonaGrid, type CreatorPersona } from "@/components/creator-personas/creator-persona-card";
import { type PersonaDetails } from "@/components/persona-details-panel/persona-details-content";
import { SkeletonPersonaGrid } from "@/components/ui/skeleton";
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
  // State management
  const [filterValue, setFilterValue] = useState("all");
  const [userPersonas, setUserPersonas] = useState<CreatorPersona[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState<PersonaDetails | null>(null);
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
        };
      });

      setUserPersonas(convertedPersonas);
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
    if (persona) {
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
    }
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
      <div className="min-h-screen transition-all duration-300" id="personas-main-content">
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
              />
            )}
          </div>
        </div>
      </div>

      {/* Persona Details Panel */}
      <PersonaDetailsPanel persona={selectedPersona} onClose={() => setSelectedPersona(null)} />

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
