"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VideoData {
  components: {
    hook: string;
    bridge: string;
    nugget: string;
    wta: string;
  };
  deepAnalysis: {
    contentThemes: string[];
    targetAudience: string;
    emotionalTriggers: string[];
    scriptStructure: {
      introduction: string;
      body: string;
      conclusion: string;
    };
    visualElements: string[];
    performanceFactors: string[];
    recommendedImprovements: string[];
  };
  transcript: string;
}

interface VideoAnalysisTabsProps {
  video: VideoData;
}

export function OverviewTab({ video }: VideoAnalysisTabsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content Themes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {video.deepAnalysis.contentThemes.map((theme) => (
              <Badge key={theme} variant="outline">
                {theme}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Target Audience</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{video.deepAnalysis.targetAudience}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Emotional Triggers</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {video.deepAnalysis.emotionalTriggers.map((trigger) => (
              <li key={trigger} className="flex items-start gap-2 text-sm">
                <span className="mt-1 text-yellow-500">★</span>
                {trigger}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Script Structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="mb-1 text-sm font-medium">Introduction</div>
            <p className="text-muted-foreground text-sm">{video.deepAnalysis.scriptStructure.introduction}</p>
          </div>
          <div>
            <div className="mb-1 text-sm font-medium">Body</div>
            <p className="text-muted-foreground text-sm">{video.deepAnalysis.scriptStructure.body}</p>
          </div>
          <div>
            <div className="mb-1 text-sm font-medium">Conclusion</div>
            <p className="text-muted-foreground text-sm">{video.deepAnalysis.scriptStructure.conclusion}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ComponentsTab({ video }: VideoAnalysisTabsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Badge variant="secondary">Hook</Badge>
            Opening Statement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{video.components.hook}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Badge variant="secondary">Bridge</Badge>
            Transition Element
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{video.components.bridge}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Badge variant="secondary">Golden Nugget</Badge>
            Key Value Proposition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{video.components.nugget}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Badge variant="secondary">WTA</Badge>
            Call to Action
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{video.components.wta}</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function AnalysisTab({ video }: VideoAnalysisTabsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Visual Elements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {video.deepAnalysis.visualElements.map((element) => (
                <li key={element} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 text-blue-500">•</span>
                  {element}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {video.deepAnalysis.performanceFactors.map((factor) => (
                <li key={factor} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 text-green-500">✓</span>
                  {factor}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recommended Improvements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            {video.deepAnalysis.recommendedImprovements.map((improvement) => (
              <div key={improvement} className="bg-muted/30 flex items-start gap-3 rounded-[var(--radius-card)] p-3">
                <span className="mt-0.5 text-orange-500">⚡</span>
                <p className="text-sm">{improvement}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function TranscriptTab({ video }: VideoAnalysisTabsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Full Transcript</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 space-y-3 overflow-y-auto text-sm leading-relaxed">
          {video.transcript.split(". ").map((sentence, index) => {
            const uniqueKey = `${sentence.substring(0, 20)}-${index}`;
            return (
              <p key={uniqueKey} className="text-sm leading-relaxed">
                <span className="text-muted-foreground mr-2">{String(index + 1).padStart(2, "0")}.</span>
                {sentence}
                {sentence.endsWith(".") ? "" : "."}
              </p>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
