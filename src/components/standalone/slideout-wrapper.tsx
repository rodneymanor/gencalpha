"use client";

import React, { useEffect, useRef, useState, type ReactNode } from "react";

import { usePathname } from "next/navigation";

import { ChevronDown, Copy, X } from "lucide-react";

import MinimalSlideoutEditor from "@/components/standalone/minimal-slideout-editor";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SlideoutWrapperProps {
  children: ReactNode;
  slideout: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SlideoutWrapper({ children, slideout: _slideout, className, contentClassName }: SlideoutWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);
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

  // Close slideout on page navigation
  useEffect(() => {
    setIsOpen(false);
    setMenuState(null);
  }, [pathname]);

  // Open slideout when structured content is sent to the editor. The editor itself
  // is updated by the event payload; this effect only toggles visibility.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const openOnStructuredAnswer = () => setIsOpen(true);
    window.addEventListener("write:editor-set-content", openOnStructuredAnswer as EventListener);
    return () => {
      window.removeEventListener("write:editor-set-content", openOnStructuredAnswer as EventListener);
    };
  }, []);

  // Close slideout when requested via global event (e.g., from new script button)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const closeOnRequest = () => setIsOpen(false);
    window.addEventListener("write:close-slideout", closeOnRequest as EventListener);
    return () => {
      window.removeEventListener("write:close-slideout", closeOnRequest as EventListener);
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
    slideoutScrollRef.current?.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
      slideoutScrollRef.current?.removeEventListener("scroll", onScroll as EventListener);
    };
  }, [menuState?.isVisible]);

  return (
    <div className={cn("flex min-h-[100dvh] w-full flex-col font-sans", className)}>
      <div className={cn("relative flex flex-1 overflow-hidden")}>
        {/* Main content area (wrapped) */}
        <div
          className={cn(
            "min-h-0 transition-all duration-300",
            isOpen ? "hidden lg:flex lg:w-1/2" : "flex w-full",
            contentClassName,
          )}
        >
          <div className="flex w-full flex-col">{children}</div>
        </div>

        {/* Slideout panel */}
        <div
          className={cn(
            "border-border bg-card absolute inset-y-0 right-0 z-40 w-full max-w-full border-l shadow-[var(--shadow-soft-drop)] transition-transform duration-300 lg:static lg:h-auto lg:w-1/2",
            isOpen ? "translate-x-0" : "translate-x-full lg:hidden lg:translate-x-0",
          )}
        >
          <div className="flex h-full flex-col">
            {/* Toolbar/Header (preserved) */}
            <div className="bg-card border-border flex items-center justify-between border-b px-3 py-2">
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <div className="border-border flex items-center overflow-hidden rounded-[var(--radius-button)] border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 rounded-none border-0 px-3 has-[>svg]:px-2.5"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </Button>
                  <div className="bg-border h-8 w-px" />
                  <Button variant="ghost" size="icon" className="size-8 rounded-none">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="default" size="sm" className="h-8 gap-1.5 rounded-[var(--radius-button)] px-3">
                  Publish
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-[var(--radius-button)]"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Editor area - minimal, no extra borders, specified padding */}
            <div className="flex-1 overflow-y-auto" ref={slideoutScrollRef}>
              <MinimalSlideoutEditor />
            </div>
            {/* Contextual dropdown for script components (dummy actions) */}
            {menuState?.isVisible ? (
              <div className="fixed z-50" style={{ top: menuState.top, left: menuState.left }} ref={menuRef}>
                <div className="bg-card border-border text-foreground min-w-[220px] rounded-[var(--radius-card)] border shadow-[var(--shadow-soft-drop)]">
                  <div className="px-3 py-2 text-xs opacity-80">{menuState.text || "Script component"}</div>
                  <div className="bg-border h-px w-full" />
                  <div className="p-1">
                    {/* TODO: Wire these menu items to real actions (insert/replace/open editors) */}
                    <button
                      className="hover:bg-accent hover:text-accent-foreground w-full rounded-[var(--radius-button)] px-3 py-2 text-left text-sm"
                      onClick={() => {
                        console.log("Add Hook clicked");
                        setMenuState(null);
                      }}
                    >
                      Add Hook
                    </button>
                    <button
                      className="hover:bg-accent hover:text-accent-foreground w-full rounded-[var(--radius-button)] px-3 py-2 text-left text-sm"
                      onClick={() => {
                        console.log("Add Bridge clicked");
                        setMenuState(null);
                      }}
                    >
                      Add Bridge
                    </button>
                    <button
                      className="hover:bg-accent hover:text-accent-foreground w-full rounded-[var(--radius-button)] px-3 py-2 text-left text-sm"
                      onClick={() => {
                        console.log("Mark as Golden Nugget clicked");
                        setMenuState(null);
                      }}
                    >
                      Mark as Golden Nugget
                    </button>
                    <button
                      className="hover:bg-accent hover:text-accent-foreground w-full rounded-[var(--radius-button)] px-3 py-2 text-left text-sm"
                      onClick={() => {
                        try {
                          navigator.clipboard.writeText(menuState.text ?? "");
                        } catch {
                          /* no-op */
                        }
                        setMenuState(null);
                      }}
                    >
                      Copy Text
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SlideoutWrapper;
