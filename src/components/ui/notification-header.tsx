"use client";

import React from 'react';

import { Hexagon, Zap } from 'lucide-react';

import { NotificationDropdown } from '@/components/ui/notification-dropdown';

interface NotificationHeaderProps {
  creditsCount?: number;
  showUpgrade?: boolean;
  onBrandClick?: () => void;
  onUpgradeClick?: () => void;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  creditsCount = 396,
  showUpgrade = true,
  onBrandClick,
  onUpgradeClick
}) => {
  const handleBrandClick = () => {
    if (onBrandClick) {
      onBrandClick();
    } else {
      // Dispatch event to open profile slideout
      window.dispatchEvent(new CustomEvent("profile:open"));
    }
  };
  return (
    <div className="flex items-center gap-2">
      {/* Notification Dropdown */}
      <NotificationDropdown />

      {/* Brand Button */}
      <button
        onClick={handleBrandClick}
        className="relative flex h-8 min-w-16 items-center justify-center gap-1.5 rounded-[var(--radius-button)] border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-[var(--background-hover)] transition-colors duration-200"
        aria-haspopup="dialog"
      >
        <Hexagon className="w-4 h-4" />
        Brand
      </button>

      {/* Credits/Points Section */}
      <div className="relative">
        <button
          onClick={onUpgradeClick}
          className="flex h-8 cursor-pointer items-center gap-1 text-sm font-medium text-foreground rounded-[var(--radius-button)] border border-border bg-background px-3 hover:bg-muted transition-colors duration-200"
          aria-expanded="false"
          aria-haspopup="dialog"
        >
          <Zap className="w-4 h-4" />
          <span className="text-sm text-foreground">
            {creditsCount}
          </span>
          {showUpgrade && (
            <div className="flex items-center">
              <div className="ml-0.5 mr-1.5 h-3 w-px bg-border" />
              <span className="select-none text-[13px] leading-[18px] text-secondary">
                Upgrade
              </span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};