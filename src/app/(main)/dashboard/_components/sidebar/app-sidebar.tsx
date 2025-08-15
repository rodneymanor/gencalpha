"use client";

import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { PanelLeft } from "lucide-react";

import { ThemeSwitcher as ColorThemeSwitcher } from "@/components/theme/theme-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";
import { type SidebarVariant, type SidebarCollapsible, type ContentLayout } from "@/types/preferences/layout";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  layoutPreferences?: {
    contentLayout: ContentLayout;
    variant: SidebarVariant;
    collapsible: SidebarCollapsible;
  };
}

function SidebarLogo({ isPinned, onPinToggle }: { isPinned: boolean; onPinToggle: () => void }) {
  const { state, isMobile } = useSidebar();
  const router = useRouter();
  const isCollapsed = state === "collapsed";

  const handleLogoClick = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex h-12 w-full items-center justify-between px-2">
      {isCollapsed && !isMobile ? (
        // Show "G" when collapsed on desktop only
        <span
          className="text-foreground hover:text-primary cursor-pointer text-2xl font-bold transition-colors duration-200 ease-linear"
          onClick={handleLogoClick}
        >
          G
        </span>
      ) : (
        <>
          {/* Logo on the left */}
          <div
            className="hover:text-primary flex cursor-pointer items-center gap-1 transition-colors duration-200 ease-linear"
            onClick={handleLogoClick}
          >
            <span className="text-foreground text-xl font-bold">Gen</span>
            <div className="bg-brand h-2 w-2 rounded-[var(--radius-pill)]"></div>
            <span className="text-foreground text-xl font-bold">C</span>
          </div>
          {/* PanelLeft icon on the right - hide on mobile */}
          {!isMobile && (
            <div className="hover:bg-accent hover:text-accent-foreground flex items-center justify-center rounded-[var(--radius-button)] p-1 transition-colors duration-200 ease-linear">
              <PanelLeft
                className={`h-4 w-4 cursor-pointer transition-colors duration-200 ease-linear ${isPinned ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                onClick={onPinToggle}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function AppSidebar({ layoutPreferences: _layoutPreferences, ...props }: AppSidebarProps) {
  const { setOpen, isMobile } = useSidebar();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const initializedRef = useRef(false);
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar_pinned") === "true";
    }
    return false;
  });

  // Set initial collapsed state only once
  useEffect(() => {
    if (!initializedRef.current) {
      console.log("🔍 [Sidebar] Setting initial state based on pin preference");
      setOpen(isPinned);
      initializedRef.current = true;
    }
  }, [isPinned, setOpen]); // Sync sidebar open state with pin preference

  // Persist pin state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar_pinned", String(isPinned));
    }
  }, [isPinned]);

  // Set up hover listeners (disabled on mobile)
  useEffect(() => {
    // Skip hover behavior on mobile
    if (isMobile) {
      console.log("🔍 [Sidebar] Mobile detected, skipping hover listeners");
      return;
    }

    console.log("🔍 [Sidebar] useEffect running, setting up hover listeners");

    const sidebar = sidebarRef.current;
    if (!sidebar) {
      console.warn("⚠️ [Sidebar] sidebarRef.current is null, cannot attach listeners");
      return;
    }

    const handleMouseEnter = () => {
      console.log("🔍 [Sidebar] Mouse enter - expanding sidebar");
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      setOpen(true);
    };

    const handleMouseLeave = () => {
      // Don't auto-collapse if pinned
      if (isPinned) {
        console.log("🔍 [Sidebar] Mouse leave - sidebar is pinned, staying open");
        return;
      }

      console.log("🔍 [Sidebar] Mouse leave - collapsing sidebar in 300ms");
      hoverTimeoutRef.current = setTimeout(() => {
        console.log("🔍 [Sidebar] Collapsing sidebar now");
        setOpen(false);
      }, 300); // 300ms delay before closing
    };

    sidebar.addEventListener("mouseenter", handleMouseEnter);
    sidebar.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      sidebar.removeEventListener("mouseenter", handleMouseEnter);
      sidebar.removeEventListener("mouseleave", handleMouseLeave);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [isPinned, setOpen, isMobile]); // Include isMobile in dependencies

  const handlePinToggle = () => {
    console.log("🔍 [Sidebar] Pin toggle - current state:", isPinned);
    setIsPinned(!isPinned);

    if (!isPinned) {
      // When pinning, ensure sidebar is open
      setOpen(true);
    } else {
      // When unpinning, close the sidebar
      setOpen(false);
    }
  };

  return (
    <Sidebar ref={sidebarRef} {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarLogo isPinned={isPinned} onPinToggle={handlePinToggle} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex flex-col">
        <div className="flex-1 overflow-auto">
          <NavMain items={sidebarItems} />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col items-center gap-2 px-2 pb-2">
          <ColorThemeSwitcher />
          {/* <LayoutControls
            {...(layoutPreferences ?? { variant: "inset", collapsible: "icon", contentLayout: "centered" })}
          />
          <ThemeSwitcher /> */}
        </div>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
