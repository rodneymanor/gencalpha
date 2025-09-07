"use client";

import { useState } from "react";

import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OnboardingWizardModal } from "@/components/ui/onboarding-wizard-modal";

export function BrandPreferencesSettings() {
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Brand Preferences</h3>
        <p className="text-muted-foreground text-sm">
          Update your content topics, platforms, and preferences to get better recommendations.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h4 className="font-medium">Content Preferences</h4>
              <p className="text-muted-foreground text-sm">
                Your content topics, platforms, and interests help personalize your experience.
              </p>
            </div>
            <Button variant="outline" onClick={() => setShowOnboardingModal(true)} className="shrink-0">
              <Settings className="mr-2 h-4 w-4" />
              Edit Preferences
            </Button>
          </div>
        </div>
      </div>

      <OnboardingWizardModal open={showOnboardingModal} onOpenChange={setShowOnboardingModal} mode="edit" />
    </div>
  );
}
