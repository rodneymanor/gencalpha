"use client";

import { Calendar, GalleryVerticalEnd, LibraryBig, Inbox, PenLine, Users, VenetianMask, type LucideIcon } from "lucide-react";

import { useCreatorsPageFlag, useGhostWriterFlag, useIdeaInboxFlag } from "@/hooks/use-feature-flag";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
  isCustomButton?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export function useDynamicSidebarItems(): NavGroup[] {
  const isCreatorsPageEnabled = useCreatorsPageFlag();
  const isGhostWriterEnabled = useGhostWriterFlag();
  const isIdeaInboxEnabled = useIdeaInboxFlag();

  const baseItems: NavGroup[] = [
    {
      id: 1,
      items: [
        {
          title: "Daily",
          url: "/write",
          icon: Calendar,
          isCustomButton: true,
        },
        {
          title: "Library",
          url: "/library",
          icon: LibraryBig,
        },
        {
          title: "Collections",
          url: "/collections",
          icon: GalleryVerticalEnd,
          isNew: true,
        },
        {
          title: "Personas",
          url: "/personas",
          icon: VenetianMask,
          isNew: true,
        },
      ],
    },
  ];

  // Build Ideas section items based on feature flags
  const ideasSectionItems = [];

  if (isCreatorsPageEnabled) {
    ideasSectionItems.push({
      title: "Creators",
      url: "/dashboard/ideas/creators",
      icon: Users,
    });
  }

  if (isIdeaInboxEnabled) {
    ideasSectionItems.push({
      title: "Idea inbox",
      url: "/dashboard/ideas/idea-inbox",
      icon: Inbox,
    });
  }

  if (isGhostWriterEnabled) {
    ideasSectionItems.push({
      title: "Ghostwriter",
      url: "/dashboard/ideas/ghostwriter",
      icon: PenLine,
    });
  }

  // Only add Ideas section if at least one idea-related feature is enabled
  if (ideasSectionItems.length > 0) {
    baseItems.push({
      id: 2,
      label: "Ideas",
      items: ideasSectionItems,
    });
  }

  return baseItems;
}
