"use client";

import React from 'react';

import { Bell, Hexagon, Zap } from 'lucide-react';

interface NotificationHeaderProps {
  notificationCount?: number;
  showUpgrade?: boolean;
  onNotificationClick?: () => void;
  onBrandClick?: () => void;
  onUpgradeClick?: () => void;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  notificationCount = 396,
  showUpgrade = true,
  onNotificationClick,
  onBrandClick,
  onUpgradeClick
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* Notification Button */}
      <button
        onClick={onNotificationClick}
        className="relative flex w-8 h-8 cursor-pointer items-center justify-center rounded-[var(--radius-button)] border border-border bg-background hover:bg-muted transition-colors duration-200"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 text-foreground" />
      </button>

      {/* Brand Button */}
      <button
        onClick={onBrandClick}
        className="relative flex h-8 min-w-16 items-center justify-center gap-1.5 rounded-[var(--radius-button)] border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted transition-colors duration-200"
        aria-expanded="false"
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
            {notificationCount}
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