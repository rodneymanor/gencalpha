import { ReactNode } from "react";

import { NotificationProvider } from "@/contexts/notification-context";
import { ThemeProvider } from "@/contexts/theme-context";

export default function WriteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <NotificationProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </NotificationProvider>
  );
}
