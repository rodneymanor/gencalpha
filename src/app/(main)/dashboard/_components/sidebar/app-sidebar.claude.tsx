"use client";

import { useState, useEffect, useRef } from "react";

import { usePathname, useRouter } from "next/navigation";

import {
  ChevronDown,
  FileText,
  FolderOpen,
  PenTool,
  PlayCircle,
  Users,
  Plus,
  Chrome,
  Smartphone,
  PanelLeft,
} from "lucide-react";
import { createPortal } from "react-dom";

import { useContentItems } from "@/components/content-inbox/hooks/use-content-inbox";
import { listConversations } from "@/components/write-chat/services/chat-service";
import { APP_CONFIG } from "@/config/app-config";
import { useAuth } from "@/contexts/auth-context";
import { CollectionsService } from "@/lib/collections";
import { cn } from "@/lib/utils";
import { type SidebarVariant, type SidebarCollapsible, type ContentLayout } from "@/types/preferences/layout";

import { NavUser } from "./nav-user";

interface AppSidebarProps {
  layoutPreferences?: {
    contentLayout: ContentLayout;
    variant: SidebarVariant;
    collapsible: SidebarCollapsible;
  };
  className?: string;
  onItemClick?: () => void;
}

interface SidebarItem {
  id: string;
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: number;
  comingSoon?: boolean;
}

interface SidebarSection {
  id: string;
  title: string;
  items: SidebarItem[];
  defaultOpen?: boolean;
}

// Tooltip component that uses fixed positioning to bypass overflow constraints
interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  isVisible: boolean;
}

