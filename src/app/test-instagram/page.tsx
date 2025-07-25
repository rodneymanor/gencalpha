"use client";

import { useState } from "react";

import { Copy, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface InstagramResponse {
  success: boolean;
  data?: {
    shortCode: string;
    caption: string;
    likesCount: number;
    videoViewCount?: number;
    hashtags: string[];
    videoUrl?: string;
    imageUrl?: string;
    thumbnailUrl?: string;
    author: {
      username: string;
      fullName: string;
    };
    timestamp: string;
  };
  error?: string;
  rawData?: any;
}

export default function TestInstagramPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<InstagramResponse | null>(null);

  const testUrls = [
    "https://www.instagram.com/reel/DMUd-PGuLux/", // Recent reel
    "https://www.instagram.com/p/C5NKOqtRW6n/", // Instagram post
    "https://www.instagram.com/reel/C5eGEVIOS8b/", // Another reel
  ];

  const handleSubmit = async (testUrl?: string, method: "sync" | "async" = "sync") => {
    const targetUrl = testUrl || url;
    if (!targetUrl) {
      toast.error("Please enter an Instagram URL");
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      console.log("🚀 Testing Instagram URL:", targetUrl, "with method:", method);

      const res = await fetch("/api/test-instagram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: targetUrl, method }),
      });

      const data = await res.json();
      setResponse(data);

      if (data.success) {
        toast.success(`Instagram data fetched successfully using ${method} method!`);
      } else {
        // If sync method failed with timeout, try async
        if (method === "sync" && data.error?.includes("timeout")) {
          toast.warning("Sync method timed out, trying async method...");
          await handleSubmit(targetUrl, "async");
          return;
        }
        toast.error(data.error || "Failed to fetch Instagram data");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Network error occurred");
      setResponse({
        success: false,
        error: "Network error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Instagram URL Tester</h1>
        <p className="text-muted-foreground">
          Test Instagram URLs with Apify's Instagram Scraper to get download links and metadata.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Instagram URL</CardTitle>
          <CardDescription>Enter an Instagram reel or post URL to extract metadata and download links.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://www.instagram.com/reel/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
            <Button onClick={() => handleSubmit()} disabled={loading || !url}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Test Sync"}
            </Button>
            <Button variant="outline" onClick={() => handleSubmit(undefined, "async")} disabled={loading || !url}>
              Test Async
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Quick Test URLs:</p>
            <div className="flex flex-wrap gap-2">
              {testUrls.map((testUrl, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSubmit(testUrl)}
                  disabled={loading}
                  className="text-xs"
                >
                  Test URL {index + 1}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {response && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Response
              <Badge variant={response.success ? "default" : "destructive"}>
                {response.success ? "Success" : "Error"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {response.success && response.data ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Basic Info</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Short Code:</strong> {response.data.shortCode}
                      </p>
                      <p>
                        <strong>Author:</strong> @{response.data.author.username}
                      </p>
                      <p>
                        <strong>Full Name:</strong> {response.data.author.fullName}
                      </p>
                      <p>
                        <strong>Likes:</strong> {response.data.likesCount.toLocaleString()}
                      </p>
                      {response.data.videoViewCount && (
                        <p>
                          <strong>Views:</strong> {response.data.videoViewCount.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Media URLs</h3>
                    <div className="space-y-2">
                      {response.data.videoUrl && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Video:</span>
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(response.data!.videoUrl!)}>
                            <Copy className="mr-1 h-3 w-3" />
                            Copy URL
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(response.data!.videoUrl, "_blank")}
                          >
                            <ExternalLink className="mr-1 h-3 w-3" />
                            Open
                          </Button>
                        </div>
                      )}
                      {response.data.imageUrl && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Image:</span>
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(response.data!.imageUrl!)}>
                            <Copy className="mr-1 h-3 w-3" />
                            Copy URL
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(response.data!.imageUrl, "_blank")}
                          >
                            <ExternalLink className="mr-1 h-3 w-3" />
                            Open
                          </Button>
                        </div>
                      )}
                      {response.data.thumbnailUrl && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Thumbnail:</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(response.data!.thumbnailUrl!)}
                          >
                            <Copy className="mr-1 h-3 w-3" />
                            Copy URL
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {response.data.caption && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Caption</h3>
                    <p className="bg-muted rounded-md p-3 text-sm">{response.data.caption}</p>
                  </div>
                )}

                {response.data.hashtags.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Hashtags</h3>
                    <div className="flex flex-wrap gap-1">
                      {response.data.hashtags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-semibold">Raw Response Data</h3>
                  <pre className="bg-muted max-h-96 overflow-auto rounded-md p-3 text-xs">
                    {JSON.stringify(response.rawData, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-destructive font-medium">Error:</p>
                <p className="text-sm">{response.error}</p>
                {response.rawData && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Raw Error Data</h3>
                    <pre className="bg-muted max-h-96 overflow-auto rounded-md p-3 text-xs">
                      {JSON.stringify(response.rawData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
