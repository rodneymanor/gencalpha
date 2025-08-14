"use client";

import { useState } from "react";

import { ChevronDown, FolderOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Collection {
  id: string;
  name: string;
  count: number;
}

const mockCollections: Collection[] = [
  { id: "all", name: "All Collections", count: 24 },
  { id: "favorites", name: "Favorites", count: 8 },
  { id: "drafts", name: "Drafts", count: 5 },
  { id: "published", name: "Published", count: 11 },
];

interface CollectionsDropdownProps {
  selectedCollection?: string;
  onCollectionChange?: (collectionId: string) => void;
}

export function CollectionsDropdown({ selectedCollection = "all", onCollectionChange }: CollectionsDropdownProps) {
  const [selected, setSelected] = useState(selectedCollection);

  const handleCollectionChange = (collectionId: string) => {
    setSelected(collectionId);
    onCollectionChange?.(collectionId);
  };

  const selectedCollectionData = mockCollections.find((c) => c.id === selected) ?? mockCollections[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />
          {selectedCollectionData.name}
          <span className="text-muted-foreground">({selectedCollectionData.count})</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {mockCollections.map((collection) => (
          <DropdownMenuItem
            key={collection.id}
            onClick={() => handleCollectionChange(collection.id)}
            className="flex items-center justify-between"
          >
            <span>{collection.name}</span>
            <span className="text-muted-foreground text-sm">({collection.count})</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
