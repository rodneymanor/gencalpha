import { Fingerprint, Calendar, Settings, Wand2, BookOpen, Video, Queue, type LucideIcon } from "lucide-react";

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
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Content",
    items: [
      {
        title: "Daily",
        url: "/dashboard/daily",
        icon: Calendar,
      },
      {
        title: "AI Ghostwriter",
        url: "/dashboard/ai-ghostwriter",
        icon: Wand2,
        isNew: true,
      },
      {
        title: "Idea Inbox",
        url: "/dashboard/idea-inbox",
        icon: BookOpen,
        isNew: true,
      },
      {
        title: "Collections",
        url: "/dashboard/collections",
        icon: Video,
        isNew: true,
      },
      {
        title: "Q",
        url: "/dashboard/q",
        icon: Queue,
        isNew: true,
      },
      {
        title: "Onboarding",
        url: "/dashboard/onboarding",
        icon: Settings,
      },
    ],
  },
  {
    id: 2,
    label: "Pages",
    items: [
      {
        title: "Authentication",
        url: "/auth",
        icon: Fingerprint,
        subItems: [
          { title: "Login v1", url: "/auth/v1/login", newTab: true },
          { title: "Login v2", url: "/auth/v2/login", newTab: true },
          { title: "Register v1", url: "/auth/v1/register", newTab: true },
          { title: "Register v2", url: "/auth/v2/register", newTab: true },
        ],
      },
    ],
  },
];
