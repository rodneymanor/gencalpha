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
}

const tabs: Tab[] = [
  { id: "inspiration", label: "Inspiration", href: "/artifacts" },
  { id: "your-artifacts", label: "Your artifacts", href: "/artifacts/my" },
];

export function CollectionsTabs({ defaultTab = "inspiration", onTabChange, className }: CollectionsTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="border-border flex border-b">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "px-6 py-3 text-sm font-medium transition-all duration-150",
                "border-b-2 border-transparent",
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

      {/* Tab content area */}
      <div className="mt-6 p-4">
        {activeTab === "inspiration" && (
          <div id="panel-inspiration" role="tabpanel" aria-labelledby="tab-inspiration">
            <h2 className="mb-2 text-xl font-semibold">Inspiration Content</h2>
            <p className="text-muted-foreground">This is where your inspiration content would go.</p>
          </div>
        )}
        {activeTab === "your-artifacts" && (
          <div id="panel-your-artifacts" role="tabpanel" aria-labelledby="tab-your-artifacts">
            <h2 className="mb-2 text-xl font-semibold">Your Artifacts</h2>
            <p className="text-muted-foreground">This is where your artifacts would be displayed.</p>
          </div>
        )}
      </div>
    </div>
  );
}
