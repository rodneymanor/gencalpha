"use client";

import React from "react";

import { FileText, Lightbulb, Fish } from "lucide-react";

export interface VideoActionSelectorProps {
  onAction: (action: "transcribe" | "ideas" | "hooks") => void;
  disabled?: boolean;
  className?: string;
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: "transcribe" | "ideas" | "hooks";
  onAction: (action: "transcribe" | "ideas" | "hooks") => void;
  disabled?: boolean;
  gradientClasses: string;
}

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon,
  action,
  onAction,
  disabled = false,
  gradientClasses,
}) => {
  const handleClick = () => {
    if (!disabled) {
      onAction(action);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && !disabled) {
      e.preventDefault();
      onAction(action);
    }
  };

  return (
    <button
      className={`group border-border-subtle hover:border-border-hover dark:hover:border-border-hover focus-visible:ring-ring/50 relative flex w-full cursor-pointer overflow-hidden rounded-[var(--radius-card)] border bg-transparent p-0.5 text-left transition-all duration-300 ease-out hover:bg-white/50 focus-visible:ring-2 focus-visible:outline-none active:scale-[0.98] active:transition-transform active:duration-150 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-white/5 ${disabled ? "" : "hover:-translate-y-px hover:shadow-[var(--shadow-soft-drop)]"} `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      tabIndex={0}
      role="button"
      aria-label={`${title}: ${description}`}
    >
      <div className="flex w-full items-stretch">
        {/* Content Area */}
        <div className="flex flex-1 flex-col gap-1 px-5 py-4">
          <div className="text-foreground text-sm leading-relaxed font-medium">{title}</div>
          <div className="text-muted-foreground text-xs leading-relaxed opacity-100 transition-opacity duration-200 group-hover:opacity-90">
            {description}
          </div>
        </div>

        {/* Preview Card */}
        <div className="relative mr-4 flex w-[140px] items-end sm:w-[100px]">
          <div className="h-[100px] w-[140px] sm:h-20 sm:w-[100px]" />
          <div
            className={`dark:from-card dark:to-card/0 border-border-subtle absolute inset-0 flex translate-y-[19%] scale-100 rotate-[0.1rad] transform items-center justify-center rounded-[10px_10px_0_0] border-t border-r border-l bg-gradient-to-b from-white to-white/0 transition-transform duration-300 ease-out will-change-transform select-none backface-hidden ${gradientClasses} group-hover:translate-y-[19%] group-hover:scale-[1.035] group-hover:rotate-[0.065rad] group-hover:duration-[400ms] group-hover:ease-[cubic-bezier(0,0.9,0.5,1.35)] motion-reduce:transform-none motion-reduce:group-hover:transform-none`}
          >
            <div className="text-muted-foreground h-8 w-8 sm:h-6 sm:w-6">{icon}</div>
          </div>
        </div>
      </div>
    </button>
  );
};

const VideoActionSelector: React.FC<VideoActionSelectorProps> = ({ onAction, disabled = false, className = "" }) => {
  const actions: Array<Omit<ActionCardProps, "onAction" | "disabled">> = [
    {
      title: "Transcribe",
      description: "Extract plain text transcript",
      icon: <FileText className="h-full w-full" />,
      action: "transcribe",
      gradientClasses: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30",
    },
    {
      title: "Create Content Ideas (@Content Ideas.md)",
      description: "New content angles using PEQ",
      icon: <Lightbulb className="h-full w-full" />,
      action: "ideas",
      gradientClasses: "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/30",
    },
    {
      title: "Hook Generation",
      description: "High-performing hooks for Shorts",
      icon: <Fish className="h-full w-full" />,
      action: "hooks",
      gradientClasses: "bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/30",
    },
  ];

  return (
    <div className={`w-full max-w-[680px] ${className}`}>
      <div className="text-muted-foreground mb-3 text-xs font-medium tracking-wide">Choose an action</div>
      <div className="flex flex-col gap-2">
        {actions.map((actionProps) => (
          <ActionCard key={actionProps.action} {...actionProps} onAction={onAction} disabled={disabled} />
        ))}
      </div>
    </div>
  );
};

export default VideoActionSelector;
