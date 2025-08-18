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
import { useCreatorsPageFlag, useGhostWriterFlag, useIdeaInboxFlag } from "@/hooks/use-feature-flag";
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
  // Layout customization
  slideoutWidth?: "default" | "wide"; // default = 1/2, wide = 2/3
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
  slideoutWidth = "default",
  openEvents = variant === "profile" ? ["profile:open"] : ["write:editor-set-content"],
  closeEvents = variant === "profile" ? ["profile:close"] : ["write:close-slideout"],
}: SlideoutWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isCreatorsPageEnabled = useCreatorsPageFlag();
  const isGhostWriterEnabled = useGhostWriterFlag();
  const isIdeaInboxEnabled = useIdeaInboxFlag();
  
  // Determine available options (custom or default)
  const isCustomMode = customOptions && customOptions.length > 0;
  
  const getDefaultOptions = (): SlideoutOption[] => {
    if (variant === "profile") {
      return [{ key: "profile", label: "Profile Settings", component: <UserProfileView /> }];
    }
    
    const baseOptions = [];
    
    // Add Ghost Writer tab if feature flag is enabled
    if (isGhostWriterEnabled) {
      baseOptions.push({ key: "ghostwriter", label: "Ghost Writer", component: <MinimalSlideoutEditor /> });
    }
    
    // Add Creators tab if feature flag is enabled
    if (isCreatorsPageEnabled) {
      baseOptions.push({ key: "creators", label: "Creators", component: <CreatorsView /> });
    }
    
    // Add Ideas tab if feature flag is enabled
    if (isIdeaInboxEnabled) {
      baseOptions.push({ key: "ideas", label: "Ideas", component: <IdeasView /> });
    }
    
    return baseOptions;
  };
  
  const defaultOptions: SlideoutOption[] = getDefaultOptions();

  const availableOptions = isCustomMode ? customOptions : defaultOptions;
  const getInitialSelectedOption = () => {
    if (defaultSelectedOption) return defaultSelectedOption;
    if (variant === "profile") return "profile";
    if (availableOptions.length > 0) return availableOptions[0].key;
    // Fallback hierarchy: ghostwriter -> creators -> ideas -> profile
    if (isGhostWriterEnabled) return "ghostwriter";
    if (isCreatorsPageEnabled) return "creators";
    if (isIdeaInboxEnabled) return "ideas";
    return "profile";
  };
  
  const initialSelectedOption = getInitialSelectedOption();

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
        // Check if the requested view is available
        const isViewAvailable = availableOptions.some(option => option.key === view);
        if (isViewAvailable) {
          setSelectedOption(view);
          setIsOpen(true);
        } else {
          // If requested view is not available due to feature flag, fallback to first available option
          const fallbackOption = availableOptions[0]?.key;
          if (fallbackOption) {
            setSelectedOption(fallbackOption);
            setIsOpen(true);
          }
        }
      }
    };
    window.addEventListener("playbook:open-slideout", openWithView as EventListener);
    return () => {
      window.removeEventListener("playbook:open-slideout", openWithView as EventListener);
    };
  }, [availableOptions, isCreatorsPageEnabled, isGhostWriterEnabled, isIdeaInboxEnabled]);

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
    <div className={cn("flex h-[100dvh] w-full flex-col overflow-hidden font-sans", className)}>
      <div className={cn("relative flex flex-1 overflow-hidden")}>
        {/* Main content area (wrapped) */}
        <div
          className={cn(
            "min-h-0 overflow-hidden transition-all ease-out",
            "cubic-bezier(0.32, 0.72, 0, 1) duration-300",
            isWritePage && isOpen
              ? "flex w-full pr-[600px]" // On write page, add right padding for slideout width
              : isOpen
                ? slideoutWidth === "wide"
                  ? "hidden lg:flex lg:w-1/3" // Wide slideout: content takes 1/3
                  : "hidden lg:flex lg:w-1/2" // Default slideout: content takes 1/2
                : "flex w-full",
            contentClassName,
          )}
        >
          <div className="flex h-full w-full flex-col overflow-y-auto">{children}</div>
        </div>

        {/* Slideout panel */}
        <div
          className={cn(
            "bg-background border-border transition-all ease-out",
            "shadow-[var(--shadow-soft-drop)]",
            isWritePage
              ? // Write page: separate overlay slider
                cn(
                  "fixed inset-y-0 right-0 z-50 w-[600px] max-w-[90vw] border-l",
                  "cubic-bezier(0.32, 0.72, 0, 1) transition-transform duration-300",
                  isOpen ? "translate-x-0" : "translate-x-full",
                )
              : // Other pages: integrated behavior with width options
                cn(
                  "absolute inset-y-0 right-0 z-40 w-full max-w-full border-l lg:static lg:h-auto",
                  "cubic-bezier(0.32, 0.72, 0, 1) transition-all duration-300",
                  slideoutWidth === "wide" ? "lg:w-2/3" : "lg:w-1/2",
                  isOpen ? "translate-x-0" : "translate-x-full lg:hidden lg:translate-x-0",
                ),
          )}
        >
          <div className="flex h-full flex-col">
            {/* Production-grade Header */}
            <div className="bg-background border-border flex min-h-[60px] items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-3">
                {/* Custom header actions go on the left when in custom mode */}
                {isCustomMode ? (
                  customHeaderActions
                ) : (
                  <>
                    {/* Only show tabs if there are multiple options or not profile variant */}
                    {(variant !== "profile" || availableOptions.length > 1) &&
                      availableOptions.map((option) => (
                        <button
                          key={option.key}
                          onClick={() => setSelectedOption(option.key)}
                          className={cn(
                            "px-4 py-2 text-sm font-medium transition-all duration-200",
                            "rounded-[var(--radius-button)]",
                            selectedOption === option.key
                              ? "bg-accent/10 text-foreground shadow-[var(--shadow-soft-drop)]"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/5",
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    {/* Profile variant with single option shows title instead */}
                    {variant === "profile" && availableOptions.length === 1 && (
                      <h2 className="text-foreground text-lg font-semibold">{availableOptions[0].label}</h2>
                    )}
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Default header actions when not in custom mode */}
                {!isCustomMode && (
                  <SlideoutHeaderActions selectedOption={selectedOption} isWritePage={isWritePage} variant={variant} />
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground hover:bg-accent/10 flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)] transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content area with panel-optimized styling */}
            <div className="flex-1 overflow-y-auto" ref={slideoutScrollRef}>
              <div className="space-y-4 p-6">
                {availableOptions.find((option) => option.key === selectedOption)?.component}
              </div>
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
