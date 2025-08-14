"use client";

import React from "react";

import { cn } from "@/lib/utils";

interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomTabsProps {
  items: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

interface CustomTabTriggerProps {
  value: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

const CustomTabTrigger = React.forwardRef<HTMLButtonElement, CustomTabTriggerProps>(
  ({ value, isActive, onClick, children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        data-state={isActive ? "active" : "inactive"}
        onClick={onClick}
        className={cn(
          // Base styles
          "relative flex h-[52px] w-[150px] items-center justify-center px-6 transition-colors",
          // Border styles
          "border-b-[1.5px] border-transparent",
          // Active state
          "data-[state=active]:border-primary data-[state=active]:font-bold data-[state=active]:text-primary",
          // Inactive state
          "data-[state=inactive]:font-normal data-[state=inactive]:text-muted-foreground",
          // Hover state for inactive tabs
          "data-[state=inactive]:hover:text-foreground",
          className
        )}
        {...props}
      >
        {/* Invisible bold text to maintain consistent width */}
        <div className="invisible absolute font-bold" aria-hidden="true">
          {children}
        </div>
        {/* Visible text positioned absolutely */}
        <div className="absolute flex items-center gap-2">
          {children}
        </div>
      </button>
    );
  }
);

CustomTabTrigger.displayName = "CustomTabTrigger";

export const CustomTabs = ({ items, value, onValueChange, className }: CustomTabsProps) => {
  return (
    <div
      className={cn(
        "flex w-full justify-start gap-3 border-b-[0.5px] border-border mt-2 mb-6",
        className
      )}
      role="tablist"
    >
      {items.map((item) => (
        <CustomTabTrigger
          key={item.value}
          value={item.value}
          isActive={value === item.value}
          onClick={() => onValueChange(item.value)}
        >
          {item.icon}
          {item.label}
        </CustomTabTrigger>
      ))}
    </div>
  );
};

export const CustomTabsContent = ({
  value,
  activeValue,
  children,
  className
}: {
  value: string;
  activeValue: string;
  children: React.ReactNode;
  className?: string;
}) => {
  if (value !== activeValue) return null;

  return (
    <div
      role="tabpanel"
      className={cn("mt-6", className)}
    >
      {children}
    </div>
  );
};