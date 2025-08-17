"use client";

import { useState, useEffect, useCallback } from "react";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PillButton } from "@/components/ui/pill-button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";

interface Keyword {
  id: string;
  label: string;
}

interface UserProfileSlideoutProps {
  onClose: () => void;
}

export function UserProfileSlideout({ onClose }: UserProfileSlideoutProps) {
  const { user } = useAuth();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [personalDescription, setPersonalDescription] = useState("");
  const [mainTopics, setMainTopics] = useState("");
  const [keywordSearch, setKeywordSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Keyword[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to get auth headers
  const getAuthHeaders = useCallback(async () => {
    if (!user) throw new Error("User not authenticated");
    const token = await user.getIdToken();
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, [user]);

  // Load existing user profile data
  useEffect(() => {
    const loadProfile = async () => {
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
              })) ?? []
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
    };

    loadProfile();
  }, [user, getAuthHeaders]);

  // Keyword search with real API
  useEffect(() => {
    if (!keywordSearch.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        if (!user) {
          setSearchResults([]);
          setIsSearching(false);
          return;
        }
        
        const headers = await getAuthHeaders();
        const response = await fetch(`/api/user/profile/keywords/search?q=${encodeURIComponent(keywordSearch)}`, { headers });
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
    }, 300);

    return () => clearTimeout(timer);
  }, [keywordSearch, user, getAuthHeaders]);

  const addKeyword = (keyword: Keyword) => {
    if (!keywords.find(k => k.id === keyword.id) && keywords.length < 10) {
      setKeywords(prev => [...prev, keyword]);
      setKeywordSearch("");
      setSearchResults([]);
    }
  };

  const removeKeyword = (keywordId: string) => {
    if (keywords.length > 3) {
      setKeywords(prev => prev.filter(k => k.id !== keywordId));
    }
  };

  const handleSave = async () => {
    try {
      if (!user) {
        console.error("❌ User not authenticated");
        return;
      }
      
      const profileData = {
        keywords: keywords.map(k => k.label),
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
        const error = await response.json();
        throw new Error(error.error ?? "Failed to save profile");
      }

      console.log("✅ Profile saved successfully");
      onClose();
    } catch (error) {
      console.error("❌ Error saving profile:", error);
      // Could add a toast notification here for user feedback
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="bg-card border-border flex items-center justify-between border-b px-6 py-4">
        <h2 className="text-lg font-semibold text-foreground">Profile Settings</h2>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-[var(--radius-button)]"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading profile...</div>
          </div>
        ) : (
          <div className="space-y-8">
          {/* Keywords Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="keywords" className="text-sm font-medium text-foreground">
                Search Keywords
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Add keywords to personalize your content recommendations (minimum 3, maximum 10)
              </p>
            </div>

            {/* Keyword Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="keywords"
                type="text"
                placeholder="Search for keywords..."
                value={keywordSearch}
                onChange={(e) => setKeywordSearch(e.target.value)}
                className="pl-10"
              />
              
              {/* Search Results Dropdown */}
              {(searchResults.length > 0 || isSearching) && (
                <div className="bg-card border-border absolute top-full mt-1 w-full rounded-[var(--radius-card)] border shadow-[var(--shadow-soft-drop)] z-10">
                  {isSearching ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">Searching...</div>
                  ) : (
                    <div className="max-h-40 overflow-y-auto">
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => addKeyword(result)}
                          className="hover:bg-accent w-full px-3 py-2 text-left text-sm transition-colors"
                          disabled={keywords.find(k => k.id === result.id) !== undefined}
                        >
                          {result.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Keywords */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <div
                    key={keyword.id}
                    className="bg-secondary/20 text-secondary-foreground flex items-center gap-2 rounded-[var(--radius-pill)] px-3 py-1 text-sm"
                  >
                    <span>{keyword.label}</span>
                    <button
                      onClick={() => removeKeyword(keyword.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      disabled={keywords.length <= 3}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {keywords.length}/10 keywords selected (minimum 3 required)
              </p>
            </div>
          </div>

          {/* Personal Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-foreground">
              Personal Description
            </Label>
            <Textarea
              id="description"
              placeholder="Tell us about yourself, your interests, and what kind of content you create..."
              value={personalDescription}
              onChange={(e) => setPersonalDescription(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>

          {/* Main Topics */}
          <div className="space-y-2">
            <Label htmlFor="topics" className="text-sm font-medium text-foreground">
              Main Topics
            </Label>
            <Input
              id="topics"
              type="text"
              placeholder="e.g., Technology, Lifestyle, Education, Entertainment"
              value={mainTopics}
              onChange={(e) => setMainTopics(e.target.value)}
            />
          </div>
        </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-card border-border border-t px-6 py-4">
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={keywords.length < 3}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save Profile
          </Button>
        </div>
      </div>
    </div>
  );
}