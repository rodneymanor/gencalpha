"use client";

import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Keyword {
  id: string;
  label: string;
}

export function LoadingState() {
  return (
    <div className="flex h-32 items-center justify-center px-6">
      <div className="text-muted-foreground">Loading profile...</div>
    </div>
  );
}

export function SaveStatusIndicator({ saveStatus }: { saveStatus: string }) {
  if (saveStatus === "idle") return null;

  return (
    <div
      className={`rounded-[var(--radius-button)] px-3 py-2 text-xs ${
        saveStatus === "saved"
          ? "bg-green-100 text-green-800"
          : saveStatus === "saving"
            ? "bg-blue-100 text-blue-800"
            : "bg-red-100 text-red-800"
      }`}
    >
      {saveStatus === "saved" && "✓ Profile saved"}
      {saveStatus === "saving" && "Saving..."}
      {saveStatus === "error" && "Failed to save"}
    </div>
  );
}

interface KeywordsSectionProps {
  keywords: Keyword[];
  keywordSearch: string;
  searchResults: Keyword[];
  isSearching: boolean;
  onSearchChange: (value: string) => void;
  onAddKeyword: (keyword: Keyword) => void;
  onRemoveKeyword: (keywordId: string) => void;
}

export function KeywordsSection({
  keywords,
  keywordSearch,
  searchResults,
  isSearching,
  onSearchChange,
  onAddKeyword,
  onRemoveKeyword,
}: KeywordsSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="keywords" className="text-foreground text-sm font-medium">
          Search Keywords
        </Label>
        <p className="text-muted-foreground mt-1 text-sm">
          Add keywords to personalize your content recommendations (minimum 3, maximum 10)
        </p>
      </div>

      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          id="keywords"
          type="text"
          placeholder="Search for keywords..."
          value={keywordSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />

        {(searchResults.length > 0 || isSearching) && (
          <div className="bg-card border-border absolute top-full z-10 mt-1 w-full rounded-[var(--radius-card)] border shadow-[var(--shadow-soft-drop)]">
            {isSearching ? (
              <div className="text-muted-foreground px-3 py-2 text-sm">Searching...</div>
            ) : (
              <div className="max-h-40 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => onAddKeyword(result)}
                    className="hover:bg-accent w-full px-3 py-2 text-left text-sm transition-colors"
                    disabled={keywords.find((k) => k.id === result.id) !== undefined}
                  >
                    {result.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword) => (
            <div
              key={keyword.id}
              className="bg-secondary/20 text-secondary-foreground flex items-center gap-2 rounded-[var(--radius-pill)] px-3 py-1 text-sm"
            >
              <span>{keyword.label}</span>
              <button
                onClick={() => onRemoveKeyword(keyword.id)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                disabled={keywords.length <= 3}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground text-xs">{keywords.length}/10 keywords selected (minimum 3 required)</p>
      </div>
    </div>
  );
}

export function PersonalDescriptionSection({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="description" className="text-foreground text-sm font-medium">
        Personal Description
      </Label>
      <Textarea
        id="description"
        placeholder="Tell us about yourself, your interests, and what kind of content you create..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[120px] resize-none"
      />
    </div>
  );
}

export function MainTopicsSection({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="topics" className="text-foreground text-sm font-medium">
        Main Topics
      </Label>
      <Input
        id="topics"
        type="text"
        placeholder="e.g., Technology, Lifestyle, Education, Entertainment"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
