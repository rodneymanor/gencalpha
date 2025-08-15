"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Eye, EyeOff, Trash2, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface ApiKeyStatus {
  keyId: string;
  status: "active" | "disabled";
  createdAt: string;
  lastUsed?: string;
  requestCount: number;
  violations: number;
  lockoutUntil?: string;
  revokedAt?: string;
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
  const { user, token } = useAuth();
  const [keyStatus, setKeyStatus] = useState<ApiKeyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const fetchKeyStatus = async () => {
    if (!token) return;

    try {
      const response = await fetch("/api/keys", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setKeyStatus(data);
      } else {
        console.error("Failed to fetch API key status");
      }
    } catch (error) {
      console.error("Error fetching API key status:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = async () => {
    if (!token) return;

    setGenerating(true);
    try {
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
    if (!token) return;

    setRevoking(true);
    try {
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
    if (user && token) {
      fetchKeyStatus();
    }
  }, [user, token]);

  if (loading) {
    return <div className="space-y-4 text-center py-8">Loading API key status...</div>;
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
              <code className="flex-1 p-2 bg-white border rounded text-sm font-mono">
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
            <ExternalLink className="h-4 w-4 mr-2" />
            Get Extension
          </Button>
        </div>

        {keyStatus?.hasActiveKey ? (
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                  <span className="text-sm font-mono text-muted-foreground">
                    Key ID: {keyStatus.activeKey?.keyId}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Created: {new Date(keyStatus.activeKey?.createdAt || "").toLocaleDateString()}
                </div>
                {keyStatus.activeKey?.lastUsed && (
                  <div className="text-sm text-muted-foreground">
                    Last used: {new Date(keyStatus.activeKey.lastUsed).toLocaleDateString()}
                  </div>
                )}
              </div>
              <Button variant="destructive" size="sm" onClick={revokeApiKey} disabled={revoking}>
                <Trash2 className="h-4 w-4 mr-2" />
                {revoking ? "Revoking..." : "Revoke"}
              </Button>
            </div>

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
          <div className="text-center py-8 border rounded-lg">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm p-4 bg-muted/50 rounded-lg">
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
            <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
              1
            </div>
            <div>
              <div className="font-medium">Install the Extension</div>
              <div className="text-muted-foreground">Install the GenC Chrome extension from the Chrome Web Store</div>
            </div>
          </div>
          <div className="flex space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
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
            <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
              3
            </div>
            <div>
              <div className="font-medium">Configure API Key</div>
              <div className="text-muted-foreground">
                Paste your API key and set the base URL to your GenC instance
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
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