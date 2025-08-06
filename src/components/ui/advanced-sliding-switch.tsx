"use client";

import React, { useState } from "react";

import { motion } from "framer-motion";

import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

// Types for the sliding switch
export type ModeType = "ghost-write" | "web-search" | "ideas";

export interface SwitchOption {
  value: ModeType;
  icon: React.ReactNode;
  tooltip: string;
}

interface AdvancedSlidingSwitchProps {
  options: SwitchOption[];
  onChange?: (index: number, option: SwitchOption) => void;
  defaultValue?: number;
  disabled?: boolean;
}

// Advanced Sliding Switch Component with improved contrast and tooltips
export const AdvancedSlidingSwitch: React.FC<AdvancedSlidingSwitchProps> = ({
  options,
  onChange,
  defaultValue = 0,
  disabled = false
}) => {
  const [activeIndex, setActiveIndex] = useState(defaultValue);

  return (
    <div className={`border-border bg-muted relative inline-flex h-8 w-[110px] items-center overflow-hidden rounded-[var(--radius-button)] border p-1 shadow-[var(--shadow-input)] ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      {/* Sliding background positioned absolutely to the container */}
      <motion.div
        className="bg-card border-border absolute h-6 rounded-[calc(var(--radius-button)-2px)] border shadow-sm"
        style={{
          width: `${96 / options.length}%`,
        }}
        animate={{
          x: `${activeIndex * 100 + 2}%`,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      />

      {options.map((option: SwitchOption, index: number) => (
        <Tooltip key={option.value}>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                if (!disabled) {
                  setActiveIndex(index);
                  onChange?.(index, option);
                }
              }}
              disabled={disabled}
              className={`relative z-10 flex h-6 flex-1 items-center justify-center text-sm font-medium transition-colors duration-200 ${
                activeIndex === index ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              } ${disabled ? 'cursor-not-allowed' : ''}`}
              aria-label={option.tooltip}
            >
              <div className="flex items-center">{option.icon}</div>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8}>
            <p className="text-xs font-medium">{option.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};