import { ReactNode } from "react";

import { DashboardWrapper } from "@/app/(main)/dashboard/_components/dashboard-wrapper";
import { AppSidebar } from "@/app/(main)/dashboard/_components/sidebar/app-sidebar";
import { ResizableDashboardWrapper } from "@/components/dashboard/resizable-dashboard-wrapper";
import { ProcessingNotificationBadge } from "@/components/ui/processing-notification-badge";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ResizableLayoutProvider } from "@/contexts/resizable-layout-context";
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
        <ResizableLayoutProvider>
          <SidebarProvider defaultOpen={false}>
            <AppSidebar
              variant={sidebarVariant}
              collapsible={sidebarCollapsible}
              layoutPreferences={layoutPreferences}
            />
            <SidebarInset
              data-content-layout={contentLayout}
              className={cn(
                "data-[content-layout=centered]:!mx-auto data-[content-layout=centered]:max-w-screen-2xl",
                "max-[113rem]:peer-data-[variant=inset]:!mr-2 min-[101rem]:peer-data-[variant=inset]:peer-data-[state=collapsed]:!mr-auto",
                "flex h-screen flex-col",
              )}
            >
              <div className="min-h-0 flex-1 overflow-y-auto">
                <ResizableDashboardWrapper className="h-full">
                  <div className="mx-auto max-w-6xl">
                    <div className="relative">
                      <div className="absolute top-6 right-6 z-10">
                        <ProcessingNotificationBadge />
                      </div>
                    </div>
                    <div className="px-4 pt-6 pb-2 md:px-6 md:pt-8 md:pb-3">{children}</div>
                  </div>
                </ResizableDashboardWrapper>
              </div>
              {/* FloatingActionButton removed on /write */}
            </SidebarInset>
          </SidebarProvider>
        </ResizableLayoutProvider>
      </ScriptPanelProvider>
    </DashboardWrapper>
  );
}
