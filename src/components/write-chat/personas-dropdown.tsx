"use client";

import { useState, useRef, useEffect, useCallback } from "react";

import { useRouter } from "next/navigation";

import { User, Plus, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { personaStorage, type StoredPersona } from "@/lib/services/persona-storage";

interface PersonasDropdownProps {
  selectedPersona?: string;
  onPersonaSelect?: (persona: string) => void;
  className?: string;
  disabled?: boolean;
}

export function PersonasDropdown({
  selectedPersona,
  onPersonaSelect,
  className = "",
  disabled = false,
}: PersonasDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [savedPersonas, setSavedPersonas] = useState<StoredPersona[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  // Load saved personas from localStorage
  useEffect(() => {
    const loadPersonas = () => {
      const personas = personaStorage.getAll();
      setSavedPersonas(personas);
    };

    loadPersonas();

    // Reload personas when window gains focus (in case they were updated elsewhere)
    const handleFocus = () => loadPersonas();
    window.addEventListener("focus", handleFocus);

    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // Calculate dropdown position to avoid layout shifts
  const calculateDropdownPosition = useCallback(() => {
    if (!buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    setDropdownPosition({
      top: buttonRect.bottom + scrollY + 8, // 8px gap (mt-2)
      left: buttonRect.left + scrollX,
    });
  }, []);

  // Close dropdown when clicking outside or scrolling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        calculateDropdownPosition();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleScroll);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isOpen, calculateDropdownPosition]);

  const handlePersonaSelect = (personaId: string) => {
    onPersonaSelect?.(personaId);
    setIsOpen(false);
  };

  // Update position when opening dropdown
  const toggleDropdown = () => {
    if (!isOpen) {
      calculateDropdownPosition();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <Button
        ref={buttonRef}
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggleDropdown}
        disabled={disabled}
        className="h-10 w-10 flex-shrink-0 rounded-[var(--radius-button)] text-neutral-600 transition-colors duration-200 hover:bg-neutral-100 hover:text-neutral-900"
        aria-label="Select persona"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-venetian-mask"
        >
          <path d="M2 12a5 5 0 0 0 5 5 8 8 0 0 1 5-5 8 8 0 0 1 5 5 5 5 0 0 0 5-5c0-8-6-8-10-8s-10 0-10 8Z" />
          <path d="M6 11c1.5 0 3 .5 3 2-2 0-3 0-3-2Z" />
          <path d="M18 11c-1.5 0-3 .5-3 2 2 0 3 0 3-2Z" />
        </svg>
      </Button>

      {/* Dropdown Portal - positioned fixed to avoid layout shifts */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed z-[9999] w-72 rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 shadow-[var(--shadow-soft-drop)]"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <div className="p-2">
            <div className="mb-2 px-2 text-sm font-medium text-neutral-600">
              {savedPersonas.length > 0 ? "Choose a Persona" : "No Saved Personas"}
            </div>

            {savedPersonas.length > 0 ? (
              savedPersonas.map((persona) => {
                const isSelected = selectedPersona === persona.personaId;

                return (
                  <button
                    key={persona.personaId}
                    type="button"
                    onClick={() => handlePersonaSelect(persona.personaId)}
                    className={`flex w-full items-start gap-3 rounded-[var(--radius-button)] px-3 py-2 text-left transition-colors duration-150 ${
                      isSelected
                        ? "bg-primary-100 border-primary-200 border"
                        : "border border-transparent hover:bg-neutral-100"
                    }`}
                  >
                    {/* Avatar or Initials */}
                    <div className={`mt-0.5 flex-shrink-0 ${isSelected ? "text-primary-600" : "text-neutral-500"}`}>
                      {persona.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={persona.avatar} alt={persona.name} className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-700">
                          {persona.initials}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className={`truncate text-sm font-medium ${isSelected ? "text-primary-900" : "text-neutral-900"}`}
                      >
                        {persona.name}
                      </div>
                      <div className="mt-0.5 text-xs text-neutral-500">@{persona.username}</div>
                    </div>
                    {isSelected && (
                      <div className="text-primary-600 flex-shrink-0">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-center">
                <User className="mx-auto h-8 w-8 text-neutral-400" />
                <p className="mt-2 text-sm text-neutral-600">No personas saved yet</p>
                <p className="mt-1 text-xs text-neutral-500">Create your first persona to get started</p>
              </div>
            )}

            {/* Divider */}
            <div className="my-2 border-t border-neutral-200" />

            {/* View All Personas Link */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push("/personas");
              }}
              className="hover:bg-primary-50 hover:border-primary-200 flex w-full items-center gap-3 rounded-[var(--radius-button)] border border-transparent px-3 py-2 text-left transition-colors duration-150"
            >
              <div className="text-primary-600 flex-shrink-0">
                <ExternalLink className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-primary-700 text-sm font-medium">View Your Personas</div>
                <div className="mt-0.5 text-xs text-neutral-500">Manage voice profiles from creators</div>
              </div>
            </button>

            {/* Create New Persona Link */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push("/test-tiktok-user-feed");
              }}
              className="hover:bg-success-50 hover:border-success-200 mt-1 flex w-full items-center gap-3 rounded-[var(--radius-button)] border border-transparent px-3 py-2 text-left transition-colors duration-150"
            >
              <div className="text-success-600 flex-shrink-0">
                <Plus className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-success-700 text-sm font-medium">Create New Persona</div>
                <div className="mt-0.5 text-xs text-neutral-500">Analyze a creator&apos;s voice patterns</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
