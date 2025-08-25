"use client";

import { useState } from "react";
import { toast } from "sonner";
import { 
  CreatorPersonaGrid, 
  type CreatorPersona 
} from "@/components/creator-personas/creator-persona-card";

// Sample data with different avatar variants
const samplePersonas: CreatorPersona[] = [
  {
    id: "mrbeast",
    name: "MrBeast Style Guide",
    initials: "MB",
    followers: "247M followers",
    lastEdited: "Last edited 2 hours ago",
    avatarVariant: "light" // Default light variant as requested
  },
  {
    id: "mkbhd",
    name: "MKBHD Tech Reviews",
    initials: "MK",
    followers: "19M followers",
    lastEdited: "Last edited 5 hours ago",
    avatarVariant: "dark"
  },
  {
    id: "emma",
    name: "Emma Chamberlain Voice",
    initials: "EC",
    followers: "12M followers",
    lastEdited: "Last edited yesterday",
    avatarVariant: "outlined"
  },
  {
    id: "casey",
    name: "Casey Neistat Vlogs",
    initials: "CN",
    followers: "12.5M followers",
    lastEdited: "Last edited 3 days ago",
    avatarVariant: "outlined"
  },
  {
    id: "airrack",
    name: "Airrack Adventures",
    initials: "AR",
    followers: "14M followers",
    lastEdited: "Last edited 4 days ago",
    avatarVariant: "light"
  }
];

export default function TestCreatorPersonasPage() {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  const handlePersonaClick = (personaId: string) => {
    setSelectedPersona(personaId);
    const persona = samplePersonas.find(p => p.id === personaId);
    toast.success(`Selected: ${persona?.name}`);
    
    // You can also post a message to parent window if needed
    if (window.parent !== window) {
      window.parent.postMessage({ 
        action: 'persona-selected', 
        personaId: personaId 
      }, '*');
    }
  };

  const handleAddClick = () => {
    toast.info("Add new persona clicked");
    
    // Trigger add flow
    if (window.parent !== window) {
      window.parent.postMessage({ 
        action: 'add-persona'
      }, '*');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-10">
      <div className="max-w-[900px] mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-neutral-900">
            Creator Personas
          </h1>
          <p className="text-neutral-600">
            Select a creator persona or add a new one. 
            {selectedPersona && (
              <span className="ml-2 text-primary-600">
                Currently selected: {selectedPersona}
              </span>
            )}
          </p>
        </div>

        {/* Grid Component */}
        <CreatorPersonaGrid
          personas={samplePersonas}
          onPersonaClick={handlePersonaClick}
          onAddClick={handleAddClick}
        />

        {/* Dark mode test section */}
        <div className="mt-16 p-8 bg-neutral-900 rounded-[var(--radius-card)]">
          <h2 className="text-xl font-semibold text-neutral-50 mb-6">
            Dark Mode Preview
          </h2>
          <div className="dark">
            <CreatorPersonaGrid
              personas={samplePersonas.slice(0, 3)}
              onPersonaClick={handlePersonaClick}
              onAddClick={handleAddClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}