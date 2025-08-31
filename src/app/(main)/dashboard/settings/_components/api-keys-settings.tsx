"use client";

import { useState, useEffect } from "react";

import { Copy, Eye, EyeOff, Trash2, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { auth } from "@/lib/firebase";

interface ApiKeyStatus {
  keyId: string;
  status: "active" | "disabled";
  createdAt: string;
  lastUsed?: string;
  requestCount: number;
  violations: number;
  lockoutUntil?: string;
  revokedAt?: string;
  apiKey?: string; // The actual API key (for new keys going forward)
}

interface ApiKeyResponse {
  success: boolean;
  hasActiveKey: boolean;
  activeKey: ApiKeyStatus | null;
  keyHistory: ApiKeyStatus[];
  limits: {
    requestsPerMinute: number;
    violationLockoutHours: number;
    maxViolationsBeforeLockout: number;
  };
}

export function ApiKeysSettings() {
  const { user } = useAuth();
  const [keyStatus, setKeyStatus] = useState<ApiKeyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [showActiveKey, setShowActiveKey] = useState(false);

  const fetchKeyStatus = async () => {
    console.log("fetchKeyStatus called, user:", !!user);

    if (!user || !auth.currentUser) {
      console.log("No user available, stopping load");
      setLoading(false);
      return;
    }

    try {
      console.log("Getting Firebase ID token...");
      const token = await auth.currentUser.getIdToken();
      console.log("Got token, making API call to /api/keys");

      const response = await fetch("/api/keys", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("API key status data:", data);
        setKeyStatus(data);
      } else {
        const errorData = await response.text();
        console.error("Failed to fetch API key status:", response.status, errorData);
        toast.error("Failed to load API key status");
      }
    } catch (error) {
      console.error("Error fetching API key status:", error);
      toast.error("Error loading API key status");
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = async () => {
    if (!user || !auth.currentUser) return;

    setGenerating(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch("/api/keys", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setNewApiKey(data.apiKey);
        setShowKey(true);
        toast.success("API key generated successfully!");
        fetchKeyStatus(); // Refresh the status
      } else {
        toast.error(data.message || "Failed to generate API key");
      }
    } catch (error) {
      toast.error("Error generating API key");
      console.error("Error generating API key:", error);
    } finally {
      setGenerating(false);
    }
  };

  const revokeApiKey = async () => {
    if (!user || !auth.currentUser) return;

    setRevoking(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch("/api/keys", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("API key revoked successfully");
        setNewApiKey(null);
        setShowKey(false);
        fetchKeyStatus(); // Refresh the status
      } else {
        toast.error(data.message || "Failed to revoke API key");
      }
    } catch (error) {
      toast.error("Error revoking API key");
      console.error("Error revoking API key:", error);
    } finally {
      setRevoking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("API key copied to clipboard");
  };

  useEffect(() => {
    console.log("useEffect triggered, user:", !!user);
    if (user && auth.currentUser) {
      fetchKeyStatus();
    } else if (user && !auth.currentUser) {
      console.log("User exists but currentUser not ready, waiting...");
      // Don't set loading false yet, wait for currentUser
    } else {
      console.log("No user, stopping loading");
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <div className="space-y-4 py-8 text-center">Loading API key status...</div>;
  }

  return (
    <div className="space-y-6">
      {/* New API Key Display */}
      {newApiKey && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="space-y-4">
            <div className="font-medium">Your new API key has been generated!</div>
            <div className="text-sm">
              <strong>Important:</strong> This key will only be shown once. Please copy it now and store it securely.
            </div>
            <div className="flex items-center space-x-2">
              <code className="flex-1 rounded border bg-white p-2 font-mono text-sm">
                {showKey ? newApiKey : "••••••••••••••••••••••••••••••••••••••••"}
              </code>
              <Button variant="outline" size="sm" onClick={() => setShowKey(!showKey)}>
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(newApiKey)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Current API Key Status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Chrome Extension API Key</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("https://chrome.google.com/webstore", "_blank")}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Get Extension
          </Button>
        </div>

        {keyStatus?.hasActiveKey ? (
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                  <span className="text-muted-foreground font-mono text-sm">Key ID: {keyStatus.activeKey?.keyId}</span>
                </div>
                <div className="text-muted-foreground text-sm">
                  Created: {new Date(keyStatus.activeKey?.createdAt || "").toLocaleDateString()}
                </div>
                {keyStatus.activeKey?.lastUsed && (
                  <div className="text-muted-foreground text-sm">
                    Last used: {new Date(keyStatus.activeKey.lastUsed).toLocaleDateString()}
                  </div>
                )}
              </div>
              <Button variant="destructive" size="sm" onClick={revokeApiKey} disabled={revoking}>
                <Trash2 className="mr-2 h-4 w-4" />
                {revoking ? "Revoking..." : "Revoke"}
              </Button>
            </div>

            {/* API Key Display with Click-to-Show */}
            {keyStatus.activeKey?.apiKey && (
              <div className="space-y-2 border-t pt-4">
                <div className="text-sm font-medium">Your API Key</div>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 rounded border bg-neutral-50 p-2 font-mono text-sm">
                    {showActiveKey ? keyStatus.activeKey.apiKey : "••••••••••••••••••••••••••••••••••••••••"}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowActiveKey(!showActiveKey)}
                  >
                    {showActiveKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(keyStatus.activeKey.apiKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">Requests Made</div>
                <div className="text-muted-foreground">{keyStatus.activeKey?.requestCount || 0}</div>
              </div>
              <div>
                <div className="font-medium">Violations</div>
                <div className="text-muted-foreground">{keyStatus.activeKey?.violations || 0}</div>
              </div>
            </div>

            {keyStatus.activeKey?.lockoutUntil && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This API key is locked out until {new Date(keyStatus.activeKey.lockoutUntil).toLocaleString()}
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="rounded-lg border py-8 text-center">
            <div className="space-y-4">
              <div className="text-muted-foreground">No active API key found</div>
              <Button onClick={generateApiKey} disabled={generating}>
                {generating ? "Generating..." : "Generate API Key"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Rate Limits Info */}
      {keyStatus && (
        <div className="space-y-2">
          <h4 className="font-medium">Rate Limits</h4>
          <div className="bg-muted/50 grid grid-cols-1 gap-4 rounded-lg p-4 text-sm md:grid-cols-3">
            <div>
              <div className="font-medium">Rate Limit</div>
              <div className="text-muted-foreground">{keyStatus.limits.requestsPerMinute} requests/minute</div>
            </div>
            <div>
              <div className="font-medium">Violation Lockout</div>
              <div className="text-muted-foreground">{keyStatus.limits.violationLockoutHours} hour(s)</div>
            </div>
            <div>
              <div className="font-medium">Max Violations</div>
              <div className="text-muted-foreground">{keyStatus.limits.maxViolationsBeforeLockout}</div>
            </div>
          </div>
        </div>
      )}

      {/* Setup Instructions */}
      <div className="space-y-4">
        <h4 className="font-medium">Chrome Extension Setup</h4>
        <div className="space-y-3 text-sm">
          <div className="flex space-x-3">
            <div className="bg-primary text-primary-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium">
              1
            </div>
            <div>
              <div className="font-medium">Install the Extension</div>
              <div className="text-muted-foreground">Install the GenC Chrome extension from the Chrome Web Store</div>
            </div>
          </div>
          <div className="flex space-x-3">
            <div className="bg-primary text-primary-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium">
              2
            </div>
            <div>
              <div className="font-medium">Open Extension Options</div>
              <div className="text-muted-foreground">
                Right-click the extension icon and select "Options" or go to chrome://extensions
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <div className="bg-primary text-primary-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium">
              3
            </div>
            <div>
              <div className="font-medium">Configure API Key</div>
              <div className="text-muted-foreground">Paste your API key and set the base URL to your GenC instance</div>
            </div>
          </div>
          <div className="flex space-x-3">
            <div className="bg-primary text-primary-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium">
              4
            </div>
            <div>
              <div className="font-medium">Test the Extension</div>
              <div className="text-muted-foreground">
                Visit YouTube, TikTok, or Instagram and click the extension icon to test functionality
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
