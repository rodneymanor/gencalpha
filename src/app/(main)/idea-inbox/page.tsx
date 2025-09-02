'use client';

// Idea Inbox Page - Redirects to unified Library with inspiration filter
// Phase 2: Redirect to Library page with captured content filter

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function IdeaInboxPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to library with captured content filter
    router.replace('/library?source=captured');
  }, [router]);
  
  // Show loading state while redirecting
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex items-center gap-2 text-neutral-600">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600"></div>
        <span>Redirecting to Library...</span>
      </div>
    </div>
  );
}