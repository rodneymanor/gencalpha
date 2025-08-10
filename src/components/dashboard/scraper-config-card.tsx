"use client";

import { useState } from "react";

import { FileText, Globe } from "lucide-react";
import { ClarityLoader } from "@/components/ui/loading";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface ScraperConfigCardProps {
  url: string;
  setUrl: (url: string) => void;
  customSelectors: string;
  setCustomSelectors: (selectors: string) => void;
  loading: boolean;
  onScrape: () => void;
}

const formatJsonExample = () => {
  return JSON.stringify(
    {
      title: "h1, .title",
      author: ".author, .byline",
      date: ".date, time",
      content: ".content, .post-body",
    },
    null,
    2,
  );
};

export function ScraperConfigCard({
  url,
  setUrl,
  customSelectors,
  setCustomSelectors,
  loading,
  onScrape,
}: ScraperConfigCardProps) {
  const [useAdvancedMode, setUseAdvancedMode] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Scraper Configuration
        </CardTitle>
        <CardDescription>Enter a URL and optional custom selectors to scrape content</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="url">Website URL</Label>
          <Input
            id="url"
            type="url"
            placeholder="https://example.com/article"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="advanced-mode">Advanced Mode</Label>
            <p className="text-muted-foreground text-sm">Enable custom CSS selectors</p>
          </div>
          <Switch id="advanced-mode" checked={useAdvancedMode} onCheckedChange={setUseAdvancedMode} />
        </div>

        {useAdvancedMode && (
          <div className="space-y-2">
            <Label htmlFor="selectors">Custom Selectors (JSON)</Label>
            <Textarea
              id="selectors"
              placeholder={formatJsonExample()}
              value={customSelectors}
              onChange={(e) => setCustomSelectors(e.target.value)}
              className="h-32 font-mono text-sm"
            />
            <p className="text-muted-foreground text-xs">JSON object mapping names to CSS selectors</p>
          </div>
        )}

        <Button onClick={onScrape} disabled={loading || !url.trim()} className="w-full">
          {loading ? (
            <>
              <ClarityLoader size="inline" />
              <span className="ml-2">Scraping...</span>
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Scrape Website
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
