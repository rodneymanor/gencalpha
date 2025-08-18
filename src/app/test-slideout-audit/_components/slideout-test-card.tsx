"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SlideoutType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  implementation: string;
  width: string;
  backdrop: string;
  responsive: string;
  patterns: string[];
}

interface SlideoutTestCardProps {
  slideout: SlideoutType;
  isActive: boolean;
  onToggle: () => void;
  onFloatingTest?: () => void;
}

export function SlideoutTestCard({ slideout, isActive, onToggle, onFloatingTest }: SlideoutTestCardProps) {
  const renderTestButton = () => {
    if (slideout.id === "floating") {
      return (
        <Button onClick={onFloatingTest} className="flex-1" variant="outline">
          {slideout.icon}
          Test Floating Player
        </Button>
      );
    }

    return (
      <Button onClick={onToggle} className="flex-1" variant={isActive ? "default" : "outline"}>
        {slideout.icon}
        {isActive ? "Close" : "Test"} {slideout.name.split(" ")[0]}
      </Button>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-primary">{slideout.icon}</div>
            <div>
              <CardTitle className="text-lg">{slideout.name}</CardTitle>
              <CardDescription className="mt-1">{slideout.description}</CardDescription>
            </div>
          </div>
          <Badge variant="outline">{slideout.implementation}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground font-medium">Width:</div>
            <div className="text-foreground">{slideout.width}</div>
          </div>
          <div>
            <div className="text-muted-foreground font-medium">Backdrop:</div>
            <div className="text-foreground">{slideout.backdrop}</div>
          </div>
        </div>

        <div>
          <div className="text-muted-foreground mb-2 text-sm font-medium">Key Patterns:</div>
          <div className="flex flex-wrap gap-1">
            {slideout.patterns.map((pattern) => (
              <Badge key={pattern} variant="secondary" className="text-xs">
                {pattern}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">{renderTestButton()}</div>
      </CardContent>
    </Card>
  );
}
