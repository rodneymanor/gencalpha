"use client";

import React, { useEffect, useState } from "react";
import { ClientOnboardingService } from "@/lib/services/client-onboarding-service";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { OnboardingWizardModal } from "@/components/ui/onboarding-wizard-modal";
import { BrandSettingsSummaryModal } from "@/components/ui/brand-settings-summary-modal";

interface ProcessedVideo {
  videoUrl?: string;
  cdnUrls?: {
    thumbnail?: string;
    iframe?: string;
    direct?: string;
  };
  videoData?: {
    title?: string;
    author?: string;
    platform?: string;
  };
}

export function PersonalizedVideoFeed() {
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [videos, setVideos] = useState<ProcessedVideo[]>([]);

  // Modal visibility
  const [wizardOpen, setWizardOpen] = useState(false);
  const [brandSettingsOpen, setBrandSettingsOpen] = useState(false);

  useEffect(() => {
    const loadFeed = async () => {
      try {
        // 1. Check onboarding completion
        const selections = await ClientOnboardingService.getSelections();
        if (!selections) {
          setOnboardingComplete(false);
          return;
        }
        setOnboardingComplete(true);

        const interestTerm =
          selections.specificInterest ??
          selections.subtopics?.[0] ??
          selections.customTopics?.[0] ??
          selections.mainTopics?.[0] ??
          "";

        if (!interestTerm) {
          console.warn("No interest term found from onboarding selections");
          return;
        }

        // 2. Trigger orchestrator
        const orchestratorRes = await fetch("/api/inspiration/orchestrator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interest: interestTerm }),
        });

        const data = await orchestratorRes.json();
        if (data.success) {
          setVideos(data.processedResults ?? []);
        }
      } catch (error) {
        console.error("[PersonalizedVideoFeed]", error);
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, []);

  // --- RENDER STATES ----------------------------------------------------
  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[9/16] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!onboardingComplete) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
        <p className="max-w-md text-muted-foreground">
          Finish setting up your brand preferences to receive personalized inspiration videos.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button onClick={() => setWizardOpen(true)}>Complete Onboarding</Button>
          <Button variant="secondary" onClick={() => setBrandSettingsOpen(true)}>
            View Brand Settings
          </Button>
        </div>

        {/* Modals */}
        <OnboardingWizardModal open={wizardOpen} onOpenChange={setWizardOpen} />
        <BrandSettingsSummaryModal isOpen={brandSettingsOpen} onClose={() => setBrandSettingsOpen(false)} />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center text-muted-foreground">
        <p>No personalized videos found. Try adjusting your interests.</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button onClick={() => setBrandSettingsOpen(true)}>Check Brand Settings</Button>
          <Button variant="secondary" onClick={() => setWizardOpen(true)}>
            Edit Preferences
          </Button>
        </div>

        {/* Modals */}
        <OnboardingWizardModal open={wizardOpen} onOpenChange={setWizardOpen} mode="edit" />
        <BrandSettingsSummaryModal isOpen={brandSettingsOpen} onClose={() => setBrandSettingsOpen(false)} onEdit={() => setWizardOpen(true)} />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        {videos.map((item, idx) => (
          <div
            key={idx}
            className="group relative aspect-[9/16] cursor-pointer overflow-hidden rounded-lg bg-muted"
          >
            {item.cdnUrls?.thumbnail ? (
              <img
                src={item.cdnUrls.thumbnail}
                alt={item.videoData?.title ?? "video"}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted-foreground/10">
                <Play className="h-8 w-8 text-primary" />
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/50">
              <Button size="icon" className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30">
                <Play className="h-6 w-6 fill-white text-white" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Hidden modals for in-grid edits */}
      <OnboardingWizardModal open={wizardOpen} onOpenChange={setWizardOpen} mode="edit" />
      <BrandSettingsSummaryModal isOpen={brandSettingsOpen} onClose={() => setBrandSettingsOpen(false)} onEdit={() => setWizardOpen(true)} />
    </>
  );
}
