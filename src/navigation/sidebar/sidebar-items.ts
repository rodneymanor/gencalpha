import { Calendar, GalleryVerticalEnd, LibraryBig, type LucideIcon } from "lucide-react";

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

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    items: [
      {
        title: "Daily",
        url: "/dashboard/daily",
        icon: Calendar,
        isCustomButton: true,
      },
      {
        title: "Library",
        url: "/dashboard/library",
        icon: LibraryBig,
      },
      {
        title: "Collections",
        url: "/focus-collections",
        icon: GalleryVerticalEnd,
        isNew: true,
      },
    ],
  },
  // Settings removed from sidebar per request; accessible via profile menu
];
