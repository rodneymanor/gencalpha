import { Calendar, Wand2, BookOpen, Video, ListTodo, Palette, MessageCircle, type LucideIcon } from "lucide-react";

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
        title: "Queue",
        url: "/dashboard/q",
        icon: ListTodo,
        isNew: true,
      },
      {
        title: "Script Chat",
        url: "/dashboard/script-chat",
        icon: MessageCircle,
        isNew: true,
      },
    ],
  },
];
