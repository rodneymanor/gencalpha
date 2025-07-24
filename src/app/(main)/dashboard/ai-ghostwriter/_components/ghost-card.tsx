import { TrendingUp, Heart, MessageSquare, Share, Clock, Target, Lightbulb, BookOpen, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { GhostWritingCard } from "./types";

interface GhostCardProps {
  card: GhostWritingCard;
  onGenerateScript: (card: GhostWritingCard) => void;
  onSave: (card: GhostWritingCard) => void;
}

const getCategoryIcon = (category: string) => {
  const iconMap = {
    problem: <Target className="h-4 w-4" />,
    excuse: <Lightbulb className="h-4 w-4" />,
    question: <MessageSquare className="h-4 w-4" />,
  };
  return iconMap[category as keyof typeof iconMap] || <BookOpen className="h-4 w-4" />;
};

const getDifficultyColor = (difficulty: "easy" | "medium" | "hard") => {
  const colorMap = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
  };
  return colorMap[difficulty] || "bg-gray-100 text-gray-800";
};

export function GhostCard({ card, onGenerateScript, onSave }: GhostCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg">
      {card.trending && (
        <div className="absolute top-4 right-4">
          <Badge className="border-0 bg-gradient-to-r from-orange-500 to-pink-500 text-white">
            <TrendingUp className="mr-1 h-3 w-3" />
            Trending
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="mb-2 text-lg leading-tight">{card.title}</CardTitle>
            <CardDescription className="text-sm">{card.concept}</CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Badge variant="outline" className="gap-1 text-xs">
            {getCategoryIcon(card.category)}
            {card.category}
          </Badge>
          <Badge className={cn("text-xs", getDifficultyColor(card.difficulty))}>{card.difficulty}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Content Preview */}
        <div className="space-y-3">
          <div>
            <div className="text-muted-foreground mb-1 text-xs font-medium">Hook</div>
            <p className="line-clamp-2 text-sm">{card.hook}</p>
          </div>

          <div>
            <div className="text-muted-foreground mb-1 text-xs font-medium">Golden Nugget</div>
            <p className="line-clamp-2 text-sm font-medium">{card.goldenNugget}</p>
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="text-muted-foreground flex items-center justify-between border-t pt-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {card.engagement.likes.toLocaleString()}
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {card.engagement.comments}
            </div>
            <div className="flex items-center gap-1">
              <Share className="h-3 w-3" />
              {card.engagement.shares}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {card.estimatedDuration}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" className="flex-1 gap-1" onClick={() => onGenerateScript(card)}>
            <Zap className="h-3 w-3" />
            Generate Script
          </Button>
          <Button size="sm" variant="outline" onClick={() => onSave(card)}>
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
