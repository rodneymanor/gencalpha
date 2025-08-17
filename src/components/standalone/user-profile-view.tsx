"use client";

import { useState, useEffect, useCallback } from "react";

import {
  LoadingState,
  SaveStatusIndicator,
  KeywordsSection,
  PersonalDescriptionSection,
  MainTopicsSection,
} from "@/components/standalone/user-profile-components";
import { useAuth } from "@/contexts/auth-context";

interface Keyword {
  id: string;
  label: string;
}

export function UserProfileView() {
  const { user } = useAuth();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [personalDescription, setPersonalDescription] = useState("");
  const [mainTopics, setMainTopics] = useState("");
  const [keywordSearch, setKeywordSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Keyword[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Helper function to get auth headers
  const getAuthHeaders = useCallback(async () => {
    if (!user) throw new Error("User not authenticated");
    const token = await user.getIdToken();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, [user]);

  // Load existing user profile data
  const loadProfile = useCallback(async () => {
    try {
      if (!user) {
        setIsLoading(false);
        return;
      }

      const headers = await getAuthHeaders();
      const response = await fetch("/api/user/profile", { headers });
      if (response.ok) {
        const data = await response.json();
        const profile = data.profile;

        if (profile) {
          setKeywords(
            profile.keywords?.map((keyword: string, index: number) => ({
              id: `existing_${index}`,
              label: keyword,
            })) ?? [],
          );
          setPersonalDescription(profile.personalDescription ?? "");
          setMainTopics(profile.mainTopics ?? "");
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, getAuthHeaders]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Keyword search with real API
  const performKeywordSearch = useCallback(
    async (searchTerm: string) => {
      if (!user) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      try {
        const headers = await getAuthHeaders();
        const response = await fetch(`/api/user/profile/keywords/search?q=${encodeURIComponent(searchTerm)}`, {
          headers,
        });
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.keywords ?? []);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error searching keywords:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [user, getAuthHeaders],
  );

  useEffect(() => {
    if (!keywordSearch.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => performKeywordSearch(keywordSearch), 300);
    return () => clearTimeout(timer);
  }, [keywordSearch, performKeywordSearch]);

  const addKeyword = (keyword: Keyword) => {
    if (!keywords.find((k) => k.id === keyword.id) && keywords.length < 10) {
      setKeywords((prev) => [...prev, keyword]);
      setKeywordSearch("");
      setSearchResults([]);
    }
  };

  const removeKeyword = (keywordId: string) => {
    if (keywords.length > 3) {
      setKeywords((prev) => prev.filter((k) => k.id !== keywordId));
    }
  };

  // Auto-save functionality
  const saveProfile = useCallback(async () => {
    try {
      setSaveStatus("saving");
      const profileData = {
        keywords: keywords.map((k) => k.label),
        personalDescription,
        mainTopics,
      };

      const headers = await getAuthHeaders();
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers,
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("❌ Error saving profile:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, [keywords, personalDescription, mainTopics, getAuthHeaders]);

  useEffect(() => {
    if (!user || isLoading || keywords.length < 3) return;
    const debounceTimer = setTimeout(saveProfile, 1000);
    return () => clearTimeout(debounceTimer);
  }, [user, isLoading, keywords.length, saveProfile]);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-8">
          <SaveStatusIndicator saveStatus={saveStatus} />
          <KeywordsSection
            keywords={keywords}
            keywordSearch={keywordSearch}
            searchResults={searchResults}
            isSearching={isSearching}
            onSearchChange={setKeywordSearch}
            onAddKeyword={addKeyword}
            onRemoveKeyword={removeKeyword}
          />
          <PersonalDescriptionSection value={personalDescription} onChange={setPersonalDescription} />
          <MainTopicsSection value={mainTopics} onChange={setMainTopics} />
        </div>
      </div>
    </div>
  );
}
