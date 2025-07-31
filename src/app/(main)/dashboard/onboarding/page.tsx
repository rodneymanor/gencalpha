import { Metadata } from "next";

import { OnboardingWizard } from "./_components/onboarding-wizard";

export const metadata: Metadata = {
  title: "Onboarding | Studio Admin",
  description: "Configure your personal AI and define your content topics",
};

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <OnboardingWizard />
      </div>
    </div>
  );
}
