"use client";

import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

export function MobileSidebarToggle() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 md:hidden"
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
    >
      <Menu className="h-4 w-4" />
    </Button>
  );
}
