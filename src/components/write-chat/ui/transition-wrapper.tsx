"use client";

import { useCallback } from "react";

export interface TransitionWrapperProps {
  isHeroState: boolean;
  isTransitioning: boolean;
  setIsHeroState: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTransitioning: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
  children: React.ReactNode;
}

export function TransitionWrapper({
  isHeroState,
  isTransitioning,
  setIsHeroState,
  setIsTransitioning,
  className = "",
  children,
}: TransitionWrapperProps) {
  // Handle hero to chat expansion with transform
  const handleHeroExpansion = useCallback(() => {
    if (!isHeroState || isTransitioning) return;
    setIsTransitioning(true);
    setIsHeroState(false);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 400); // Match CSS transition duration
  }, [isHeroState, isTransitioning, setIsTransitioning, setIsHeroState]);

  return (
    <div
      className={`claude-chat-container ${isHeroState ? "hero-state" : "expanded"} ${
        isTransitioning ? "transitioning" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
