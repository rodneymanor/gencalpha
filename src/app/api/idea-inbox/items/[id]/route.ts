// Idea Inbox Item by ID API - Alias to content-inbox during migration
// Phase 1: API route alias

// Re-export available methods from content-inbox route
export { PATCH, DELETE } from '@/app/api/content-inbox/items/[id]/route';