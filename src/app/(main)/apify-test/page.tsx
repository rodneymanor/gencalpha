'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, PlayCircle, User, Video, Layers } from 'lucide-react';

interface APIResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  timestamp: string;
  summary?: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalProfiles: number;
    totalVideos: number;
  };
}

interface TestState {
  loading: boolean;
  response: APIResponse | null;
  error: string | null;
}

export default function ApifyTestPage() {
  const [instagramProfile, setInstagramProfile] = useState({
    username: '',
    usernames: '',
    includeDetails: false,
    resultsLimit: 50,
  });

  const [instagramReel, setInstagramReel] = useState({
    url: '',
    urls: '',
    username: '',
    resultsLimit: 50,
    downloadVideo: false,
  });

  const [tiktokProfile, setTiktokProfile] = useState({
    username: '',
    usernames: '',
    includeVideos: false,
    resultsLimit: 50,
    downloadVideos: false,
  });

  const [tiktokScraper, setTiktokScraper] = useState({
    profiles: '',
    hashtags: '',
    videoUrls: '',
    searchQueries: '',
    resultsPerPage: 10,
  });

  const [orchestrator, setOrchestrator] = useState({
    instagramProfiles: '',
    instagramReels: '',
    tiktokProfiles: '',
    includeDetails: false,
    includeVideos: false,
    downloadVideos: false,
    resultsLimit: 50,
  });

  const [testStates, setTestStates] = useState<Record<string, TestState>>({
    instagramProfile: { loading: false, response: null, error: null },
    instagramReel: { loading: false, response: null, error: null },
    tiktokProfile: { loading: false, response: null, error: null },
    tiktokScraper: { loading: false, response: null, error: null },
    orchestrator: { loading: false, response: null, error: null },
  });

  const updateTestState = (key: string, update: Partial<TestState>) => {
    setTestStates(prev => ({
      ...prev,
      [key]: { ...prev[key], ...update }
    }));
  };

  const makeAPICall = async (endpoint: string, body: object, stateKey: string) => {
    updateTestState(stateKey, { loading: true, error: null, response: null });

    try {
      const response = await fetch(`/api/apify/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      updateTestState(stateKey, { loading: false, response: data });
    } catch (error) {
      updateTestState(stateKey, {
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const testInstagramProfile = () => {
    const body: Record<string, unknown> = {
      includeDetails: instagramProfile.includeDetails,
      resultsLimit: instagramProfile.resultsLimit,
    };

    if (instagramProfile.username) {
      body.username = instagramProfile.username;
    } else if (instagramProfile.usernames) {
      body.usernames = instagramProfile.usernames.split(',').map(u => u.trim());
    }

    makeAPICall('instagram/profile', body, 'instagramProfile');
  };

  const testInstagramReel = () => {
    const body: Record<string, unknown> = {
      resultsLimit: instagramReel.resultsLimit,
      downloadVideo: instagramReel.downloadVideo,
    };

    if (instagramReel.url) {
      body.url = instagramReel.url;
    } else if (instagramReel.urls) {
      body.urls = instagramReel.urls.split(',').map(u => u.trim());
    } else if (instagramReel.username) {
      body.username = instagramReel.username;
    }

    makeAPICall('instagram/reel', body, 'instagramReel');
  };

  const testTiktokProfile = () => {
    const body: Record<string, unknown> = {
      includeVideos: tiktokProfile.includeVideos,
      resultsLimit: tiktokProfile.resultsLimit,
      downloadVideos: tiktokProfile.downloadVideos,
    };

    if (tiktokProfile.username) {
      body.username = tiktokProfile.username;
    } else if (tiktokProfile.usernames) {
      body.usernames = tiktokProfile.usernames.split(',').map(u => u.trim());
    }

    makeAPICall('tiktok/profile', body, 'tiktokProfile');
  };

  const testTiktokScraper = () => {
    const body: Record<string, unknown> = {
      resultsPerPage: tiktokScraper.resultsPerPage,
    };

    if (tiktokScraper.profiles) {
      body.profiles = tiktokScraper.profiles.split(',').map(u => u.trim());
    }

    if (tiktokScraper.hashtags) {
      body.hashtags = tiktokScraper.hashtags.split(',').map(h => h.trim());
    }

    if (tiktokScraper.videoUrls) {
      body.videoUrls = tiktokScraper.videoUrls.split(',').map(url => url.trim());
    }

    if (tiktokScraper.searchQueries) {
      body.searchQueries = tiktokScraper.searchQueries.split(',').map(q => q.trim());
    }

    makeAPICall('tiktok/scraper', body, 'tiktokScraper');
  };

  const testOrchestrator = () => {
    const body: Record<string, unknown> = {
      resultsLimit: orchestrator.resultsLimit,
    };

    if (orchestrator.instagramProfiles || orchestrator.instagramReels) {
      body.instagram = {};
      if (orchestrator.instagramProfiles) {
        (body.instagram as Record<string, unknown>).profiles = orchestrator.instagramProfiles.split(',').map(u => u.trim());
        (body.instagram as Record<string, unknown>).includeDetails = orchestrator.includeDetails;
      }
      if (orchestrator.instagramReels) {
        (body.instagram as Record<string, unknown>).reels = orchestrator.instagramReels.split(',').map(u => u.trim());
        (body.instagram as Record<string, unknown>).downloadVideos = orchestrator.downloadVideos;
      }
    }

    if (orchestrator.tiktokProfiles) {
      body.tiktok = {
        profiles: orchestrator.tiktokProfiles.split(',').map(u => u.trim()),
        includeVideos: orchestrator.includeVideos,
        downloadVideos: orchestrator.downloadVideos,
      };
    }

    makeAPICall('orchestrator', body, 'orchestrator');
  };

  const ResponseDisplay = ({ response, error, loading }: TestState) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Testing API...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive font-medium">Error:</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      );
    }

    if (response) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={response.success ? 'default' : 'destructive'}>
              {response.success ? 'Success' : 'Failed'}
            </Badge>
            <span className="text-sm text-muted-foreground">{response.timestamp}</span>
          </div>

          {response.summary && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold">{response.summary.totalRequests}</p>
                <p className="text-xs text-muted-foreground">Total Requests</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{response.summary.successfulRequests}</p>
                <p className="text-xs text-muted-foreground">Successful</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{response.summary.failedRequests}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{response.summary.totalProfiles}</p>
                <p className="text-xs text-muted-foreground">Profiles</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{response.summary.totalVideos}</p>
                <p className="text-xs text-muted-foreground">Videos</p>
              </div>
            </div>
          )}

          <div className="max-h-96 overflow-auto">
            <pre className="text-xs bg-muted p-4 rounded-lg">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>No response yet. Click "Test API" to run the request.</p>
      </div>
    );
  };

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Apify API Test Console</h1>
        <p className="text-muted-foreground">
          Test all Apify API endpoints with real data. Configure parameters and see live responses.
        </p>
      </div>

      <Tabs defaultValue="instagram-profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="instagram-profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            IG Profile
          </TabsTrigger>
          <TabsTrigger value="instagram-reel" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            IG Reel
          </TabsTrigger>
          <TabsTrigger value="tiktok-profile" className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4" />
            TikTok Profile
          </TabsTrigger>
          <TabsTrigger value="tiktok-scraper" className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4" />
            TikTok Scraper
          </TabsTrigger>
          <TabsTrigger value="orchestrator" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Orchestrator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="instagram-profile">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Instagram Profile Scraper</CardTitle>
                <CardDescription>
                  Get profile information and recent posts from Instagram users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ig-username">Username (single)</Label>
                  <Input
                    id="ig-username"
                    placeholder="apifyoffice"
                    value={instagramProfile.username}
                    onChange={(e) => setInstagramProfile(prev => ({ ...prev, username: e.target.value, usernames: '' }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ig-usernames">Usernames (comma-separated)</Label>
                  <Input
                    id="ig-usernames"
                    placeholder="user1, user2, user3"
                    value={instagramProfile.usernames}
                    onChange={(e) => setInstagramProfile(prev => ({ ...prev, usernames: e.target.value, username: '' }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="ig-details"
                    checked={instagramProfile.includeDetails}
                    onCheckedChange={(checked) => setInstagramProfile(prev => ({ ...prev, includeDetails: checked }))}
                  />
                  <Label htmlFor="ig-details">Include detailed information</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ig-limit">Results Limit</Label>
                  <Input
                    id="ig-limit"
                    type="number"
                    value={instagramProfile.resultsLimit}
                    onChange={(e) => setInstagramProfile(prev => ({ ...prev, resultsLimit: Number(e.target.value) }))}
                  />
                </div>

                <Button 
                  onClick={testInstagramProfile} 
                  disabled={testStates.instagramProfile.loading || (!instagramProfile.username && !instagramProfile.usernames)}
                  className="w-full"
                >
                  {testStates.instagramProfile.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Test API
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponseDisplay {...testStates.instagramProfile} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="instagram-reel">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Instagram Reel Scraper</CardTitle>
                <CardDescription>
                  Download reels by URL or scrape from user profiles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reel-url">Single Reel URL</Label>
                  <Input
                    id="reel-url"
                    placeholder="https://www.instagram.com/reel/ABC123/"
                    value={instagramReel.url}
                    onChange={(e) => setInstagramReel(prev => ({ ...prev, url: e.target.value, urls: '', username: '' }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reel-urls">Multiple URLs (comma-separated)</Label>
                  <Textarea
                    id="reel-urls"
                    placeholder="https://instagram.com/reel/1, https://instagram.com/reel/2"
                    value={instagramReel.urls}
                    onChange={(e) => setInstagramReel(prev => ({ ...prev, urls: e.target.value, url: '', username: '' }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reel-username">Or Username</Label>
                  <Input
                    id="reel-username"
                    placeholder="username"
                    value={instagramReel.username}
                    onChange={(e) => setInstagramReel(prev => ({ ...prev, username: e.target.value, url: '', urls: '' }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="reel-download"
                    checked={instagramReel.downloadVideo}
                    onCheckedChange={(checked) => setInstagramReel(prev => ({ ...prev, downloadVideo: checked }))}
                  />
                  <Label htmlFor="reel-download">Download videos in background</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reel-limit">Results Limit</Label>
                  <Input
                    id="reel-limit"
                    type="number"
                    value={instagramReel.resultsLimit}
                    onChange={(e) => setInstagramReel(prev => ({ ...prev, resultsLimit: Number(e.target.value) }))}
                  />
                </div>

                <Button 
                  onClick={testInstagramReel} 
                  disabled={testStates.instagramReel.loading || (!instagramReel.url && !instagramReel.urls && !instagramReel.username)}
                  className="w-full"
                >
                  {testStates.instagramReel.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Test API
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponseDisplay {...testStates.instagramReel} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tiktok-profile">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>TikTok Profile Scraper</CardTitle>
                <CardDescription>
                  Get TikTok user profiles and their videos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tiktok-username">Username (single)</Label>
                  <Input
                    id="tiktok-username"
                    placeholder="tiktokuser"
                    value={tiktokProfile.username}
                    onChange={(e) => setTiktokProfile(prev => ({ ...prev, username: e.target.value, usernames: '' }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktok-usernames">Usernames (comma-separated)</Label>
                  <Input
                    id="tiktok-usernames"
                    placeholder="user1, user2, user3"
                    value={tiktokProfile.usernames}
                    onChange={(e) => setTiktokProfile(prev => ({ ...prev, usernames: e.target.value, username: '' }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="tiktok-videos"
                    checked={tiktokProfile.includeVideos}
                    onCheckedChange={(checked) => setTiktokProfile(prev => ({ ...prev, includeVideos: checked }))}
                  />
                  <Label htmlFor="tiktok-videos">Include user videos</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="tiktok-download"
                    checked={tiktokProfile.downloadVideos}
                    onCheckedChange={(checked) => setTiktokProfile(prev => ({ ...prev, downloadVideos: checked }))}
                  />
                  <Label htmlFor="tiktok-download">Download videos in background</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktok-limit">Results Limit</Label>
                  <Input
                    id="tiktok-limit"
                    type="number"
                    value={tiktokProfile.resultsLimit}
                    onChange={(e) => setTiktokProfile(prev => ({ ...prev, resultsLimit: Number(e.target.value) }))}
                  />
                </div>

                <Button 
                  onClick={testTiktokProfile} 
                  disabled={testStates.tiktokProfile.loading || (!tiktokProfile.username && !tiktokProfile.usernames)}
                  className="w-full"
                >
                  {testStates.tiktokProfile.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Test API
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponseDisplay {...testStates.tiktokProfile} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tiktok-scraper">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>TikTok General Scraper</CardTitle>
                <CardDescription>
                  Scrape TikTok profiles, hashtags, individual videos, or search queries
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tiktok-scraper-profiles">Profiles (comma-separated)</Label>
                  <Input
                    id="tiktok-scraper-profiles"
                    placeholder="apifytech, therock"
                    value={tiktokScraper.profiles}
                    onChange={(e) => setTiktokScraper(prev => ({ ...prev, profiles: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktok-scraper-hashtags">Hashtags (comma-separated)</Label>
                  <Input
                    id="tiktok-scraper-hashtags"
                    placeholder="funny, viral, dance"
                    value={tiktokScraper.hashtags}
                    onChange={(e) => setTiktokScraper(prev => ({ ...prev, hashtags: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktok-scraper-videos">Video URLs (comma-separated)</Label>
                  <Textarea
                    id="tiktok-scraper-videos"
                    placeholder="https://www.tiktok.com/@user/video/123, https://www.tiktok.com/@user/video/456"
                    value={tiktokScraper.videoUrls}
                    onChange={(e) => setTiktokScraper(prev => ({ ...prev, videoUrls: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktok-scraper-search">Search Queries (comma-separated)</Label>
                  <Input
                    id="tiktok-scraper-search"
                    placeholder="cats, cooking tutorials, funny pets"
                    value={tiktokScraper.searchQueries}
                    onChange={(e) => setTiktokScraper(prev => ({ ...prev, searchQueries: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktok-scraper-limit">Results Per Page</Label>
                  <Input
                    id="tiktok-scraper-limit"
                    type="number"
                    value={tiktokScraper.resultsPerPage}
                    onChange={(e) => setTiktokScraper(prev => ({ ...prev, resultsPerPage: Number(e.target.value) }))}
                  />
                </div>

                <Button 
                  onClick={testTiktokScraper} 
                  disabled={testStates.tiktokScraper.loading || (!tiktokScraper.profiles && !tiktokScraper.hashtags && !tiktokScraper.videoUrls && !tiktokScraper.searchQueries)}
                  className="w-full"
                >
                  {testStates.tiktokScraper.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Test API
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponseDisplay {...testStates.tiktokScraper} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orchestrator">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Orchestrator (Batch Operations)</CardTitle>
                <CardDescription>
                  Run multiple scraping operations in parallel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orch-ig-profiles">Instagram Profiles (comma-separated)</Label>
                  <Input
                    id="orch-ig-profiles"
                    placeholder="user1, user2"
                    value={orchestrator.instagramProfiles}
                    onChange={(e) => setOrchestrator(prev => ({ ...prev, instagramProfiles: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orch-ig-reels">Instagram Reel URLs (comma-separated)</Label>
                  <Textarea
                    id="orch-ig-reels"
                    placeholder="https://instagram.com/reel/1, https://instagram.com/reel/2"
                    value={orchestrator.instagramReels}
                    onChange={(e) => setOrchestrator(prev => ({ ...prev, instagramReels: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orch-tiktok-profiles">TikTok Profiles (comma-separated)</Label>
                  <Input
                    id="orch-tiktok-profiles"
                    placeholder="tikuser1, tikuser2"
                    value={orchestrator.tiktokProfiles}
                    onChange={(e) => setOrchestrator(prev => ({ ...prev, tiktokProfiles: e.target.value }))}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="orch-details"
                      checked={orchestrator.includeDetails}
                      onCheckedChange={(checked) => setOrchestrator(prev => ({ ...prev, includeDetails: checked }))}
                    />
                    <Label htmlFor="orch-details">Include Instagram details</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="orch-videos"
                      checked={orchestrator.includeVideos}
                      onCheckedChange={(checked) => setOrchestrator(prev => ({ ...prev, includeVideos: checked }))}
                    />
                    <Label htmlFor="orch-videos">Include TikTok videos</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="orch-download"
                      checked={orchestrator.downloadVideos}
                      onCheckedChange={(checked) => setOrchestrator(prev => ({ ...prev, downloadVideos: checked }))}
                    />
                    <Label htmlFor="orch-download">Download videos in background</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orch-limit">Results Limit</Label>
                  <Input
                    id="orch-limit"
                    type="number"
                    value={orchestrator.resultsLimit}
                    onChange={(e) => setOrchestrator(prev => ({ ...prev, resultsLimit: Number(e.target.value) }))}
                  />
                </div>

                <Button 
                  onClick={testOrchestrator} 
                  disabled={testStates.orchestrator.loading || (!orchestrator.instagramProfiles && !orchestrator.instagramReels && !orchestrator.tiktokProfiles)}
                  className="w-full"
                >
                  {testStates.orchestrator.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Test API
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponseDisplay {...testStates.orchestrator} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}