"use client";

import React from "react";

import { ChevronsRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SlideoutHeaderProps {
  // Left side content (title, badge, etc.)
  leftContent?: React.ReactNode;
  // Right side actions (buttons, etc.)
  rightActions?: React.ReactNode;
  // Close handler
  onClose: () => void;
  // Additional className for customization
  className?: string;
  // Hide close button (for special cases)
  hideCloseButton?: boolean;
}

/**
 * Standardized header component for all slideout panels
 * Height: 52px (13 * 4px grid)
 * Padding: p-2 (8px)
 * Close icon: ChevronsRight on left side
 */
export function SlideoutHeader({
  leftContent,
  rightActions,
  onClose,
  className,
  hideCloseButton = false,
}: SlideoutHeaderProps) {
  return (
    <div
      className={cn(
        // Base styles - fixed height 52px with p-2
        "flex h-[52px] items-center justify-between border-b border-neutral-200 p-2",
        className
      )}
    >
      {/* Left side - Close button and content */}
      <div className="flex items-center gap-2">
        {!hideCloseButton && (
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="Close panel"
          >
            <ChevronsRight className="h-5 w-5" />
          </Button>
        )}
        {leftContent}
      </div>

      {/* Right side - Actions */}
      {rightActions && (
        <div className="flex items-center gap-2">
          {rightActions}
        </div>
      )}
    </div>
  );
}

// Common header patterns as convenience components

interface SimpleSlideoutHeaderProps extends Omit<SlideoutHeaderProps, 'leftContent'> {
  title: string;
  badge?: React.ReactNode;
}

/**
 * Simple header with just a title
 */
export function SimpleSlideoutHeader({
  title,
  badge,
  ...props
}: SimpleSlideoutHeaderProps) {
  return (
    <SlideoutHeader
      leftContent={
        <div className="flex items-center gap-2">
          {badge}
          <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
        </div>
      }
      {...props}
    />
  );
}

interface IconSlideoutHeaderProps extends Omit<SlideoutHeaderProps, 'leftContent'> {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}

/**
 * Header with icon, title and optional subtitle
 */
export function IconSlideoutHeader({
  icon,
  title,
  subtitle,
  ...props
}: IconSlideoutHeaderProps) {
  return (
    <SlideoutHeader
      leftContent={
        <div className="flex items-center gap-2">
          {icon}
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-neutral-900 leading-tight">{title}</h2>
            {subtitle && (
              <p className="text-xs text-neutral-600 leading-tight">{subtitle}</p>
            )}
          </div>
        </div>
      }
      {...props}
    />
  );
}