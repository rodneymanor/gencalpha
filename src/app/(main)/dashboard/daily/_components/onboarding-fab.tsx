"use client";

import { useState } from "react";

import { Sparkles } from "lucide-react";

import { OnboardingWizardModal } from "@/components/ui/onboarding-wizard-modal";

/**
 * Floating action button that opens the onboarding wizard modal.
 * Appears as a pulsing circle on the right-hand side of the viewport.
 */
export function OnboardingFAB() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open onboarding setup"
        className="bg-primary text-primary-foreground focus:ring-primary/50 fixed right-6 bottom-20 z-50 flex h-12 w-12 animate-pulse items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 focus:ring-4 focus:outline-none md:right-8 md:bottom-24"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {/* Modal */}
      {open && <OnboardingWizardModal />}
    </>
  );
}
