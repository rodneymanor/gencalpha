import { Calendar, GalleryVerticalEnd, LibraryBig, Inbox, PenLine, Users, type LucideIcon } from "lucide-react";

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
    ],
  },
  {
    id: 2,
    label: "Ideas",
    items: [
      {
        title: "Creators",
        url: "/dashboard/ideas/creators",
        icon: Users,
      },
      {
        title: "Idea inbox",
        url: "/dashboard/ideas/idea-inbox",
        icon: Inbox,
      },
      {
        title: "Ghostwriter",
        url: "/dashboard/ideas/ghostwriter",
        icon: PenLine,
      },
    ],
  },
  // Settings removed from sidebar per request; accessible via profile menu
];
