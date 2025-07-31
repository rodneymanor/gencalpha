"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SheetClose, SheetTitle } from "@/components/ui/sheet";
import { ReactNode } from "react";

interface PanelHeaderProps {
  title: ReactNode;
  onClose?: () => void;
  className?: string;
  children?: ReactNode; // optional right-side custom actions (replaces default X)
}

export function PanelHeader({ title, onClose, className, children }: PanelHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between border-b p-6", className)}>
      <SheetTitle asChild>
        <h2 className="text-lg font-semibold leading-none">{title}</h2>
      </SheetTitle>
      {children ?? (
        <SheetClose asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </Button>
        </SheetClose>
      )}
    </div>
  );
}
