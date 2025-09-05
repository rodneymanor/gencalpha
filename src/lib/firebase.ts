// For more information on how to access Firebase in a Next.js app, see:
// https://firebase.google.com/docs/web/setup#access-firebase

import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:123456789:web:abcdef123456",
};

// Only initialize Firebase if we have a valid API key (not the demo one)
const hasValidConfig =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "demo-api-key";

console.log("🔥 [Firebase] Configuration status:");
console.log("🔥 [Firebase] Has valid config:", hasValidConfig);
console.log("🔥 [Firebase] API Key exists:", !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log("🔥 [Firebase] API Key is demo:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "demo-api-key");
console.log("🔥 [Firebase] Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log("🔥 [Firebase] Auth Domain:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
console.log("🔥 [Firebase] Running in:", typeof window !== "undefined" ? "browser" : "server");

// Log missing environment variables for debugging
if (!hasValidConfig) {
  console.error("❌ [Firebase] Missing or invalid Firebase configuration!");
  console.error("❌ [Firebase] Please check these environment variables in Vercel:");
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "demo-api-key") {
    console.error("  - NEXT_PUBLIC_FIREBASE_API_KEY (currently using demo value)");
  }
  if (!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) console.error("  - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) console.error("  - NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) console.error("  - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
  if (!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID)
    console.error("  - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
  if (!process.env.NEXT_PUBLIC_FIREBASE_APP_ID) console.error("  - NEXT_PUBLIC_FIREBASE_APP_ID");
}

const app = hasValidConfig ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]) : null;
const auth = hasValidConfig && app ? getAuth(app) : null;
const db = hasValidConfig && app ? getFirestore(app) : null;

// Connect to local emulators in development for faster local feedback loops
let emulatorsConnected = false;
try {
  if (
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true" &&
    auth &&
    db &&
    !emulatorsConnected
  ) {
    connectAuthEmulator(auth, "http://localhost:9099");
    connectFirestoreEmulator(db, "localhost", 8080);
    emulatorsConnected = true;
    console.log("🔥 [Firebase] Emulators connected (auth:9099, firestore:8080)");
  }
} catch (emulatorError) {
  console.warn("⚠️ [Firebase] Emulator connection failed:", emulatorError);
}

// Enable offline persistence for faster subsequent loads and optimistic UX
let persistenceEnabled = false;
try {
  if (typeof window !== "undefined" && db && !persistenceEnabled) {
    enableIndexedDbPersistence(db).catch((err: unknown) => {
      const e = err as { code?: string };
      if (e?.code === "failed-precondition") {
        console.warn("⚠️ [Firebase] Persistence not enabled: multiple tabs open.");
      } else if (e?.code === "unimplemented") {
        console.warn("⚠️ [Firebase] Persistence not supported in this browser.");
      } else {
        console.warn("⚠️ [Firebase] Persistence enable failed:", err);
      }
    });
    persistenceEnabled = true;
  }
} catch (persistenceError) {
  console.warn("⚠️ [Firebase] Error enabling persistence:", persistenceError);
}

// Optional: lazy loader to import Firebase modules on-demand (for code-splitting in new code paths)
export async function loadFirebase() {
  const [{ initializeApp, getApps }, { getAuth }, { getFirestore, enableIndexedDbPersistence }] = await Promise.all([
    import("firebase/app"),
    import("firebase/auth"),
    import("firebase/firestore"),
  ]);

  const appInstance = hasValidConfig ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]) : null;
  const authInstance = appInstance ? getAuth(appInstance) : null;
  const dbInstance = appInstance ? getFirestore(appInstance) : null;

  if (typeof window !== "undefined" && dbInstance) {
    try {
      await enableIndexedDbPersistence(dbInstance);
    } catch (err) {
      console.warn("⚠️ [Firebase] Lazy persistence enable failed:", err);
    }
  }

  return { app: appInstance, auth: authInstance, db: dbInstance } as const;
}

console.log("🔥 [Firebase] App initialized:", !!app);
console.log("🔥 [Firebase] Auth initialized:", !!auth);
console.log("🔥 [Firebase] Firestore initialized:", !!db);

export { auth, db };
