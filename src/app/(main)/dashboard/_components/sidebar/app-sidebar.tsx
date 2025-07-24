"use client";

import { useEffect, useRef } from "react";

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
import { APP_CONFIG } from "@/config/app-config";
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

function SidebarLogo() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarMenuButton asChild className="!h-12">
      <a href="#" className="flex w-full items-center justify-center">
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

  // Set initial collapsed state once
  useEffect(() => {
    console.log("🔍 [Sidebar] Setting initial collapsed state");
    setOpen(false);
  }, [setOpen]);

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
  }, []); // Remove setOpen from dependencies to prevent infinite loop

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
          <NavMain items={sidebarItems} />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
