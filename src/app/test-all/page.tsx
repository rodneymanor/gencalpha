'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const API_TESTS = [
  // Core Services
  { name: 'Core Services', endpoint: '/api/test-core', method: 'GET', category: 'core' },
  
  // Video Processing
  { name: 'Video Download (Test)', endpoint: '/api/test-video-download', method: 'POST', category: 'video', 
    data: { url: 'https://www.tiktok.com/@test/video/123' } },
  { name: 'Video Transcribe (Test)', endpoint: '/api/test-video-transcribe', method: 'POST', category: 'video',
    data: { url: 'https://www.tiktok.com/@test/video/123' } },
  { name: 'Video Upload (Test)', endpoint: '/api/test-video-uploader', method: 'POST', category: 'video',
    data: { videoBuffer: 'test', fileName: 'test.mp4' } },
  
  // Transcription Services
  { name: 'Voice Transcription', endpoint: '/api/transcribe/voice', method: 'POST', category: 'transcription',
    data: { audioData: 'test_audio_data', format: 'wav', testMode: true } },
  { name: 'YouTube Transcript', endpoint: '/api/chrome-extension/youtube-transcript', method: 'POST', category: 'transcription',
    data: { url: 'https://youtube.com/watch?v=test', testMode: true } },
  
  // Collections (Auth Required)
  { name: 'Collections', endpoint: '/api/collections', method: 'GET', category: 'collections', requiresAuth: true },
  { name: 'User Collections', endpoint: '/api/collections/user-collections', method: 'GET', category: 'collections', requiresAuth: true },
  
  // Script Generation
  { name: 'Speed Write', endpoint: '/api/script/speed-write', method: 'POST', category: 'scripts',
    data: { prompt: 'Test script generation', testMode: true } },
  { name: 'Scripts Management', endpoint: '/api/scripts', method: 'GET', category: 'scripts', requiresAuth: true },
  
  // AI Actions
  { name: 'AI Action', endpoint: '/api/ai-action', method: 'POST', category: 'ai',
    data: { action: 'test', content: 'test content' } },
  { name: 'Humanize', endpoint: '/api/humanize', method: 'POST', category: 'ai',
    data: { text: 'test text to humanize' } },
  { name: 'Shorten', endpoint: '/api/shorten', method: 'POST', category: 'ai',
    data: { text: 'test text to shorten' } },
  
  // Voice System
  { name: 'Voices', endpoint: '/api/voices', method: 'GET', category: 'voices', requiresAuth: true },
  { name: 'Active Voices', endpoint: '/api/voices/active', method: 'GET', category: 'voices', requiresAuth: true },
  
  // Notes System
  { name: 'Notes', endpoint: '/api/notes', method: 'GET', category: 'notes', requiresAuth: true },
  { name: 'Idea Inbox', endpoint: '/api/notes/idea-inbox', method: 'GET', category: 'notes', requiresAuth: true },
  
  // Usage & Billing
  { name: 'Usage Stats', endpoint: '/api/usage/stats', method: 'GET', category: 'billing', requiresAuth: true },
  { name: 'API Keys', endpoint: '/api/keys', method: 'GET', category: 'billing', requiresAuth: true }
];

const CATEGORIES = {
  core: { name: 'Core Services', color: 'bg-blue-500' },
  video: { name: 'Video Processing', color: 'bg-purple-500' },
  transcription: { name: 'Transcription', color: 'bg-green-500' },
  collections: { name: 'Collections', color: 'bg-orange-500' },
  scripts: { name: 'Script Generation', color: 'bg-red-500' },
  ai: { name: 'AI Actions', color: 'bg-yellow-500' },
  voices: { name: 'Voice System', color: 'bg-pink-500' },
  notes: { name: 'Notes System', color: 'bg-indigo-500' },
  billing: { name: 'Usage & Billing', color: 'bg-gray-500' }
};

