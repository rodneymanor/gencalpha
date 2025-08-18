"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

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

// Tooltip components (simplified for demo)
const Tooltip = ({ children }) => <div className="relative inline-block">{children}</div>;
const TooltipTrigger = ({ children, asChild, ...props }) => 
  asChild ? React.cloneElement(children, props) : <div {...props}>{children}</div>;
const TooltipContent = ({ children, side, sideOffset }) => (
  <div className="absolute z-50 bg-popover text-popover-foreground rounded-md px-2 py-1 text-xs shadow-lg opacity-0 hover:opacity-100 transition-opacity -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
    {children}
  </div>
);

// Demo icons
const GhostWriteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const WebSearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const IdeasIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="2" x2="12" y2="6"/>
    <line x1="12" y1="18" x2="12" y2="22"/>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
    <line x1="2" y1="12" x2="6" y2="12"/>
    <line x1="18" y1="12" x2="22" y2="12"/>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
  </svg>
);

// Advanced Sliding Switch Component with improved alignment
export const AdvancedSlidingSwitch: React.FC<AdvancedSlidingSwitchProps> = ({
  options,
  onChange,
  defaultValue = 0,
  disabled = false
}) => {
  const [activeIndex, setActiveIndex] = useState(defaultValue);

  // Calculate dimensions
  const buttonWidth = 26; // Width of each button
  const containerPadding = 4; // Padding on each side (p-1 = 4px)
  const containerWidth = (buttonWidth * options.length) + (containerPadding * 2);

  // Calculate the exact position for the sliding background
  const calculateSliderPosition = (index: number) => {
    // Start at 3px (slightly less than container padding) for better visual balance
    // This accounts for the border and ensures equal spacing on both sides
    return 3 + (buttonWidth * index);
  };

  return (
    <div 
      className={`relative inline-flex h-8 items-center justify-center overflow-hidden rounded-[10px] border border-black/[0.06] bg-[#F8F8F7] p-1 shadow-[0_0.125rem_0.5rem_rgba(0,0,0,0.025),0_0_0_0.5px_rgba(0,0,0,0.04)] ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ width: `${containerWidth}px` }}
    >
      {/* Sliding background - positioned using left instead of transform for better accuracy */}
      <motion.div
        className="absolute h-6 rounded-[8px] border border-black/[0.06] bg-white shadow-sm"
        style={{
          width: `${buttonWidth}px`,
          top: '50%',
          transform: 'translateY(-50%)', // Perfect vertical centering
        }}
        animate={{
          left: `${calculateSliderPosition(activeIndex)}px`,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      />

      {/* Button container - flex to ensure proper spacing */}
      <div className="relative z-10 flex items-center h-full">
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
                className={`relative flex h-6 items-center justify-center text-sm font-medium transition-colors duration-200 ${
                  activeIndex === index ? "text-[#34322D]" : "text-[#858481] hover:text-[#34322D]"
                } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                style={{ width: `${buttonWidth}px` }}
                aria-label={option.tooltip}
              >
                <div className="flex items-center justify-center">{option.icon}</div>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={8}>
              <p className="text-xs font-medium">{option.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

// Demo Component
export default function SwitchDemo() {
  const [selectedMode, setSelectedMode] = useState<ModeType>("web-search");
  
  const switchOptions: SwitchOption[] = [
    {
      value: "ghost-write",
      icon: <GhostWriteIcon />,
      tooltip: "Ghost Write"
    },
    {
      value: "web-search",
      icon: <WebSearchIcon />,
      tooltip: "Web Search"
    },
    {
      value: "ideas",
      icon: <IdeasIcon />,
      tooltip: "Ideas"
    }
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F8F7]">
      <div className="flex flex-col items-center gap-8">
        <h2 className="text-2xl font-medium text-[#34322D]">Fixed Sliding Switch</h2>
        
        <AdvancedSlidingSwitch
          options={switchOptions}
          onChange={(index, option) => {
            setSelectedMode(option.value);
            console.log("Selected:", option.value);
          }}
          defaultValue={1}
        />
        
        <p className="text-sm text-[#858481]">
          Selected mode: <span className="font-medium text-[#34322D]">{selectedMode}</span>
        </p>

        {/* Test with different numbers of options */}
        <div className="mt-8 flex flex-col gap-4">
          <h3 className="text-lg font-medium text-[#34322D]">Different Configurations</h3>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#858481]">2 options:</span>
            <AdvancedSlidingSwitch
              options={switchOptions.slice(0, 2)}
              onChange={(index, option) => console.log("2-option switch:", option.value)}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#858481]">Disabled:</span>
            <AdvancedSlidingSwitch
              options={switchOptions}
              defaultValue={0}
              disabled={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}