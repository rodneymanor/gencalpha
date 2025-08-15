import { doc, getDoc, setDoc } from "firebase/firestore";

import type { OnboardingSelections } from "@/components/ui/onboarding-wizard-modal";
import { auth, db } from "@/lib/firebase";

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
    console.log("🔧 [ClientOnboardingService] Starting saveSelections...");
    console.log("🔧 [ClientOnboardingService] Auth object:", !!auth);
    console.log("🔧 [ClientOnboardingService] DB object:", !!db);
    console.log("🔧 [ClientOnboardingService] Current user:", !!auth?.currentUser);

    if (!auth?.currentUser) {
      console.error("❌ [ClientOnboardingService] User not authenticated");
      throw new Error("User not authenticated");
    }

    if (!db) {
      console.error("❌ [ClientOnboardingService] Firestore not initialised");
      console.error(
        "❌ [ClientOnboardingService] This likely means Firebase environment variables are not set correctly",
      );
      throw new Error("Firestore not initialised");
    }

    const { uid } = auth.currentUser;
    console.log("🔧 [ClientOnboardingService] User UID:", uid);
    console.log("🔧 [ClientOnboardingService] Saving selections:", selections);

    try {
      await setDoc(this.userDoc(uid), { onboardingSelections: selections }, { merge: true });
      console.log("✅ [ClientOnboardingService] Successfully saved to Firestore");
    } catch (firestoreError) {
      console.error("❌ [ClientOnboardingService] Firestore error:", firestoreError);
      throw firestoreError;
    }
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

  /**
   * Alias for getSelections for backward compatibility
   */
  static async getOnboardingData(): Promise<OnboardingSelections | null> {
    return this.getSelections();
  }
}
