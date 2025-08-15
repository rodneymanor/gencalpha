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
import type { Collection } from "@/lib/collections";

interface CollectionsDropdownProps {
  selectedCollection?: string;
  onCollectionChange?: (collectionId: string) => void;
  collections?: Collection[];
  loading?: boolean;
}

export function CollectionsDropdown({
  selectedCollection = "all-videos",
  onCollectionChange,
  collections = [],
  loading = false,
}: CollectionsDropdownProps) {
  const [selected, setSelected] = useState(selectedCollection);

  // Create collection options with "All Videos" as first option
  const collectionOptions = [
    { id: "all-videos", title: "All Videos", videoCount: collections.reduce((total, c) => total + c.videoCount, 0) },
    ...collections,
  ];

  const handleCollectionChange = (collectionId: string) => {
    setSelected(collectionId);
    onCollectionChange?.(collectionId);
  };

  const selectedCollectionData = collectionOptions.find((c) => c.id === selected) ?? collectionOptions[0];

  if (loading) {
    return (
      <Button variant="outline" className="flex items-center gap-2" disabled>
        <FolderOpen className="h-4 w-4" />
        Loading...
        <ChevronDown className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />
          {selectedCollectionData.title}
          <span className="text-muted-foreground">({selectedCollectionData.videoCount})</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {collectionOptions.map((collection) => (
          <DropdownMenuItem
            key={collection.id}
            onClick={() => handleCollectionChange(collection.id!)}
            className="flex items-center justify-between"
          >
            <span>{collection.title}</span>
            <span className="text-muted-foreground text-sm">({collection.videoCount})</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
