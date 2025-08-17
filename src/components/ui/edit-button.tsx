"use client";

import { useState } from "react";

import { Edit3 } from "lucide-react";

import { cn } from "@/lib/utils";

interface EditButtonProps {
  onEdit?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "floating" | "inline";
}

const sizeClasses = {
  sm: {
    container: "p-1",
    button: "p-1",
    icon: "h-3 w-3",
    text: "text-xs"
  },
  md: {
    container: "p-1.5",
    button: "px-2 py-1",
    icon: "h-3.5 w-3.5",
    text: "text-xs"
  },
  lg: {
    container: "p-2",
    button: "px-3 py-1.5",
    icon: "h-4 w-4",
    text: "text-sm"
  }
};

export function EditButton({
  onEdit,
  className,
  size = "md",
  variant = "floating"
}: EditButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  // eslint-disable-next-line security/detect-object-injection
  const sizeConfig = sizeClasses[size];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  if (variant === "inline") {
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "inline-flex items-center gap-1.5 transition-all duration-150",
          "text-muted-foreground hover:text-foreground",
          "hover:bg-background-hover rounded-[var(--radius-button)]",
          sizeConfig.button,
          sizeConfig.text,
          className
        )}
      >
        <Edit3 className={sizeConfig.icon} />
        <span>Edit</span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "absolute bottom-0 right-2 transform translate-y-4 pointer-events-none",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "pointer-events-auto min-w-max transition-all duration-150",
          "bg-background/90 backdrop-blur-sm",
          "border-[0.5px] border-[var(--border-subtle)]",
          "shadow-[var(--shadow-soft-drop)]",
          "rounded-[var(--radius-button)]",
          sizeConfig.container,
          isHovered && "shadow-[var(--shadow-hover)] border-[var(--border-hover)]"
        )}
      >
        <button
          onClick={handleClick}
          className={cn(
            "flex items-center gap-1.5 transition-all duration-150",
            "text-muted-foreground hover:text-foreground",
            "hover:bg-background-hover rounded-[var(--radius-subtle)]",
            sizeConfig.button,
            sizeConfig.text
          )}
        >
          <Edit3 className={sizeConfig.icon} />
          <span>Edit</span>
        </button>
      </div>
    </div>
  );
}

interface EditableTextProps {
  children: React.ReactNode;
  onEdit?: () => void;
  className?: string;
  editButtonSize?: "sm" | "md" | "lg";
  showEditButton?: boolean;
}

export function EditableText({
  children,
  onEdit,
  className,
  editButtonSize = "md",
  showEditButton = true
}: EditableTextProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn("relative group", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {showEditButton && isHovered && (
        <EditButton
          onEdit={onEdit}
          size={editButtonSize}
          variant="floating"
        />
      )}
    </div>
  );
}

interface EditableCardProps {
  children: React.ReactNode;
  onEdit?: () => void;
  className?: string;
  editButtonSize?: "sm" | "md" | "lg";
  showEditButton?: boolean;
}

export function EditableCard({
  children,
  onEdit,
  className,
  editButtonSize = "md",
  showEditButton = true
}: EditableCardProps) {
  return (
    <div className={cn("relative group", className)}>
      {children}
      {showEditButton && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <EditButton
            onEdit={onEdit}
            size={editButtonSize}
            variant="floating"
            className="bottom-2 right-2 transform translate-y-0"
          />
        </div>
      )}
    </div>
  );
}