"use client";

import { useEffect, useMemo, useState } from "react";

import { ChevronsUpDown, FolderOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/auth-context";
import { RBACClientService } from "@/core/auth/rbac-client";
import type { Collection } from "@/lib/collections";
import { cn } from "@/lib/utils";

interface CollectionComboboxProps {
  selectedCollectionId?: string;
  onChange?: (collectionId: string) => void;
  placeholder?: string;
  includeAllVideosOption?: boolean;
  className?: string;
}

export function CollectionCombobox({
  selectedCollectionId = "all-videos",
  onChange,
  placeholder = "Select collection",
  includeAllVideosOption = true,
  className,
}: CollectionComboboxProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selected, setSelected] = useState<string>(selectedCollectionId);

  useEffect(() => {
    setSelected(selectedCollectionId);
  }, [selectedCollectionId]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const result = await RBACClientService.getUserCollections(user.uid);
        if (!isMounted) return;
        // Ensure shape matches Collection
        setCollections(result.collections ?? []);
      } catch (err) {
        console.error("Failed to load collections", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  const options = useMemo(() => {
    const totalCount = collections.reduce((sum, c) => sum + (typeof c.videoCount === "number" ? c.videoCount : 0), 0);
    const base = includeAllVideosOption
      ? [{
          id: "all-videos",
          title: "All Videos",
          description: "All content",
          userId: user?.uid ?? "",
          videoCount: totalCount,
          createdAt: "",
          updatedAt: "",
        } as Collection]
      : [];
    return [...base, ...collections];
  }, [collections, includeAllVideosOption, user?.uid]);

  const selectedOption = useMemo(() => options.find((c) => c.id === selected) ?? options[0], [options, selected]);

  const handleSelect = (collectionId: string) => {
    setSelected(collectionId);
    onChange?.(collectionId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex h-9 min-w-0 items-center justify-between gap-2 px-4 rounded-[var(--radius-button)]",
            className,
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <FolderOpen className="h-4 w-4 shrink-0" />
            {loading ? "Loading..." : selectedOption?.title ?? placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search collections..." className="h-9" />
          <CommandEmpty>No collections found.</CommandEmpty>
          <CommandGroup>
            {options.map((c) => (
              <CommandItem key={c.id} value={c.id} onSelect={() => handleSelect(c.id!)} className="cursor-pointer">
                <span className="truncate">{c.title}</span>
                {typeof c.videoCount === "number" && (
                  <span className="text-muted-foreground ml-auto text-sm">{c.videoCount}</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default CollectionCombobox;