function FixedTooltip({ children, content, isVisible }: TooltipProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (!isVisible) return;
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      // Position tooltip to the right of the trigger element
      setPosition({
        x: rect.right + 8, // 8px gap from the element
        y: rect.top + rect.height / 2, // Center vertically
      });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <>
      <div ref={triggerRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="w-full">
        {children}
      </div>
      {showTooltip &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[9999] -translate-y-1/2 rounded-md bg-gray-800 px-2 py-1 text-xs text-white"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
          >
            <div className="relative">
              {/* Arrow pointing left */}
              <div className="absolute top-1/2 -left-1 -translate-x-full -translate-y-1/2">
                <div className="border-4 border-transparent border-r-gray-800" />
              </div>
              {content}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

export function AppSidebarClaude({ className, onItemClick }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, userProfile } = useAuth();

  // Pin state and collapsed state
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-pinned");
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth < 768;
      if (isMobile) return false;
      const pinnedSaved = localStorage.getItem("sidebar-pinned");
      const pinned = pinnedSaved ? JSON.parse(pinnedSaved) : false;
      // If pinned, start expanded; otherwise default to collapsed for hover-open UX
      return pinned ? false : true;
    }
    return true;
  });

  // Removed AI activity indicator state (status dot no longer shown)

  // Initialize collapsed sections from localStorage
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed-sections");
      return saved ? JSON.parse(saved) : { organize: false, recent: false };
    }
    return { organize: false, recent: false };
  });

  const [collectionsCount, setCollectionsCount] = useState(0);
  const [recentItems, setRecentItems] = useState<SidebarItem[]>([]);
  // Lock expansion while profile menu is open to avoid jitter
  const [menuOpen, setMenuOpen] = useState(false);
  const prevCollapsedRef = useRef<boolean>(false);

  // Use content items hook for fetching library items
  const { data: contentData } = useContentItems({}, { field: "savedAt", direction: "desc" });

  const sections: SidebarSection[] = [
    {
      id: "organize",
      title: "Organize",
      items: [
        {
          id: "collections",
          title: "Collections",
          icon: FolderOpen,
          badge: collectionsCount > 0 ? collectionsCount : undefined,
        },
        { id: "brand-voice", title: "Brand Voice", icon: Users },
        { id: "library", title: "Library", icon: PlayCircle },
      ],
      defaultOpen: true,
    },
    {
      id: "recent",
      title: "Recent Activity",
      items: recentItems.length > 0 ? recentItems : [{ id: "no-recent", title: "No recent items", icon: FileText }],
      defaultOpen: false,
    },
  ];

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const updated = {
        ...prev,
        [sectionId]: !prev[sectionId],
      };
      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebar-collapsed-sections", JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Enable hover-to-expand on desktop when not pinned
  const handleMouseEnter = () => {
    if (typeof window === "undefined") return;
    const isMobile = window.innerWidth < 768;
    if (!isMobile && !isPinned && !menuOpen) setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    if (typeof window === "undefined") return;
    const isMobile = window.innerWidth < 768;
    if (!isMobile && !isPinned && !menuOpen) setIsCollapsed(true);
  };

  const togglePin = () => {
    const next = !isPinned;
    setIsPinned(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-pinned", JSON.stringify(next));
    }
    // When pinning, keep expanded; when unpinning, collapse back to hover baseline
    setIsCollapsed(!next ? true : false);
  };

  const handleItemClick = (id: string) => {
    // Map sidebar item IDs to actual URLs
    const urlMap: Record<string, string> = {
      collections: "/collections",
      "brand-voice": "/brand-hub",
      library: "/library",
      drafts: "/drafts",
      "no-recent": "/library", // Navigate to library when clicking "No recent items"
    };

    const url = urlMap[id] || "/library";

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("write:close-slideout"));
    }

    if (pathname === url) {
      window.location.href = url;
    } else {
      router.push(url);
    }

    if (onItemClick) {
      onItemClick();
    }
  };

  const handleLogoClick = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("write:close-slideout"));
    }

    const homePage = APP_CONFIG.navigation.homePage;
    if (window.location.pathname === homePage || window.location.pathname.startsWith(homePage)) {
      window.location.href = homePage;
    } else {
      router.push(homePage);
    }

    if (onItemClick) {
      onItemClick();
    }
  };

  // Fetch collections count and recent items from library
  useEffect(() => {
    const fetchSidebarData = async () => {
      if (!user?.uid) return;

      try {
        // Fetch collections count
        const collections = await CollectionsService.getUserCollections(user.uid);
        setCollectionsCount(collections.length);

        // Fetch recent chat conversations
        const conversations = await listConversations();

        // Combine different library items (chats and content)
        const libraryItems: SidebarItem[] = [];

        const recentChats = conversations.slice(0, 2).map((chat) => ({
          id: chat.id,
          title: chat.title ?? "Untitled Script",
          icon: PenTool,
        }));
        libraryItems.push(...recentChats);

        if (contentData?.pages) {
          const contentItems = contentData.pages
            .flatMap((page) => page.items ?? [])
            .slice(0, 3 - recentChats.length)
            .map((item) => ({
              id: item.id,
              title: item.title ?? "Untitled Content",
              icon:
                item.platform.toLowerCase() === "tiktok" || item.platform.toLowerCase() === "instagram"
                  ? PlayCircle
                  : FileText,
            }));
          libraryItems.push(...contentItems);
        }

        setRecentItems(libraryItems.length > 0 ? libraryItems.slice(0, 3) : []);
      } catch (error) {
        console.error("Error fetching sidebar data:", error);
      }
    };

    fetchSidebarData();
  }, [user, contentData]);

  // Removed AI activity indicator effect

  return (
    <div
      className={cn(
        "relative z-50 border-r border-gray-100 bg-white",
        isCollapsed ? "w-16" : "w-80",
        className,
      )}
      // Smooth, Claude-like easing on width change; hover only affects desktop
      style={{
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        willChange: "width",
        backfaceVisibility: "hidden",
        overflow: "visible", // Allow content to be visible during transitions
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Sidebar */}
      <div className="flex h-full w-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-50 px-4 overflow-hidden">
          {/* Logo - hidden when collapsed */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {!isCollapsed && (
              <>
                <div
                  className="hover:text-primary flex cursor-pointer items-center gap-1 transition-colors duration-200 ease-linear"
                  onClick={handleLogoClick}
                >
                  <span className="text-foreground text-xl font-bold">Gen</span>
                  <div className="bg-brand h-2 w-2 rounded-[var(--radius-pill)]"></div>
                  <span className="text-foreground text-xl font-bold">C</span>
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="flex items-center text-xs text-neutral-600 whitespace-nowrap">
                    <span>AI writing assistant</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Pin toggle - Always present */}
          <button
            onClick={togglePin}
            aria-pressed={isPinned}
            aria-label={isPinned ? "Unpin sidebar" : "Pin sidebar"}
            className="hidden rounded-md p-1.5 text-neutral-600 transition-colors duration-200 hover:bg-neutral-100 hover:text-neutral-900 md:block flex-shrink-0"
            title={isPinned ? "Unpin" : "Pin"}
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Primary CTA - Claude style (circle + plus) */}
        <div className="p-4 transition-all duration-300 ease-out">
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("write:close-slideout"));
              }
              router.push("/write");
              if (onItemClick) {
                onItemClick();
              }
            }}
            className={cn(
              "group flex items-center rounded-md transition-all duration-300 ease-out",
              "hover:bg-neutral-100",
              isCollapsed ? "h-8 w-8 justify-center" : "h-10 w-full gap-3 p-2 text-left",
            )}
          >
            <span
              className={cn(
                "bg-brand flex items-center justify-center rounded-full text-white flex-shrink-0",
                "shadow-sm transition-all duration-300 group-hover:shadow-md",
                // In collapsed state, the CTA circle must be 32x32 to match the 32px content area
                isCollapsed ? "h-8 w-8" : "h-10 w-10",
              )}
            >
              <Plus className={cn("transition-transform duration-200 group-hover:scale-110", isCollapsed ? "h-5 w-5" : "h-4 w-4")} />
            </span>
            <span
              className="text-sm font-medium text-neutral-900 transition-all duration-300 ease-out overflow-hidden whitespace-nowrap"
              style={{
                opacity: isCollapsed ? 0 : 1,
                width: isCollapsed ? 0 : "auto",
                transform: isCollapsed ? "translateX(-10px)" : "translateX(0)",
              }}
            >
              New Script
            </span>
          </button>
          {/* Tooltip is handled on buttons via FixedTooltip for nav items; no overlay needed here */}
        </div>

        {/* Quick Generators - removed for Claude style */}

        {/* Navigation Sections */}
        <div
          className="flex-1 overflow-x-visible overflow-y-auto overscroll-contain px-4 pb-4"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {sections.map((section) => {
            if (section.id === "recent" && isCollapsed) {
              return null;
            }

            const showHeader = !isCollapsed && section.id !== "organize";
            const renderItems = section.id === "organize" ? true : !collapsedSections[section.id] || isCollapsed;

            return (
              <div key={section.id} className="mb-6">
                {showHeader && (
                  <div
                    className="mb-3 flex items-center justify-between transition-all duration-300 ease-out overflow-hidden"
                    style={{
                      opacity: isCollapsed ? 0 : 1,
                      height: isCollapsed ? 0 : "auto",
                      transform: isCollapsed ? "translateX(-10px)" : "translateX(0)",
                    }}
                  >
                    <h3 className="text-xs font-medium tracking-wide text-neutral-600 uppercase whitespace-nowrap">{section.title}</h3>
                    <button
                      onClick={() => toggleSection(section.id)}
                      aria-label={collapsedSections[section.id] ? `Expand ${section.title}` : `Collapse ${section.title}`}
                      className="relative rounded p-2 md:p-0.5 transition-colors duration-200 hover:bg-gray-100 flex-shrink-0 after:absolute after:-inset-2 md:after:hidden"
                    >
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 text-neutral-500 transition-transform duration-200",
                          collapsedSections[section.id] && "rotate-180",
                        )}
                      />
                    </button>
                  </div>
                )}

                {renderItems && (
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <FixedTooltip
                        key={item.id}
                        isVisible={isCollapsed}
                        content={
                          <>
                            {item.title}
                            {item.badge && ` (${item.badge})`}
                            {item.comingSoon && " (Coming Soon)"}
                          </>
                        }
                      >
                        <button
                          onClick={() => !item.comingSoon && handleItemClick(item.id)}
                          disabled={item.comingSoon}
                    className={cn(
                      "group flex h-11 md:h-10 w-full items-center rounded-md transition-all duration-300 ease-out overflow-hidden",
                      pathname === `/${item.id}` ||
                        (item.id === "library" && pathname === "/library") ||
                        (item.id === "brand-voice" && pathname === "/brand-hub")
                        ? "bg-neutral-100 font-medium text-neutral-900"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
                      item.comingSoon && "cursor-not-allowed opacity-50",
                      // Collapsed: use exact 32px content width (sidebar 64px - 2*16px padding)
                      // Avoid extra inner padding to keep icons centered and unclipped
                      isCollapsed ? "justify-center p-0" : "gap-3 p-3 md:p-2.5 text-left",
                    )}
                  >
                    {section.id !== "recent" && (
                      <div
                        className={cn(
                          "flex-shrink-0 transition-all duration-300 ease-out",
                          // Collapsed: fixed 32x32 touch target centered precisely
                          isCollapsed
                            ? "inline-flex h-11 w-11 md:h-8 md:w-8 items-center justify-center rounded-md group-hover:bg-neutral-200"
                            : "group-hover:scale-110",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                      </div>
                    )}

                          {!isCollapsed && (
                            <>
                              <span className="flex-1 text-sm font-medium overflow-hidden whitespace-nowrap">
                                {item.title}
                              </span>

                              {item.badge && (
                                <div className="flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-neutral-700 px-2 py-0.5 text-xs text-white">
                                  {item.badge}
                                </div>
                              )}

                              {item.comingSoon && (
                                <div className="flex-shrink-0 rounded-full bg-neutral-300 px-2 py-0.5 text-xs text-neutral-700">
                                  Soon
                                </div>
                              )}
                            </>
                          )}
                        </button>
                      </FixedTooltip>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tools (bottom links) */}
        <div className="border-t border-gray-50 px-4 py-3">
          {(userProfile?.role === "creator" || userProfile?.role === "coach" || userProfile?.role === "super_admin") && (
            <div className="space-y-2">
              <button
                onClick={() => router.push("/chrome-extension")}
                className={cn(
                  "group flex h-11 md:h-10 w-full items-center rounded-md text-sm transition-all duration-300 ease-out overflow-hidden",
                  pathname === "/chrome-extension"
                    ? "bg-neutral-100 text-neutral-900"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
                  isCollapsed ? "justify-center p-0" : "gap-2 p-3 md:p-2",
                )}
              >
                <div
                  className={cn(
                    "inline-flex items-center justify-center rounded-md",
                    isCollapsed ? "h-11 w-11 md:h-8 md:w-8 group-hover:bg-neutral-200" : "h-8 w-8",
                  )}
                >
                  <Chrome className="h-4 w-4 transition-transform duration-200 group-hover:scale-110 flex-shrink-0" />
                </div>
                {!isCollapsed && <span className="overflow-hidden whitespace-nowrap">Chrome Extension</span>}
              </button>
              <button
                onClick={() => router.push("/downloads")}
                className={cn(
                  "group flex h-11 md:h-10 w-full items-center rounded-md text-sm transition-all duration-300 ease-out overflow-hidden",
                  pathname === "/downloads"
                    ? "bg-neutral-100 text-neutral-900"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
                  isCollapsed ? "justify-center p-0" : "gap-2 p-3 md:p-2",
                )}
              >
                <div
                  className={cn(
                    "inline-flex items-center justify-center rounded-md",
                    isCollapsed ? "h-11 w-11 md:h-8 md:w-8 group-hover:bg-neutral-200" : "h-8 w-8",
                  )}
                >
                  <Smartphone className="h-4 w-4 transition-transform duration-200 group-hover:scale-110 flex-shrink-0" />
                </div>
                {!isCollapsed && <span className="overflow-hidden whitespace-nowrap">iOS Shortcut</span>}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-50 p-4 relative z-10">
          {!isCollapsed ? (
            <NavUser
              onMenuOpenChange={(open) => {
                setMenuOpen(open);
                if (open) {
                  prevCollapsedRef.current = isCollapsed;
                  setIsCollapsed(false);
                } else {
                  // Restore previous collapse state when menu closes, unless pinned
                  setIsCollapsed((prev) => (isPinned ? false : prevCollapsedRef.current));
                }
              }}
            />
          ) : (
            <NavUser
              compact
              onMenuOpenChange={(open) => {
                setMenuOpen(open);
                if (open) {
                  prevCollapsedRef.current = isCollapsed;
                  setIsCollapsed(false);
                } else {
                  setIsCollapsed((prev) => (isPinned ? false : prevCollapsedRef.current));
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
