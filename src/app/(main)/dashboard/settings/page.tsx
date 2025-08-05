"use client";

import { useState } from "react";

import { Settings, User, CreditCard, Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { AccountSettings } from "./_components/account-settings";
import { BillingSettings } from "./_components/billing-settings";
import { NotificationsSettings } from "./_components/notifications-settings";

const settingsTabs = [
  {
    id: "account",
    label: "Account",
    icon: User,
    component: AccountSettings,
  },
  {
    id: "billing",
    label: "Billing",
    icon: CreditCard,
    component: BillingSettings,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    component: NotificationsSettings,
  },
] as const;

type SettingsTab = (typeof settingsTabs)[number]["id"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  const ActiveComponent = settingsTabs.find((tab) => tab.id === activeTab)?.component ?? AccountSettings;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-[var(--radius-card)]">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-foreground text-2xl font-semibold">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your account preferences and configuration</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ActiveComponent />
        </CardContent>
      </Card>
    </div>
  );
}
