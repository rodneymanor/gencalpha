"use client";

import { useState, useRef, useEffect, useCallback } from "react";

import { User, Brain, Briefcase, Zap, Heart } from "lucide-react";

import { Button } from "@/components/ui/button";

// Define persona types with icons and descriptions
const personas = [
  {
    id: "professional",
    name: "Professional",
    icon: Briefcase,
    description: "Business-focused, polished tone",
  },
  {
    id: "creative",
    name: "Creative",
    icon: Zap,
    description: "Imaginative, out-of-the-box thinking",
  },
  {
    id: "analytical",
    name: "Analytical",
    icon: Brain,
    description: "Data-driven, logical approach",
  },
  {
    id: "friendly",
    name: "Friendly",
    icon: Heart,
    description: "Warm, conversational tone",
  },
  {
    id: "expert",
    name: "Expert",
    icon: User,
    description: "Authoritative, knowledge-focused",
  },
];

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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  const selectedPersonaData = personas.find((p) => p.id === selectedPersona);

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
            <div className="mb-2 px-2 text-sm font-medium text-neutral-600">Choose a Persona</div>

            {personas.map((persona) => {
              const Icon = persona.icon;
              const isSelected = selectedPersona === persona.id;

              return (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => handlePersonaSelect(persona.id)}
                  className={`flex w-full items-start gap-3 rounded-[var(--radius-button)] px-3 py-2 text-left transition-colors duration-150 ${
                    isSelected
                      ? "bg-primary-100 border-primary-200 border"
                      : "border border-transparent hover:bg-neutral-100"
                  }`}
                >
                  <div className={`mt-0.5 flex-shrink-0 ${isSelected ? "text-primary-600" : "text-neutral-500"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className={`truncate text-sm font-medium ${isSelected ? "text-primary-900" : "text-neutral-900"}`}
                    >
                      {persona.name}
                    </div>
                    <div className="mt-0.5 text-xs text-neutral-500">{persona.description}</div>
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
            })}
          </div>
        </div>
      )}
    </div>
  );
}
