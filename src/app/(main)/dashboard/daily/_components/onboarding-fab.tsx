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
        className="fixed right-6 bottom-20 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary/50 md:right-8 md:bottom-24 animate-pulse"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {/* Modal */}
      {open && <OnboardingWizardModal />}
    </>
  );
}
