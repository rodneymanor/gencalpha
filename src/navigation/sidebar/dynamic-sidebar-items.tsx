"use client";

import {
  Calendar,
  GalleryVerticalEnd,
  LibraryBig,
  Inbox,
  PenLine,
  Users,
  VenetianMask,
  Archive,
  type LucideIcon,
} from "lucide-react";

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
  useIdeaInboxFlag(); // Hook must be called but result not currently used

  const baseItems: NavGroup[] = [
    {
      id: 1,
      label: "CREATE",
      items: [
        {
          title: "Daily",
          url: "/write",
          icon: Calendar,
          isCustomButton: true,
        },
        {
          title: "Personas",
          url: "/personas",
          icon: VenetianMask,
          isNew: true,
        },
      ],
    },
    {
      id: 2,
      label: "ORGANIZE",
      items: [
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
      ],
    },
  ];

  // Build DISCOVER section items based on feature flags (advanced tools only)
  const discoverSectionItems = [];

  if (isCreatorsPageEnabled) {
    discoverSectionItems.push({
      title: "Creators",
      url: "/dashboard/ideas/creators",
      icon: Users,
    });
  }

  if (isGhostWriterEnabled) {
    discoverSectionItems.push({
      title: "Ghostwriter",
      url: "/dashboard/ideas/ghostwriter",
      icon: PenLine,
    });
  }

  // Only add DISCOVER section if there are feature-flagged items
  if (discoverSectionItems.length > 0) {
    baseItems.push({
      id: 3,
      label: "DISCOVER",
      items: discoverSectionItems,
    });
  }

  return baseItems;
}
