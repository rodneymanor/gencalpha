"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingWizardModal } from "@/components/ui/onboarding-wizard-modal";
import { useAuth } from "@/contexts/auth-context";
import {
  OnboardingSelections,
  getOnboardingSelections,
  saveOnboardingSelections,
} from "@/lib/onboarding-service";
import { useEffect, useState } from "react";

import { X } from "lucide-react";

export default function BrandPage() {
  const { user } = useAuth();
  const [selections, setSelections] = useState<OnboardingSelections | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [newCustom, setNewCustom] = useState("");

  // Fetch saved selections
  useEffect(() => {
    if (!user) return;
    (async () => {
      const data = await getOnboardingSelections(user.uid);
      setSelections(data);
    })();
  }, [user]);



  const updateList = (
    key: keyof OnboardingSelections,
    updater: (arr: string[]) => string[],
  ) =>
    selections && setSelections({ ...selections, [key]: updater(selections[key]) });

  const removeItem = (key: keyof OnboardingSelections, value: string) =>
    updateList(key, arr => arr.filter(v => v !== value));

  const addCustomItem = () => {
    if (!newCustom.trim()) return;
    updateList("customTopics", arr => [...arr, newCustom.trim()]);
    setNewCustom("");
  };

  const handleSave = async () => {
    if (!user || !selections) return;
    setIsSaving(true);
    await saveOnboardingSelections(user.uid, selections);
    setIsSaving(false);
  };

  if (!selections)
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="mt-4 h-4 w-full" />
      </div>
    );

  const isEmpty =
    selections.mainTopics.length === 0 && selections.customTopics.length === 0;

  if (isEmpty) {
    return <OnboardingWizardModal />;
  }

  const TagList = ({
    label,
    keyName,
  }: {
    label: string;
    keyName: keyof OnboardingSelections;
  }) => (
    <div className="space-y-2">
      <h3 className="text-lg font-medium text-foreground">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {selections[keyName].map(item => (
          <span
            key={`${keyName}-${item}`}
            className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-sm"
          >
            {item}
            <button
              onClick={() => removeItem(keyName, item)}
              className="rounded-full p-0.5 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {selections[keyName].length === 0 && (
          <span className="text-sm text-muted-foreground">None</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto max-w-3xl space-y-8 p-4 py-10">
      <h1 className="text-3xl font-bold text-foreground">Your Brand Profile</h1>

      <TagList label="Main Topics" keyName="mainTopics" />
      <TagList label="Custom Topics" keyName="customTopics" />

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Add a custom topic..."
          value={newCustom}
          onChange={e => setNewCustom(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addCustomItem()}
          className="w-full rounded-md border px-3 py-2"
        />
        <Button
          variant="outline"
          onClick={addCustomItem}
          disabled={!newCustom.trim()}
        >
          Add Topic
        </Button>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
