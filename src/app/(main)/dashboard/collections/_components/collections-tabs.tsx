"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  href?: string;
}

interface CollectionsTabsProps {
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
  rightContent?: React.ReactNode;
}

const tabs: Tab[] = [
  { id: "collections", label: "Collections" },
  { id: "saved-collections", label: "Saved collections" },
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
                  isActive
                    ? "text-foreground border-b-primary"
                    : "text-muted-foreground hover:text-foreground hover:border-border",
                )}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
              >
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
