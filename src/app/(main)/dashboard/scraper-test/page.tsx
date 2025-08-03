'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Globe, FileText, Hash, AlertCircle, CheckCircle } from 'lucide-react';

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
  'https://example.com',
  'https://httpbin.org/html',
  'https://news.ycombinator.com',
  'https://www.perplexity.ai/discover/you/apple-quietly-builds-chatgpt-r-a2yCjtUNRk2oXmDg2snOWQ'
];

const formatJsonExample = () => {
  return JSON.stringify({
    "title": "h1, .title",
    "author": ".author, .byline",
    "date": ".date, time",
    "content": ".content, .post-body"
  }, null, 2);
};

function ScraperConfigCard({ 
  url, 
  setUrl, 
  customSelectors, 
  setCustomSelectors, 
  loading, 
  onScrape 
}: {
  url: string;
  setUrl: (url: string) => void;
  customSelectors: string;
  setCustomSelectors: (selectors: string) => void;
  loading: boolean;
  onScrape: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Scraper Configuration
        </CardTitle>
        <CardDescription>
          Enter a URL and optional custom selectors to scrape content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div className="space-y-2">
          <Label htmlFor="selectors">Custom Selectors (Optional JSON)</Label>
          <Textarea
            id="selectors"
            placeholder={formatJsonExample()}
            value={customSelectors}
            onChange={(e) => setCustomSelectors(e.target.value)}
            className="font-mono text-sm h-32"
          />
          <p className="text-xs text-muted-foreground">
            JSON object mapping names to CSS selectors
          </p>
        </div>

        <Button 
          onClick={onScrape} 
          disabled={loading || !url.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scraping...
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

function TestUrlsCard({ onTestUrl }: { onTestUrl: (url: string) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Test URLs</CardTitle>
        <CardDescription>
          Click any URL below to test the scraper
        </CardDescription>
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
      <Label className="text-sm font-medium">
        Headings ({headings.length})
      </Label>
      <ScrollArea className="h-32 mt-2 border rounded p-2">
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
              <ScrollArea className="h-24 border rounded p-2">
                <div className="space-y-1">
                  {values.map((value) => (
                    <p key={value} className="text-xs text-muted-foreground">
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

function ScrapedDataCard({ data }: { data: NonNullable<ScrapeResult['data']> }) {
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
          <p className="text-sm text-muted-foreground mt-1">
            {data.title}
          </p>
        </div>

        <Separator />

        <HeadingsSection headings={data.headings} />

        <Separator />

        <div>
          <Label className="text-sm font-medium">
            Full Text Preview ({data.allText.length} characters)
          </Label>
          <ScrollArea className="h-40 mt-2 border rounded p-2">
            <p className="text-xs text-muted-foreground whitespace-pre-wrap">
              {data.allText.substring(0, 1000)}
              {data.allText.length > 1000 && '\n\n... (truncated)'}
            </p>
          </ScrollArea>
        </div>

        <CustomSelectorsSection customSelectors={data.customSelectors ?? {}} />
      </CardContent>
    </Card>
  );
}

function ResultsDisplay({ error, result }: { 
  error: string | null; 
  result: ScrapeResult | null; 
}) {
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
          <AlertDescription>
            Successfully scraped content from {result.data?.url ?? ''}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {result.error}
            {result.details && (
              <div className="mt-2 text-xs opacity-70">
                Details: {result.details}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {result.success && result.data && (
        <ScrapedDataCard data={result.data} />
      )}
    </>
  );
}

export default function ScraperTestPage() {
  const [url, setUrl] = useState('');
  const [customSelectors, setCustomSelectors] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScrapeResult | null>(null);

  const handleScrape = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
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
          setError('Invalid JSON format in custom selectors');
          setLoading(false);
          return;
        }
      }

      const response = await fetch('/api/scraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      setError(err instanceof Error ? err.message : 'An error occurred while scraping');
    } finally {
      setLoading(false);
    }
  };

  const handleTestUrl = (testUrl: string) => {
    setUrl(testUrl);
    setCustomSelectors('');
    setError(null);
    setResult(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Web Scraper Test</h1>
          <p className="text-muted-foreground mt-2">
            Test the web scraping functionality with any URL
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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