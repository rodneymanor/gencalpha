"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";

import { ChevronDown, FileText, FolderOpen, PenTool, PlayCircle, Users, Plus, Chrome, Smartphone, PanelLeft } from "lucide-react";

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

interface QuickGenerator {
  id: string;
  title: string;
  uses: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
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
  const { user } = useAuth();

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

  const [isAIActive, setIsAIActive] = useState(true);

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

  // Hover handlers (desktop only, no-op when pinned)
  const handleMouseEnter = () => {
    if (typeof window === "undefined") return;
    const isMobile = window.innerWidth < 768;
    if (!isMobile && !isPinned) setIsCollapsed(false);
  };
  const handleMouseLeave = () => {
    if (typeof window === "undefined") return;
    const isMobile = window.innerWidth < 768;
    if (!isMobile && !isPinned) setIsCollapsed(true);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAIActive((prev) => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        "overflow-visible border-r border-gray-100 bg-white transition-all duration-200 ease-out",
        isCollapsed ? "w-16" : "w-80",
        className,
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Sidebar */}
      <div className="flex h-full w-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-50 px-4">
          {!isCollapsed ? (
            <>
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div
                  className="hover:text-primary flex cursor-pointer items-center gap-1 transition-colors duration-200 ease-linear"
                  onClick={handleLogoClick}
                >
                  <span className="text-foreground text-xl font-bold">Gen</span>
                  <div className="bg-brand h-2 w-2 rounded-[var(--radius-pill)]"></div>
                  <span className="text-foreground text-xl font-bold">C</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                    <div
                      className={cn(
                        "h-1.5 w-1.5 rounded-full transition-colors duration-300",
                        isAIActive ? "bg-emerald-500" : "bg-neutral-400",
                      )}
                    />
                    <span>{isAIActive ? "AI Active" : "AI Idle"}</span>
                  </div>
                </div>
              </div>

              {/* Pin toggle - Hidden on mobile */}
              <button
                onClick={togglePin}
                aria-pressed={isPinned}
                aria-label={isPinned ? "Unpin sidebar" : "Pin sidebar"}
                className="hidden rounded-md p-1.5 text-neutral-600 transition-colors duration-200 hover:bg-neutral-100 hover:text-neutral-900 md:block"
                title={isPinned ? "Unpin" : "Pin"}
              >
                <PanelLeft className="h-4 w-4" />
              </button>
            </>
          ) : (
            // Collapsed header shows only pin toggle
            <button
              onClick={togglePin}
              aria-pressed={isPinned}
              aria-label={isPinned ? "Unpin sidebar" : "Pin sidebar"}
              className="mx-auto hidden rounded-md p-2 text-neutral-600 transition-colors duration-200 hover:bg-neutral-100 hover:text-neutral-900 md:block"
              title={isPinned ? "Unpin" : "Pin"}
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Primary CTA - Claude style (circle + plus) */}
        <div className={isCollapsed ? "py-4" : "p-4"}>
          {!isCollapsed ? (
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
                "group flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors",
                "hover:bg-neutral-100",
              )}
            >
              <span
                className={cn(
                  "bg-brand flex h-8 w-8 items-center justify-center rounded-full text-white",
                  "shadow-sm group-hover:shadow-md transition-shadow",
                )}
              >
                <Plus className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              </span>
              <span className="text-sm font-medium text-neutral-900">New Script</span>
            </button>
          ) : (
            <FixedTooltip isVisible={isCollapsed} content="New Script">
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
                  "bg-brand group mx-auto flex h-10 w-10 items-center justify-center rounded-full text-white transition-all duration-200 ease-out",
                  "hover:bg-brand-600 active:bg-brand-700 shadow-sm hover:shadow-md hover:scale-[1.03]",
                )}
                aria-label="New Script"
                title="New Script"
              >
                <Plus className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
              </button>
            </FixedTooltip>
          )}
        </div>

        {/* Quick Generators - removed for Claude style */}

        {/* Navigation Sections */}
        <div className="flex-1 overflow-x-visible overflow-y-auto px-4 pb-4">
          {sections.map((section) => {
            if (section.id === "recent" && isCollapsed) {
              return null;
            }

            const showHeader = !isCollapsed && section.id !== "organize";
            const renderItems = section.id === "organize" ? true : !collapsedSections[section.id] || isCollapsed;

            return (
              <div key={section.id} className="mb-6">
                {showHeader && (
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-medium tracking-wide text-neutral-600 uppercase">{section.title}</h3>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="rounded p-0.5 transition-colors duration-200 hover:bg-gray-100"
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
                            "group flex w-full items-center gap-3 rounded-md p-2.5 text-left transition-all duration-200 ease-out",
                            pathname === `/${item.id}` ||
                              (item.id === "library" && pathname === "/library") ||
                              (item.id === "brand-voice" && pathname === "/brand-hub")
                              ? "bg-neutral-100 font-medium text-neutral-900"
                              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
                            item.comingSoon && "cursor-not-allowed opacity-50",
                            isCollapsed && "justify-center p-2",
                          )}
                        >
                          {section.id !== "recent" && (
                            <div
                              className={cn(
                                "flex-shrink-0 transition-all duration-200 ease-out",
                                isCollapsed
                                  ? "-m-1 rounded-md p-1 group-hover:scale-125 group-hover:bg-neutral-200"
                                  : "group-hover:scale-110",
                              )}
                            >
                              <item.icon className="h-4 w-4" />
                            </div>
                          )}

                          {!isCollapsed && (
                            <>
                              <span className="flex-1 text-sm font-medium">{item.title}</span>

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
          {!isCollapsed ? (
            <div className="space-y-2">
              <button
                onClick={() => router.push("/chrome-extension")}
                className={cn(
                  "group flex w-full items-center gap-2 rounded-md p-2 text-sm",
                  pathname === "/chrome-extension"
                    ? "bg-neutral-100 text-neutral-900"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
                )}
              >
                <Chrome className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                Chrome Extension
              </button>
              <button
                onClick={() => router.push("/downloads")}
                className={cn(
                  "group flex w-full items-center gap-2 rounded-md p-2 text-sm",
                  pathname === "/downloads"
                    ? "bg-neutral-100 text-neutral-900"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
                )}
              >
                <Smartphone className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                iOS Shortcut
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <FixedTooltip isVisible={isCollapsed} content="Chrome Extension">
                <button
                  onClick={() => router.push("/chrome-extension")}
                  className="group flex h-9 w-9 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                >
                  <Chrome className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                </button>
              </FixedTooltip>
              <FixedTooltip isVisible={isCollapsed} content="iOS Shortcut">
                <button
                  onClick={() => router.push("/downloads")}
                  className="group flex h-9 w-9 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                >
                  <Smartphone className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                </button>
              </FixedTooltip>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-50 p-4">{!isCollapsed ? <NavUser /> : <NavUser compact />}</div>
      </div>
    </div>
  );
}
