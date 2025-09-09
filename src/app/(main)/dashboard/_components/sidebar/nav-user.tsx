"use client";

import Link from "next/link";

import { EllipsisVertical, LogOut, Moon, Sun, Settings, HelpCircle } from "lucide-react";
import { toast } from "sonner";

import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { usePreferencesStore } from "@/lib/stores/preferences/preferences-provider";
import { updateThemeMode } from "@/lib/theme-utils";
import { setValueToCookie } from "@/server/server-actions";
// removed getInitials; using first initial for avatar per design request

// Helper function to get display name
function getDisplayName(userProfile: any, user: any): string {
  return userProfile?.displayName ?? user.displayName ?? user.email?.split("@")[0] ?? "User";
}

export function NavUser({ compact = false }: { compact?: boolean }) {
  const { user, userProfile, logout, loading } = useAuth();
  const themeMode = usePreferencesStore((s) => s.themeMode);
  const setThemeMode = usePreferencesStore((s) => s.setThemeMode);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Successfully logged out!");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  const handleThemeToggle = async () => {
    const newTheme = themeMode === "dark" ? "light" : "dark";
    updateThemeMode(newTheme);
    setThemeMode(newTheme);
    await setValueToCookie("theme_mode", newTheme);
  };

  if (!user) {
    return null;
  }

  const displayName = getDisplayName(userProfile, user);
  const email = user.email ?? "";
  const firstInitial =
    typeof displayName === "string" && displayName.trim() ? displayName.trim().charAt(0).toUpperCase() : "U";

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {compact ? (
            <button
              type="button"
              aria-label="Open profile menu"
              title="Profile"
              className="text-foreground mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm leading-none font-medium transition-transform duration-200 hover:scale-110 hover:bg-gray-300"
            >
              {firstInitial}
            </button>
          ) : (
            <button type="button" className="flex w-full items-center gap-3 rounded-md p-2.5 text-left transition-all duration-200 ease-out hover:bg-gray-50 data-[state=open]:bg-gray-100">
              <div className="text-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm leading-none font-medium">
                {firstInitial}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="text-muted-foreground truncate text-xs">{email}</span>
              </div>
              <EllipsisVertical className="ml-auto h-4 w-4" />
            </button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          side="right"
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
              <Link href="/dashboard/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/help" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Help & Support
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleThemeToggle} className="flex items-center gap-2">
            {themeMode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {themeMode === "dark" ? "Light Mode" : "Dark Mode"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="px-2 py-1">
            <div className="text-muted-foreground mb-1 text-xs font-medium">Color Theme</div>
            <ThemeSwitcher />
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} disabled={loading}>
            <LogOut />
            {loading ? "Logging out..." : "Log out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
