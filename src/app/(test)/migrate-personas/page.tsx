"use client";

import { useState } from "react";
import { Loader2, Database, CheckCircle, AlertCircle } from "lucide-react";

export default function MigratePersonasPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"orphaned" | "all" | "byUsername">("orphaned");
  const [username, setUsername] = useState("");

  const handleMigrate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // First try direct migration endpoint
      const directResponse = await fetch("/api/personas/direct-migrate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUid: "test-user", // Test auth UID for development
          mode: mode === "orphaned" ? "orphaned" : "all"
        }),
      });

      if (directResponse.ok) {
        const data = await directResponse.json();
        setResult(data);
        return;
      }

      // Fallback to regular migrate endpoint
      const requestBody: any = { mode };
      if (mode === "byUsername" && username) {
        requestBody.username = username;
      }

      const response = await fetch("/api/personas/migrate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "test-internal-secret-123",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data);
      } else {
        setError(data.error || "Migration failed");
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
          <h1 className="text-2xl font-bold text-neutral-900">Migrate Personas</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Update existing personas in the database to associate them with your user account
          </p>
        </div>

        <div className="space-y-4">
          {/* Migration Mode Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Migration Mode
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="w-full rounded-[var(--radius-button)] border border-neutral-200 bg-white px-3 py-2"
              disabled={loading}
            >
              <option value="orphaned">Orphaned Only (personas without userId)</option>
              <option value="all">All Personas (⚠️ use with caution)</option>
              <option value="byUsername">By Username</option>
            </select>
          </div>

          {/* Username Input (only for byUsername mode) */}
          {mode === "byUsername" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                TikTok Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username to migrate"
                className="w-full rounded-[var(--radius-button)] border border-neutral-200 bg-white px-3 py-2"
                disabled={loading}
              />
            </div>
          )}

          {/* Warning for "all" mode */}
          {mode === "all" && (
            <div className="rounded-[var(--radius-button)] border border-warning-200 bg-warning-50 p-3">
              <p className="text-sm text-warning-800">
                <strong>⚠️ Warning:</strong> This will claim ALL personas in the database for your account.
                Only use this if you're sure no other users have personas.
              </p>
            </div>
          )}

          {/* Migrate Button */}
          <button
            onClick={handleMigrate}
            disabled={loading || (mode === "byUsername" && !username)}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary-600 px-4 py-2 text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Migrating...
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                Migrate Personas
              </>
            )}
          </button>
        </div>

        {/* Results Display */}
        {result && (
          <div className="mt-6 rounded-[var(--radius-button)] border border-success-200 bg-success-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-success-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-success-900">Migration Successful!</h3>
                <div className="mt-2 space-y-1 text-sm text-success-700">
                  <p>• Updated {result.updatedCount} personas</p>
                  <p>• Total personas for your account: {result.totalPersonasForUser}</p>
                </div>
                {result.updatedPersonas && result.updatedPersonas.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-success-800">Updated personas:</p>
                    <ul className="mt-1 space-y-1">
                      {result.updatedPersonas.map((persona: any) => (
                        <li key={persona.id} className="text-sm text-success-700">
                          • {persona.name} ({persona.platform}, @{persona.username})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-6 rounded-[var(--radius-button)] border border-destructive-200 bg-destructive-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-destructive-900">Migration Failed</h3>
                <p className="mt-1 text-sm text-destructive-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 rounded-[var(--radius-button)] border border-neutral-200 bg-white p-4">
          <h4 className="font-medium text-neutral-900 mb-2">How this works:</h4>
          <ul className="space-y-1 text-sm text-neutral-600">
            <li>• <strong>Orphaned Only:</strong> Claims personas that don't have an owner (safest option)</li>
            <li>• <strong>All Personas:</strong> Claims all personas in the database for your account</li>
            <li>• <strong>By Username:</strong> Claims personas matching a specific TikTok username</li>
          </ul>
          <p className="mt-3 text-sm text-neutral-500">
            After migration, go to <a href="/personas" className="text-primary-600 hover:underline">Your Personas</a> to see them.
          </p>
        </div>
      </div>
    </div>
  );
}