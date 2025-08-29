"use client";

import { useState } from "react";
import { Loader2, User, Copy, CheckCircle } from "lucide-react";

export default function ShowMyUidPage() {
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchUserInfo = async () => {
    setLoading(true);
    setError(null);
    setUserInfo(null);

    try {
      // First, let's try to get user info from a test endpoint
      const response = await fetch("/api/personas/list", {
        method: "GET",
        headers: {
          "x-api-key": "test-internal-secret-123",
        },
      });

      // The auth system will return the user info in the authentication process
      // We can extract it from the response headers or create a dedicated endpoint
      if (response.ok) {
        // For now, we'll show the test user info
        setUserInfo({
          uid: "test-user",
          email: "test@example.com",
          displayName: "Test User",
          note: "In development mode with test authentication"
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch user info");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-6 shadow-[var(--shadow-soft-drop)]">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Your User Information</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Find your Firebase Auth UID to use for persona migration
          </p>
        </div>

        <div className="space-y-4">
          {/* Fetch Button */}
          <button
            onClick={fetchUserInfo}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary-600 px-4 py-2 text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <User className="h-4 w-4" />
                Get My User Info
              </>
            )}
          </button>

          {/* User Info Display */}
          {userInfo && (
            <div className="rounded-[var(--radius-button)] border border-success-200 bg-success-50 p-4">
              <h3 className="font-medium text-success-900 mb-3">Your User Information:</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700">UID:</span>
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-neutral-100 px-2 py-1 text-sm font-mono text-neutral-900">
                      {userInfo.uid}
                    </code>
                    <button
                      onClick={() => copyToClipboard(userInfo.uid)}
                      className="text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      {copied ? (
                        <CheckCircle className="h-4 w-4 text-success-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                {userInfo.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Email:</span>
                    <span className="text-sm text-neutral-900">{userInfo.email}</span>
                  </div>
                )}
                {userInfo.displayName && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Display Name:</span>
                    <span className="text-sm text-neutral-900">{userInfo.displayName}</span>
                  </div>
                )}
                {userInfo.note && (
                  <div className="mt-2 pt-2 border-t border-success-200">
                    <p className="text-xs text-success-700">{userInfo.note}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="rounded-[var(--radius-button)] border border-destructive-200 bg-destructive-50 p-4">
              <p className="text-sm text-destructive-700">{error}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="rounded-[var(--radius-button)] border border-neutral-200 bg-white p-4">
            <h4 className="font-medium text-neutral-900 mb-2">How to find your UID:</h4>
            <ol className="space-y-2 text-sm text-neutral-600">
              <li>
                <strong>1. Firebase Console:</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• Go to Firebase Console → Authentication → Users</li>
                  <li>• Find your user by email</li>
                  <li>• Copy the UID column value</li>
                </ul>
              </li>
              <li>
                <strong>2. In Development:</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• If using test auth, your UID is: <code className="bg-neutral-100 px-1">test-user</code></li>
                  <li>• Check console logs when logging in</li>
                </ul>
              </li>
              <li>
                <strong>3. From Browser DevTools:</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• Open DevTools → Application → IndexedDB</li>
                  <li>• Look for Firebase auth data</li>
                </ul>
              </li>
            </ol>
            
            <div className="mt-4 p-3 bg-brand-50 border border-brand-200 rounded-[var(--radius-button)]">
              <p className="text-sm text-brand-800">
                <strong>💡 Tip:</strong> The UID is what connects your personas to your account. 
                It's stored as <code className="bg-brand-100 px-1">userId</code> in each persona document.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}