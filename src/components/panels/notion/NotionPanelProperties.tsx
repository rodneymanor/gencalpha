"use client";

import React from "react";

import { Link, Zap, GripVertical } from "lucide-react";

export interface PageProperty {
  id: string;
  type: "url" | "status" | "text" | "select" | "date";
  name: string;
  value?: string | { label: string; color: string };
  icon?: string;
}

interface NotionPanelPropertiesProps {
  properties: PageProperty[];
  onPropertyChange?: (id: string, value: string | { label: string; color: string }) => void;
}

export default function NotionPanelProperties({ properties, onPropertyChange }: NotionPanelPropertiesProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      success: "bg-success-100 text-success-900 border-success-200",
      warning: "bg-warning-100 text-warning-900 border-warning-200",
      error: "bg-destructive-100 text-destructive-900 border-destructive-200",
      default: "bg-neutral-100 text-neutral-700 border-neutral-200",
    };
    return colors[status] || colors.default;
  };

  const getStatusDotColor = (status: string) => {
    const colors: Record<string, string> = {
      success: "bg-success-600",
      warning: "bg-warning-600",
      error: "bg-destructive-600",
      default: "bg-neutral-600",
    };
    return colors[status] || colors.default;
  };

  const getIcon = (iconType?: string) => {
    switch (iconType) {
      case "link":
        return <Link className="h-3.5 w-3.5" />;
      case "burst":
        return <Zap className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  if (properties.length === 0) return null;

  return (
    <div className="px-4 pb-4">
      <div className="space-y-2">
        {properties.map((property) => (
          <div key={property.id} className="group flex items-center gap-2">
            {/* Property Name */}
            <div className="flex w-40 items-center gap-1 text-neutral-500">
              <div className="opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                <GripVertical className="h-3 w-3 cursor-grab" />
              </div>
              <div className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-button)] px-2 py-1 hover:bg-neutral-100">
                {getIcon(property.icon)}
                <span className="text-sm">{property.name}</span>
              </div>
            </div>

            {/* Property Value */}
            <div className="flex-1">
              {/* Status Property */}
              {property.type === "status" && property.value && typeof property.value === "object" && (
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs ${getStatusColor(property.value.color)} transition-all duration-150`}
                >
                  <div className={`h-2 w-2 rounded-full ${getStatusDotColor(property.value.color)}`} />
                  {property.value.label}
                </div>
              )}

              {/* URL Property */}
              {property.type === "url" && (
                <input
                  type="text"
                  placeholder="Empty"
                  value={typeof property.value === "string" ? property.value : ""}
                  className="w-full rounded-[var(--radius-button)] border border-transparent bg-transparent px-2 py-1 text-sm placeholder-neutral-300 transition-all duration-150 outline-none hover:bg-neutral-100 focus:border-neutral-200 focus:bg-white"
                  onChange={(e) => onPropertyChange?.(property.id, e.target.value)}
                />
              )}

              {/* Text Property */}
              {property.type === "text" && (
                <input
                  type="text"
                  placeholder="Empty"
                  value={typeof property.value === "string" ? property.value : ""}
                  className="w-full rounded-[var(--radius-button)] border border-transparent bg-transparent px-2 py-1 text-sm placeholder-neutral-300 transition-all duration-150 outline-none hover:bg-neutral-100 focus:border-neutral-200 focus:bg-white"
                  onChange={(e) => onPropertyChange?.(property.id, e.target.value)}
                />
              )}

              {/* Date Property */}
              {property.type === "date" && (
                <input
                  type="date"
                  value={typeof property.value === "string" ? property.value : ""}
                  className="rounded-[var(--radius-button)] border border-transparent bg-transparent px-2 py-1 text-sm transition-all duration-150 outline-none hover:bg-neutral-100 focus:border-neutral-200 focus:bg-white"
                  onChange={(e) => onPropertyChange?.(property.id, e.target.value)}
                />
              )}

              {/* Select Property */}
              {property.type === "select" && (
                <select
                  value={typeof property.value === "string" ? property.value : ""}
                  className="rounded-[var(--radius-button)] border border-transparent bg-transparent px-2 py-1 text-sm transition-all duration-150 outline-none hover:bg-neutral-100 focus:border-neutral-200 focus:bg-white"
                  onChange={(e) => onPropertyChange?.(property.id, e.target.value)}
                >
                  <option value="">Select...</option>
                  {/* Add options as needed */}
                </select>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
