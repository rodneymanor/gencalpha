"use client";

import * as React from "react";

import Image from "next/image";

import { ChevronRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ResourceItem = {
  id: string;
  title: string;
  icon?: React.ReactNode;
  iconUrl?: string;
  kindLabel?: string;
  kindIcon?: React.ReactNode;
  actionIcon?: React.ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
};

export type ResourceGridProps = {
  items: ResourceItem[];
  lgColumns?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
};

function getLgColsClass(cols: NonNullable<ResourceGridProps["lgColumns"]>): string {
  switch (cols) {
    case 1:
      return "lg:grid-cols-1";
    case 2:
      return "lg:grid-cols-2";
    case 3:
      return "lg:grid-cols-3";
    case 4:
      return "lg:grid-cols-4";
    case 5:
      return "lg:grid-cols-5";
    case 6:
      return "lg:grid-cols-6";
    default:
      return "lg:grid-cols-3";
  }
}

export function ResourceGrid({ items, lgColumns = 3, className }: ResourceGridProps) {
  const lgColsClass = getLgColsClass(lgColumns);

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2", lgColsClass, "gap-6 w-full", className)}>
      {items.map((item) => (
        <ResourceCard key={item.id} {...item} />
      ))}
    </div>
  );
}

export function ResourceCard({
  title,
  icon,
  iconUrl,
  kindLabel,
  kindIcon,
  actionIcon,
  onClick,
  ariaLabel,
}: ResourceItem) {
  const hasFooterContent = [kindLabel, kindIcon, actionIcon].some((v) => v != null);

  return (
    <Card
      role="button"
      aria-label={ariaLabel ?? title}
      onClick={onClick}
      className={cn(
        "bg-card text-card-foreground border shadow-[var(--shadow-soft-drop)]",
        "rounded-[var(--radius-card)]",
        "flex h-36 select-none transition-colors",
        "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "px-6 py-6"
      )}
    >
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex flex-col gap-2">
          <div
            className={cn(
              "flex size-8 items-center justify-center",
              "bg-accent text-accent-foreground",
              "rounded-[var(--radius-pill)]"
            )}
          >
            {icon ? (
              <span className="text-foreground/75">{icon}</span>
            ) : iconUrl ? (
              <Image src={iconUrl} alt="" width={16} height={16} className="opacity-75" />
            ) : null}
          </div>

          <div className="text-sm font-medium leading-5 text-foreground line-clamp-2">{title}</div>
        </div>

        {hasFooterContent && (
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              {kindIcon}
              {kindLabel ? <span className="text-sm">{kindLabel}</span> : null}
            </div>
            <div className="text-foreground/70">{actionIcon ?? <ChevronRight className="size-4" aria-hidden />}</div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default ResourceGrid;

