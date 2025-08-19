"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { auth as firebaseAuth } from "@/lib/firebase";
import { detectSocialLink, type DetectionResult } from "@/lib/utils/social-link-detector";

export type SupportedPlatform = false | "instagram" | "tiktok" | null;

export function useUrlDetection(inputText: string) {
  const [linkDetection, setLinkDetection] = useState<DetectionResult | null>(null);
  const [urlCandidate, setUrlCandidate] = useState<string | null>(null);
  const [urlSupported, setUrlSupported] = useState<SupportedPlatform>(null);
  const [isUrlProcessing, setIsUrlProcessing] = useState(false);

  const hasValidVideoUrl = useMemo(() => Boolean(urlCandidate && urlSupported), [urlCandidate, urlSupported]);

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      const detection = detectSocialLink(inputText);
      setLinkDetection(detection);
      if (detection.type !== "instagram" && detection.type !== "tiktok") {
        setUrlCandidate(null);
        setUrlSupported(null);
        setIsUrlProcessing(false);
        return;
      }
      setUrlCandidate(detection.url ?? null);
      setIsUrlProcessing(true);
      try {
        const token =
          firebaseAuth && firebaseAuth.currentUser && typeof firebaseAuth.currentUser.getIdToken === "function"
            ? await firebaseAuth.currentUser.getIdToken()
            : undefined;
        const res = await fetch("/api/url/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ url: detection.url }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(String(res.status));
        const data: {
          success: boolean;
          isSupported: boolean;
          isReachable: boolean;
          platform: "instagram" | "tiktok" | null;
        } = await res.json();
        setUrlSupported(data.success && data.isSupported && data.platform ? data.platform : false);
      } catch {
        setUrlSupported(false);
      } finally {
        setIsUrlProcessing(false);
      }
    };
    const handle = setTimeout(() => {
      void run();
    }, 300);
    return () => {
      clearTimeout(handle);
      controller.abort();
    };
  }, [inputText]);

  const detectManually = useCallback((text: string) => {
    const detection = detectSocialLink(text);
    setLinkDetection(detection);
  }, []);

  return {
    linkDetection,
    urlCandidate,
    urlSupported,
    isUrlProcessing,
    hasValidVideoUrl,
    detectManually,
  } as const;
}

export default useUrlDetection;


