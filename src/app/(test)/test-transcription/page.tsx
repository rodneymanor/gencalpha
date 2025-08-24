"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export default function TestTranscription() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [youtubeUrl, setYoutubeUrl] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");

  const runTest = async (endpoint: string, data: any = {}, key: string) => {
    setLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      setResults((prev) => ({ ...prev, [key]: result }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [key]: { error: error.message },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const testVoiceTranscription = () => {
    runTest(
      "transcribe/voice",
      {
        audioData: "base64_audio_data_here_for_testing",
        format: "wav",
        testMode: true,
      },
      "voice",
    );
  };

  const testYouTubeTranscript = () => {
    runTest(
      "chrome-extension/youtube-transcript",
      {
        url: youtubeUrl,
        testMode: true,
      },
      "youtube",
    );
  };

  const ResultDisplay = ({ result, title }: { result: any; title: string }) => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">{title} Result</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted max-h-64 overflow-auto rounded p-3 text-xs">{JSON.stringify(result, null, 2)}</pre>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Transcription Services Test</h1>
        <p className="text-muted-foreground">Test voice transcription and YouTube transcript extraction services</p>
      </div>

      <Tabs defaultValue="voice" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="voice">Voice Transcription</TabsTrigger>
          <TabsTrigger value="youtube">YouTube Transcript</TabsTrigger>
        </TabsList>

        <TabsContent value="voice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voice Transcription Test</CardTitle>
              <CardDescription>Test the /api/transcribe/voice endpoint with audio data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Audio Data (Mock)</Label>
                <Textarea
                  value="base64_audio_data_here_for_testing"
                  disabled
                  className="text-xs"
                  placeholder="Audio data would be provided here..."
                />
              </div>

              <Button onClick={testVoiceTranscription} disabled={loading.voice} className="w-full">
                {loading.voice ? "Transcribing..." : "Test Voice Transcription"}
              </Button>

              {results.voice && <ResultDisplay result={results.voice} title="Voice Transcription" />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="youtube" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>YouTube Transcript Test</CardTitle>
              <CardDescription>Test the /api/chrome-extension/youtube-transcript endpoint</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="youtubeUrl">YouTube URL</Label>
                <Input
                  id="youtubeUrl"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="Enter YouTube URL to test"
                />
              </div>

              <Button onClick={testYouTubeTranscript} disabled={loading.youtube} className="w-full">
                {loading.youtube ? "Extracting..." : "Test YouTube Transcript"}
              </Button>

              {results.youtube && <ResultDisplay result={results.youtube} title="YouTube Transcript" />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Supporting Services</CardTitle>
          <CardDescription>Additional transcription support files have been migrated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
            <div className="bg-muted rounded p-3">
              <h4 className="font-medium">Transcript Title Generator</h4>
              <p className="text-muted-foreground text-xs">Generates titles from transcripts</p>
            </div>
            <div className="bg-muted rounded p-3">
              <h4 className="font-medium">Enhanced Readability Service</h4>
              <p className="text-muted-foreground text-xs">Improves transcript readability</p>
            </div>
            <div className="bg-muted rounded p-3">
              <h4 className="font-medium">Script Analysis</h4>
              <p className="text-muted-foreground text-xs">Analyzes transcript content</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
