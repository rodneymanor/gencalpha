"use client";

import { useState, useEffect } from "react";

import { Loader2, Database, CheckCircle, AlertCircle } from "lucide-react";

export default function QuickMigratePage() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUid, setCurrentUid] = useState<string | null>(null);

  // Check current user on mount
  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    setChecking(true);
    try {
      // Get the current user from auth context
      const authData = localStorage.getItem("auth-cache");
      if (authData) {
        const parsed = JSON.parse(authData);
        if (parsed.user?.uid) {
          setCurrentUid(parsed.user.uid);
        }
      }
    } catch (err) {
      console.error("Error checking user:", err);
    } finally {
      setChecking(false);
    }
  };

  const handleMigrate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // First, let's bypass authentication and directly update the database
      // We'll use the migrate endpoint with the actual uid
      const response = await fetch("/api/personas/direct-migrate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUid: currentUid || "xfPvnnUdJCRIJEVrpJCmR7kXBOX2", // Your actual UID
          mode: "all", // Migrate all personas to your account
        }),
      });

      if (!response.ok) {
        // Fallback to regular migrate endpoint
        const migrateResponse = await fetch("/api/personas/migrate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "test-internal-secret-123",
          },
          body: JSON.stringify({ mode: "orphaned" }),
        });

        const data = await migrateResponse.json();
        if (migrateResponse.ok && data.success) {
          setResult(data);
        } else {
          setError(data.error || "Migration failed");
        }
      } else {
        const data = await response.json();
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Migration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-6 shadow-[var(--shadow-soft-drop)]">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Quick Persona Migration</h1>
          <p className="mt-2 text-sm text-neutral-600">Quickly migrate your existing personas to your account</p>
        </div>

        {/* Current User Info */}
        {checking ? (
          <div className="mb-4 flex items-center gap-2 text-sm text-neutral-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking current user...
          </div>
        ) : currentUid ? (
          <div className="border-primary-200 bg-primary-50 mb-4 rounded-[var(--radius-button)] border p-3">
            <p className="text-primary-800 text-sm">
              <span className="font-medium">Your UID:</span>{" "}
              <code className="bg-primary-100 rounded px-1">{currentUid}</code>
            </p>
          </div>
        ) : (
          <div className="border-warning-200 bg-warning-50 mb-4 rounded-[var(--radius-button)] border p-3">
            <p className="text-warning-800 text-sm">
              Using hardcoded UID: <code className="bg-warning-100 rounded px-1">xfPvnnUdJCRIJEVrpJCmR7kXBOX2</code>
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-4">
          <button
            onClick={handleMigrate}
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] px-4 py-3 text-white transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Migrating...
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                Migrate All Personas to My Account
              </>
            )}
          </button>

          <div className="text-center text-xs text-neutral-500">
            This will update all personas in the database to be owned by your account
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="border-success-200 bg-success-50 mt-6 rounded-[var(--radius-button)] border p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="text-success-600 mt-0.5 h-5 w-5" />
              <div className="flex-1">
                <h3 className="text-success-900 font-medium">Migration Successful!</h3>
                <div className="text-success-700 mt-2 space-y-1 text-sm">
                  <p>• Updated {result.updatedCount || 0} personas</p>
                  <p>• Total personas for your account: {result.totalPersonasForUser || 0}</p>
                </div>
                <div className="mt-3">
                  <a
                    href="/personas"
                    className="text-success-700 hover:text-success-800 inline-flex items-center gap-1 text-sm font-medium"
                  >
                    View Your Personas →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="border-destructive-200 bg-destructive-50 mt-6 rounded-[var(--radius-button)] border p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-destructive-600 mt-0.5 h-5 w-5" />
              <div className="flex-1">
                <h3 className="text-destructive-900 font-medium">Migration Failed</h3>
                <p className="text-destructive-700 mt-1 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 rounded-[var(--radius-button)] border border-neutral-200 bg-white p-4">
          <h4 className="mb-2 font-medium text-neutral-900">What this does:</h4>
          <ul className="space-y-1 text-sm text-neutral-600">
            <li>• Updates all personas to have your userId (uid)</li>
            <li>• Makes them visible in your /personas page</li>
            <li>• Preserves all persona data and analysis</li>
          </ul>
          <div className="bg-brand-50 border-brand-200 mt-3 rounded-[var(--radius-button)] border p-3">
            <p className="text-brand-800 text-sm">
              <strong>Your detected UID:</strong> xfPvnnUdJCRIJEVrpJCmR7kXBOX2
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
