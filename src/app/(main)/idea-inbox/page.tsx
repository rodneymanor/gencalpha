'use client';

// Idea Inbox Page - Alias to ContentInbox during migration
// Phase 1: Route alias pointing to existing ContentInbox component

import { ContentInbox } from '@/components/content-inbox';

export default function IdeaInboxPage() {
  return <ContentInbox />;
}