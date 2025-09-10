"use client";

import { useState } from "react";

import { Bell, Mail, MessageSquare, Smartphone, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

interface NotificationSettings {
  email: {
    marketing: boolean;
    security: boolean;
    updates: boolean;
    billing: boolean;
  };
  push: {
    enabled: boolean;
    mentions: boolean;
    messages: boolean;
    updates: boolean;
  };
  inApp: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
  };
  frequency: string;
}

export function NotificationsSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      marketing: false,
      security: true,
      updates: true,
      billing: true,
    },
    push: {
      enabled: true,
      mentions: true,
      messages: true,
      updates: false,
    },
    inApp: {
      enabled: true,
      sound: true,
      desktop: true,
    },
    frequency: "immediate",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const updateEmailSetting = (key: keyof typeof settings.email, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      email: { ...prev.email, [key]: value },
    }));
  };

  const updatePushSetting = (key: keyof typeof settings.push, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      push: { ...prev.push, [key]: value },
    }));
  };

  const updateInAppSetting = (key: keyof typeof settings.inApp, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      inApp: { ...prev.inApp, [key]: value },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary-700" />
            <CardTitle>Email Notifications</CardTitle>
          </div>
          <CardDescription>Control which emails you receive from us</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-marketing">Marketing & Promotions</Label>
              <p className="text-neutral-600 text-sm">Receive updates about new features and special offers</p>
            </div>
            <Switch
              id="email-marketing"
              checked={settings.email.marketing}
              onCheckedChange={(checked) => updateEmailSetting("marketing", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-security">Security Alerts</Label>
              <p className="text-neutral-600 text-sm">Important security updates and login notifications</p>
            </div>
            <Switch
              id="email-security"
              checked={settings.email.security}
              onCheckedChange={(checked) => updateEmailSetting("security", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-updates">Product Updates</Label>
              <p className="text-neutral-600 text-sm">Updates about new features and improvements</p>
            </div>
            <Switch
              id="email-updates"
              checked={settings.email.updates}
              onCheckedChange={(checked) => updateEmailSetting("updates", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-billing">Billing & Invoices</Label>
              <p className="text-neutral-600 text-sm">Billing statements and payment confirmations</p>
            </div>
            <Switch
              id="email-billing"
              checked={settings.email.billing}
              onCheckedChange={(checked) => updateEmailSetting("billing", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary-700" />
            <CardTitle>Push Notifications</CardTitle>
          </div>
          <CardDescription>Manage notifications sent to your devices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-enabled">Enable Push Notifications</Label>
              <p className="text-neutral-600 text-sm">Allow notifications to be sent to your devices</p>
            </div>
            <Switch
              id="push-enabled"
              checked={settings.push.enabled}
              onCheckedChange={(checked) => updatePushSetting("enabled", checked)}
            />
          </div>

          {settings.push.enabled && (
            <>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-mentions">Mentions & Replies</Label>
                  <p className="text-neutral-600 text-sm">When someone mentions you or replies to your content</p>
                </div>
                <Switch
                  id="push-mentions"
                  checked={settings.push.mentions}
                  onCheckedChange={(checked) => updatePushSetting("mentions", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-messages">Direct Messages</Label>
                  <p className="text-neutral-600 text-sm">New direct messages and chat notifications</p>
                </div>
                <Switch
                  id="push-messages"
                  checked={settings.push.messages}
                  onCheckedChange={(checked) => updatePushSetting("messages", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-updates">System Updates</Label>
                  <p className="text-neutral-600 text-sm">Important system updates and maintenance notices</p>
                </div>
                <Switch
                  id="push-updates"
                  checked={settings.push.updates}
                  onCheckedChange={(checked) => updatePushSetting("updates", checked)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* In-App Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary-700" />
            <CardTitle>In-App Notifications</CardTitle>
          </div>
          <CardDescription>Configure notifications within the application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="inapp-enabled">Enable In-App Notifications</Label>
              <p className="text-neutral-600 text-sm">Show notifications while using the application</p>
            </div>
            <Switch
              id="inapp-enabled"
              checked={settings.inApp.enabled}
              onCheckedChange={(checked) => updateInAppSetting("enabled", checked)}
            />
          </div>

          {settings.inApp.enabled && (
            <>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="inapp-sound">Sound Notifications</Label>
                  <p className="text-neutral-600 text-sm">Play sound when receiving notifications</p>
                </div>
                <Switch
                  id="inapp-sound"
                  checked={settings.inApp.sound}
                  onCheckedChange={(checked) => updateInAppSetting("sound", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="inapp-desktop">Desktop Notifications</Label>
                  <p className="text-neutral-600 text-sm">Show desktop notifications when app is minimized</p>
                </div>
                <Switch
                  id="inapp-desktop"
                  checked={settings.inApp.desktop}
                  onCheckedChange={(checked) => updateInAppSetting("desktop", checked)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notification Frequency */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="text-primary h-5 w-5" />
            <CardTitle>Notification Frequency</CardTitle>
          </div>
          <CardDescription>Control how often you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="frequency-select">Email Digest Frequency</Label>
            <Select
              value={settings.frequency}
              onValueChange={(value) => setSettings((prev) => ({ ...prev, frequency: value }))}
            >
              <SelectTrigger id="frequency-select">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="hourly">Every Hour</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Digest</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
