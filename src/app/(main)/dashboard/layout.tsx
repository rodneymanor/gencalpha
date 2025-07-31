import { ReactNode } from "react";

import { DashboardWrapper } from "@/app/(main)/dashboard/_components/dashboard-wrapper";
import { AppSidebar } from "@/app/(main)/dashboard/_components/sidebar/app-sidebar";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
// import removed: OnboardingProgress
import { ProcessingNotificationBadge } from "@/components/ui/processing-notification-badge";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ScriptPanelProvider } from "@/contexts/script-panel-context";
import { cn } from "@/lib/utils";
import { getPreference } from "@/server/server-actions";
import {
  SIDEBAR_VARIANT_VALUES,
  SIDEBAR_COLLAPSIBLE_VALUES,
  CONTENT_LAYOUT_VALUES,
  type SidebarVariant,
  type SidebarCollapsible,
  type ContentLayout,
} from "@/types/preferences/layout";

export default async function Layout({ children }: Readonly<{ children: ReactNode }>) {
  const [sidebarVariant, sidebarCollapsible, contentLayout] = await Promise.all([
    getPreference<SidebarVariant>("sidebar_variant", SIDEBAR_VARIANT_VALUES, "inset"),
    getPreference<SidebarCollapsible>("sidebar_collapsible", SIDEBAR_COLLAPSIBLE_VALUES, "icon"),
    getPreference<ContentLayout>("content_layout", CONTENT_LAYOUT_VALUES, "centered"),
  ]);

  const layoutPreferences = {
    contentLayout,
    variant: sidebarVariant,
    collapsible: sidebarCollapsible,
  };

  return (
    <DashboardWrapper>
      <ScriptPanelProvider>
        <SidebarProvider defaultOpen={false}>
          <AppSidebar variant={sidebarVariant} collapsible={sidebarCollapsible} layoutPreferences={layoutPreferences} />
          <SidebarInset
            data-content-layout={contentLayout}
            className={cn(
              "data-[content-layout=centered]:!mx-auto data-[content-layout=centered]:max-w-screen-2xl",
              // Adds right margin for inset sidebar in centered layout up to 113rem.
              // On wider screens with collapsed sidebar, removes margin and sets margin auto for alignment.
              "max-[113rem]:peer-data-[variant=inset]:!mr-2 min-[101rem]:peer-data-[variant=inset]:peer-data-[state=collapsed]:!mr-auto",
            )}
          >
            <div className="h-full">
              <div className="mx-auto max-w-6xl">
                <div className="relative">
                  
                  <div className="absolute top-6 right-6">
                    <ProcessingNotificationBadge />
                  </div>
                </div>
                <div className="px-4 pb-4 pt-6 md:px-6 md:pb-6 md:pt-8">{children}</div>
              </div>
            </div>
            <FloatingActionButton />
          </SidebarInset>
        </SidebarProvider>
      </ScriptPanelProvider>
    </DashboardWrapper>
  );
}
