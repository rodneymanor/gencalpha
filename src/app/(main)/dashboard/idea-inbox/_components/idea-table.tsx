import React from "react";

import { Calendar, Eye, Instagram, Youtube, Globe, MessageSquare, Mic, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Idea {
  id: string;
  title: string;
  content: string;
  source: "instagram" | "tiktok" | "youtube" | "blog" | "manual" | "voice";
  sourceUrl?: string;
  excerpt: string;
  createdAt: string;
  wordCount: number;
  tags: string[];
}

interface IdeaTableProps {
  ideas: Idea[];
  onViewIdea: (idea: Idea) => void;
}

const getSourceIcon = (source: string) => {
  switch (source) {
    case "instagram":
      return <Instagram className="h-4 w-4" />;
    case "tiktok":
      return <MessageSquare className="h-4 w-4" />;
    case "youtube":
      return <Youtube className="h-4 w-4" />;
    case "blog":
      return <Globe className="h-4 w-4" />;
    case "voice":
      return <Mic className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getSourceColor = (source: string) => {
  switch (source) {
    case "instagram":
      return "bg-pink-100 text-pink-800";
    case "tiktok":
      return "bg-black text-white";
    case "youtube":
      return "bg-red-100 text-red-800";
    case "blog":
      return "bg-blue-100 text-blue-800";
    case "voice":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
  return date.toLocaleDateString();
};

export function IdeaTable({ ideas, onViewIdea }: IdeaTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-48">Title</TableHead>
          <TableHead className="w-24">Source</TableHead>
          <TableHead className="w-80">Excerpt</TableHead>
          <TableHead className="w-20">Words</TableHead>
          <TableHead className="w-24">Added</TableHead>
          <TableHead className="w-20">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ideas.map((idea) => (
          <TableRow key={idea.id} className="hover:bg-muted/50 cursor-pointer">
            <TableCell onClick={() => onViewIdea(idea)} className="max-w-48 font-medium">
              <div className="flex flex-col gap-1">
                <span className="line-clamp-1 text-sm font-medium">{idea.title}</span>
                {idea.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {idea.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {idea.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{idea.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell onClick={() => onViewIdea(idea)}>
              <Badge className={`gap-1 text-xs ${getSourceColor(idea.source)}`}>
                {getSourceIcon(idea.source)}
                {idea.source}
              </Badge>
            </TableCell>
            <TableCell onClick={() => onViewIdea(idea)} className="text-muted-foreground max-w-xs">
              <span className="line-clamp-2">{idea.excerpt}</span>
            </TableCell>
            <TableCell onClick={() => onViewIdea(idea)}>
              <Badge variant="outline" className="text-xs">
                {idea.wordCount}
              </Badge>
            </TableCell>
            <TableCell onClick={() => onViewIdea(idea)}>
              <div className="text-muted-foreground flex items-center gap-1 text-sm">
                <Calendar className="h-3 w-3" />
                {formatDate(idea.createdAt)}
              </div>
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewIdea(idea);
                }}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-3 w-3" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
