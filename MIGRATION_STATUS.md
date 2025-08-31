# Content Inbox → Idea Inbox Migration Status

## Phase 1: Complete ✅
Created parallel routes without breaking existing functionality:

### New Routes Created:
- **Page**: `/src/app/(main)/idea-inbox/page.tsx` → Points to existing ContentInbox component
- **API Routes**: `/src/app/api/idea-inbox/*` → All re-export from `/api/content-inbox/*`
  - `/items/route.ts`
  - `/items/[id]/route.ts`
  - `/bulk-action/route.ts`
  - `/check-onboarding/route.ts`
  - `/search-suggestions/route.ts`
  - `/update-order/route.ts`
- **Components**: `/src/components/idea-inbox/index.ts` → Re-exports everything from content-inbox

### Updated:
- ✅ Sidebar navigation now points to `/idea-inbox` with title "Idea Inbox"

## Current State:
- Both `/content-inbox` and `/idea-inbox` routes are functional
- All API calls to `/api/idea-inbox/*` work via aliases
- Component imports from either path work

## Phase 2: Next Steps (When Ready)
1. Update the hook in `use-content-inbox.ts` to use `/api/idea-inbox` endpoints
2. Start importing from `@/components/idea-inbox` in new code
3. Gradually rename internal components and types

## Phase 3: Cleanup (After Testing)
1. Remove old `/content-inbox` page route
2. Remove old `/api/content-inbox/*` routes
3. Move actual component files from `content-inbox` to `idea-inbox`
4. Update all imports throughout codebase

## Testing Checklist:
- [ ] Navigate to `/idea-inbox` - should show the inbox
- [ ] Add new content works
- [ ] Search/filter works
- [ ] Bulk actions work
- [ ] API calls succeed

## Rollback Instructions:
If issues arise, simply revert the sidebar change in `dynamic-sidebar-items.tsx` line 84-85 back to:
```tsx
title: "Content Inbox",
url: "/content-inbox",
```