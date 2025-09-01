'use client';

// React Query Client Provider

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: how long until a query is considered stale
      staleTime: 1000 * 60 * 5, // 5 minutes
      // Cache time: how long data stays in cache after component unmounts
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      // Retry configuration
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Retry configuration for mutations
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query Devtools disabled - uncomment to enable */}
      {/* {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )} */}
    </QueryClientProvider>
  );
}