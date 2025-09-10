"use client";

import { useEffect, useState } from "react";

import { useSearchParams, useRouter } from "next/navigation";

import { Settings } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { PillButton } from "@/components/ui/pill-button";
import { CenteredPageTemplate, PageHeader } from "@/components/page-templates/centered-page-template";
import { cn } from "@/lib/utils";

// Local settings subcomponents
import { AccountSettings } from "./_components/account-settings";
import { ApiKeysSettings } from "./_components/api-keys-settings";
import { BillingSettings } from "./_components/billing-settings";
import { NotificationsSettings } from "./_components/notifications-settings";

const settingsTabs = [
  {
    id: "account",
    label: "Account",
    component: AccountSettings,
  },
  {
    id: "billing",
    label: "Billing",
    component: BillingSettings,
  },
  {
    id: "notifications",
    label: "Notifications",
    component: NotificationsSettings,
  },
  {
    id: "api-keys",
    label: "API Keys",
    component: ApiKeysSettings,
  },
] as const;

type SettingsTab = (typeof settingsTabs)[number]["id"];

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  // Initialize from ?tab= query param if present
  useEffect(() => {
    const tabParam = (searchParams.get("tab") as SettingsTab | null) ?? null;
    if (tabParam && settingsTabs.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const ActiveComponent = settingsTabs.find((tab) => tab.id === activeTab)?.component ?? AccountSettings;

  return (
    <CenteredPageTemplate
      header={
        <PageHeader
          title="Settings"
          subtitle="Manage your account preferences and configuration"
          className="mb-4"
        >
          <div className="mt-3 flex items-center gap-2">
            <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-[var(--radius-card)] bg-neutral-100 text-neutral-900">
              <Settings className="h-5 w-5" />
            </div>
          </div>
        </PageHeader>
      }
    >
      {/* Tabs: Pill pattern with numbered variants */}
      <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-1.5 sm:p-2">
        <div className="flex min-w-max items-center gap-2 overflow-x-auto">
          {settingsTabs.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <PillButton
                key={tab.id}
                label={tab.label}
                selected={selected}
                onClick={() => {
                  setActiveTab(tab.id);
                  const params = new URLSearchParams(Array.from(searchParams.entries()));
                  params.set("tab", tab.id);
                  router.replace(`/settings?${params.toString()}`);
                }}
                className={cn("whitespace-nowrap px-2.5 sm:px-3")}
              />
            );
          })}
        </div>
      </div>

      {/* Content Card */}
      <div className="mt-6">
        <Card className="border-neutral-200 bg-neutral-50">
          <CardContent className="p-4 sm:p-6">
            <ActiveComponent />
          </CardContent>
        </Card>
      </div>
    </CenteredPageTemplate>
  );
}
