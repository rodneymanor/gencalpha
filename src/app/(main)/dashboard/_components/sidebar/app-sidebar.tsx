"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { APP_CONFIG } from "@/config/app-config";
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

export function AppSidebar({ layoutPreferences, ...props }: AppSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-white">Gen</span>
                  <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                  <span className="text-2xl font-bold text-white">C</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex flex-col">
        <div className="flex-1 overflow-auto">
          <NavMain items={sidebarItems} />
        </div>
        <div className="mt-auto border-t pt-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <ThemeSwitcher />
            </SidebarMenuItem>
            <SidebarMenuItem>{layoutPreferences && <LayoutControls {...layoutPreferences} />}</SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
