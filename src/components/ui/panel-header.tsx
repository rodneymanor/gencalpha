"use client";

import { ReactNode } from "react";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PanelHeaderProps {
  title: ReactNode;
  onClose?: () => void;
  className?: string;
  children?: ReactNode; // optional right-side custom actions (replaces default X)
}

export function PanelHeader({ title, onClose, className, children }: PanelHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between border-b p-6", className)}>
      <h2 className="text-lg font-semibold leading-none">{title}</h2>
      {children ?? (
        <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </Button>

      )}
    </div>
  );
}
