"use client";

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
  return (
    <Sidebar {...props}>
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
