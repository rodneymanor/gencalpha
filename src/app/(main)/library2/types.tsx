// Library Types and Utilities
// Type definitions and helper functions for the Library2 page

import React from "react";
import {
  FileText,
  Video,
  Mic,
  Image as ImageIcon,
  Link,
  BookOpen,
} from "lucide-react";

import { BaseItem } from "@/components/templates/data-table-template";

// Define library item type
export interface LibraryItem extends BaseItem {
  id: string;
  title: string;
  description?: string;
  type: "document" | "video" | "audio" | "image" | "link" | "note";
  category: "research" | "reference" | "tutorial" | "inspiration" | "archive";
  status: "draft" | "published" | "reviewing" | "archived";
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
  size?: number; // in bytes
  duration?: number; // in seconds for media
  viewCount: number;
  rating?: number; // 1-5
  progress?: number; // 0-100 for reading/watching progress
  url?: string;
  thumbnail?: string;
  collaborators?: Array<{
    id: string;
    name: string;
    role: "viewer" | "editor" | "owner";
  }>;
  metadata?: {
    wordCount?: number;
    pageCount?: number;
    format?: string;
    language?: string;
  };
}

// Type icons mapping
export const TypeIcon: Record<LibraryItem["type"], React.ReactNode> = {
  document: <FileText className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  audio: <Mic className="h-4 w-4" />,
  image: <ImageIcon className="h-4 w-4" />,
  link: <Link className="h-4 w-4" />,
  note: <BookOpen className="h-4 w-4" />,
};

// Format file size
export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "—";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

// Format duration
export const formatDuration = (seconds?: number): string => {
  if (!seconds) return "—";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

// Generate mock data
export const generateMockData = (): LibraryItem[] => {
  const types: LibraryItem["type"][] = ["document", "video", "audio", "image", "link", "note"];
  const categories: LibraryItem["category"][] = ["research", "reference", "tutorial", "inspiration", "archive"];
  const statuses: LibraryItem["status"][] = ["draft", "published", "reviewing", "archived"];
  
  const mockTitles = [
    "Design System Documentation",
    "User Research Findings Q4 2024",
    "Component Architecture Guide",
    "Brand Guidelines v3.0",
    "Sprint Planning Template",
    "Customer Journey Map",
    "API Integration Tutorial",
    "Performance Optimization Tips",
    "Accessibility Best Practices",
    "Mobile Design Patterns",
    "Data Visualization Handbook",
    "Content Strategy Framework",
    "Development Workflow Guide",
    "Security Audit Report",
    "Marketing Campaign Analysis",
  ];

  return mockTitles.map((title, index) => {
    const type = types[index % types.length];
    const category = categories[index % categories.length];
    const status = statuses[index % statuses.length];
    const createdDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
    
    return {
      id: `lib-${index + 1}`,
      title,
      description: `${title} - Comprehensive resource for team reference and collaboration`,
      type,
      category,
      status,
      author: {
        id: `user-${(index % 3) + 1}`,
        name: ["Alex Johnson", "Sarah Chen", "Mike Williams"][index % 3],
      },
      tags: ["important", "featured", "team", "2024"].slice(0, Math.floor(Math.random() * 3) + 1),
      createdAt: createdDate,
      updatedAt: new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
      lastAccessedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      size: type !== "link" ? Math.floor(Math.random() * 50000000) : undefined,
      duration: ["video", "audio"].includes(type) ? Math.floor(Math.random() * 7200) : undefined,
      viewCount: Math.floor(Math.random() * 1000),
      rating: Math.random() > 0.3 ? Math.floor(Math.random() * 5) + 1 : undefined,
      progress: Math.random() > 0.5 ? Math.floor(Math.random() * 101) : undefined,
      url: type === "link" ? `https://example.com/${title.toLowerCase().replace(/\s+/g, "-")}` : undefined,
      thumbnail: ["video", "image"].includes(type) ? `https://picsum.photos/seed/${index}/200/150` : undefined,
      metadata: type === "document" ? {
        wordCount: Math.floor(Math.random() * 10000) + 1000,
        pageCount: Math.floor(Math.random() * 100) + 10,
        format: "PDF",
        language: "English",
      } : undefined,
    };
  });
};