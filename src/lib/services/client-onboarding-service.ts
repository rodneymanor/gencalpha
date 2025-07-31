import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { OnboardingSelections } from "@/components/ui/onboarding-wizard-modal";

/**
 * Client-side helper for persisting and retrieving a user's onboarding selections
 * in Firestore under `users/{uid}.onboardingSelections`.
 */
export class ClientOnboardingService {
  /** Path helper */
  private static userDoc(uid: string) {
    return doc(db!, "users", uid);
  }

  /**
   * Persist onboarding selections for the currently authenticated user.
   */
  static async saveSelections(selections: OnboardingSelections): Promise<void> {
    if (!auth?.currentUser) throw new Error("User not authenticated");
    if (!db) throw new Error("Firestore not initialised");

    const { uid } = auth.currentUser;
    await setDoc(
      this.userDoc(uid),
      { onboardingSelections: selections },
      { merge: true }
    );
  }

  /**
   * Fetch onboarding selections for the currently authenticated user.
   * Returns `null` if none exist.
   */
  static async getSelections(): Promise<OnboardingSelections | null> {
    if (!auth?.currentUser) throw new Error("User not authenticated");
    if (!db) throw new Error("Firestore not initialised");

    const { uid } = auth.currentUser;
    const snap = await getDoc(this.userDoc(uid));
    if (!snap.exists()) return null;
    return (snap.data().onboardingSelections ?? null) as OnboardingSelections | null;
  }
}
