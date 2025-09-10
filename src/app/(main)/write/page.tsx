"use client";

import { useState, useEffect, use } from "react";

import BrandHub from "@/components/brand-hub/brand-hub";
import FirebaseConfigError from "@/components/firebase-config-error";
import { ScriptCardGrid } from "@/components/script-display";
import { sampleScripts } from "@/components/script-display/sample-data";
import type { VideoScript } from "@/components/script-display/types";
import { StreamlinedScriptWriter } from "@/components/script-generation/streamlined-script-writer";
import { AnimatedGradientText as MagicAnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import Link from "next/link";
import { Smartphone, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ExpandableSection from "@/components/ui/expandable-section";
import { useAuth } from "@/contexts/auth-context";

export default function WritePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [hasFirebaseConfig, setHasFirebaseConfig] = useState(false);
  const [isBrandHubOpen, setIsBrandHubOpen] = useState(false);
  const [dailyScripts, setDailyScripts] = useState<VideoScript[] | null>(null);
  const [dailyDate, setDailyDate] = useState<string | null>(null);
  const [keywordsUsed, setKeywordsUsed] = useState<string[] | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const { user, userProfile } = useAuth();

  // Unwrap search params using React.use()
  const params = use(searchParams);

  // Process search params
  const initialPrompt = typeof params.prompt === "string" ? params.prompt : undefined;
  const remountKey = typeof params.new === "string" ? params.new : undefined;
  const fromLibrary = typeof params.from === "string" && params.from === "library";
  const preselectedGenerator = typeof params.generator === "string" ? params.generator : undefined;
  const preselectedTemplate = typeof params.template === "string" ? params.template : undefined;
  const preselectedTopic =
    typeof params.topic === "string" ? params.topic : typeof params.category === "string" ? params.category : undefined;

  useEffect(() => {
    // Check Firebase config on client side
    const isConfigured =
      typeof window !== "undefined" &&
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "demo-api-key";

    setHasFirebaseConfig(!!isConfigured);
  }, []);

  // Open Brand Voice modal when brand=1
  useEffect(() => {
    if (typeof params.brand === "string" && params.brand === "1") {
      setIsBrandHubOpen(true);
    }
  }, [params.brand]);

  // Fetch server-processed daily scripts (cached per day)
  const loadTopSix = async (force?: boolean, signal?: AbortSignal) => {
    try {
      setIsRefreshing(true);
      setErrorMsg(null);
      setProcessedCount(0);
      const topicParam = preselectedTopic ?? (userProfile as any)?.contentTopic ?? undefined;
      const search = new URLSearchParams();
      if (topicParam) search.set("topic", String(topicParam));
      if (force) search.set("force", "1");
      if (user?.uid) search.set("userId", user.uid);
      const qs = search.toString();
      const url = `/api/tiktok/daily-picks${qs ? `?${qs}` : ""}`;
      const res = await fetch(url, { cache: "no-store", signal });
      const json = await res.json();
      if (res.ok && json?.ok && Array.isArray(json.scripts)) {
        if (Array.isArray(json.keywordsUsed)) {
          setKeywordsUsed(json.keywordsUsed as string[]);
          console.log(`🔑 [DailyPicks] Keywords used: ${json.keywordsUsed.join(", ")}`);
        } else {
          setKeywordsUsed(null);
        }
        setActiveQuery(null);
        setDailyDate(typeof json.date === "string" ? json.date : null);
        setTotalCount(json.scripts.length);
        setDailyScripts(json.scripts as VideoScript[]);
        setProcessedCount(json.scripts.length);
      } else {
        setDailyScripts([]);
        setErrorMsg(String(json?.error || "Failed to load daily picks"));
      }
    } catch (e: any) {
      if (e?.name === "AbortError") return; // ignore aborted fetches
      setDailyScripts([]);
      setErrorMsg("Request failed. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch ad-hoc picks for a specific keyword/hashtag
  const loadByKeyword = async (kw: string, signal?: AbortSignal) => {
    const keyword = String(kw || "").trim();
    if (!keyword) return;
    try {
      setIsRefreshing(true);
      setErrorMsg(null);
      setProcessedCount(0);
      const search = new URLSearchParams();
      search.set("keyword", keyword);
      if (user?.uid) search.set("userId", user.uid);
      const url = `/api/tiktok/search-picks?${search.toString()}`;
      const res = await fetch(url, { cache: "no-store", signal });
      const json = await res.json();
      if (res.ok && json?.ok && Array.isArray(json.scripts)) {
        setKeywordsUsed([keyword]);
        setActiveQuery(keyword);
        setDailyDate(null);
        setTotalCount(json.scripts.length);
        setDailyScripts(json.scripts as VideoScript[]);
        setProcessedCount(json.scripts.length);
      } else {
        setDailyScripts([]);
        setErrorMsg(String(json?.error || "No results for that keyword"));
      }
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setDailyScripts([]);
      setErrorMsg("Request failed. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const resolvedTopic = preselectedTopic ?? ((userProfile as any)?.contentTopic as string | undefined) ?? null;

  useEffect(() => {
    // Always attempt to load daily picks; server may infer topic from profile.
    const controller = new AbortController();
    loadTopSix(false, controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTopic, user?.uid]);

  if (!hasFirebaseConfig && typeof window !== "undefined") {
    return <FirebaseConfigError />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 font-sans">
      {/* Pill now injected into hero via heroBanner prop */}
      {/* Main content area - constrain height to leave room for expand trigger */}
      <div className="-mt-[75px] max-h-[calc(100vh-52px)] flex-1 overflow-hidden">
        <StreamlinedScriptWriter
          key={remountKey}
          initialPrompt={initialPrompt}
          fromLibrary={fromLibrary}
          preselectedGenerator={preselectedGenerator}
          preselectedTemplate={preselectedTemplate}
          heroBanner={
            <Link href="/downloads" className="group hidden sm:block">
              <div className="group relative mx-auto flex items-center justify-center rounded-full px-3 py-1 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f]">
                <span
                  className="absolute inset-0 block h-full w-full animate-gradient rounded-[inherit] bg-gradient-to-r from-transparent via-[var(--ring)] to-transparent bg-[length:300%_100%] p-[1px]"
                  style={{
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "destination-out",
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    // @ts-ignore - maskComposite is not fully typed in React CSSProperties
                    maskComposite: "subtract",
                    WebkitClipPath: "padding-box",
                  }}
                />
                <span className="relative z-10 flex items-center">
                  <Smartphone className="mr-2 h-3.5 w-3.5 text-neutral-600 transition-colors group-hover:text-neutral-800" />
                  <span className="mx-2 h-3.5 w-px shrink-0 bg-neutral-500" />
                  <MagicAnimatedGradientText
                    className="text-sm font-normal"
                    colorFrom="var(--neutral-900)"
                    colorTo="var(--ring)"
                    speed={1}
                  >
                    Introducing iOS Shortcuts
                  </MagicAnimatedGradientText>
                  <ChevronRight className="ml-1 h-3.5 w-3.5 stroke-neutral-500 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          }
          className="from-background to-background-muted h-full bg-gradient-to-b"
          onBrandModalOpen={() => setIsBrandHubOpen(true)}
        />
      </div>
      <ExpandableSection
        className="mt-auto mb-5"
        collapsedText="Explore Daily Content"
        expandedText="Hide Content Library"
        plain
      >
        {/* On-demand topic/hashtag search */}
        <div className="mb-4 flex items-center gap-2 px-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                loadByKeyword(query);
              }
            }}
            placeholder="Search topic or #hashtag"
            className="h-9 w-full max-w-md rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-neutral-300"
            aria-label="Search topic or hashtag"
          />
          <button
            type="button"
            className="h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-700 hover:bg-neutral-50"
            onClick={() => loadByKeyword(query)}
            disabled={isRefreshing || !query.trim()}
            aria-label="Search"
            title="Search"
          >
            Search
          </button>
        </div>
        <ScriptCardGrid
          scripts={dailyScripts && dailyScripts.length > 0 ? dailyScripts : sampleScripts}
          title={activeQuery ? `Picks for "${activeQuery}"` : "Daily Picks"}
          subtitle={(() => {
            if (errorMsg) return `Error: ${errorMsg}`;
            if (dailyScripts && dailyScripts.length > 0) {
              const datePart = dailyDate && !activeQuery ? `Picks for ${dailyDate}` : undefined;
              const kwPart = keywordsUsed && keywordsUsed.length ? `Keywords: ${keywordsUsed.join(", ")}` : undefined;
              const base = "Top six videos transformed into ready-to-write outlines";
              return [base, datePart, kwPart].filter(Boolean).join(" • ");
            }
            return "Sample scripts shown (no daily picks available)";
          })()}
          loading={isRefreshing}
          progressLabel={totalCount ? `Processing ${processedCount}/${totalCount}…` : undefined}
          onRefresh={() => (activeQuery ? loadByKeyword(activeQuery) : loadTopSix(true))}
        />
      </ExpandableSection>

      {/* Brand Hub Modal */}
      <Dialog open={isBrandHubOpen} onOpenChange={setIsBrandHubOpen}>
        <DialogContent className="flex h-[90vh] w-[95vw] flex-col overflow-hidden p-0 sm:max-w-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Brand Hub</DialogTitle>
          </DialogHeader>
          <BrandHub />
        </DialogContent>
      </Dialog>
    </div>
  );
}
