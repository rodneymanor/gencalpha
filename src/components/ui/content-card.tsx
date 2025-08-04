import React from 'react';

import { Shield, Star, Share2, Bookmark } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ContentCardProps {
  title: string;
  description: string;
  badge: {
    label: string;
    variant?: 'default' | 'secondary' | 'outline';
  };
  rating: {
    value: string;
    showIcon?: boolean;
  };
  onShare?: () => void;
  onBookmark?: () => void;
  className?: string;
}

export function ContentCard({
  title,
  description,
  badge,
  rating,
  onShare,
  onBookmark,
  className,
}: ContentCardProps) {
  return (
    <Card className={cn("w-full max-w-lg", className)}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-card-foreground leading-none">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>

      <CardFooter className="border-t pt-6">
        <div className="flex items-center justify-between w-full">
          {/* Left Section - Badge and Rating */}
          <div className="flex items-center gap-3">
            {/* Badge */}
            <Badge variant={badge.variant || 'secondary'} className="gap-1">
              <span className="text-xs font-medium">
                {badge.label}
              </span>
              <Shield className="size-3" />
            </Badge>

            {/* Rating */}
            <div className="flex items-center gap-1">
              {rating.showIcon !== false && (
                <Star className="size-3 fill-yellow-500 text-yellow-500" />
              )}
              <span className="text-xs font-medium text-yellow-600">
                {rating.value}
              </span>
            </div>
          </div>

          {/* Right Section - Action Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onShare}
              className="size-8"
            >
              <Share2 className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onBookmark}
              className="size-8"
            >
              <Bookmark className="size-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default ContentCard;