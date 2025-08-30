"use client";

import { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Centered Page Template
 *
 * Replicates the collections page design pattern with:
 * - Perfect viewport centering (max-w-4xl)
 * - Responsive padding following the 4px grid system
 * - Side panel awareness for dynamic spacing
 * - Flexible header and content areas
 * - Maintains design system consistency with numbered variants
 */

export interface CenteredPageTemplateProps {
  /** Page header content - typically includes title, description, and actions */
  header?: ReactNode;

  /** Main content area - grids, lists, or any page content */
  children: ReactNode;

  /** Additional bottom content - dialogs, modals, etc. */
  footer?: ReactNode;

  /** Override the default max-width constraint */
  maxWidth?: "3xl" | "4xl" | "5xl" | "6xl" | "7xl";

  /** Custom CSS classes for the main container */
  className?: string;

  /** Custom CSS classes for the content wrapper */
  contentClassName?: string;

  /** Remove default background styling */
  removeBackground?: boolean;

  /** Custom padding override */
  customPadding?: string;
}

/**
 * Header Template Component
 * Pre-styled header following collections page patterns
 */
export interface PageHeaderProps {
  /** Main page title */
  title: string;

  /** Optional subtitle/description */
  subtitle?: string;

  /** Action buttons (typically on the right) */
  actions?: ReactNode;

  /** Additional content below title/subtitle */
  children?: ReactNode;

  /** Custom CSS classes */
  className?: string;
}

export function PageHeader({ title, subtitle, actions, children, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-6 flex items-center justify-between", className)}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">{title}</h1>
        {subtitle && <p className="mt-1 text-neutral-600">{subtitle}</p>}
        {children}
      </div>
      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  );
}

/**
 * Content Section Component
 * Pre-styled content areas with proper spacing
 */
export interface ContentSectionProps {
  /** Section content */
  children: ReactNode;

  /** Top margin override */
  topMargin?: "none" | "sm" | "md" | "lg";

  /** Custom CSS classes */
  className?: string;
}

export function ContentSection({ children, topMargin = "md", className }: ContentSectionProps) {
  const marginClasses = {
    none: "",
    sm: "mt-4",
    md: "mt-6",
    lg: "mt-8",
  };

  return <div className={cn(marginClasses[topMargin], className)}>{children}</div>;
}

export function CenteredPageTemplate({
  header,
  children,
  footer,
  maxWidth = "4xl",
  className,
  contentClassName,
  removeBackground = false,
  customPadding,
}: CenteredPageTemplateProps) {
  const maxWidthClasses = {
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
  };

  const defaultPadding = "px-3 sm:px-4 py-4 sm:py-6 lg:px-8";
  const appliedPadding = customPadding || defaultPadding;

  return (
    <div
      className={cn(
        // Background and min-height
        !removeBackground && "bg-background min-h-screen",
        className,
      )}
      id="centered-page-main-content"
    >
      <div
        className={cn(
          // Responsive centering and padding following collections pattern
          "mx-auto",
          maxWidthClasses[maxWidth],
          appliedPadding,
          contentClassName,
        )}
      >
        {/* Header Section */}
        {header}

        {/* Main Content */}
        {children}
      </div>

      {/* Footer Content (dialogs, modals, etc.) */}
      {footer}
    </div>
  );
}
