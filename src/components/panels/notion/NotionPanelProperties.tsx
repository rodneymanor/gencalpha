'use client';

import React from 'react';
import { Link, Zap, GripVertical } from 'lucide-react';

export interface PageProperty {
  id: string;
  type: 'url' | 'status' | 'text' | 'select' | 'date';
  name: string;
  value?: string | { label: string; color: string };
  icon?: string;
}

interface NotionPanelPropertiesProps {
  properties: PageProperty[];
  onPropertyChange?: (id: string, value: string | { label: string; color: string }) => void;
}

export default function NotionPanelProperties({
  properties,
  onPropertyChange
}: NotionPanelPropertiesProps) {
  
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      success: 'bg-success-100 text-success-900 border-success-200',
      warning: 'bg-warning-100 text-warning-900 border-warning-200',
      error: 'bg-destructive-100 text-destructive-900 border-destructive-200',
      default: 'bg-neutral-100 text-neutral-700 border-neutral-200'
    };
    return colors[status] || colors.default;
  };

  const getStatusDotColor = (status: string) => {
    const colors: Record<string, string> = {
      success: 'bg-success-600',
      warning: 'bg-warning-600',
      error: 'bg-destructive-600',
      default: 'bg-neutral-600'
    };
    return colors[status] || colors.default;
  };

  const getIcon = (iconType?: string) => {
    switch (iconType) {
      case 'link':
        return <Link className="w-3.5 h-3.5" />;
      case 'burst':
        return <Zap className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  if (properties.length === 0) return null;

  return (
    <div className="px-4 pb-4">
      <div className="space-y-2">
        {properties.map((property) => (
          <div key={property.id} className="flex items-center gap-2 group">
            {/* Property Name */}
            <div className="flex items-center gap-1 w-40 text-neutral-500">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <GripVertical className="w-3 h-3 cursor-grab" />
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-button)] hover:bg-neutral-100 cursor-pointer">
                {getIcon(property.icon)}
                <span className="text-sm">{property.name}</span>
              </div>
            </div>

            {/* Property Value */}
            <div className="flex-1">
              {/* Status Property */}
              {property.type === 'status' && property.value && typeof property.value === 'object' && (
                <div className={`
                  inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs
                  ${getStatusColor(property.value.color)} transition-all duration-150
                `}>
                  <div className={`w-2 h-2 rounded-full ${getStatusDotColor(property.value.color)}`} />
                  {property.value.label}
                </div>
              )}

              {/* URL Property */}
              {property.type === 'url' && (
                <input
                  type="text"
                  placeholder="Empty"
                  value={typeof property.value === 'string' ? property.value : ''}
                  className="w-full px-2 py-1 text-sm bg-transparent border border-transparent rounded-[var(--radius-button)] hover:bg-neutral-100 focus:bg-white focus:border-neutral-200 outline-none transition-all duration-150 placeholder-neutral-300"
                  onChange={(e) => onPropertyChange?.(property.id, e.target.value)}
                />
              )}

              {/* Text Property */}
              {property.type === 'text' && (
                <input
                  type="text"
                  placeholder="Empty"
                  value={typeof property.value === 'string' ? property.value : ''}
                  className="w-full px-2 py-1 text-sm bg-transparent border border-transparent rounded-[var(--radius-button)] hover:bg-neutral-100 focus:bg-white focus:border-neutral-200 outline-none transition-all duration-150 placeholder-neutral-300"
                  onChange={(e) => onPropertyChange?.(property.id, e.target.value)}
                />
              )}

              {/* Date Property */}
              {property.type === 'date' && (
                <input
                  type="date"
                  value={typeof property.value === 'string' ? property.value : ''}
                  className="px-2 py-1 text-sm bg-transparent border border-transparent rounded-[var(--radius-button)] hover:bg-neutral-100 focus:bg-white focus:border-neutral-200 outline-none transition-all duration-150"
                  onChange={(e) => onPropertyChange?.(property.id, e.target.value)}
                />
              )}

              {/* Select Property */}
              {property.type === 'select' && (
                <select
                  value={typeof property.value === 'string' ? property.value : ''}
                  className="px-2 py-1 text-sm bg-transparent border border-transparent rounded-[var(--radius-button)] hover:bg-neutral-100 focus:bg-white focus:border-neutral-200 outline-none transition-all duration-150"
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