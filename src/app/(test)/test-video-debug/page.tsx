"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface VideoTestResult {
  step: string;
  status: "pending" | "loading" | "success" | "error";
  data?: any;
  error?: string;
  timestamp?: string;
}

export default function VideoDebugPage() {
  const [testUrl, setTestUrl] = useState("https://www.tiktok.com/@aronsogi/video/7496968629385186582");
  const [results, setResults] = useState<VideoTestResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addResult = (step: string, status: VideoTestResult["status"], data?: any, error?: string) => {
    setResults((prev) => [
      ...prev.filter((r) => r.step !== step),
      {
        step,
        status,
        data,
        error,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const testVideoScraping = async () => {
    setIsProcessing(true);
    setResults([]);

    try {
      // Step 1: Test Video Scraping (using TikTok scraper)
      addResult("1. Video Scraping", "loading");

      let scrapingData;
      if (testUrl.includes("tiktok.com")) {
        const scrapingResponse = await fetch("/api/apify/tiktok/scraper", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: testUrl }),
        });

        if (!scrapingResponse.ok) {
          throw new Error(`TikTok scraping failed: ${scrapingResponse.status}`);
        }

        scrapingData = await scrapingResponse.json();
      } else if (testUrl.includes("instagram.com")) {
        const scrapingResponse = await fetch("/api/apify/instagram/reel-downloader", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: testUrl }),
        });

        if (!scrapingResponse.ok) {
          throw new Error(`Instagram scraping failed: ${scrapingResponse.status}`);
        }

        scrapingData = await scrapingResponse.json();
      } else {
        throw new Error("Unsupported platform - use TikTok or Instagram URL");
      }

      addResult("1. Video Scraping", "success", scrapingData);

      // Step 2: Test Direct URL Analysis
      if (scrapingData.videoUrl) {
        addResult("2. Video URL Analysis", "loading");

        try {
          const urlTestResponse = await fetch(scrapingData.videoUrl, {
            method: "HEAD",
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
          });

          const contentType = urlTestResponse.headers.get("content-type");
          const contentLength = urlTestResponse.headers.get("content-length");

          addResult("2. Video URL Analysis", "success", {
            url: scrapingData.videoUrl,
            contentType,
            contentLengthMB: contentLength ? (parseInt(contentLength) / (1024 * 1024)).toFixed(2) : "unknown",
            status: urlTestResponse.status,
            isVideo: contentType?.startsWith("video/"),
          });
        } catch (error: any) {
          addResult("2. Video URL Analysis", "error", null, error.message);
        }
      }

      // Step 3: Test Bunny.net Streaming
      if (scrapingData.videoUrl) {
        addResult("3. Bunny.net Streaming", "loading");

        try {
          const streamingResponse = await fetch("/api/video/stream-to-bunny", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              videoUrl: scrapingData.videoUrl,
              filename: `test-${Date.now()}.mp4`,
            }),
          });

          if (!streamingResponse.ok) {
            throw new Error(`Streaming failed: ${streamingResponse.status}`);
          }

          const streamingData = await streamingResponse.json();
          addResult("3. Bunny.net Streaming", "success", streamingData);

          // Step 4: Test iframe URL
          if (streamingData.cdnUrl) {
            addResult("4. Iframe Test", "loading");

            // Test if iframe URL loads
            setTimeout(() => {
              addResult("4. Iframe Test", "success", {
                iframeUrl: streamingData.cdnUrl,
                note: "Check iframe below for actual playback",
              });
            }, 2000);
          }
        } catch (error: any) {
          addResult("3. Bunny.net Streaming", "error", null, error.message);
        }
      }

      // Step 5: Test Full Process-and-Add Workflow
      addResult("5. Full Workflow", "loading");
      try {
        const fullResponse = await fetch("/api/video/process-and-add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            videoUrl: testUrl,
            title: "Debug Test Video",
            collectionId: "debug-collection",
            scrapedData: scrapingData,
          }),
        });

        if (!fullResponse.ok) {
          throw new Error(`Full workflow failed: ${fullResponse.status}`);
        }

        const fullData = await fullResponse.json();
        addResult("5. Full Workflow", "success", fullData);
      } catch (error: any) {
        addResult("5. Full Workflow", "error", null, error.message);
      }
    } catch (error: any) {
      addResult("1. Video Scraping", "error", null, error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: VideoTestResult["status"]) => {
    switch (status) {
      case "pending":
        return "bg-gray-500";
      case "loading":
        return "bg-blue-500";
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">🔧 Video Processing Debug Tool</h1>
        <p className="text-muted-foreground">Test each step of the video processing workflow to identify issues</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">Video URL to Test</label>
              <Input
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="Enter TikTok or Instagram URL"
                className="font-mono text-sm"
              />
            </div>
            <Button onClick={testVideoScraping} disabled={isProcessing || !testUrl} className="px-8">
              {isProcessing ? "Testing..." : "Start Debug Test"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Results Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Test Results Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.map((result) => (
                  <div key={result.step} className="flex items-center justify-between rounded-lg border p-3">
                    <span className="font-medium">{result.step}</span>
                    <Badge className={getStatusColor(result.status)}>{result.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Results</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="data" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="data">Data</TabsTrigger>
                  <TabsTrigger value="errors">Errors</TabsTrigger>
                </TabsList>

                <TabsContent value="data">
                  <div className="max-h-96 space-y-4 overflow-y-auto">
                    {results
                      .filter((r) => r.data)
                      .map((result) => (
                        <div key={result.step} className="rounded border p-3">
                          <h4 className="mb-2 text-sm font-semibold">{result.step}</h4>
                          <Textarea
                            value={JSON.stringify(result.data, null, 2)}
                            readOnly
                            className="h-32 font-mono text-xs"
                          />
                        </div>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="errors">
                  <div className="space-y-4">
                    {results
                      .filter((r) => r.error)
                      .map((result) => (
                        <div key={result.step} className="rounded border border-red-200 bg-red-50 p-3">
                          <h4 className="mb-2 text-sm font-semibold text-red-800">{result.step}</h4>
                          <p className="text-sm text-red-700">{result.error}</p>
                        </div>
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Iframe Test Section */}
      {results.find((r) => r.step === "4. Iframe Test" && r.status === "success") && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🎥 Iframe Playback Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video overflow-hidden rounded-lg bg-black">
              <iframe
                src={results.find((r) => r.step === "3. Bunny.net Streaming")?.data?.cdnUrl}
                className="h-full w-full"
                allowFullScreen
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              />
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              If the video loads above, the streaming process is working correctly.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Raw Log Analysis */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>🔍 Key Issues to Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">TikTok Subtitle Links Analysis</h4>
              <p className="text-muted-foreground text-sm">
                Your logs show TikTok returns many "subtitleLinks" - we need to ensure we're selecting the actual video,
                not subtitle tracks.
              </p>
              <Badge variant="outline">Check: subtitleLinks vs videoUrl</Badge>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Content-Type Validation</h4>
              <p className="text-muted-foreground text-sm">
                The logs show "video/mp4" content-type, which is correct. But file size shows 0.00 MB.
              </p>
              <Badge variant="outline">Check: File size validation</Badge>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Bunny.net Processing</h4>
              <p className="text-muted-foreground text-sm">
                Video object created successfully, but check if the stream actually contains video data.
              </p>
              <Badge variant="outline">Check: Stream content validation</Badge>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">URL Expiration</h4>
              <p className="text-muted-foreground text-sm">
                TikTok URLs have expiration timestamps. URLs might expire before Bunny.net processes them.
              </p>
              <Badge variant="outline">Check: URL freshness</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
