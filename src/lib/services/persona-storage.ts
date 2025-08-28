/**
 * Persona Storage Service
 * Manages storage and retrieval of generated personas in localStorage
 */

export interface StoredPersona {
  personaId: string;
  username: string;
  platform: "tiktok" | "instagram";
  name: string;
  initials: string;
  followers: string;
  avatar?: string | null;
  voiceProfile: string;
  createdAt: string;
  lastUsed?: string;
  metadata?: {
    videosAnalyzed: number;
    totalVideosFound: number;
    analysisDate: string;
  };
}

const STORAGE_KEY = "gen-c-alpha-personas";
const MAX_PERSONAS = 20; // Limit stored personas to prevent storage issues

class PersonaStorageService {
  /**
   * Get all stored personas
   */
  getAll(): StoredPersona[] {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];

      const personas = JSON.parse(stored) as StoredPersona[];
      // Sort by last used, then by created date
      return personas.sort((a, b) => {
        const aDate = a.lastUsed ?? a.createdAt;
        const bDate = b.lastUsed ?? b.createdAt;
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      });
    } catch (error) {
      console.error("Failed to load personas:", error);
      return [];
    }
  }

  /**
   * Get a single persona by ID
   */
  get(personaId: string): StoredPersona | null {
    const personas = this.getAll();
    return personas.find((p) => p.personaId === personaId) ?? null;
  }

  /**
   * Save a new persona or update existing
   */
  save(persona: StoredPersona): void {
    if (typeof window === "undefined") return;

    try {
      let personas = this.getAll();

      // Check if persona already exists
      const existingIndex = personas.findIndex((p) => p.personaId === persona.personaId);

      if (existingIndex >= 0) {
        // Update existing persona
        personas[existingIndex] = {
          ...personas[existingIndex],
          ...persona,
          lastUsed: new Date().toISOString(),
        };
      } else {
        // Add new persona
        personas.unshift({
          ...persona,
          createdAt: persona.createdAt ?? new Date().toISOString(),
        });

        // Limit the number of stored personas
        if (personas.length > MAX_PERSONAS) {
          personas = personas.slice(0, MAX_PERSONAS);
        }
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(personas));
    } catch (error) {
      console.error("Failed to save persona:", error);
    }
  }

  /**
   * Delete a persona by ID
   */
  delete(personaId: string): void {
    if (typeof window === "undefined") return;

    try {
      const personas = this.getAll();
      const filtered = personas.filter((p) => p.personaId !== personaId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Failed to delete persona:", error);
    }
  }

  /**
   * Update last used timestamp for a persona
   */
  markAsUsed(personaId: string): void {
    const persona = this.get(personaId);
    if (persona) {
      persona.lastUsed = new Date().toISOString();
      this.save(persona);
    }
  }

  /**
   * Clear all personas
   */
  clearAll(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Check if a username already has a persona
   */
  hasPersonaForUser(username: string, platform: string): boolean {
    const personas = this.getAll();
    return personas.some((p) => p.username.toLowerCase() === username.toLowerCase() && p.platform === platform);
  }

  /**
   * Get persona by username and platform
   */
  getByUser(username: string, platform: string): StoredPersona | null {
    const personas = this.getAll();
    return personas.find((p) => p.username.toLowerCase() === username.toLowerCase() && p.platform === platform) ?? null;
  }
}

// Export singleton instance
export const personaStorage = new PersonaStorageService();
