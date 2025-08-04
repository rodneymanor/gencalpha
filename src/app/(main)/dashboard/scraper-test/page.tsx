"use client";

import React, { useState } from "react";

import { Hash, AlertCircle, CheckCircle } from "lucide-react";

import { ScraperConfigCard } from "@/components/dashboard/scraper-config-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ScrapeResult {
  success: boolean;
  data?: {
    url: string;
    title: string;
    headings: string[];
    paragraphs: string[];
    allText: string;
    extractedAt: string;
    customSelectors?: Record<string, string[]>;
  };
  error?: string;
  details?: string;
}

const testUrls = [
  "https://example.com",
  "https://httpbin.org/html",
  "https://news.ycombinator.com",
  "https://www.perplexity.ai/discover/you/apple-quietly-builds-chatgpt-r-a2yCjtUNRk2oXmDg2snOWQ",
];

function TestUrlsCard({ onTestUrl }: { onTestUrl: (url: string) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Test URLs</CardTitle>
        <CardDescription>Click any URL below to test the scraper</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {testUrls.map((testUrl) => (
            <Button
              key={testUrl}
              variant="outline"
              size="sm"
              onClick={() => onTestUrl(testUrl)}
              className="w-full justify-start text-left"
            >
              {testUrl}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function HeadingsSection({ headings }: { headings: string[] }) {
  if (headings.length === 0) return null;

  return (
    <div>
      <Label className="text-sm font-medium">Headings ({headings.length})</Label>
      <ScrollArea className="mt-2 h-32 rounded border p-2">
        <div className="space-y-1">
          {headings.map((heading) => (
            <div key={heading} className="text-xs">
              <Badge variant="outline" className="mr-2">
                H
              </Badge>
              {heading}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function CustomSelectorsSection({ customSelectors }: { customSelectors: Record<string, string[]> }) {
  if (!customSelectors || Object.keys(customSelectors).length === 0) return null;

  return (
    <>
      <Separator />
      <div>
        <Label className="text-sm font-medium">Custom Selector Results</Label>
        <div className="mt-2 space-y-3">
          {Object.entries(customSelectors).map(([key, values]) => (
            <div key={key}>
              <Badge variant="secondary" className="mb-2">
                {key}
              </Badge>
              <ScrollArea className="h-24 rounded border p-2">
                <div className="space-y-1">
                  {values.map((value) => (
                    <p key={value} className="text-muted-foreground text-xs">
                      {value}
                    </p>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ScrapedDataCard({ data }: { data: NonNullable<ScrapeResult["data"]> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-4 w-4" />
          Scraped Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Title</Label>
          <p className="text-muted-foreground mt-1 text-sm">{data.title}</p>
        </div>

        <Separator />

        <HeadingsSection headings={data.headings} />

        <Separator />

        <div>
          <Label className="text-sm font-medium">Full Text Preview ({data.allText.length} characters)</Label>
          <ScrollArea className="mt-2 h-40 rounded border p-2">
            <p className="text-muted-foreground text-xs whitespace-pre-wrap">
              {data.allText.substring(0, 1000)}
              {data.allText.length > 1000 && "\n\n... (truncated)"}
            </p>
          </ScrollArea>
        </div>

        <CustomSelectorsSection customSelectors={data.customSelectors ?? {}} />
      </CardContent>
    </Card>
  );
}

function ResultsDisplay({ error, result }: { error: string | null; result: ScrapeResult | null }) {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!result) return null;

  return (
    <>
      {result.success ? (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Successfully scraped content from {result.data?.url ?? ""}</AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {result.error}
            {result.details && <div className="mt-2 text-xs opacity-70">Details: {result.details}</div>}
          </AlertDescription>
        </Alert>
      )}

      {result.success && result.data && <ScrapedDataCard data={result.data} />}
    </>
  );
}

export default function ScraperTestPage() {
  const [url, setUrl] = useState("");
  const [customSelectors, setCustomSelectors] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScrapeResult | null>(null);

  const handleScrape = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload: { url: string; customSelectors?: Record<string, string> } = { url: url.trim() };

      if (customSelectors.trim()) {
        try {
          payload.customSelectors = JSON.parse(customSelectors);
        } catch {
          setError("Invalid JSON format in custom selectors");
          setLoading(false);
          return;
        }
      }

      const response = await fetch("/api/scraper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? `HTTP error! status: ${response.status}`);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while scraping");
    } finally {
      setLoading(false);
    }
  };

  const handleTestUrl = (testUrl: string) => {
    setUrl(testUrl);
    setCustomSelectors("");
    setError(null);
    setResult(null);
  };

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Web Scraper Test</h1>
          <p className="text-muted-foreground mt-2">Test the web scraping functionality with any URL</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <ScraperConfigCard
              url={url}
              setUrl={setUrl}
              customSelectors={customSelectors}
              setCustomSelectors={setCustomSelectors}
              loading={loading}
              onScrape={handleScrape}
            />

            <TestUrlsCard onTestUrl={handleTestUrl} />
          </div>

          <div className="space-y-6">
            <ResultsDisplay error={error} result={result} />
          </div>
        </div>
      </div>
    </div>
  );
}
