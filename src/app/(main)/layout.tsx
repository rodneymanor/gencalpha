import { ReactNode } from "react";

import { DashboardWrapper } from "@/app/(main)/dashboard/_components/dashboard-wrapper";
import { AppSidebar } from "@/app/(main)/dashboard/_components/sidebar/app-sidebar";
import { VideoProcessingNotifier } from "@/components/notifications/video-processing-notifier";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { ProcessingNotificationBadge } from "@/components/ui/processing-notification-badge";
import { AuthProvider } from "@/contexts/auth-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { ResizableLayoutProvider } from "@/contexts/resizable-layout-context";
import { ScriptPanelProvider } from "@/contexts/script-panel-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { VideoProcessingProvider } from "@/contexts/video-processing-context";

export default async function MainLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <VideoProcessingProvider>
          <ThemeProvider>
            <DashboardWrapper>
              <ScriptPanelProvider>
                <ResizableLayoutProvider>
                  <div className="flex h-screen">
                    <AppSidebar className="flex-shrink-0" />
                    <div className="flex h-screen flex-1 flex-col">
                      <header className="flex h-12 shrink-0 items-center gap-2 transition-[width,height] md:hidden">
                        <div className="flex w-full items-center justify-between px-4">
                          <div className="flex items-center gap-2">
                            {/* Mobile sidebar toggle removed - custom sidebar doesn't need it */}
                          </div>
                          <div className="flex items-center gap-2">
                            <ProcessingNotificationBadge />
                          </div>
                        </div>
                      </header>
                      <div className="min-h-0 flex-1 overflow-y-auto">
                        <VideoProcessingNotifier />
                        {children}
                      </div>
                      <FloatingActionButton />
                    </div>
                  </div>
                </ResizableLayoutProvider>
              </ScriptPanelProvider>
            </DashboardWrapper>
          </ThemeProvider>
        </VideoProcessingProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}