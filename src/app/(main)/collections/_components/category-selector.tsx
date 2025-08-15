"use client";

import { useEffect, useState } from "react";

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

export function CategorySelector({
  selectedCategory = "all-videos",
  onCategoryChange,
  collections = [],
  loading = false,
}: CategorySelectorProps) {
  const [selected, setSelected] = useState(selectedCategory);

  // Update local state when selectedCategory prop changes
  useEffect(() => {
    setSelected(selectedCategory);
  }, [selectedCategory]);

  // Create collection options with "All Videos" as first option
  const collectionOptions: CollectionOption[] = [
    { id: "all-videos", title: "All Videos", videoCount: collections.reduce((total, c) => total + c.videoCount, 0) },
    ...collections.map((collection) => ({
      id: collection.id ?? "",
      title: collection.title,
      videoCount: collection.videoCount,
    })),
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
              <div className="rounded-pill bg-card/50 animate-pulse px-3 py-2">
                <div className="bg-muted-foreground/20 h-4 w-12 rounded"></div>
              </div>
              <div className="rounded-pill bg-card/30 animate-pulse px-3 py-2">
                <div className="bg-muted-foreground/20 h-4 w-20 rounded"></div>
              </div>
              <div className="rounded-pill bg-card/30 animate-pulse px-3 py-2">
                <div className="bg-muted-foreground/20 h-4 w-16 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted px-4 py-3">
      <div className="flex items-center">
        <div className="flex-1 overflow-x-auto">
          <div className="flex min-w-max gap-2">
            {collectionOptions.map((collection) => {
              const isSelected = selected === collection.id;
              const displayTitle =
                collection.videoCount !== undefined
                  ? `${collection.title} (${collection.videoCount})`
                  : collection.title;
              return (
                <PillButton
                  key={collection.id}
                  label={displayTitle}
                  ariaLabel={`Select ${collection.title} collection`}
                  selected={isSelected}
                  onClick={() => handleCategoryChange(collection.id)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
