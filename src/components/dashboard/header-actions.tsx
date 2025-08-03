"use client";

import Image from "next/image";

import { Bell, FileText, Star, MessageSquare } from "lucide-react";

import { useResizableLayout } from "@/contexts/resizable-layout-context";

interface HeaderActionsProps {
  creditCount?: number;
  userAvatar?: string;
  userName?: string;
  onNotificationClick?: () => void;
  onUpgradeClick?: () => void;
  onUserClick?: () => void;
  hasNotifications?: boolean;
}

export default function HeaderActions({
  creditCount = 157,
  userAvatar,
  userName = "User",
  onNotificationClick,
  onUpgradeClick,
  onUserClick,
  hasNotifications = false,
}: HeaderActionsProps) {
  const { toggleNotesPanel, toggleChatbotPanel } = useResizableLayout();
  return (
    <div className="flex items-center gap-2">
      {/* Notification Button */}
      <div
        className="hover:bg-muted outline-border group relative flex size-8 cursor-pointer items-center justify-center rounded-full outline outline-1 -outline-offset-1 transition-colors"
        onClick={onNotificationClick}
        role="button"
        tabIndex={0}
        aria-label="Notifications"
      >
        <Bell className="text-muted-foreground size-[18px]" />
        {hasNotifications && <div className="bg-destructive absolute -top-1 -right-1 h-2 w-2 rounded-full" />}
      </div>

      {/* Chatbot Button */}
      <button
        className="hover:bg-accent text-foreground outline-border relative hidden h-8 min-w-16 items-center justify-center gap-1.5 rounded-full bg-transparent px-3 text-sm font-medium whitespace-nowrap outline outline-1 -outline-offset-1 transition-colors hover:opacity-90 active:opacity-80 sm:flex"
        onClick={() => toggleChatbotPanel()}
        aria-label="Toggle AI chatbot panel"
      >
        <MessageSquare className="size-[18px]" />
        AI Chat
      </button>

      {/* Notes Button */}
      <button
        className="hover:bg-accent text-foreground outline-border relative hidden h-8 min-w-16 items-center justify-center gap-1.5 rounded-full bg-transparent px-3 text-sm font-medium whitespace-nowrap outline outline-1 -outline-offset-1 transition-colors hover:opacity-90 active:opacity-80 sm:flex"
        onClick={toggleNotesPanel}
        aria-label="Toggle idea inbox panel"
      >
        <FileText className="size-[18px]" />
        Ideas
      </button>

      {/* Credits Section */}
      <div className="relative">
        <div
          className="outline-border text-foreground hover:bg-accent flex h-8 cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-sm font-medium outline outline-1 -outline-offset-1 transition-colors"
          role="button"
          tabIndex={0}
          aria-label={`${creditCount} credits available`}
        >
          <Star className="size-4" />
          <span className="text-foreground text-sm">{creditCount}</span>
          <div className="flex items-center">
            <div className="bg-border mr-1.5 ml-0.5 h-3 w-px" />
            <button
              className="text-[13px] leading-[18px] font-medium text-blue-600 transition-colors hover:text-blue-700"
              onClick={onUpgradeClick}
            >
              Upgrade
            </button>
          </div>
        </div>
      </div>

      {/* User Avatar */}
      <div
        className="flex cursor-pointer items-center"
        onClick={onUserClick}
        role="button"
        tabIndex={0}
        aria-label={`User menu for ${userName}`}
      >
        <div className="relative flex flex-shrink-0 items-center justify-center font-bold">
          <div className="bg-muted relative flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full font-bold">
            {userAvatar ? (
              <Image
                className="h-full w-full object-cover"
                src={userAvatar}
                alt={`${userName} avatar`}
                width={32}
                height={32}
              />
            ) : (
              <div className="bg-primary/10 text-primary flex h-full w-full items-center justify-center text-sm font-semibold">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
