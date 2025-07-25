# Instagram API Integration Guide

> **⚠️ DEPRECATED**: This guide has been superseded by the comprehensive [Apify Integration Guide](./apify-integration-guide.md) which covers both Instagram and TikTok integrations with current working endpoints.

## Overview

This document provides a comprehensive guide to the Instagram API integration system built for Gen.C Alpha. The system uses Apify's Instagram Scraper Actor to extract video metadata, download URLs, and engagement data from Instagram posts and reels.

**For the most up-to-date information, please refer to the [Apify Integration Guide](./apify-integration-guide.md).**

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [API Endpoints](#api-endpoints)
- [Apify Integration](#apify-integration)
- [Sync vs Async Methods](#sync-vs-async-methods)
- [Background Processing](#background-processing)
- [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)
- [Future Enhancements](#future-enhancements)

## Architecture Overview

The Instagram API system consists of three main components:

1. **Apify Instagram Scraper** (`src/lib/apify-instagram-scraper.ts`)
2. **Background Queue System** (`src/lib/simple-video-queue.ts`)
3. **API Endpoints** (`src/app/api/video/`)

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend UI   │───▶│   API Endpoint   │───▶│  Background     │
│                 │    │                  │    │  Queue System   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │ Apify Instagram  │    │   Real-time     │
                       │    Scraper       │    │  Notifications  │
                       └──────────────────┘    └─────────────────┘
```

## API Endpoints

### Current Endpoints

#### 1. Add Video to Queue
**Endpoint:** `POST /api/video/add-to-queue`

**Purpose:** Immediately queues an Instagram video for background processing

**Request Body:**
```json
{
  "videoUrl": "https://www.instagram.com/reel/ABC123...",
  "collectionId": "optional-collection-id",
  "userId": "user-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Video added to processing queue",
  "job": {
    "id": "job_1234567890",
    "status": "pending",
    "progress": 0,
    "message": "Video queued for processing",
    "estimatedTime": "30-60 seconds"
  },
  "instructions": {
    "polling": "Check /api/video/processing-status for updates",
    "notification": "Watch the notification badge in the top-right corner",
    "timeline": [
      "Extracting video metadata (10-20s)",
      "Getting download links (5-10s)", 
      "Adding to collection (10-20s)",
      "Complete!"
    ]
  }
}
```

#### 2. Processing Status
**Endpoint:** `GET /api/video/processing-status`

**Purpose:** Get real-time status of all processing jobs

**Response:**
```json
{
  "success": true,
  "activeJobs": [
    {
      "id": "job_1234567890",
      "status": "processing",
      "progress": 45,
      "message": "Extracting video metadata...",
      "videoUrl": "https://www.instagram.com/reel/ABC123...",
      "startTime": "2025-07-25T15:30:00Z"
    }
  ],
  "stats": {
    "total": 15,
    "pending": 2,
    "processing": 1,
    "completed": 10,
    "failed": 2
  },
  "timestamp": "2025-07-25T15:35:00Z"
}
```

#### 3. Test Instagram Endpoint
**Endpoint:** `POST /api/test-instagram`

**Purpose:** Test Instagram URL scraping with both sync and async methods

**Request Body:**
```json
{
  "url": "https://www.instagram.com/reel/ABC123...",
  "method": "sync" // or "async"
}
```

## Apify Integration

### ApifyInstagramScraper Class

Located in `src/lib/apify-instagram-scraper.ts`, this class provides a comprehensive interface to Apify's Instagram Scraper Actor.

#### Key Features:
- **Sync scraping** for quick single-URL requests (≤60s)
- **Async scraping** for larger jobs with polling
- **URL validation** and shortcode extraction
- **Comprehensive error handling** with detailed logging
- **Utility methods** for extracting video/image URLs

#### Configuration:
```typescript
const scraper = new ApifyInstagramScraper(process.env.APIFY_TOKEN);
```

#### Environment Variables:
```env
APIFY_TOKEN=apify_api_YOUR_TOKEN_HERE
```

## Sync vs Async Methods

### Sync Method (`scrapeSyncQuick`)
**Best for:** Single URLs, testing, quick results

**Characteristics:**
- **Endpoint:** `/run-sync-get-dataset-items`
- **Timeout:** 60 seconds maximum
- **Response:** Immediate results
- **Use case:** Single video processing, real-time testing

**Example:**
```typescript
const results = await scraper.scrapeSyncQuick(url);
```

### Async Method (`scrapeAsync` → `pollRun` → `getResults`)
**Best for:** Multiple URLs, production workloads, complex jobs

**Characteristics:**
- **Endpoints:** `/runs` → `/actor-runs/{runId}` → `/datasets/{datasetId}/items`
- **Timeout:** 10 minutes maximum (configurable)
- **Response:** 3-step process with polling
- **Use case:** Background processing, multiple videos, user profiles

**Example:**
```typescript
const runInfo = await scraper.scrapeAsync(urls);
const completedRun = await scraper.pollRun(runInfo.id);
const results = await scraper.getResults(completedRun.defaultDatasetId);
```

### Response Structure

Both methods return `ApifyInstagramResult[]` with this structure:

```typescript
interface ApifyInstagramResult {
  shortCode: string;           // Instagram post ID
  caption?: string;            // Post caption/description
  hashtags: string[];          // Array of hashtags
  likesCount: number;          // Number of likes
  videoViewCount?: number;     // Video view count
  commentsCount: number;       // Number of comments
  timestamp: string;           // Post creation date
  displayUrl?: string;         // Thumbnail image URL
  videoUrl?: string;           // Direct video download URL
  videoUrlBackup?: string;     // Backup video URL
  imageUrl?: string;           // Image URL (for photos)
  thumbnailUrl?: string;       // Thumbnail URL
  ownerUsername: string;       // Profile username
  ownerFullName?: string;      // Profile display name
  isVideo: boolean;            // Whether content is video
  videoDurationSeconds?: number; // Video length
  location?: {                 // Location data (if available)
    name: string;
    id: string;
  };
  mentions: string[];          // @mentioned users
  url: string;                 // Instagram URL
}
```

## Background Processing

### Simple Video Queue System

The background processing system (`src/lib/simple-video-queue.ts`) provides:

- **In-memory job queue** with automatic processing
- **Real-time status updates** via polling
- **Progress tracking** with detailed messages
- **Error handling** with retry logic
- **Job lifecycle management** (pending → processing → completed/failed)

### Job Status Flow:
```
pending → processing → completed
   ↓           ↓
failed ←─── timeout
```

### Admin Feedback System:
- **Notification Badge**: Top-right corner showing active/completed jobs
- **Progress Indicators**: Real-time progress bars and status messages
- **Processing Placeholders**: Visual cards showing processing videos
- **Immediate Response**: Dialog closes instantly while processing continues

## Error Handling

### Common Error Scenarios:

1. **Invalid Instagram URL**
   ```json
   {
     "success": false,
     "error": "Please provide a valid Instagram URL (reels, posts, or IGTV)"
   }
   ```

2. **Apify API Error**
   ```json
   {
     "success": false,
     "error": "Apify API error: 401 - Invalid token"
   }
   ```

3. **Processing Timeout**
   ```json
   {
     "success": false,
     "error": "Processing timeout exceeded (60s)"
   }
   ```

4. **Network Error**
   ```json
   {
     "success": false,
     "error": "Network error connecting to Apify API"
   }
   ```

### Error Recovery:
- **Automatic retries** for network failures
- **Fallback mechanisms** between sync/async methods
- **Graceful degradation** with detailed error messages
- **Background job recovery** after server restarts

## Usage Examples

### Basic Video Processing

```typescript
// Add video to background queue
const response = await fetch('/api/video/add-to-queue', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoUrl: 'https://www.instagram.com/reel/ABC123...',
    collectionId: 'my-collection',
    userId: 'user123'
  })
});

const result = await response.json();
console.log('Job ID:', result.job.id);
```

### Real-time Status Monitoring

```typescript
// Poll for job status updates
const pollStatus = async () => {
  const response = await fetch('/api/video/processing-status');
  const status = await response.json();
  
  status.activeJobs.forEach(job => {
    console.log(`Job ${job.id}: ${job.progress}% - ${job.message}`);
  });
};

// Poll every 2 seconds
setInterval(pollStatus, 2000);
```

### Direct Apify Usage (Advanced)

```typescript
import { createApifyInstagramScraper } from '@/lib/apify-instagram-scraper';

const scraper = createApifyInstagramScraper();

// Quick sync scraping
const results = await scraper.scrapeSyncQuick(
  'https://www.instagram.com/reel/ABC123...'
);

// Extract video URL
const videoUrl = ApifyInstagramScraper.getVideoUrl(results[0]);
console.log('Download URL:', videoUrl);
```

## URL Validation

The system supports these Instagram URL patterns:

- `https://www.instagram.com/reel/ABC123...`
- `https://www.instagram.com/reels/ABC123...`
- `https://www.instagram.com/p/ABC123...` (posts)
- `https://www.instagram.com/tv/ABC123...` (IGTV)
- `https://instagram.com/reel/ABC123...` (without www)
- `https://instagr.am/p/ABC123...` (short domain)

### Validation Function:
```typescript
const isValid = ApifyInstagramScraper.isValidInstagramUrl(url);
const shortCode = ApifyInstagramScraper.extractShortcode(url);
```

## Future Enhancements

### User Profile Integration (Coming Soon)

The next major enhancement will add user profile scraping capabilities:

#### New Endpoint: `POST /api/profile/scrape`
```json
{
  "username": "instagram_username",
  "options": {
    "includeRecentPosts": true,
    "postLimit": 50,
    "includeReels": true,
    "includeStories": false
  }
}
```

#### Expected Response:
```json
{
  "success": true,
  "profile": {
    "username": "instagram_username",
    "fullName": "Display Name",
    "biography": "Bio text...",
    "followersCount": 12500,
    "followingCount": 800,
    "postsCount": 150,
    "isVerified": false,
    "isPrivate": false,
    "profilePicUrl": "https://...",
    "externalUrl": "https://website.com"
  },
  "posts": [
    {
      "shortCode": "ABC123",
      "url": "https://www.instagram.com/p/ABC123/",
      "type": "video|image",
      "timestamp": "2025-07-25T15:30:00Z",
      "caption": "Post caption...",
      "likesCount": 500,
      "commentsCount": 25
    }
  ],
  "job": {
    "id": "profile_job_123",
    "status": "completed",
    "processedPosts": 25,
    "totalPosts": 25
  }
}
```

### Additional Planned Features:

1. **Bulk URL Processing**
   - Upload CSV/text files with multiple URLs
   - Batch processing with progress tracking
   - Export results to various formats

2. **Advanced Filtering**
   - Filter by engagement metrics
   - Date range filtering
   - Content type filtering (videos only, images only)

3. **Analytics Dashboard**
   - Processing success rates
   - Performance metrics
   - Usage statistics

4. **Webhook Integration**
   - Real-time notifications via webhooks
   - Integration with external services
   - Custom callback URLs

5. **Caching Layer**
   - Redis integration for result caching
   - Reduced API calls for duplicate requests
   - Configurable cache expiration

## Configuration

### Environment Variables

```env
# Required
APIFY_TOKEN=apify_api_YOUR_TOKEN_HERE

# Optional
APIFY_TIMEOUT_SYNC=60000        # 60 seconds
APIFY_TIMEOUT_ASYNC=600000      # 10 minutes
APIFY_MEMORY_MB=1024           # Memory allocation
APIFY_RETRY_ATTEMPTS=3         # Retry failed requests
```

### Rate Limits

- **Sync Method**: ~30 requests/minute
- **Async Method**: ~200 requests/minute
- **Daily Limits**: Based on Apify subscription plan

### Best Practices

1. **Use sync method** for single URLs and testing
2. **Use async method** for multiple URLs and production
3. **Implement proper error handling** for all API calls
4. **Monitor rate limits** to avoid API throttling
5. **Cache results** when possible to reduce API usage
6. **Use background processing** for user-facing features

---

*This guide will be updated as new features are added and the system evolves.*