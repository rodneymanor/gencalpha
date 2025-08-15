"use client";

import { useState } from "react";

import { Play, Download, Link, AlertCircle, CheckCircle, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ClarityLoader } from "@/components/ui/loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface TestResult {
  success: boolean;
  method: string;
  bunnyVideoId?: string;
  bunnyPlaybackUrl?: string;
  error?: string;
  details?: unknown;
  timing?: {
    downloadTime?: number;
    uploadTime?: number;
    totalTime: number;
  };
}

function TestResultsDisplay({ result }: { result: TestResult }) {
  const renderSuccessContent = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Bunny Video ID</label>
          <Input value={result.bunnyVideoId ?? ""} readOnly className="font-mono text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Playback URL</label>
          <Input value={result.bunnyPlaybackUrl ?? ""} readOnly className="font-mono text-sm" />
        </div>
      </div>

      {result.timing && (
        <div className="grid grid-cols-3 gap-4">
          {result.timing.downloadTime != null && (
            <div className="bg-muted rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{result.timing.downloadTime}ms</div>
              <div className="text-muted-foreground text-sm">Download</div>
            </div>
          )}
          {result.timing.uploadTime != null && (
            <div className="bg-muted rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{result.timing.uploadTime}ms</div>
              <div className="text-muted-foreground text-sm">Upload</div>
            </div>
          )}
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{result.timing.totalTime}ms</div>
            <div className="text-muted-foreground text-sm">Total</div>
          </div>
        </div>
      )}

      {result.bunnyPlaybackUrl && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Test Playback</label>
          <iframe src={result.bunnyPlaybackUrl} className="aspect-video w-full rounded-lg border" allowFullScreen />
        </div>
      )}
    </div>
  );

  const renderErrorContent = () => (
    <div className="space-y-4">
      <div className="border-destructive/20 bg-destructive/10 rounded-lg border p-4">
        <h4 className="text-destructive mb-2 font-medium">Error</h4>
        <p className="text-sm">{result.error}</p>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {result.success ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <span>Test Result</span>
          <Badge variant={result.success ? "default" : "destructive"}>{result.success ? "Success" : "Failed"}</Badge>
        </CardTitle>
        <CardDescription>
          Method: {result.method} • Total Time: {result.timing?.totalTime}ms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {result.success ? renderSuccessContent() : renderErrorContent()}

        {result.details && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Technical Details</label>
            <Textarea value={JSON.stringify(result.details, null, 2)} readOnly className="h-32 font-mono text-xs" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TestInstagramBunnyTransferPage() {
  const [instagramUrl, setInstagramUrl] = useState("");
  const [testMethod, setTestMethod] = useState<"download-upload" | "direct-stream" | "bunny-fetch">("download-upload");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const handleTest = async () => {
    if (!instagramUrl.trim()) {
      alert("Please enter an Instagram video URL");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/test-instagram-bunny-transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instagramVideoUrl: instagramUrl.trim(),
          testMethod,
        }),
      });

      const data: TestResult = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        method: testMethod,
        error: error instanceof Error ? error.message : "Network error",
        timing: { totalTime: 0 },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "download-upload":
        return <Download className="h-4 w-4" />;
      case "direct-stream":
        return <Link className="h-4 w-4" />;
      case "bunny-fetch":
        return <Play className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getMethodDescription = (method: string) => {
    switch (method) {
      case "download-upload":
        return "Downloads video from Instagram CDN first, then uploads to Bunny.net. Most reliable method.";
      case "direct-stream":
        return "Attempts to stream directly from Instagram CDN to Bunny.net. Expected to fail due to hotlinking protection.";
      case "bunny-fetch":
        return "Uses Bunny.net's built-in URL fetch API to download from Instagram. May work with proper headers.";
      default:
        return "Unknown method";
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold">Instagram → Bunny.net Transfer Test</h1>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Test different methods for transferring Instagram CDN videos to Bunny.net. This helps us understand
            Instagram&apos;s hotlinking protection and find the best approach.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>Enter an Instagram video URL and select a transfer method to test</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Instagram Video URL</label>
              <Input
                placeholder="https://scontent-*.cdninstagram.com/..."
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-muted-foreground text-xs">
                Paste a direct Instagram CDN video URL (usually starts with scontent-*.cdninstagram.com)
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Transfer Method</label>
              <Select
                value={testMethod}
                onValueChange={(value: "download-upload" | "direct-stream" | "bunny-fetch") => setTestMethod(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="download-upload">
                    <div className="flex items-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Download → Upload (Recommended)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="direct-stream">
                    <div className="flex items-center space-x-2">
                      <Link className="h-4 w-4" />
                      <span>Direct Stream (Expected to Fail)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bunny-fetch">
                    <div className="flex items-center space-x-2">
                      <Play className="h-4 w-4" />
                      <span>Bunny.net URL Fetch</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">{getMethodDescription(testMethod)}</p>
            </div>

            <Button onClick={handleTest} disabled={isLoading || !instagramUrl.trim()} className="w-full">
              {isLoading ? (
                <>
                  <ClarityLoader size="inline" />
                  <span className="ml-2">Testing {testMethod}...</span>
                </>
              ) : (
                <>
                  {getMethodIcon(testMethod)}
                  <span className="ml-2">Run Test</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {result && <TestResultsDisplay result={result} />}

        <Card>
          <CardHeader>
            <CardTitle>About This Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="mb-2 font-medium">What This Tests</h4>
              <ul className="text-muted-foreground list-inside list-disc space-y-1">
                <li>Instagram&apos;s hotlinking protection and how it affects different transfer methods</li>
                <li>Success rates of various approaches to bypass CDN restrictions</li>
                <li>Performance characteristics (download vs upload times)</li>
                <li>Bunny.net integration and video processing capabilities</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2 font-medium">Expected Results</h4>
              <ul className="text-muted-foreground list-inside list-disc space-y-1">
                <li>
                  <strong>Download → Upload:</strong> Should work reliably with proper User-Agent and Referer headers
                </li>
                <li>
                  <strong>Direct Stream:</strong> Will likely fail with 403 Forbidden due to hotlinking protection
                </li>
                <li>
                  <strong>Bunny.net Fetch:</strong> May work if Bunny.net can send proper headers to Instagram
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
