"use client";

export function FirebaseError() {
  // Only show in production if Firebase is not configured
  const hasFirebase =
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "demo-api-key");

  if (!hasFirebase) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/50">
      <div className="mx-4 max-w-md rounded-[var(--radius-card)] bg-neutral-50 p-6 shadow-[var(--shadow-soft-drop)]">
        <h2 className="mb-2 text-xl font-semibold text-neutral-900">Configuration Error</h2>
        <p className="mb-4 text-neutral-600">
          Firebase is not properly configured. The application cannot function without authentication services.
        </p>
        <div className="bg-destructive-50 text-destructive-700 rounded-[var(--radius-card)] p-3 text-sm">
          <p className="font-medium">For administrators:</p>
          <p>
            Please check the Vercel environment variables and ensure all Firebase configuration values are set
            correctly.
          </p>
        </div>
        <div className="mt-4 text-xs text-neutral-500">Check the browser console for detailed error messages.</div>
      </div>
    </div>
  );
}
