"use client";

import { useState } from "react";

import { ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

interface CollectionsFilterDropdownProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const filterOptions: FilterOption[] = [
  { value: "all", label: "All Creators" },
  { value: "recent", label: "Recent Videos" },
  { value: "favorites", label: "Favorites" },
  { value: "most-viewed", label: "Most Viewed" },
  { value: "trending", label: "Trending" },
];

export function CollectionsFilterDropdown({
  value = "all",
  onValueChange,
  placeholder = "All Creators",
  className,
}: CollectionsFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);

  const selectedOption = filterOptions.find((option) => option.value === selectedValue);

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    onValueChange?.(optionValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("flex h-9 min-w-0 flex-1 items-center justify-between gap-2 px-4 sm:flex-initial", className)}
        >
          <span className="truncate">{selectedOption?.label ?? placeholder}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="end">
        <Command>
          <CommandInput placeholder="Search filters..." className="h-9" />
          <CommandEmpty>No filter found.</CommandEmpty>
          <CommandGroup>
            {filterOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => handleSelect(option.value)}
                className="cursor-pointer"
              >
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
