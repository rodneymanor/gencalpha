"use client";

import Link from "next/link";

import { EllipsisVertical, CircleUser, CreditCard, MessageSquareDot, LogOut } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";
// removed getInitials; using first initial for avatar per design request

// Helper function to get display name
function getDisplayName(userProfile: any, user: any): string {
  return userProfile?.displayName ?? user.displayName ?? user.email?.split("@")[0] ?? "User";
}

export function NavUser() {
  const { user, userProfile, logout, loading } = useAuth();
  const { isMobile } = useSidebar();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Successfully logged out!");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  if (!user) {
    return null;
  }

  const displayName = getDisplayName(userProfile, user);
  const email = user.email ?? "";
  const firstInitial =
    typeof displayName === "string" && displayName.trim() ? displayName.trim().charAt(0).toUpperCase() : "U";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-muted text-foreground flex h-8 w-8 items-center justify-center rounded-[var(--radius-pill)] text-sm font-medium">
                {firstInitial}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="text-muted-foreground truncate text-xs">{email}</span>
              </div>
              <EllipsisVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className="bg-muted text-foreground flex h-8 w-8 items-center justify-center rounded-[var(--radius-pill)] text-sm font-medium">
                  {firstInitial}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="text-muted-foreground truncate text-xs">{email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings?tab=account" className="flex items-center gap-2">
                  <CircleUser />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings?tab=billing" className="flex items-center gap-2">
                  <CreditCard />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings?tab=notifications" className="flex items-center gap-2">
                  <MessageSquareDot />
                  Notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} disabled={loading}>
              <LogOut />
              {loading ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
