import { doc, getDoc, setDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";

export interface OnboardingSelections {
  contentTypes: string[];
  mainTopics: string[];
  subtopics: string[];
  customTopics: string[];
  platforms: string[];
  specificInterest?: string;
}

const DEFAULT_SELECTIONS: OnboardingSelections = {
  contentTypes: [],
  mainTopics: [],
  subtopics: [],
  customTopics: [],
  platforms: [],
  specificInterest: undefined,
};

/**
 * Return the onboarding selections for a user or sensible defaults when missing.
 */
export async function getOnboardingSelections(uid: string): Promise<OnboardingSelections> {
  if (!db) return DEFAULT_SELECTIONS;
  try {
    const ref = doc(db, "onboarding", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as OnboardingSelections;
    }
  } catch (err) {
    console.error("[ONBOARDING] Failed fetching selections", err);
  }
  return DEFAULT_SELECTIONS;
}

/**
 * Persist onboarding selections for a user (merging with any existing data).
 */
export async function saveOnboardingSelections(uid: string, selections: OnboardingSelections) {
  if (!db) return;
  try {
    const ref = doc(db, "onboarding", uid);
    await setDoc(ref, selections, { merge: true });
  } catch (err) {
    console.error("[ONBOARDING] Failed saving selections", err);
  }
}
