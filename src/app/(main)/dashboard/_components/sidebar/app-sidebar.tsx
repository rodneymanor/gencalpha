"use client";

import { useState, useEffect, useRef } from "react";

import { usePathname, useRouter } from "next/navigation";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  FolderOpen,
  Hash,
  MousePointer,
  PenTool,
  PlayCircle,
  Sparkles,
  TrendingUp,
  Users,
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

export function AppSidebar({ className, onItemClick }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  // Initialize collapsed state from localStorage (only for desktop)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      // Always expanded on mobile
      const isMobile = window.innerWidth < 768;
      if (isMobile) return false;

      const saved = localStorage.getItem("sidebar-collapsed");
      return saved ? JSON.parse(saved) : false;
    }
    return false;
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

  const quickGenerators: QuickGenerator[] = [
    { id: "generate-hooks", title: "Hook Generator", uses: 24, icon: Hash },
    { id: "content-ideas", title: "Content Ideas", uses: 18, icon: Sparkles },
    { id: "if-then-script", title: "If You Then Do This", uses: 15, icon: MousePointer },
    { id: "problem-solution", title: "Problem Solution", uses: 32, icon: TrendingUp },
  ];

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
        { id: "personas", title: "Personas", icon: Users },
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

  // Function to toggle sidebar collapsed state with persistence
  const toggleSidebar = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
    }
  };

  const handleItemClick = (id: string) => {
    // Map sidebar item IDs to actual URLs
    const urlMap: Record<string, string> = {
      collections: "/collections",
      personas: "/personas",
      library: "/library",
      drafts: "/drafts",
      "no-recent": "/library", // Navigate to library when clicking "No recent items"
    };

    // For dynamic recent items (from database), navigate to library
    const url = urlMap[id] || "/library";

    // Close slideout wrapper by dispatching a global event
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("write:close-slideout"));
    }

    // If already on the same route, reload for fresh content (especially /write)
    if (pathname === url) {
      window.location.href = url;
    } else {
      router.push(url);
    }

    // Call the onItemClick callback if provided (for mobile menu close)
    if (onItemClick) {
      onItemClick();
    }
  };

  const handleLogoClick = () => {
    // Close slideout wrapper by dispatching a global event
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("write:close-slideout"));
    }

    // If already on /write (with or without query params), reload the page for a fresh script
    const homePage = APP_CONFIG.navigation.homePage;
    if (window.location.pathname === homePage || window.location.pathname.startsWith(homePage)) {
      window.location.href = homePage;
    } else {
      router.push(homePage);
    }

    // Call the onItemClick callback if provided (for mobile menu close)
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

        // Add recent chat conversations (scripts)
        const recentChats = conversations.slice(0, 2).map((chat) => ({
          id: chat.id,
          title: chat.title ?? "Untitled Script",
          icon: PenTool, // Script icon for chats
        }));
        libraryItems.push(...recentChats);

        // Add recent content items if available
        if (contentData?.pages) {
          const contentItems = contentData.pages
            .flatMap((page) => page.items ?? [])
            .slice(0, 3 - recentChats.length) // Fill up to 3 total items
            .map((item) => ({
              id: item.id,
              title: item.title ?? "Untitled Content",
              icon:
                item.platform.toLowerCase() === "tiktok" || item.platform.toLowerCase() === "instagram"
                  ? PlayCircle // Video icon for social media content
                  : FileText, // Document icon for other content
            }));
          libraryItems.push(...contentItems);
        }

        // If still less than 3 items, show what we have or a placeholder
        setRecentItems(libraryItems.length > 0 ? libraryItems.slice(0, 3) : []);
      } catch (error) {
        console.error("Error fetching sidebar data:", error);
      }
    };

    fetchSidebarData();
  }, [user, contentData]);

  useEffect(() => {
    // Simulate AI activity indicator
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

              {/* Collapse Button - Hidden on mobile */}
              <button
                onClick={() => toggleSidebar(true)}
                className="hidden rounded-md p-1.5 text-neutral-600 transition-colors duration-200 hover:bg-neutral-100 hover:text-neutral-900 md:block"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => toggleSidebar(false)}
              className="mx-auto hidden rounded-md p-2 text-neutral-600 transition-colors duration-200 hover:bg-neutral-100 hover:text-neutral-900 md:block"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Bar - Commented out for now */}
        {/* {!isCollapsed && (
          <div className="border-b border-gray-50 p-4">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search or ask AI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50/50 pr-10 pl-10 text-sm text-gray-700 transition-all duration-200 focus:border-gray-300 focus:bg-white focus:ring-1 focus:ring-gray-200 focus:outline-none"
              />
              <button className="absolute top-1/2 right-2 -translate-y-1/2 transform rounded-md p-1 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-600">
                <Mic className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )} */}

        {/* Primary CTA */}
        <div className={isCollapsed ? "py-4" : "p-4"}>
          {!isCollapsed ? (
            <button
              onClick={() => {
                // Close slideout wrapper by dispatching a global event
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("write:close-slideout"));
                }

                // Navigate to write page
                router.push("/write");

                // Call the onItemClick callback if provided (for mobile menu close)
                if (onItemClick) {
                  onItemClick();
                }
              }}
              className={cn(
                "bg-brand flex h-10 w-full items-center justify-center gap-2 rounded-lg",
                "text-sm font-medium text-white transition-all duration-200 ease-out",
                "hover:bg-brand-600 active:bg-brand-700 shadow-sm hover:shadow-md",
              )}
            >
              <PenTool className="h-4 w-4" />
              <span>New Script</span>
            </button>
          ) : (
            <FixedTooltip isVisible={isCollapsed} content="New Script">
              <button
                onClick={() => {
                  // Close slideout wrapper by dispatching a global event
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("write:close-slideout"));
                  }

                  // Navigate to write page
                  router.push("/write");

                  // Call the onItemClick callback if provided (for mobile menu close)
                  if (onItemClick) {
                    onItemClick();
                  }
                }}
                className={cn(
                  "bg-brand mx-auto flex h-10 w-10 items-center justify-center rounded-lg text-white transition-all duration-200 ease-out",
                  "hover:bg-brand-600 active:bg-brand-700 shadow-sm hover:shadow-md",
                )}
              >
                <PenTool className="h-4 w-4" />
              </button>
            </FixedTooltip>
          )}
        </div>

        {/* Quick Generators */}
        {!isCollapsed && (
          <div className="mb-6 px-4">
            <h3 className="mb-3 text-xs font-medium tracking-wide text-neutral-600 uppercase">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {quickGenerators.map((generator) => (
                <button
                  key={generator.id}
                  onClick={() => {
                    // Close slideout wrapper by dispatching a global event
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new CustomEvent("write:close-slideout"));
                    }

                    // Navigate to write page with appropriate parameter
                    // Hook Generator and Content Ideas are generators, the other two are templates
                    const isGenerator = generator.id === "generate-hooks" || generator.id === "content-ideas";
                    const paramName = isGenerator ? "generator" : "template";
                    const url = `/write?${paramName}=${generator.id}`;

                    router.push(url);

                    // Call the onItemClick callback if provided (for mobile menu close)
                    if (onItemClick) {
                      onItemClick();
                    }
                  }}
                  className={cn(
                    "group border border-gray-100 bg-gray-50/50 p-3 text-left transition-all duration-200",
                    "rounded-lg hover:border-gray-200 hover:bg-gray-100/80",
                  )}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-neutral-300 text-neutral-700 transition-all duration-200 group-hover:bg-neutral-400">
                      <generator.icon className="h-3 w-3" />
                    </div>
                    <div className="text-xs font-medium text-neutral-700 group-hover:text-neutral-900">
                      {generator.title}
                    </div>
                  </div>
                  <div className="text-xs text-neutral-600">{generator.uses} uses</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        <div className="flex-1 overflow-x-visible overflow-y-auto px-4 pb-4">
          {sections.map((section) => {
            // Hide "Recent Activity" section when sidebar is collapsed
            if (section.id === "recent" && isCollapsed) {
              return null;
            }

            return (
              <div key={section.id} className="mb-6">
                {!isCollapsed && (
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

                {(!collapsedSections[section.id] || isCollapsed) && (
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
                            pathname === `/${item.id}` || (item.id === "library" && pathname === "/library")
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

        {/* Footer */}
        <div className="border-t border-gray-50 p-4">{!isCollapsed && <NavUser />}</div>
      </div>
    </div>
  );
}
