"use client";

import React, { useState } from 'react';

import { Hexagon, Zap } from 'lucide-react';

import { UserProfileSlideout } from '@/components/standalone/user-profile-slideout';
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
  const [isProfileSlideoutOpen, setIsProfileSlideoutOpen] = useState(false);

  const handleBrandClick = () => {
    if (onBrandClick) {
      onBrandClick();
    } else {
      setIsProfileSlideoutOpen(true);
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
        aria-expanded={isProfileSlideoutOpen}
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

      {/* Profile Slideout Overlay */}
      {isProfileSlideoutOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="flex-1 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsProfileSlideoutOpen(false)}
          />
          
          {/* Slideout Panel */}
          <div className="bg-background border-border w-[400px] max-w-[90vw] border-l shadow-[var(--shadow-soft-drop)]">
            <UserProfileSlideout onClose={() => setIsProfileSlideoutOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};