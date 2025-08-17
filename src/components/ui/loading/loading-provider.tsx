"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type LoadingType = "page" | "section" | "inline" | "skeleton" | "overlay" | "stream" | "toast";
export type LoadingAction =
  | "fetch"
  | "upload"
  | "generate"
  | "save"
  | "delete"
  | "search"
  | "submit"
  | "sync"
  | string;

export interface LoadingStateEntry {
  id: string;
  type: LoadingType;
  action: LoadingAction;
  message?: string;
  progress?: number;
  error?: string;
  startedAt: number;
  visible: boolean;
}

type LoadingEventType = "start" | "stop" | "update" | "error";

export interface LoadingEvent {
  type: LoadingEventType;
  state: LoadingStateEntry;
}

interface LoadingContextValue {
  states: Map<string, LoadingStateEntry>;
  start: (
    id: string,
    type: LoadingType,
    action: LoadingAction,
    message?: string,
    debounceMs?: number
  ) => void;
  stop: (id: string) => void;
  updateProgress: (id: string, progress: number) => void;
  setMessage: (id: string, message: string) => void;
  setError: (id: string, error: string) => void;
  registerAnalyticsHandler: (handler: (event: LoadingEvent) => void) => () => void;
}

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [states, setStates] = useState<Map<string, LoadingStateEntry>>(new Map());
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const analyticsHandlers = useRef<Set<(event: LoadingEvent) => void>>(new Set());

  const notify = useCallback((event: LoadingEvent) => {
    analyticsHandlers.current.forEach((h) => {
      try {
        h(event);
      } catch {
        // ignore handler failures
      }
    });
  }, []);

  // Expose loading states in development without changing function identities
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // @ts-expect-error - debug exposure for development only
      (window as unknown as Record<string, unknown>).LOADING_STATES = states;
    }
  }, [states]);

  const start = useCallback<LoadingContextValue["start"]>((id, type, action, message, debounceMs = 300) => {
    const entry: LoadingStateEntry = {
      id,
      type,
      action,
      message,
      progress: undefined,
      error: undefined,
      startedAt: Date.now(),
      visible: false,
    };

    setStates((prev) => new Map(prev).set(id, entry));
    notify({ type: "start", state: entry });

    if (debounceTimers.current.get(id)) {
      clearTimeout(debounceTimers.current.get(id));
    }
    const timer = setTimeout(() => {
      setStates((prev) => {
        const next = new Map(prev);
        const current = next.get(id);
        if (current) {
          next.set(id, { ...current, visible: true });
        }
        return next;
      });
    }, Math.max(0, debounceMs));
    debounceTimers.current.set(id, timer);
  }, [notify]);

  const stop = useCallback<LoadingContextValue["stop"]>((id) => {
    if (debounceTimers.current.get(id)) {
      clearTimeout(debounceTimers.current.get(id));
      debounceTimers.current.delete(id);
    }
    setStates((prev) => {
      const next = new Map(prev);
      const state = next.get(id);
      if (state) {
        notify({ type: "stop", state });
      }
      next.delete(id);
      return next;
    });
  }, [notify]);

  const updateProgress = useCallback<LoadingContextValue["updateProgress"]>((id, progress) => {
    setStates((prev) => {
      const next = new Map(prev);
      const current = next.get(id);
      if (current) {
        const updated = { ...current, progress } as LoadingStateEntry;
        next.set(id, updated);
        notify({ type: "update", state: updated });
      }
      return next;
    });
  }, [notify]);

  const setMessage = useCallback<LoadingContextValue["setMessage"]>((id, message) => {
    setStates((prev) => {
      const next = new Map(prev);
      const current = next.get(id);
      if (current) {
        const updated = { ...current, message } as LoadingStateEntry;
        next.set(id, updated);
        notify({ type: "update", state: updated });
      }
      return next;
    });
  }, [notify]);

  const setError = useCallback<LoadingContextValue["setError"]>((id, error) => {
    setStates((prev) => {
      const next = new Map(prev);
      const current = next.get(id);
      if (current) {
        const updated = { ...current, error } as LoadingStateEntry;
        next.set(id, updated);
        notify({ type: "error", state: updated });
      }
      return next;
    });
  }, [notify]);

  const registerAnalyticsHandler = useCallback<LoadingContextValue["registerAnalyticsHandler"]>((handler) => {
    analyticsHandlers.current.add(handler);
    return () => analyticsHandlers.current.delete(handler);
  }, []);

  const value = useMemo<LoadingContextValue>(() => ({
    states,
    start,
    stop,
    updateProgress,
    setMessage,
    setError,
    registerAnalyticsHandler,
  }), [states, start, stop, updateProgress, setMessage, setError, registerAnalyticsHandler]);

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
}

export function useLoadingContext() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoadingContext must be used within LoadingProvider");
  return ctx;
}

