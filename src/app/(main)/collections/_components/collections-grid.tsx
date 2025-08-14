"use client";

import { useState } from "react";

import Image from "next/image";

import { Play, Clock, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface CollectionItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  createdAt: string;
  status: "draft" | "published" | "archived";
}

const mockCollectionItems: CollectionItem[] = [
  {
    id: "1",
    title: "Marketing Strategy Deep Dive",
    description: "Comprehensive analysis of modern marketing approaches",
    thumbnail: "/api/placeholder/320/180",
    duration: "12:34",
    createdAt: "2024-01-15",
    status: "published",
  },
  {
    id: "2",
    title: "Product Launch Presentation",
    description: "Q4 product roadmap and launch strategy",
    thumbnail: "/api/placeholder/320/180",
    duration: "8:42",
    createdAt: "2024-01-14",
    status: "draft",
  },
  {
    id: "3",
    title: "Team Meeting Recap",
    description: "Weekly sync and project updates",
    thumbnail: "/api/placeholder/320/180",
    duration: "15:18",
    createdAt: "2024-01-13",
    status: "published",
  },
  {
    id: "4",
    title: "Customer Feedback Analysis",
    description: "User research insights and action items",
    thumbnail: "/api/placeholder/320/180",
    duration: "6:55",
    createdAt: "2024-01-12",
    status: "archived",
  },
];

interface CollectionsGridProps {
  selectedCollection?: string;
  onItemClick?: (item: CollectionItem) => void;
  showFollowButton?: boolean;
}

export function CollectionsGrid({
  selectedCollection = "all",
  onItemClick: _onItemClick,
  showFollowButton: _showFollowButton,
}: CollectionsGridProps) {
  const [items] = useState(mockCollectionItems);

  const filteredItems = items.filter((item) => {
    if (selectedCollection === "all") return true;
    if (selectedCollection === "favorites") return item.status === "published";
    if (selectedCollection === "drafts") return item.status === "draft";
    if (selectedCollection === "published") return item.status === "published";
    return true;
  });

  const getStatusColor = (status: CollectionItem["status"]) => {
    switch (status) {
      case "published":
        return "bg-green-500";
      case "draft":
        return "bg-yellow-500";
      case "archived":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredItems.map((item) => (
        <Card key={item.id} className="group cursor-pointer transition-shadow hover:shadow-md">
          <CardContent className="p-0">
            <div className="bg-muted relative aspect-video overflow-hidden rounded-t-[var(--radius-card)]">
              <Image
                src={item.thumbnail}
                alt={item.title}
                className="h-full w-full object-cover"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <Button size="sm" variant="secondary" className="rounded-full">
                  <Play className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute right-2 bottom-2 flex items-center gap-1 rounded bg-black/80 px-2 py-1 text-xs text-white">
                <Clock className="h-3 w-3" />
                {item.duration}
              </div>
              <div className={`absolute top-2 left-2 h-3 w-3 rounded-full ${getStatusColor(item.status)}`} />
            </div>
          </CardContent>
          <CardFooter className="p-4">
            <div className="w-full space-y-2">
              <h3 className="line-clamp-1 text-sm font-medium">{item.title}</h3>
              <p className="text-muted-foreground line-clamp-2 text-xs">{item.description}</p>
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
