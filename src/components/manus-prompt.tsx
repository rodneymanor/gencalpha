"use client";

import React from "react";

import { ArrowUp, BarChart3, FileText, Globe, Image as ImageIcon, MoreHorizontal, Table } from "lucide-react";

import HelpNotificationsButtons from "@/components/help-notifications-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type QuickAction = {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  isNew?: boolean;
};

interface ManusPromptProps {
  greeting?: string;
  subtitle?: string;
  placeholder?: string;
  actions?: QuickAction[];
  className?: string;
}

const defaultActions: QuickAction[] = [
  { label: "Image", icon: ImageIcon },
  { label: "Slides", icon: FileText },
  { label: "Webpage", icon: Globe },
  { label: "Spreadsheet", icon: Table, isNew: true },
  { label: "Visualization", icon: BarChart3 },
  { label: "More", icon: MoreHorizontal },
];

export const ManusPrompt: React.FC<ManusPromptProps> = ({
  greeting = "Hello",
  subtitle = "What will you script today?",
  placeholder = "Give Gen.C a topic to script...",
  actions = defaultActions,
  className,
}) => {
  return (
    <div className={cn("mx-auto my-24 w-full max-w-3xl min-w-[390px] space-y-4 px-5 text-base", className)}>
      {/* Header */}
      <header className="flex w-full items-end justify-between pb-4 pl-4">
        <h1 className="text-foreground text-4xl leading-10 font-bold tracking-tight">
          {greeting}
          <br />
          <span className="text-muted-foreground">{subtitle}</span>
        </h1>
      </header>

      {/* Input Card */}
      <div className="bg-background rounded-3xl border shadow-md">
        <div className="flex max-h-72 flex-col space-y-3 py-3">
          <div className="overflow-y-auto px-4">
            <Textarea
              rows={1}
              placeholder={placeholder}
              className="resize-none border-0 bg-transparent focus-visible:ring-0"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 px-3">
            <HelpNotificationsButtons />

            <span className="flex-1" />

            <Button disabled className="bg-muted hover:bg-muted/80 size-9 rounded-full">
              <ArrowUp className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {actions.map(({ label, icon: Icon, isNew }) => (
          <Button key={label} variant="outline" size="sm" className="h-9 rounded-full px-4 py-2">
            {Icon && <Icon className="size-4" />}
            <span>{label}</span>
            {isNew && (
              <Badge variant="outline" className="ml-2">
                New
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ManusPrompt;
