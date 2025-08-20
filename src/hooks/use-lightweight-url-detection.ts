/**
 * Lightweight URL detection hook
 * Replaces use-url-detection.ts with immediate regex-based validation
 */

import { useState, useEffect } from "react";

import { detectSocialUrl, type LightweightDetectionResult } from "@/lib/utils/lightweight-url-detector";

interface UseLightweightUrlDetectionReturn {
  detection: LightweightDetectionResult;
  isProcessing: boolean;
}

/**
 * Immediate URL detection with minimal debounce (50ms for UX smoothness)
 * No network calls, no API validation - pure client-side regex
 */
export function useLightweightUrlDetection(inputText: string): UseLightweightUrlDetectionReturn {
  const [detection, setDetection] = useState<LightweightDetectionResult>({
    isValid: false,
    platform: null,
    url: null,
    contentType: null,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Minimal debounce for UX (50ms vs 300ms)
    const timeoutId = setTimeout(() => {
      setIsProcessing(true);

      // Immediate detection - no async operations
      const result = detectSocialUrl(inputText);
      setDetection(result);

      // Processing complete immediately
      setIsProcessing(false);
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [inputText]);

  return { detection, isProcessing };
}

/**
 * Even simpler hook for just checking if input contains valid social URL
 */
export function useIsSocialUrl(inputText: string): boolean {
  const { detection } = useLightweightUrlDetection(inputText);
  return detection.isValid;
}

/**
 * Hook for getting just the platform
 */
export function usePlatformDetection(inputText: string): "instagram" | "tiktok" | null {
  const { detection } = useLightweightUrlDetection(inputText);
  return detection.platform;
}
