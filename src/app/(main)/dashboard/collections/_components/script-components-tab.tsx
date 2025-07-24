"use client";

import { Zap, ArrowRight, TrendingUp, Target, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VideoComponents {
  hook: string;
  bridge: string;
  nugget: string;
  wta: string;
}

interface ScriptComponentsTabProps {
  components: VideoComponents | undefined;
  copiedText: string;
  onCopy: (text: string, label: string) => void;
}

export function ScriptComponentsTab({ components, copiedText, onCopy }: ScriptComponentsTabProps) {
  if (!components) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50">📝</div>
          <h3 className="text-lg font-semibold mb-2">No Script Components</h3>
          <p className="text-muted-foreground mb-4">
            Script components haven&apos;t been analyzed yet for this video.
          </p>
          <Button>Analyze Script Components</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Hook
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopy(components.hook, "hook")}
            >
              {copiedText === "hook" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{components.hook}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-blue-500" />
              Bridge
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopy(components.bridge, "bridge")}
            >
              {copiedText === "bridge" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{components.bridge}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-500" />
              Golden Nugget
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopy(components.nugget, "nugget")}
            >
              {copiedText === "nugget" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{components.nugget}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              What To Action (WTA)
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopy(components.wta, "wta")}
            >
              {copiedText === "wta" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{components.wta}</p>
        </CardContent>
      </Card>
    </div>
  );
}