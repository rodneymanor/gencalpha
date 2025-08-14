"use client";

import { useState, useEffect } from "react";

import { ChevronDown } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Collection } from "@/lib/collections";

interface CategorySelectorProps {
  selectedCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
}

export function CategorySelector({ selectedCategory = "all", onCategoryChange }: CategorySelectorProps) {
  const [selected, setSelected] = useState(selectedCategory);
  const [collections, setCollections] = useState<(Collection & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        // For now, we'll use a placeholder userId - this should come from auth context in production
        const userId = "current-user-id"; // TODO: Get from auth context

        const response = await fetch("/api/collections/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        });

        if (response.ok) {
          const data = await response.json();
          const collectionsWithAll = [
            {
              id: "all",
              title: "All Collections",
              description: "",
              userId: "",
              videoCount: 0,
              createdAt: "",
              updatedAt: "",
              favorite: false,
            },
            ...data.collections.map((col: Collection & { id: string }) => ({
              ...col,
              id: col.id,
            })),
          ];
          setCollections(collectionsWithAll);
        } else {
          console.error("Failed to fetch collections:", response.statusText);
          // Fallback to default categories
          setCollections([
            {
              id: "all",
              title: "All Collections",
              description: "",
              userId: "",
              videoCount: 0,
              createdAt: "",
              updatedAt: "",
              favorite: false,
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
        // Fallback to default categories
        setCollections([
          {
            id: "all",
            title: "All Collections",
            description: "",
            userId: "",
            videoCount: 0,
            createdAt: "",
            updatedAt: "",
            favorite: false,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    setSelected(categoryId);
    onCategoryChange?.(categoryId);
  };

  if (loading) {
    return (
      <div className="bg-muted px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex-1 overflow-x-auto">
            <div className="flex min-w-max gap-2">
              <div className="rounded-pill bg-card/50 text-muted-foreground animate-pulse px-3 py-2 text-sm">
                Loading collections...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted px-4 py-3">
      <div className="flex items-center gap-4">
        <div className="flex-1 overflow-x-auto">
          <div className="flex min-w-max gap-2">
            {collections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => handleCategoryChange(collection.id)}
                className={`rounded-pill px-3 py-2 font-sans text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  selected === collection.id
                    ? "bg-card text-foreground shadow-[var(--shadow-soft-drop)]"
                    : "text-muted-foreground hover:bg-background-hover bg-transparent"
                } `}
                aria-label={`Select ${collection.title} collection`}
                role="tab"
                aria-selected={selected === collection.id}
              >
                {collection.title}
                {collection.videoCount > 0 && (
                  <span className="ml-1 text-xs opacity-70">({collection.videoCount})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0">
          <Select value={selected} onValueChange={handleCategoryChange}>
            <SelectTrigger className="bg-card border-border h-8 w-36 text-sm">
              <SelectValue />
              <ChevronDown className="h-4 w-4 opacity-50" />
            </SelectTrigger>
            <SelectContent>
              {collections.map((collection) => (
                <SelectItem key={collection.id} value={collection.id}>
                  {collection.title}
                  {collection.videoCount > 0 && (
                    <span className="ml-1 text-xs opacity-70">({collection.videoCount})</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
