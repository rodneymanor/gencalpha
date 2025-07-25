# Collections Integration Plan: Apify API Endpoints

## Overview
Seamlessly integrate new Apify API endpoints into existing collections workflow while maintaining backward compatibility and eliminating bugs.

## Current State Analysis

### ✅ WORKING COMPONENTS (Keep As-Is)
- `AddVideoDialog` - Frontend component with validation
- `VideoProcessingContext` - Real-time status polling
- `simple-video-queue.ts` - Background processing queue
- `process-and-add` API route - Core processing workflow
- Bunny CDN streaming integration
- Firestore collections management
- RBAC and permissions system

### ❌ COMPONENTS TO REPLACE
- `/api/video/downloader/route.ts` - Replace with new Apify endpoints
- `video-processing-helpers.ts` - Replace TikTok/Instagram download logic
- `apify-instagram-scraper.ts` - Upgrade to use new unified endpoints

### 🔧 NEW INTEGRATION POINTS
- `/api/apify/instagram/reel` - For Instagram videos
- `/api/apify/tiktok/scraper` - For TikTok videos (with postURLs)
- Unified video metadata extraction
- Enhanced error handling and retry logic

## Implementation Strategy

### Phase 1: Create Unified Video Scraper Service
**File:** `src/lib/unified-video-scraper.ts`

**Purpose:** Single interface to handle both TikTok and Instagram via Apify
- Detect platform from URL
- Route to appropriate Apify endpoint
- Standardize response format
- Handle errors gracefully

### Phase 2: Update Video Queue Processing
**File:** `src/lib/simple-video-queue.ts`

**Changes:**
- Replace `scrapeInstagramUrl()` call with new unified scraper
- Add TikTok support using `postURLs` parameter
- Enhance metadata extraction
- Improve error handling

### Phase 3: Replace Video Downloader
**File:** `src/app/api/video/downloader/route.ts`

**Changes:**
- Remove old TikTok/Instagram download libraries
- Use new Apify endpoints exclusively
- Maintain same API interface for backward compatibility
- Add comprehensive logging

### Phase 4: Frontend Validation Updates
**File:** `src/app/(main)/dashboard/collections/_components/add-video-dialog.tsx`

**Changes:**
- Expand URL validation to support more TikTok formats
- Add better error messaging
- Support both short and full TikTok URLs

### Phase 5: Testing & Validation
- Test Instagram reel URLs
- Test TikTok video URLs (both short and full)
- Test error scenarios
- Validate queue processing
- Check video streaming and transcription

## Technical Implementation Details

### New Unified Video Scraper Interface
```typescript
interface UnifiedVideoResult {
  platform: 'tiktok' | 'instagram';
  videoUrl: string;
  thumbnailUrl: string;
  title: string;
  author: string;
  description: string;
  hashtags: string[];
  metrics: {
    likes: number;
    views: number;
    comments: number;
    shares: number;
  };
  metadata: any;
}

class UnifiedVideoScraper {
  async scrapeUrl(url: string): Promise<UnifiedVideoResult>
  static detectPlatform(url: string): 'tiktok' | 'instagram' | 'unsupported'
  static validateUrl(url: string): boolean
}
```

### URL Validation Patterns
```typescript
const URL_PATTERNS = {
  instagram: /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/(p|reel|reels|tv)\/[A-Za-z0-9_-]+/,
  tiktok: /^https?:\/\/(www\.)?(tiktok\.com\/@[\w.-]+\/video\/\d+|vm\.tiktok\.com\/[A-Za-z0-9]+|tiktok\.com\/t\/[A-Za-z0-9]+)/
};
```

### API Integration Points
1. **Instagram:** `/api/apify/instagram/reel` with URL parameter
2. **TikTok:** `/api/apify/tiktok/scraper` with `postURLs` parameter
3. **Error Handling:** Comprehensive retry logic and fallbacks

## Migration Safety Measures

### 1. Backward Compatibility
- Keep existing API interfaces unchanged
- Maintain same response formats
- Preserve error handling patterns

### 2. Gradual Rollout
- Test new scraper alongside old one
- Feature flag for switching between implementations
- Comprehensive logging for debugging

### 3. Rollback Plan
- Keep old code in place initially
- Easy switch back if issues arise
- Database schema remains unchanged

## Success Criteria

### ✅ Functional Requirements
- [ ] Instagram reel URLs work seamlessly
- [ ] TikTok video URLs work (both short and full)
- [ ] Video metadata extraction accurate
- [ ] Thumbnails generate correctly
- [ ] Real-time processing status updates
- [ ] Error scenarios handled gracefully

### ✅ Technical Requirements
- [ ] No breaking changes to existing API
- [ ] Performance equal or better than current
- [ ] Comprehensive error logging
- [ ] Memory usage optimized
- [ ] Queue processing reliable

### ✅ User Experience
- [ ] Same or faster processing times
- [ ] Clear error messages
- [ ] Progress indicators working
- [ ] No data loss or corruption
- [ ] Seamless video playback

## Timeline
- **Day 1:** Create unified video scraper
- **Day 2:** Update queue processing and downloader
- **Day 3:** Frontend validation improvements
- **Day 4:** Testing and validation
- **Day 5:** Bug fixes and optimization

## Risk Mitigation
- Keep old code paths available for rollback
- Extensive testing with real URLs
- Monitor performance metrics
- User feedback collection
- Gradual feature rollout