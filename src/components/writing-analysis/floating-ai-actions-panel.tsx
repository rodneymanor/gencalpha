"use client";

import React, { useState, useEffect } from "react";

import { User, ChevronDown, ChevronRight, Sparkles } from "lucide-react";

import { buildAuthHeaders } from "@/lib/http/auth-headers";

// Types from existing components
interface PersonaOption {
  id: string;
  name: string;
  description: string;
  voiceStyle?: string;
  distinctiveness?: string;
  usageCount?: number;
}

interface FloatingAiActionsPanelProps {
  onPersonaSelect?: (persona: PersonaOption | null) => void;
  onActionTrigger?: (action: string, prompt: string) => void; // kept for API compatibility
  onOpenBrandHub?: () => void;
  className?: string;
}

// Removed templates and generators sections

export function FloatingAiActionsPanel({
  onPersonaSelect,
  onOpenBrandHub,
  className = "",
}: FloatingAiActionsPanelProps) {
  const [selectedPersona, setSelectedPersona] = useState<PersonaOption | null>(null);
  const [userPersonas, setUserPersonas] = useState<PersonaOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    personas: true,
  });

  // Load user personas
  useEffect(() => {
    const loadPersonas = async () => {
      try {
        const headers = await buildAuthHeaders();
        const response = await fetch("/api/personas/list", {
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUserPersonas(data.personas ?? []);
          }
        } else {
          console.error("Failed to load personas - HTTP", response.status);
        }
      } catch (error) {
        console.error("Failed to load personas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPersonas();
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePersonaSelect = (persona: PersonaOption | null) => {
    setSelectedPersona(persona);
    onPersonaSelect?.(persona);
  };

  // Generators and templates removed

  return (
    <div
      className={`bg-card border-border overflow-hidden rounded-[var(--radius-card)] border shadow-[var(--shadow-soft-drop)] ${className}`}
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="border-border-subtle border-b px-6 py-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="text-primary h-5 w-5" />
            <h2 className="text-foreground text-lg font-semibold">AI Actions</h2>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto">
          <div className="space-y-6 px-6 pt-4 pb-6">
            {/* Persona Selection */}
            <div>
              <button
                onClick={() => toggleSection("personas")}
                className="flex w-full items-center justify-between py-2 text-left"
              >
                <div className="flex items-center space-x-2">
                  <User className="text-muted-foreground h-4 w-4" />
                  <span className="text-foreground text-sm font-medium">Brand Voice</span>
                </div>
                {expandedSections.personas ? (
                  <ChevronDown className="text-muted-foreground h-4 w-4" />
                ) : (
                  <ChevronRight className="text-muted-foreground h-4 w-4" />
                )}
              </button>

              {expandedSections.personas && (
                <div className="mt-3 space-y-2">
                  {loading ? (
                    <div className="text-muted-foreground text-xs">Loading brand voices...</div>
                  ) : (
                    <>
                      <button
                        onClick={() => handlePersonaSelect(null)}
                        className={`w-full rounded-[var(--radius-button)] border p-3 text-left transition-colors ${
                          selectedPersona === null
                            ? "border-primary bg-accent text-accent-foreground"
                            : "border-border hover:border-border-hover hover:bg-background-hover"
                        }`}
                      >
                        <div className="text-sm font-medium">Default Brand Voice</div>
                      </button>

                      {userPersonas.slice(0, 3).map((persona) => (
                        <button
                          key={persona.id}
                          onClick={() => handlePersonaSelect(persona)}
                          className={`w-full rounded-[var(--radius-button)] border p-3 text-left transition-colors ${
                            selectedPersona?.id === persona.id
                              ? "border-primary bg-accent text-accent-foreground"
                              : "border-border hover:border-border-hover hover:bg-background-hover"
                          }`}
                        >
                          <div className="text-sm font-medium">{persona.name}</div>
                        </button>
                      ))}

                      {userPersonas.length > 3 && (
                        <button
                          className="text-primary hover:text-primary/80 w-full p-2 text-center text-xs transition-colors"
                          onClick={() => onOpenBrandHub?.()}
                        >
                          View all brand voices ({userPersonas.length})
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Script Templates and Quick Generators removed */}

            {/* Current Selection Status */}
            {selectedPersona && (
              <div className="bg-accent/10 border-accent/20 rounded-[var(--radius-button)] border p-4">
                <h4 className="text-primary mb-1 text-sm font-medium">🎯 Active Brand Voice</h4>
                <div className="text-muted-foreground text-xs">
                  <strong>{selectedPersona.name}</strong>
                </div>
              </div>
            )}

            {/* Usage Tips */}
            <div className="bg-muted/50 border-border rounded-[var(--radius-button)] border p-4">
              <h4 className="text-foreground mb-2 text-sm font-medium">💡 Tips</h4>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li>• Select a brand voice to match your writing style</li>
                <li>• Manage voices in Brand Hub</li>
                <li>• All outputs include readability analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
