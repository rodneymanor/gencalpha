"use client";

import { useCallback, useMemo } from "react";

import { useLoadingContext, type LoadingAction, type LoadingType } from "./loading-provider";

export function useLoadingState(id: string) {
  const { states, start, stop, updateProgress, setMessage, setError } = useLoadingContext();
  const state = states.get(id);

  const isLoading = !!state;
  const isVisible = !!state?.visible;
  const progress = state?.progress ?? 0;
  const message = state?.message;
  const error = state?.error;

  const begin = useCallback((type: LoadingType, action: LoadingAction, msg?: string, debounceMs?: number) => {
    start(id, type, action, msg, debounceMs);
  }, [id, start]);

  const end = useCallback(() => stop(id), [id, stop]);

  const setProgress = useCallback((value: number) => updateProgress(id, value), [id, updateProgress]);
  const updateMessage = useCallback((msg: string) => setMessage(id, msg), [id, setMessage]);
  const setErrorMessage = useCallback((err: string) => setError(id, err), [id, setError]);

  return useMemo(() => ({
    isLoading,
    isVisible,
    progress,
    message,
    error,
    start: begin,
    stop: end,
    updateProgress: setProgress,
    setMessage: updateMessage,
    setError: setErrorMessage,
  }), [isLoading, isVisible, progress, message, error, begin, end, setProgress, updateMessage, setErrorMessage]);
}

type AsyncOptions<T> = {
  type: LoadingType;
  action: LoadingAction;
  message?: string;
  debounceMs?: number;
  onSuccess?: (result: T) => void;
  onError?: (err: any) => void;
};

export function useAsyncOperation<T>(
  id: string,
  fn: () => Promise<T>,
  { type, action, message, debounceMs = 300, onSuccess, onError }: AsyncOptions<T>
) {
  const { start, stop, setError } = useLoadingContext();

  const execute = useCallback(async () => {
    start(id, type, action, message, debounceMs);
    try {
      const result = await fn();
      onSuccess?.(result);
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Operation failed";
      setError(id, message);
      onError?.(err);
      throw err;
    } finally {
      stop(id);
    }
  }, [id, type, action, message, debounceMs, fn, start, stop, setError, onSuccess, onError]);

  return { execute };
}

export function useIsLoading(id?: string) {
  const { states } = useLoadingContext();
  if (id) return !!states.get(id);
  return states.size > 0;
}

export function useRegisterLoadingAnalytics(handler: (event: { type: string; state: unknown }) => void) {
  const { registerAnalyticsHandler } = useLoadingContext();
  return registerAnalyticsHandler(handler);
}

