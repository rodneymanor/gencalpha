import { ReactNode } from "react";

import { ResizableDashboardWrapper } from "@/components/dashboard/resizable-dashboard-wrapper";
import { NotificationHeader } from "@/components/ui/notification-header";

export default function WriteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <ResizableDashboardWrapper className="h-full">
        <div className="relative h-full w-full">
          <div className="absolute top-6 right-6 z-10">
            <NotificationHeader />
          </div>
          {children}
        </div>
      </ResizableDashboardWrapper>
    </div>
  );
}
