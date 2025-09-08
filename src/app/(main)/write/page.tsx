"use client";

import { useState, useEffect, use } from "react";

import FirebaseConfigError from "@/components/firebase-config-error";
import { ScriptCardGrid } from "@/components/script-display";
import { sampleScripts } from "@/components/script-display/sample-data";
import type { VideoScript } from "@/components/script-display/types";
import { StreamlinedScriptWriter } from "@/components/script-generation/streamlined-script-writer";
import BrandHub from "@/components/brand-hub/brand-hub";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ExpandableSection from "@/components/ui/expandable-section";
import { ClientScriptService } from "@/lib/services/client-script-service";
import { useAuth } from "@/contexts/auth-context";

export default function WritePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [hasFirebaseConfig, setHasFirebaseConfig] = useState(false);
  const [isBrandHubOpen, setIsBrandHubOpen] = useState(false);
  const [dailyScripts, setDailyScripts] = useState<VideoScript[] | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const { user, userProfile } = useAuth();

  // Unwrap search params using React.use()
  const params = use(searchParams);

  // Process search params
  const initialPrompt = typeof params.prompt === "string" ? params.prompt : undefined;
  const remountKey = typeof params.new === "string" ? params.new : undefined;
  const fromLibrary = typeof params.from === "string" && params.from === "library";
  const preselectedGenerator = typeof params.generator === "string" ? params.generator : undefined;
  const preselectedTemplate = typeof params.template === "string" ? params.template : undefined;

  useEffect(() => {
    // Check Firebase config on client side
    const isConfigured =
      typeof window !== "undefined" &&
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "demo-api-key";

    setHasFirebaseConfig(!!isConfigured);
  }, []);

  // Fetch top six videos and process them into scripts
  const loadTopSix = async () => {
    try {
      setIsRefreshing(true);
      setProcessedCount(0);
      const res = await fetch("/api/tiktok/top-six", { cache: "no-store" });
      const json = await res.json();
      if (res.ok && json?.ok && Array.isArray(json.videos)) {
        console.log(`🎯 [DailyPicks] Received ${json.videos.length} candidate videos from Top Six`);
        setTotalCount(json.videos.length);

        // Set placeholders immediately
        const placeholders: VideoScript[] = (json.videos as any[]).map((v: any, idx: number) => {
          const secs = typeof v.duration === 'number' ? v.duration : 0;
          const durationLabel = secs ? `${Math.round(secs)}s` : "";
          const title = (v.description as string | undefined)?.slice(0, 80) || `Video ${idx + 1}`;
          return {
            id: idx + 1,
            title,
            duration: durationLabel,
            status: 'loading',
            statusText: 'Processing…',
            sections: [
              { type: 'hook', label: 'Hook', timeRange: '0-3s', dialogue: 'Loading…', action: 'Fetching video' },
              { type: 'bridge', label: 'Bridge', timeRange: '3-8s', dialogue: 'Loading…', action: 'Transcribing' },
              { type: 'golden-nugget', label: 'Golden Nugget', timeRange: '8-20s', dialogue: 'Loading…', action: 'Generating' },
              { type: 'wta', label: 'What To Action', timeRange: '20-30s', dialogue: 'Loading…', action: 'Finalizing' },
            ],
          } satisfies VideoScript;
        });
        setDailyScripts(placeholders);

        // Process each video sequentially
        for (let idx = 0; idx < json.videos.length; idx++) {
          const v = json.videos[idx];
          try {
            console.log(`🎬 [DailyPicks] (${idx + 1}/${json.videos.length}) Start processing`);

            // 1) Transcribe via server pipeline (with TikTok fallback info)
            console.log(`🎙️ [DailyPicks] Transcribing via /api/video/transcribe-from-url`);
            const tRes = await fetch('/api/video/transcribe-from-url', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ videoUrl: v.url, tiktokId: v.itemId, platform: 'tiktok' }),
            });
            const tJson = await tRes.json().catch(() => ({}));
            if (!tRes.ok || !tJson?.success) {
              console.error('❌ [DailyPicks] Transcription failed:', tJson?.error || tRes.statusText);
            }

            const transcript = tJson?.transcript as string | undefined;
            const comp = tJson?.components || {};
            const hookText: string | undefined = comp.hook || (v.description as string | undefined)?.slice(0, 140);

            // 2) Prepare idea for speed-write
            const ideaBase = hookText || (transcript ? transcript.slice(0, 200) : `Script idea from trending video`);
            const idea = String(ideaBase).slice(0, 900);

            let contentFromGen: string | null = null;
            if (user) {
              console.log(`⚡ [DailyPicks] Generating speed-write script`);
              const gen = await ClientScriptService.generateSingle({ idea, length: '60', type: 'speed' } as any);
              if (gen.success && gen.script?.content) {
                contentFromGen = gen.script.content;
              } else {
                console.error('❌ [DailyPicks] Speed-write generation failed:', gen.error);
              }
            } else {
              console.warn('⚠️ [DailyPicks] Not authenticated; skipping speed-write generation');
            }

            // 3) Map to card sections
            const content = contentFromGen || '';
            const parts = content
              ? content.split(/\n\n+/).map((s) => s.trim()).filter(Boolean)
              : [hookText || '', comp.bridge || '', comp.nugget || comp.goldenNugget || '', comp.wta || ''];

            const [hook = idea, bridge = parts[1] || '', nugget = parts[2] || '', wta = parts[3] || ''] = parts;

            const secs = typeof v.duration === 'number' ? v.duration : 0;
            const durationLabel = secs ? `${Math.round(secs)}s` : "";
            const title = (v.description as string | undefined)?.slice(0, 80) || `Video ${idx + 1}`;

            const built: VideoScript = {
              id: idx + 1,
              title,
              duration: durationLabel,
              status: 'ready',
              sections: [
                { type: 'hook', label: 'Hook', timeRange: '0-3s', dialogue: hook, action: 'Open strong' },
                { type: 'bridge', label: 'Bridge', timeRange: '3-8s', dialogue: bridge, action: 'Set context' },
                { type: 'golden-nugget', label: 'Golden Nugget', timeRange: '8-20s', dialogue: nugget, action: 'Deliver insight' },
                { type: 'wta', label: 'What To Action', timeRange: '20-30s', dialogue: wta, action: 'Give next step' },
              ],
            };

            setDailyScripts((prev) => {
              const base = prev && prev.length === placeholders.length ? [...prev] : [...placeholders];
              base[idx] = built;
              return base;
            });

            setProcessedCount((c) => c + 1);
            console.log(`✅ [DailyPicks] (${idx + 1}/${json.videos.length}) Completed`);
          } catch (err) {
            console.error(`❌ [DailyPicks] Error processing video ${idx + 1}:`, err);
            setProcessedCount((c) => c + 1);
          }
        }
      } else {
        setDailyScripts([]);
      }
    } catch (e) {
      setDailyScripts([]);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTopSix();
  }, []);

  if (!hasFirebaseConfig && typeof window !== "undefined") {
    return <FirebaseConfigError />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 font-sans">
      {/* Main content area - constrain height to leave room for expand trigger */}
      <div className="max-h-[calc(100vh-60px)] flex-1 overflow-hidden">
        <StreamlinedScriptWriter
          key={remountKey}
          initialPrompt={initialPrompt}
          fromLibrary={fromLibrary}
          preselectedGenerator={preselectedGenerator}
          preselectedTemplate={preselectedTemplate}
          className="from-background to-background-muted h-full bg-gradient-to-b"
          onBrandModalOpen={() => setIsBrandHubOpen(true)}
        />
      </div>

      {/* Expandable section trigger - always visible at bottom */}
      <ExpandableSection collapsedText="Explore Daily Content" expandedText="Hide Content Library" plain>
        <ScriptCardGrid
          scripts={dailyScripts && dailyScripts.length > 0 ? dailyScripts : sampleScripts}
          title="Daily Picks"
          subtitle={
            dailyScripts && dailyScripts.length > 0
              ? "Top six videos transformed into ready-to-write outlines"
              : "Sample scripts shown (no daily picks available)"
          }
          loading={isRefreshing}
          progressLabel={totalCount ? `Processing ${processedCount}/${totalCount}…` : undefined}
          onRefresh={loadTopSix}
        />
      </ExpandableSection>

      {/* Brand Hub Modal */}
      <Dialog open={isBrandHubOpen} onOpenChange={setIsBrandHubOpen}>
        <DialogContent className="w-[95vw] h-[90vh] p-0 overflow-hidden sm:max-w-none flex flex-col">
          <DialogHeader className="sr-only">
            <DialogTitle>Brand Hub</DialogTitle>
          </DialogHeader>
          <BrandHub />
        </DialogContent>
      </Dialog>
    </div>
  );
}
