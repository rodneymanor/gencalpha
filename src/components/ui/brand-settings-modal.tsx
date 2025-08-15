"use client";

import { useEffect, useState } from "react";

import { CheckCircle2, PencilLine, Save, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { OnboardingSelections } from "@/components/ui/onboarding-wizard-modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { ClientOnboardingService } from "@/lib/services/client-onboarding-service";
import { cn } from "@/lib/utils";

interface BrandSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Duplicate minimal constants – ideally import from a shared file
const CONTENT_TYPES = [
  { id: "educational", name: "Educational/Tutorial", icon: "🎓" },
  { id: "entertainment", name: "Entertainment/Comedy", icon: "😂" },
  { id: "lifestyle", name: "Lifestyle/Personal", icon: "✨" },
  { id: "reviews", name: "Product Reviews", icon: "⭐" },
  { id: "bts", name: "Behind-the-Scenes", icon: "🎬" },
  { id: "trends", name: "Challenges/Trends", icon: "🔥" },
];

export function BrandSettingsModal({ open, onOpenChange }: BrandSettingsModalProps) {
  const [selections, setSelections] = useState<OnboardingSelections | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Fetch saved selections
    ClientOnboardingService.getSelections()
      .then(setSelections)
      .catch((err) => console.error("Failed to load selections", err));
  }, [open]);

  const toggleContentType = (id: string) => {
    if (!selections) return;
    const current = selections.contentTypes;
    const updated = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id];
    setSelections({ ...selections, contentTypes: updated });
  };

  const save = async () => {
    if (!selections) return;
    setPending(true);
    try {
      await ClientOnboardingService.saveSelections(selections);
      setEditMode(false);
    } catch (e) {
      console.error(e);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-0 overflow-hidden">
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>Brand Preferences</DialogTitle>
          </VisuallyHidden>
        </DialogHeader>

        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b">
          <h2 className="text-xl font-semibold">Brand Preferences</h2>
          {editMode ? (
            <div className="flex gap-2">
              <Button size="sm" onClick={save} disabled={pending}>
                <Save className="mr-1 size-4" /> Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditMode(false)}
                disabled={pending}
              >
                <X className="mr-1 size-4" /> Cancel
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => setEditMode(true)}>
              <PencilLine className="mr-1 size-4" /> Edit
            </Button>
          )}
        </div>

        {!selections ? (
          <div className="p-6">Loading...</div>
        ) : (
          <ScrollArea className="h-[70vh] px-6 pb-6">
            {/* Content Types Section */}
            <section className="space-y-4">
              <h3 className="font-medium">Content Types</h3>
              {editMode ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {CONTENT_TYPES.map((type) => {
                    const selected = selections.contentTypes.includes(type.id);
                    return (
                      <Card
                        key={type.id}
                        className={cn(
                          "p-4 cursor-pointer text-center space-y-2 border-2 transition-all",
                          selected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                        onClick={() => toggleContentType(type.id)}
                      >
                        <span className="text-3xl">{type.icon}</span>
                        <p className="text-sm font-medium">{type.name}</p>
                        {selected && <CheckCircle2 className="mx-auto size-4 text-primary" />}
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selections.contentTypes.map((id) => {
                    const type = CONTENT_TYPES.find((t) => t.id === id);
                    if (!type) return null;
                    return (
                      <Badge key={id} variant="default">
                        {type.icon} {type.name}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </section>
            {/* TODO: sections for topics, subtopics, platforms, etc. */}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
