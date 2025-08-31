// Idea Inbox Items API - Alias to content-inbox during migration
// Phase 1: API route alias

import { NextRequest } from 'next/server';

// Re-export all methods from content-inbox route
export { GET, POST, DELETE } from '@/app/api/content-inbox/items/route';