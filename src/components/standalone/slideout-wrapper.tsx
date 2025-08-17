"use client";

import React, { useEffect, useRef, useState, type ReactNode } from "react";

import { usePathname } from "next/navigation";

import { X } from "lucide-react";

import { CreatorsView } from "@/components/standalone/creators-view";
import { IdeasView } from "@/components/standalone/ideas-view";
import MinimalSlideoutEditor from "@/components/standalone/minimal-slideout-editor";
import { ContextualMenu } from "@/components/standalone/slideout-contextual-menu";
import { SlideoutHeaderActions } from "@/components/standalone/slideout-header-actions";
import { UserProfileView } from "@/components/standalone/user-profile-view";
import { Button } from "@/components/ui/button";
import { PillButton } from "@/components/ui/pill-button";
import { cn } from "@/lib/utils";

export interface SlideoutOption {
  key: string;
  label: string;
  component: ReactNode;
}

export interface SlideoutWrapperProps {
  children: ReactNode;
  slideout: ReactNode;
  className?: string;
  contentClassName?: string;
  // Custom slideout configuration
  customOptions?: SlideoutOption[];
  customHeaderActions?: ReactNode;
  defaultSelectedOption?: string;
  openEvents?: string[];
  closeEvents?: string[];
  // Profile-specific props
  variant?: "default" | "profile";
}

