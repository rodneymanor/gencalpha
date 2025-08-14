"use client";

import { useState } from "react";

import { ChevronDown } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PillButton } from "@/components/ui/pill-button";
import type { Collection } from "@/lib/collections";

interface CategorySelectorProps {
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  collections?: Collection[];
  loading?: boolean;
}

interface CollectionOption {
  id: string;
  title: string;
  videoCount?: number;
}

export function CategorySelector({ selectedCategory = "all-videos", onCategoryChange, collections = [], loading = false }: CategorySelectorProps) {
  const [selected, setSelected] = useState(selectedCategory);

  // Create collection options with "All" as first option
  const collectionOptions: CollectionOption[] = [
    { id: "all-videos", title: "All", videoCount: undefined },
    ...collections.map(collection => ({
      id: collection.id || "",
      title: collection.title,
      videoCount: collection.videoCount
    }))
  ];

  const handleCategoryChange = (collectionId: string) => {
    setSelected(collectionId);
    onCategoryChange?.(collectionId);
  };

  if (loading) {
    return (
      <div className="bg-muted px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex-1 overflow-x-auto">
            <div className="flex min-w-max gap-2">
              <div className="rounded-pill px-3 py-2 bg-card/50 animate-pulse">
                <div className="h-4 w-12 bg-muted-foreground/20 rounded"></div>
              </div>
              <div className="rounded-pill px-3 py-2 bg-card/30 animate-pulse">
                <div className="h-4 w-20 bg-muted-foreground/20 rounded"></div>
              </div>
              <div className="rounded-pill px-3 py-2 bg-card/30 animate-pulse">
                <div className="h-4 w-16 bg-muted-foreground/20 rounded"></div>
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
            {collectionOptions.map((collection) => {
              const isSelected = selected === collection.id;
              const displayTitle = collection.videoCount !== undefined 
                ? `${collection.title} (${collection.videoCount})`
                : collection.title;
              return (
                <PillButton
                  key={collection.id}
                  label={displayTitle}
                  ariaLabel={`Select ${collection.title} collection`}
                  selected={isSelected}
                  onClick={() => handleCategoryChange(collection.id)}
                  className="h-8 px-3 text-sm"
                />
              );
            })}
          </div>
        </div>

        <div className="flex-shrink-0">
          <Select value={selected} onValueChange={handleCategoryChange}>
            <SelectTrigger className="bg-card border-border h-8 w-36 text-sm">
              <SelectValue />
              <ChevronDown className="h-4 w-4 opacity-50" />
            </SelectTrigger>
            <SelectContent>
              {collectionOptions.map((collection) => {
                const displayTitle = collection.videoCount !== undefined 
                  ? `${collection.title} (${collection.videoCount})`
                  : collection.title;
                  
                return (
                  <SelectItem key={collection.id} value={collection.id}>
                    {displayTitle}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