export default function TestAll() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [testing, setTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState('');

  const runAllTests = async () => {
    setTesting(true);
    setProgress(0);
    setResults({});
    const testResults: Record<string, any> = {};

    for (let i = 0; i < API_TESTS.length; i++) {
      const test = API_TESTS[i];
      setCurrentTest(test.name);
      setProgress((i / API_TESTS.length) * 100);

      try {
        const startTime = Date.now();
        
        const requestOptions: RequestInit = {
          method: test.method,
          headers: { 'Content-Type': 'application/json' },
        };

        if (test.data && test.method === 'POST') {
          requestOptions.body = JSON.stringify(test.data);
        }

        const response = await fetch(test.endpoint, requestOptions);
        const responseTime = Date.now() - startTime;
        
        let responseData;
        try {
          responseData = await response.json();
        } catch {
          responseData = { message: 'Non-JSON response' };
        }

        testResults[test.name] = {
          status: response.status,
          success: response.ok,
          responseTime,
          category: test.category,
          requiresAuth: test.requiresAuth,
          data: responseData,
          expectedAuth: test.requiresAuth && response.status === 401
        };
      } catch (error) {
        testResults[test.name] = {
          status: 'error',
          success: false,
          error: error.message,
          category: test.category,
          requiresAuth: test.requiresAuth
        };
      }

      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setResults(testResults);
    setProgress(100);
    setCurrentTest('');
    setTesting(false);
  };

  const getStatusIcon = (result: any) => {
    if (result.success || result.expectedAuth) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (result.requiresAuth && result.status === 401) {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusBadge = (result: any) => {
    if (result.success) {
      return <Badge className="bg-green-500">Success</Badge>;
    } else if (result.requiresAuth && result.status === 401) {
      return <Badge className="bg-yellow-500">Auth Required</Badge>;
    } else if (result.expectedAuth) {
      return <Badge className="bg-blue-500">Expected Auth</Badge>;
    } else {
      return <Badge variant="destructive">Failed</Badge>;
    }
  };

  const categoryResults = Object.entries(CATEGORIES).map(([key, category]) => {
    const categoryTests = Object.entries(results).filter(([_, result]) => result.category === key);
    const successCount = categoryTests.filter(([_, result]) => 
      result.success || result.expectedAuth || (result.requiresAuth && result.status === 401)
    ).length;
    
    return {
      key,
      ...category,
      total: categoryTests.length,
      success: successCount,
      percentage: categoryTests.length > 0 ? (successCount / categoryTests.length) * 100 : 0
    };
  });

  const overallStats = {
    total: Object.keys(results).length,
    success: Object.values(results).filter((result: any) => 
      result.success || result.expectedAuth || (result.requiresAuth && result.status === 401)
    ).length,
    failed: Object.values(results).filter((result: any) => 
      !result.success && !result.expectedAuth && !(result.requiresAuth && result.status === 401)
    ).length
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🧪 API Migration Test Suite</h1>
        <p className="text-muted-foreground">
          Comprehensive testing for all {API_TESTS.length} migrated API endpoints across {Object.keys(CATEGORIES).length} categories
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Runner</CardTitle>
          <CardDescription>
            Run comprehensive tests across all API categories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runAllTests} 
            disabled={testing}
            className="w-full"
            size="lg"
          >
            {testing ? (
              <>
                <Clock className="w-4 h-4 mr-2" />
                Testing {currentTest}...
              </>
            ) : (
              `Run All ${API_TESTS.length} Tests`
            )}
          </Button>
          
          {testing && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                {Math.round(progress)}% complete
              </p>
            </div>
          )}

          {Object.keys(results).length > 0 && (
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{overallStats.success}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{overallStats.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{overallStats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {Object.keys(results).length > 0 && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="by-category">By Category</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Results</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categoryResults.map((category) => (
                <Card key={category.key}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{category.name}</CardTitle>
                      <div className={`w-3 h-3 rounded-full ${category.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{category.success}/{category.total}</span>
                        <span>{Math.round(category.percentage)}%</span>
                      </div>
                      <Progress value={category.percentage} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="by-category" className="space-y-6">
            {Object.entries(CATEGORIES).map(([categoryKey, category]) => {
              const categoryTests = Object.entries(results).filter(([_, result]) => result.category === categoryKey);
              
              if (categoryTests.length === 0) return null;

              return (
                <Card key={categoryKey}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${category.color}`} />
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {categoryTests.map(([name, result]) => (
                        <div key={name} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(result)}
                            <span className="font-medium">{name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(result)}
                            {result.responseTime && (
                              <span className="text-xs text-muted-foreground">
                                {result.responseTime}ms
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            {Object.entries(results).map(([name, result]) => (
              <Card key={name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {getStatusIcon(result)}
                      {name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(result)}
                      <Badge variant="outline">
                        {CATEGORIES[result.category]?.name}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <strong>Status:</strong> {result.status}
                      </div>
                      {result.responseTime && (
                        <div>
                          <strong>Response Time:</strong> {result.responseTime}ms
                        </div>
                      )}
                    </div>
                    
                    {result.error && (
                      <div className="text-red-600">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}
                    
                    {result.requiresAuth && result.status === 401 && (
                      <div className="text-yellow-600">
                        <strong>Note:</strong> This endpoint requires authentication (expected 401)
                      </div>
                    )}
                    
                    {result.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer font-medium">Response Data</summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}