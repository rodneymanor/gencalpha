'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TestVideo() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [testUrl, setTestUrl] = useState('https://www.tiktok.com/@example/video/123456789');

  const runTest = async (endpoint: string, data: any = {}, key: string) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      setResults(prev => ({ ...prev, [key]: result }));
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        [key]: { error: error.message } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const testCoreServices = async () => {
    setLoading(prev => ({ ...prev, core: true }));
    try {
      const response = await fetch('/api/test-core');
      const result = await response.json();
      setResults(prev => ({ ...prev, core: result }));
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        core: { error: error.message } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, core: false }));
    }
  };

  const ResultDisplay = ({ result, title }: { result: any; title: string }) => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">{title} Result</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-64">
          {JSON.stringify(result, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Video Processing Test Suite</h1>
        <p className="text-muted-foreground">
          Comprehensive testing for all video processing endpoints and core services
        </p>
      </div>

      <Tabs defaultValue="core" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="core">Core Services</TabsTrigger>
          <TabsTrigger value="priority1">Priority 1</TabsTrigger>
          <TabsTrigger value="priority2">Priority 2</TabsTrigger>
          <TabsTrigger value="priority3">Priority 3</TabsTrigger>
        </TabsList>

        <TabsContent value="core" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Core Services Test</CardTitle>
              <CardDescription>
                Test Firebase, Gemini, and Bunny Stream connections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testCoreServices}
                disabled={loading.core}
                className="w-full"
              >
                {loading.core ? 'Testing...' : 'Test Core Services'}
              </Button>
              {results.core && <ResultDisplay result={results.core} title="Core Services" />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priority1" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Priority 1 - Core Video Processing</CardTitle>
              <CardDescription>
                Test download, transcribe, upload, and process-and-add endpoints
                <br />
                <span className="text-xs text-muted-foreground">
                  Note: Download, Transcribe, and Uploader use test endpoints without authentication
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testUrl">Test Video URL</Label>
                <Input
                  id="testUrl"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  placeholder="Enter video URL to test"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => runTest('test-video-download', { url: testUrl }, 'download')}
                  disabled={loading.download}
                  variant="outline"
                >
                  {loading.download ? 'Testing...' : 'Test Download (No Auth)'}
                </Button>
                
                <Button 
                  onClick={() => runTest('test-video-transcribe', { url: testUrl }, 'transcribe')}
                  disabled={loading.transcribe}
                  variant="outline"
                >
                  {loading.transcribe ? 'Testing...' : 'Test Transcribe (No Auth)'}
                </Button>
                
                <Button 
                  onClick={() => runTest('test-video-uploader', { videoBuffer: 'test', fileName: 'test.mp4' }, 'uploader')}
                  disabled={loading.uploader}
                  variant="outline"
                >
                  {loading.uploader ? 'Testing...' : 'Test Uploader (No Auth)'}
                </Button>
                
                <Button 
                  onClick={() => runTest('video/process-and-add', { url: testUrl }, 'processAdd')}
                  disabled={loading.processAdd}
                  variant="outline"
                >
                  {loading.processAdd ? 'Testing...' : 'Test Process & Add'}
                </Button>
              </div>
              
              {results.download && <ResultDisplay result={results.download} title="Download" />}
              {results.transcribe && <ResultDisplay result={results.transcribe} title="Transcribe" />}
              {results.uploader && <ResultDisplay result={results.uploader} title="Uploader" />}
              {results.processAdd && <ResultDisplay result={results.processAdd} title="Process & Add" />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priority2" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Priority 2 - Bunny Integration</CardTitle>
              <CardDescription>
                Test stream-to-bunny and instagram-to-bunny endpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => runTest('video/stream-to-bunny', { url: testUrl }, 'streamBunny')}
                  disabled={loading.streamBunny}
                  variant="outline"
                >
                  {loading.streamBunny ? 'Testing...' : 'Test Stream to Bunny'}
                </Button>
                
                <Button 
                  onClick={() => runTest('video/instagram-to-bunny', { url: testUrl }, 'instaBunny')}
                  disabled={loading.instaBunny}
                  variant="outline"
                >
                  {loading.instaBunny ? 'Testing...' : 'Test Instagram to Bunny'}
                </Button>
              </div>
              
              {results.streamBunny && <ResultDisplay result={results.streamBunny} title="Stream to Bunny" />}
              {results.instaBunny && <ResultDisplay result={results.instaBunny} title="Instagram to Bunny" />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priority3" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Priority 3 - Analysis Endpoints</CardTitle>
              <CardDescription>
                Test all video analysis endpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => runTest('video/analyze-complete', { videoId: 'test123' }, 'analyzeComplete')}
                  disabled={loading.analyzeComplete}
                  variant="outline"
                >
                  {loading.analyzeComplete ? 'Testing...' : 'Test Analyze Complete'}
                </Button>
                
                <Button 
                  onClick={() => runTest('video/analyze-metadata', { videoId: 'test123' }, 'analyzeMeta')}
                  disabled={loading.analyzeMeta}
                  variant="outline"
                >
                  {loading.analyzeMeta ? 'Testing...' : 'Test Analyze Metadata'}
                </Button>
                
                <Button 
                  onClick={() => runTest('video/analyze-script', { videoId: 'test123' }, 'analyzeScript')}
                  disabled={loading.analyzeScript}
                  variant="outline"
                >
                  {loading.analyzeScript ? 'Testing...' : 'Test Analyze Script'}
                </Button>
                
                <Button 
                  onClick={() => runTest('video/analyze-visuals', { videoId: 'test123' }, 'analyzeVisuals')}
                  disabled={loading.analyzeVisuals}
                  variant="outline"
                >
                  {loading.analyzeVisuals ? 'Testing...' : 'Test Analyze Visuals'}
                </Button>
              </div>
              
              {results.analyzeComplete && <ResultDisplay result={results.analyzeComplete} title="Analyze Complete" />}
              {results.analyzeMeta && <ResultDisplay result={results.analyzeMeta} title="Analyze Metadata" />}
              {results.analyzeScript && <ResultDisplay result={results.analyzeScript} title="Analyze Script" />}
              {results.analyzeVisuals && <ResultDisplay result={results.analyzeVisuals} title="Analyze Visuals" />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}