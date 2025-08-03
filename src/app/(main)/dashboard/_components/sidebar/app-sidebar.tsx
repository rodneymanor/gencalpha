"use client";

import { useEffect, useRef, useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";
import { type SidebarVariant, type SidebarCollapsible, type ContentLayout } from "@/types/preferences/layout";

import { LayoutControls } from "./layout-controls";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { ThemeSwitcher } from "./theme-switcher";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  layoutPreferences?: {
    contentLayout: ContentLayout;
    variant: SidebarVariant;
    collapsible: SidebarCollapsible;
  };
}

function SidebarLogo() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarMenuButton asChild className="!h-12">
      <a href="#" className="flex w-full items-center justify-start">
        {isCollapsed ? (
          // Show "G" when collapsed
          <span className="text-foreground text-2xl font-bold">G</span>
        ) : (
          // Show full "Gen.C" when expanded
          <div className="flex items-center gap-1">
            <span className="text-foreground text-xl font-bold">Gen</span>
            <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
            <span className="text-foreground text-xl font-bold">C</span>
          </div>
        )}
      </a>
    </SidebarMenuButton>
  );
}

export function AppSidebar({ layoutPreferences, ...props }: AppSidebarProps) {
  const { setOpen } = useSidebar();
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

  // Set up hover listeners
  useEffect(() => {
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
  }, [isPinned, setOpen]); // Include both isPinned and setOpen in dependencies

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
    <Sidebar ref={sidebarRef} className="transition-all duration-300 ease-in-out" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarLogo />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex flex-col">
        <div className="flex-1 overflow-auto">
          <NavMain items={sidebarItems} isPinned={isPinned} onPinToggle={handlePinToggle} />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col items-center gap-2 px-2 pb-2">
          <LayoutControls {...(layoutPreferences || { variant: "inset", collapsible: "icon", contentLayout: "centered" })} />
          <ThemeSwitcher />
        </div>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
