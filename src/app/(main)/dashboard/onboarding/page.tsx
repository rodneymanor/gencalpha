import { Metadata } from "next";

import { OnboardingQuestionnaire } from "./_components/onboarding-questionnaire";

export const metadata: Metadata = {
  title: "Onboarding | Studio Admin",
  description: "Configure your personal AI and define your content topics",
};

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <OnboardingQuestionnaire />
      </div>
    </div>
  );
}
