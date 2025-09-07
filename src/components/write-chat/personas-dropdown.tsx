"use client";

import { useState, useRef, useEffect, useCallback } from "react";

import { useRouter } from "next/navigation";

import { onAuthStateChanged } from "firebase/auth";
import { User, Plus, ExternalLink, Loader2, Zap, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import ClaudeDropdownMenu, { DropdownSection, DropdownItem } from "@/components/ui/claude-dropdown-menu";
import { auth } from "@/lib/firebase";

// Interface for persona data from Firestore
interface FirestorePersona {
  id: string;
  name: string;
  username?: string;
  platform?: string;
  avatar?: string;
  initials?: string;
  voiceProfile?: string;
  createdAt: string;
  lastUsedAt?: string;
}

interface PersonasDropdownProps {
  selectedPersona?: string;
  onPersonaSelect?: (persona: string) => void;
  selectedGenerator?: 'hook' | 'template' | null;
  onGeneratorSelect?: (generator: 'hook' | 'template') => void;
  className?: string;
  disabled?: boolean;
}

export function PersonasDropdown({
  selectedPersona,
  onPersonaSelect,
  selectedGenerator,
  onGeneratorSelect,
  className = "",
  disabled = false,
}: PersonasDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [savedPersonas, setSavedPersonas] = useState<FirestorePersona[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  // Load personas from Firestore API
  useEffect(() => {
    const loadPersonas = async () => {
      // Wait for auth state to be ready
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setLoading(true);
          try {
            const token = await user.getIdToken();

            // Fetch personas from API
            const response = await fetch("/api/personas/list", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            const data = await response.json();

            if (response.ok && data.success) {
              // Use Firestore personas directly with proper mapping
              const firestorePersonas: FirestorePersona[] = data.personas ?? [];

              // Ensure all personas have required fields
              const processedPersonas = firestorePersonas.map((p) => ({
                ...p,
                username: p.username ?? p.name.toLowerCase().replace(/\s+/g, ""),
                platform: p.platform ?? "tiktok",
                initials:
                  p.initials ??
                  p.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2),
              }));

              setSavedPersonas(processedPersonas);
            } else {
              console.warn("Could not fetch personas:", data.error);
              setSavedPersonas([]);
            }
          } catch (error) {
            console.error("Error loading personas:", error);
            setSavedPersonas([]);
          } finally {
            setLoading(false);
          }
        } else {
          setSavedPersonas([]);
          setLoading(false);
        }
      });

      return unsubscribe;
    };

    const unsubscribe = loadPersonas();

    // Reload personas when window gains focus (in case they were updated elsewhere)
    const handleFocus = () => loadPersonas();
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      unsubscribe.then((unsub) => unsub());
    };
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

  // Generate dropdown sections based on current state
  const generateDropdownSections = (): DropdownSection[] => {
    const sections: DropdownSection[] = [];

    // Personas Section
    const personaItems: DropdownItem[] = savedPersonas.length > 0 
      ? savedPersonas.slice(0, 3).map((persona) => ({
          id: persona.id,
          label: persona.name,
          description: `@${persona.username}`,
          icon: persona.avatar ? (
            <img
              src={persona.avatar}
              alt={persona.name}
              className="h-4 w-4 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-700">
              {persona.initials}
            </div>
          ),
          selected: selectedPersona === persona.id,
          onClick: () => handlePersonaSelect(persona.id)
        }))
      : [{
          id: 'no-personas',
          label: 'No personas saved yet',
          description: 'Create your first persona to get started',
          icon: <User className="h-4 w-4" />,
          disabled: true,
          onClick: () => {}
        }];

    sections.push({
      id: 'personas',
      label: 'Personas',
      items: personaItems
    });

    // Script Options Section
    sections.push({
      id: 'script-options',
      label: 'Script Options',
      items: [
        {
          id: 'hook-generator',
          label: 'Hook Generator',
          description: 'Create engaging openings',
          icon: <Zap className="h-4 w-4" />,
          selected: selectedGenerator === 'hook',
          onClick: () => onGeneratorSelect?.('hook')
        },
        {
          id: 'if-you-then-do-this',
          label: 'If You Then Do This',
          description: 'Conditional logic scripts',
          icon: <FileText className="h-4 w-4" />,
          selected: selectedGenerator === 'template',
          onClick: () => onGeneratorSelect?.('template')
        }
      ]
    });

    // Management Section
    sections.push({
      id: 'management',
      label: 'Management',
      items: [
        {
          id: 'view-personas',
          label: 'View Your Personas',
          description: 'Manage voice profiles from creators',
          icon: <ExternalLink className="h-4 w-4" />,
          onClick: () => {
            setIsOpen(false);
            router.push("/personas");
          }
        },
        {
          id: 'create-persona',
          label: 'Create New Persona',
          description: 'Analyze a creator\'s voice patterns',
          icon: <Plus className="h-4 w-4" />,
          badge: 'NEW',
          onClick: () => {
            setIsOpen(false);
            router.push("/personas");
          }
        }
      ]
    });

    return sections;
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
        loading ? (
          <div
            ref={dropdownRef}
            className="fixed z-[9999] w-72 rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 shadow-[var(--shadow-soft-drop)] p-4"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
          >
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            </div>
          </div>
        ) : (
          <div ref={dropdownRef}>
            <ClaudeDropdownMenu
              sections={generateDropdownSections()}
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
              }}
            />
          </div>
        )
      )}
    </div>
  );
}
