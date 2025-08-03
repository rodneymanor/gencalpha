"use client"

import * as React from "react"

import { CircleHelp, Inbox, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export interface HelpNotificationsButtonsProps {
  className?: string
}

export const HelpNotificationsButtons: React.FC<HelpNotificationsButtonsProps> = ({
  className,
}) => (
  <TooltipProvider>
    <div
      className={cn(
        "inline-flex items-center overflow-hidden rounded-full border",
        className,
      )}
    >
      {/* Help */}
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="group rounded-none data-[state=open]:bg-muted"
              >
                <CircleHelp className="size-5 text-muted-foreground transition-colors group-hover:text-foreground" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Help</p>
          </TooltipContent>
        </Tooltip>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Help & Support</h4>
            <p className="text-sm text-muted-foreground">
              Get help with your account, billing, and technical issues.
            </p>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                Documentation
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Contact Support
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Community Forum
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Notifications */}
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="group rounded-none data-[state=open]:bg-muted"
              >
                <Inbox className="size-5 text-muted-foreground transition-colors group-hover:text-foreground" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Notifications</p>
          </TooltipContent>
        </Tooltip>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Notifications</h4>
            <p className="text-sm text-muted-foreground">
              You have no new notifications.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <div className="size-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Welcome to the platform!</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 rounded-md p-2">
                <div className="size-2 rounded-full bg-muted" />
                <div className="flex-1">
                  <p className="text-sm font-medium">System maintenance scheduled</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Settings */}
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="group rounded-none data-[state=open]:bg-muted"
              >
                <Settings className="size-5 text-muted-foreground transition-colors group-hover:text-foreground" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Settings</p>
          </TooltipContent>
        </Tooltip>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Settings</h4>
            <p className="text-sm text-muted-foreground">
              Manage your account settings and preferences.
            </p>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                Account Settings
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Privacy & Security
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Appearance
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Billing & Usage
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  </TooltipProvider>
)

export default HelpNotificationsButtons
