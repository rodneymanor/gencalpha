"use client";

import { useState } from "react";

import { GalleryVerticalEnd, Bookmark } from "lucide-react";

import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface CollectionsTabsProps {
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
  rightContent?: React.ReactNode;
}

const tabs: Tab[] = [
  { id: "collections", label: "Collections", icon: GalleryVerticalEnd },
  { id: "saved-collections", label: "Saved collections", icon: Bookmark },
];

export function CollectionsTabs({
  defaultTab = "collections",
  onTabChange,
  className,
  rightContent,
}: CollectionsTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="border-border flex items-end justify-between border-b">
        <div className="flex">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "px-6 py-3 text-sm font-medium transition-all duration-150",
                  "-mb-px border-b-2 border-transparent",
                  "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                  "flex items-center gap-2",
                  isActive
                    ? "text-foreground border-b-primary"
                    : "text-muted-foreground hover:text-foreground hover:border-border",
                )}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
              >
                {tab.icon && <tab.icon className="h-4 w-4" />}
                {tab.label}
              </button>
            );
          })}
        </div>
        {rightContent && <div className="flex items-center px-6 py-3">{rightContent}</div>}
      </div>
    </div>
  );
}
