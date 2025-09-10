"use client";

import { ReactNode, useRef, useState } from "react";

import { Menu, ArrowLeft } from "lucide-react";

import { DashboardWrapper } from "@/app/(main)/dashboard/_components/dashboard-wrapper";
import { AppSidebarClaude } from "@/app/(main)/dashboard/_components/sidebar/app-sidebar.claude";
import { VideoProcessingNotifier } from "@/components/notifications/video-processing-notifier";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { ProcessingNotificationBadge } from "@/components/ui/processing-notification-badge";
import { AuthProvider } from "@/contexts/auth-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { ResizableLayoutProvider } from "@/contexts/resizable-layout-context";
import { ScriptPanelProvider } from "@/contexts/script-panel-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { VideoProcessingProvider } from "@/contexts/video-processing-context";

export default function MainLayout({ children }: Readonly<{ children: ReactNode }>) {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  // Simple swipe-to-close for mobile sidebar
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchActive = useRef<boolean>(false);

  return (
    <AuthProvider>
      <NotificationProvider>
        <VideoProcessingProvider>
          <ThemeProvider>
            <DashboardWrapper>
              <ScriptPanelProvider>
                <ResizableLayoutProvider>
                  <div className="flex h-screen">
                    {/* Desktop Sidebar - hidden on mobile */}
                    <AppSidebarClaude className="hidden flex-shrink-0 md:block" />

                    {/* Mobile Sidebar - Full page view */}
                    {showMobileSidebar && (
                      <div
                        className="fixed inset-0 z-50 bg-white md:hidden"
                        onTouchStart={(e) => {
                          if (e.touches.length !== 1) return;
                          touchActive.current = true;
                          touchStartX.current = e.touches[0].clientX;
                          touchStartY.current = e.touches[0].clientY;
                        }}
                        onTouchMove={(e) => {
                          if (!touchActive.current || touchStartX.current == null || touchStartY.current == null) return;
                          const dx = e.touches[0].clientX - touchStartX.current;
                          const dy = e.touches[0].clientY - touchStartY.current;
                          // Ignore if primarily vertical gesture
                          if (Math.abs(dy) > Math.abs(dx)) return;
                          // If swiping right more than 60px with minimal vertical jitter, close
                          if (dx > 60 && Math.abs(dy) < 40) {
                            touchActive.current = false;
                            setShowMobileSidebar(false);
                          }
                        }}
                        onTouchEnd={() => {
                          touchActive.current = false;
                          touchStartX.current = null;
                          touchStartY.current = null;
                        }}
                      >
                        <div className="flex h-14 items-center border-b border-neutral-100 px-4">
                          <button
                            onClick={() => setShowMobileSidebar(false)}
                            className="rounded-md p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                          >
                            <ArrowLeft className="h-5 w-5" />
                          </button>
                          <span className="ml-3 text-lg font-medium">Menu</span>
                        </div>
                        <AppSidebarClaude
                          className="h-[calc(100vh-3.5rem)]"
                          onItemClick={() => setShowMobileSidebar(false)}
                        />
                      </div>
                    )}

                    <div className="flex h-screen flex-1 flex-col">
                      {/* Mobile Header with Hamburger Menu */}
                      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-neutral-100 bg-white md:hidden">
                        <div className="flex w-full items-center justify-between px-4">
                          <div className="flex items-center gap-3">
                            {/* Hamburger Menu Button */}
                            <button
                              onClick={() => setShowMobileSidebar(true)}
                              className="rounded-md p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                            >
                              <Menu className="h-5 w-5" />
                            </button>

                            {/* Mobile Logo */}
                            <div className="flex items-center gap-1">
                              <span className="text-foreground text-lg font-bold">Gen</span>
                              <div className="bg-brand h-1.5 w-1.5 rounded-full"></div>
                              <span className="text-foreground text-lg font-bold">C</span>
                            </div>
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
