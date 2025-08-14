"use client";

import { useState } from "react";

import { ChevronDown } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategorySelectorProps {
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const categories = ["All", "Learn something", "Life hacks", "Play a game", "Be creative", "Touch grass"];

export function CategorySelector({ selectedCategory = "All", onCategoryChange }: CategorySelectorProps) {
  const [selected, setSelected] = useState(selectedCategory);

  const handleCategoryChange = (category: string) => {
    setSelected(category);
    onCategoryChange?.(category);
  };

  return (
    <div className="bg-muted px-4 py-3">
      <div className="flex items-center gap-4">
        <div className="flex-1 overflow-x-auto">
          <div className="flex min-w-max gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`rounded-pill px-3 py-2 font-sans text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  selected === category
                    ? "bg-card text-foreground shadow-[var(--shadow-soft-drop)]"
                    : "text-muted-foreground hover:bg-background-hover bg-transparent"
                } `}
                aria-label={`Select ${category} category`}
                role="tab"
                aria-selected={selected === category}
              >
                {category}
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
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
