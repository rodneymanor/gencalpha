"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { ChevronRight, Plus } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { type NavGroup, type NavMainItem } from "@/navigation/sidebar/sidebar-items";

interface NavMainProps {
  readonly items: readonly NavGroup[];
}

const IsComingSoon = () => (
  <span className="bg-muted text-muted-foreground ml-auto rounded-[var(--radius-button)] px-2 py-1 text-xs">Soon</span>
);

const CustomDailyButton = ({ url }: { url: string }) => {
  const router = useRouter();
  const handleClick = () => {
    // Close slideout wrapper by dispatching a global event
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("write:close-slideout"));
    }
    
    // Force a page reload to ensure fresh state
    window.location.href = `${url}?new=${Date.now()}`;
  };

  return (
    <SidebarMenuButton
      isActive={false}
      tooltip="New Script"
      onClick={handleClick}
      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground data-[active=true]:bg-transparent data-[active=true]:font-normal"
    >
      <div className="bg-primary hover:bg-primary/90 flex h-4 w-4 shrink-0 items-center justify-center rounded-[var(--radius-pill)] shadow-[var(--shadow-soft-drop)] transition-all duration-200 ease-linear">
        <Plus className="text-primary-foreground h-3 w-3" />
      </div>
      <span>New Script</span>
    </SidebarMenuButton>
  );
};

const NavItemExpanded = ({
  item,
  isActive,
  isSubmenuOpen,
}: {
  item: NavMainItem;
  isActive: (url: string, subItems?: NavMainItem["subItems"]) => boolean;
  isSubmenuOpen: (subItems?: NavMainItem["subItems"]) => boolean;
}) => {
  return (
    <Collapsible key={item.title} asChild defaultOpen={isSubmenuOpen(item.subItems)} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          {item.subItems ? (
            <SidebarMenuButton
              disabled={item.comingSoon}
              isActive={isActive(item.url, item.subItems)}
              tooltip={item.title}
            >
              {item.icon && <item.icon />}
              <span>{item.title}</span>
              {item.comingSoon && <IsComingSoon />}
              <ChevronRight className="ml-auto transition-transform duration-200 ease-linear group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          ) : item.isCustomButton && item.title === "Daily" ? (
            // Custom Daily button - render with standard structure
            <CustomDailyButton url={item.url} />
          ) : (
            <SidebarMenuButton
              asChild
              aria-disabled={item.comingSoon}
              isActive={isActive(item.url)}
              tooltip={item.title}
            >
              <Link href={item.url} target={item.newTab ? "_blank" : undefined}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                {item.comingSoon && <IsComingSoon />}
              </Link>
            </SidebarMenuButton>
          )}
        </CollapsibleTrigger>
        {item.subItems && (
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.subItems.map((subItem) => (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton aria-disabled={subItem.comingSoon} isActive={isActive(subItem.url)} asChild>
                    <Link href={subItem.url} target={subItem.newTab ? "_blank" : undefined}>
                      {subItem.icon && <subItem.icon />}
                      <span>{subItem.title}</span>
                      {subItem.comingSoon && <IsComingSoon />}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        )}
      </SidebarMenuItem>
    </Collapsible>
  );
};

const NavItemCollapsed = ({
  item,
  isActive,
}: {
  item: NavMainItem;
  isActive: (url: string, subItems?: NavMainItem["subItems"]) => boolean;
}) => {
  return (
    <SidebarMenuItem key={item.title}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            disabled={item.comingSoon}
            tooltip={item.title}
            isActive={isActive(item.url, item.subItems)}
          >
            {item.icon && <item.icon />}
            <span>{item.title === "Queue" ? "Q" : item.title}</span>
            <ChevronRight />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-50 space-y-1" side="right" align="start">
          {item.subItems?.map((subItem) => (
            <DropdownMenuItem key={subItem.title} asChild>
              <SidebarMenuSubButton
                key={subItem.title}
                asChild
                className="focus-visible:ring-0"
                aria-disabled={subItem.comingSoon}
                isActive={isActive(subItem.url)}
              >
                <Link href={subItem.url} target={subItem.newTab ? "_blank" : undefined}>
                  {subItem.icon && <subItem.icon className="[&>svg]:text-sidebar-foreground" />}
                  <span>{subItem.title}</span>
                  {subItem.comingSoon && <IsComingSoon />}
                </Link>
              </SidebarMenuSubButton>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

export function NavMain({ items }: NavMainProps) {
  const path = usePathname();
  const { state, isMobile } = useSidebar();

  const isItemActive = (url: string, subItems?: NavMainItem["subItems"]) => {
    if (subItems?.length) {
      return subItems.some((sub) => path.startsWith(sub.url));
    }
    return path === url;
  };

  const isSubmenuOpen = (subItems?: NavMainItem["subItems"]) => {
    return subItems?.some((sub) => path.startsWith(sub.url)) ?? false;
  };

  return (
    <>
      {/* <SidebarGroup>
        <SidebarGroupContent className="flex flex-col gap-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Write a Script"
                onClick={openPanel}
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground border-primary/20 hover:border-primary/30 min-w-8 border shadow-lg backdrop-blur-sm duration-200 ease-linear hover:shadow-xl"
              >
                <Pencil className="rotate-[-15deg]" />
                <span>Write a Script</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup> */}
      {items.map((group) => (
        <SidebarGroup key={group.id}>
          {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {group.items.map((item) => {
                if (state === "collapsed" && !isMobile) {
                  // If no subItems, just render the button as a link
                  if (!item.subItems) {
                    return item.isCustomButton && item.title === "Daily" ? (
                      // Render custom Daily button with standard SidebarMenuItem structure
                      <SidebarMenuItem key={item.title}>
                        <CustomDailyButton url={item.url} />
                      </SidebarMenuItem>
                    ) : (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          aria-disabled={item.comingSoon}
                          tooltip={item.title}
                          isActive={isItemActive(item.url)}
                        >
                          <Link href={item.url} target={item.newTab ? "_blank" : undefined}>
                            {item.icon && <item.icon />}
                            <span>{item.title === "Queue" ? "Q" : item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }
                  // Otherwise, render the dropdown as before
                  return <NavItemCollapsed key={item.title} item={item} isActive={isItemActive} />;
                }
                // Expanded view
                return (
                  <NavItemExpanded key={item.title} item={item} isActive={isItemActive} isSubmenuOpen={isSubmenuOpen} />
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
