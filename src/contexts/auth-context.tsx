"use client";

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";

import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";

import { APP_VERSION, APP_VERSION_STORAGE_KEY } from "@/config/app-version";
import { getAuthCache, setAuthCache, clearAuthCache, isCacheStale, type AccountLevel } from "@/lib/auth-cache";
import { auth } from "@/lib/firebase";
import { UserManagementService, type UserProfile, type UserRole } from "@/lib/user-management";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  initializing: boolean;
  accountLevel: AccountLevel;
  hasValidCache: boolean;
  isBackgroundVerifying: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string, role?: UserRole, coachId?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  upgradeAccount: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Helper function to create user profile via API
async function createUserProfileViaAPI(
  uid: string,
  email: string,
  displayName: string,
  role: UserRole,
  coachId?: string,
) {
  console.log("🔍 [AUTH] Creating user profile in Firestore using Admin SDK...");

  const response = await fetch("/api/debug-env", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "create-user-profile",
      userData: {
        uid,
        email,
        displayName,
        role,
        coachId,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create user profile via API");
  }

  const profileResult = await response.json();
  console.log("✅ [AUTH] User profile created with result:", profileResult);
  return profileResult;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [accountLevel, setAccountLevel] = useState<AccountLevel>("free");
  const [hasValidCache, setHasValidCache] = useState(false);
  const [isBackgroundVerifying, setIsBackgroundVerifying] = useState(false);

  // Simplified version checking without forced reloads
  useEffect(() => {
    const initializeCache = () => {
      const storedVersion = localStorage.getItem(APP_VERSION_STORAGE_KEY);

      // If version has changed, clear cache but don't force reload
      if (storedVersion && storedVersion !== APP_VERSION) {
        console.log("🔄 [AUTH] App version changed, clearing cache");
        clearAuthCache();
        localStorage.setItem(APP_VERSION_STORAGE_KEY, APP_VERSION);
      }

      // If no version stored yet (first visit), just store it
      if (!storedVersion) {
        localStorage.setItem(APP_VERSION_STORAGE_KEY, APP_VERSION);
      }

      // Load from cache if available
      const cachedAuth = getAuthCache();
      if (cachedAuth && !isCacheStale()) {
        console.log("🔍 [AUTH] Loading from cache:", cachedAuth);
        setUserProfile(cachedAuth.userProfile);
        setAccountLevel(cachedAuth.accountLevel);
        setHasValidCache(true);
        setIsBackgroundVerifying(true);
      }
      
      // Always set initializing to false after cache check
      setInitializing(false);
    };

    initializeCache();
  }, []);

  const updateAuthCache = useCallback(
    (user: User | null, userProfile: UserProfile | null, accountLevel: AccountLevel) => {
      setAuthCache(user, userProfile, accountLevel);
    },
    [],
  );

  const refreshUserProfile = useCallback(async () => {
    if (!user) {
      setUserProfile(null);
      setAccountLevel("free");
      clearAuthCache();
      return;
    }

    try {
      const profile = await UserManagementService.getUserProfile(user.uid);
      setUserProfile(profile);

      const newAccountLevel: AccountLevel =
        profile?.role === "super_admin" || profile?.role === "coach" ? "pro" : "free";
      setAccountLevel(newAccountLevel);

      updateAuthCache(user, profile, newAccountLevel);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserProfile(null);
      setAccountLevel("free");
      updateAuthCache(user, null, "free");
    }
  }, [user, updateAuthCache]);

  useEffect(() => {
    if (!auth) {
      console.warn("⚠️ [AUTH] Firebase auth is not configured - running in fallback mode");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("🔍 [AUTH] Auth state changed:", firebaseUser?.uid ?? "logged out");
      setUser(firebaseUser);

      if (firebaseUser) {
        // Try to fetch profile, but don't block on it
        const cachedAuth = getAuthCache();
        const shouldFetchProfile =
          !hasValidCache || !cachedAuth || cachedAuth.userProfile?.uid !== firebaseUser.uid || isCacheStale();

        if (shouldFetchProfile) {
          try {
            // Do these in parallel, don't await them
            UserManagementService.updateLastLogin(firebaseUser.uid).catch(err => 
              console.warn("⚠️ [AUTH] Failed to update last login:", err)
            );
            
            const profile = await UserManagementService.getUserProfile(firebaseUser.uid);
            setUserProfile(profile);

            const newAccountLevel: AccountLevel =
              profile?.role === "super_admin" || profile?.role === "coach" ? "pro" : "free";
            setAccountLevel(newAccountLevel);

            updateAuthCache(firebaseUser, profile, newAccountLevel);
          } catch (error) {
            console.warn("⚠️ [AUTH] Error fetching user profile, using cached data:", error);
            // Use cached data if available, otherwise set basic profile
            if (cachedAuth?.userProfile) {
              setUserProfile(cachedAuth.userProfile);
              setAccountLevel(cachedAuth.accountLevel);
            } else {
              setUserProfile({
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName: firebaseUser.displayName || "",
                role: "creator",
                createdAt: new Date(),
                updatedAt: new Date()
              });
              setAccountLevel("free");
            }
          }
        } else {
          console.log("🚀 [AUTH] Using cached profile data");
        }

        setHasValidCache(true);
      } else {
        setUserProfile(null);
        setAccountLevel("free");
        setHasValidCache(false);
        clearAuthCache();
      }

      setIsBackgroundVerifying(false);
    });

    return unsubscribe;
  }, [updateAuthCache, hasValidCache, accountLevel]);

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      throw new Error("Firebase is not configured. Please set up Firebase environment variables.");
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message);
      }
      throw new Error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName?: string,
    role: UserRole = "creator",
    coachId?: string,
  ) => {
    if (!auth) {
      throw new Error("Firebase is not configured. Please set up Firebase environment variables.");
    }

    setLoading(true);
    try {
      console.log("🔍 [AUTH] Starting user registration for:", { email, displayName, role });

      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log("✅ [AUTH] Firebase Auth user created:", result.user.uid);

      const finalDisplayName = displayName ?? result.user.email?.split("@")[0] ?? "User";

      if (displayName) {
        console.log("🔍 [AUTH] Updating user profile display name...");
        await updateProfile(result.user, { displayName: finalDisplayName });
        console.log("✅ [AUTH] Display name updated");
      }

      try {
        await createUserProfileViaAPI(result.user.uid, result.user.email!, finalDisplayName, role, coachId);
      } catch (profileError) {
        console.error("❌ [AUTH] Failed to create user profile:", profileError);
        throw new Error("User account created but profile creation failed. Please contact support.");
      }

      console.log("✅ [AUTH] User registration completed successfully");
    } catch (err) {
      console.error("❌ [AUTH] Error during user registration:", err);
      if (err instanceof Error) {
        throw new Error(err.message);
      }
      throw new Error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) {
      throw new Error("Firebase is not configured. Please set up Firebase environment variables.");
    }

    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message);
      }
      throw new Error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!auth) {
      throw new Error("Firebase is not configured. Please set up Firebase environment variables.");
    }

    setLoading(true);
    try {
      await signOut(auth);
      clearAuthCache();
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (!auth) {
      throw new Error("Firebase is not configured. Please set up Firebase environment variables.");
    }

    await sendPasswordResetEmail(auth, email);
  };

  const upgradeAccount = useCallback(async () => {
    const newLevel: AccountLevel = accountLevel === "free" ? "pro" : "free";
    setAccountLevel(newLevel);
    updateAuthCache(user, userProfile, newLevel);
  }, [accountLevel, user, userProfile, updateAuthCache]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      userProfile,
      loading,
      initializing,
      accountLevel,
      hasValidCache,
      isBackgroundVerifying,
      signIn,
      signUp,
      signInWithGoogle,
      logout,
      resetPassword,
      upgradeAccount,
      refreshUserProfile,
    }),
    [
      user,
      userProfile,
      loading,
      initializing,
      accountLevel,
      hasValidCache,
      isBackgroundVerifying,
      upgradeAccount,
      refreshUserProfile,
    ],
  );

  // Remove global loading gate - let individual components handle their own loading states

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export type { AccountLevel };