// eslint-disable-next-line complexity
export function SlideoutWrapper({
  children,
  slideout: _slideout,
  className,
  contentClassName,
  customOptions,
  customHeaderActions,
  defaultSelectedOption,
  variant = "default",
  openEvents = variant === "profile" ? ["profile:open"] : ["write:editor-set-content"],
  closeEvents = variant === "profile" ? ["profile:close"] : ["write:close-slideout"],
}: SlideoutWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Determine available options (custom or default)
  const isCustomMode = customOptions && customOptions.length > 0;
  const defaultOptions: SlideoutOption[] =
    variant === "profile"
      ? [{ key: "profile", label: "Profile Settings", component: <UserProfileView /> }]
      : [
          { key: "ghostwriter", label: "Ghost Writer", component: <MinimalSlideoutEditor /> },
          { key: "creators", label: "Creators", component: <CreatorsView /> },
          { key: "ideas", label: "Ideas", component: <IdeasView /> },
        ];

  const availableOptions = isCustomMode ? customOptions : defaultOptions;
  const initialSelectedOption =
    defaultSelectedOption ?? availableOptions[0]?.key ?? (variant === "profile" ? "profile" : "ghostwriter");

  const [selectedOption, setSelectedOption] = useState<string>(initialSelectedOption);
  const [menuState, setMenuState] = useState<{
    isVisible: boolean;
    top: number;
    left: number;
    text: string;
  } | null>(null);
  const pathname = usePathname();
  const slideoutScrollRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  // Reference to satisfy linter while we intentionally ignore external slideout content
  void _slideout;

  // Check if we're on the write page
  const isWritePage = pathname === "/write";

  // Close slideout on page navigation
  useEffect(() => {
    setIsOpen(false);
    setMenuState(null);
  }, [pathname]);

  // Open slideout when configured events are triggered
  useEffect(() => {
    if (typeof window === "undefined" || !openEvents.length) return;
    const openHandler = () => setIsOpen(true);

    openEvents.forEach((eventName) => {
      window.addEventListener(eventName, openHandler as EventListener);
    });

    return () => {
      openEvents.forEach((eventName) => {
        window.removeEventListener(eventName, openHandler as EventListener);
      });
    };
  }, [openEvents]);

  // Close slideout when configured events are triggered
  useEffect(() => {
    if (typeof window === "undefined" || !closeEvents.length) return;
    const closeHandler = () => setIsOpen(false);

    closeEvents.forEach((eventName) => {
      window.addEventListener(eventName, closeHandler as EventListener);
    });

    return () => {
      closeEvents.forEach((eventName) => {
        window.removeEventListener(eventName, closeHandler as EventListener);
      });
    };
  }, [closeEvents]);

  // Open slideout with specific view when triggered from PlaybookCards
  useEffect(() => {
    if (typeof window === "undefined") return;
    const openWithView = (ev: Event) => {
      const e = ev as CustomEvent<{ view: "ideas" | "ghostwriter" | "creators" }>;
      const view = e.detail?.view;
      if (view) {
        setSelectedOption(view);
        setIsOpen(true);
      }
    };
    window.addEventListener("playbook:open-slideout", openWithView as EventListener);
    return () => {
      window.removeEventListener("playbook:open-slideout", openWithView as EventListener);
    };
  }, []);

  // Handle contextual interactions from read-only editor
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (ev: Event) => {
      const e = ev as CustomEvent<{ element?: HTMLElement; text?: string }>;
      const el = e.detail?.element;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const menuWidth = 240; // approximate width for positioning guard
      const top = rect.bottom + 8; // 8px offset on 4px grid
      const left = Math.min(rect.left, window.innerWidth - menuWidth - 8);
      setIsOpen(true);
      setMenuState({ isVisible: true, top, left, text: e.detail?.text ?? "" });
    };
    window.addEventListener("write:script-component-click", handler as EventListener);
    return () => window.removeEventListener("write:script-component-click", handler as EventListener);
  }, []);

  // Close menu on outside click / escape / scroll within slideout
  useEffect(() => {
    if (!menuState?.isVisible) return;
    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (menuRef.current && target && !menuRef.current.contains(target)) {
        setMenuState(null);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuState(null);
    };
    const onScroll = () => setMenuState(null);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    const currentRef = slideoutScrollRef.current;
    currentRef?.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
      currentRef?.removeEventListener("scroll", onScroll as EventListener);
    };
  }, [menuState?.isVisible]);

  return (
    <div className={cn("flex min-h-[100dvh] w-full flex-col font-sans", className)}>
      <div className={cn("relative flex flex-1 overflow-hidden")}>
        {/* Main content area (wrapped) */}
        <div
          className={cn(
            "min-h-0 transition-all duration-300",
            isWritePage && isOpen
              ? "flex w-full pr-[400px]" // On write page, add right padding for slideout width
              : isOpen
                ? "hidden lg:flex lg:w-1/2" // On other pages, use original behavior
                : "flex w-full",
            contentClassName,
          )}
        >
          <div className="flex w-full flex-col">{children}</div>
        </div>

        {/* Slideout panel */}
        <div
          className={cn(
            "border-border bg-card transition-all duration-300",
            isWritePage
              ? // Write page: separate overlay slider
                cn(
                  "fixed inset-y-0 right-0 z-50 w-[400px] max-w-[90vw] border-l",
                  isOpen ? "translate-x-0" : "translate-x-full",
                )
              : // Other pages: original integrated behavior
                cn(
                  "absolute inset-y-0 right-0 z-40 w-full max-w-full border-l lg:static lg:h-auto lg:w-1/2",
                  isOpen ? "translate-x-0" : "translate-x-full lg:hidden lg:translate-x-0",
                ),
          )}
        >
          <div className="flex h-full flex-col">
            {/* Toolbar/Header with option selection */}
            <div className="bg-card border-border flex items-center justify-between border-b px-3 py-2">
              <div className="flex items-center gap-2">
                {/* Only show tabs if there are multiple options or not profile variant */}
                {(variant !== "profile" || availableOptions.length > 1) &&
                  availableOptions.map((option) => (
                    <PillButton
                      key={option.key}
                      label={option.label}
                      selected={selectedOption === option.key}
                      onClick={() => setSelectedOption(option.key)}
                      className="h-8 px-3 text-sm"
                    />
                  ))}
                {/* Profile variant with single option shows title instead */}
                {variant === "profile" && availableOptions.length === 1 && (
                  <h2 className="text-foreground text-lg font-semibold">{availableOptions[0].label}</h2>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Custom header actions or default actions */}
                {isCustomMode ? (
                  customHeaderActions
                ) : (
                  <SlideoutHeaderActions selectedOption={selectedOption} isWritePage={isWritePage} variant={variant} />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-[var(--radius-button)]"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Editor area - minimal, no extra borders, specified padding */}
            <div className="flex-1 overflow-y-auto" ref={slideoutScrollRef}>
              {availableOptions.find((option) => option.key === selectedOption)?.component}
            </div>
            <ContextualMenu
              isVisible={menuState?.isVisible ?? false}
              top={menuState?.top ?? 0}
              left={menuState?.left ?? 0}
              text={menuState?.text ?? ""}
              onClose={() => setMenuState(null)}
              ref={menuRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SlideoutWrapper;
