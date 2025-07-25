# Apify Social Media API Integration Guide

## Overview

This document provides a comprehensive guide to the Apify API integration system built for Gen.C Alpha. The system uses various Apify actors to extract video metadata, download URLs, and engagement data from Instagram and TikTok content, with support for profiles, individual posts, hashtags, and search queries.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Actor Configuration](#actor-configuration)
- [API Endpoints](#api-endpoints)
- [Instagram Integration](#instagram-integration)
- [TikTok Integration](#tiktok-integration)
- [Background Processing](#background-processing)
- [Testing Interface](#testing-interface)
- [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)
- [Configuration](#configuration)

## Architecture Overview

The Apify integration system consists of multiple specialized scrapers:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend UI   │───▶│   API Gateway    │───▶│  Apify Actors   │
│   Test Console  │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │ Background Queue │    │   Data Storage  │
                       │    Processing    │    │   & Analytics   │
                       └──────────────────┘    └─────────────────┘
```

## Actor Configuration

### Supported Apify Actors

All actor names use the tilde (`~`) format for proper API compatibility:

```typescript
export const APIFY_ACTORS = {
  INSTAGRAM_PROFILE: "apify~instagram-profile-scraper",
  INSTAGRAM_REEL: "apify~instagram-reel-scraper", 
  INSTAGRAM_HASHTAG: "apify~instagram-hashtag-scraper",
  TIKTOK_PROFILE: "clockworks~tiktok-profile-scraper",
  TIKTOK_SCRAPER: "clockworks~tiktok-scraper",
} as const;
```

### Core ApifyClient Class

Located in `src/lib/apify.ts`, provides comprehensive logging and error handling:

```typescript
const client = new ApifyClient(process.env.APIFY_TOKEN);

// All actors support both sync and async modes
const results = await client.runActor(actorId, input, waitForFinish);
```

## API Endpoints

### Instagram Endpoints

#### 1. Instagram Profile Scraper
**Endpoint:** `POST /api/apify/instagram/profile`

**Purpose:** Extract Instagram user profile data and recent posts

**Request Body:**
```json
{
  "username": "apifyoffice",
  "includeDetails": true,
  "resultsLimit": 50
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "username": "apifyoffice",
      "fullName": "Apify",
      "biography": "Web scraping and automation platform",
      "followersCount": 15000,
      "followingCount": 500,
      "postsCount": 200,
      "isVerified": true,
      "profilePicUrl": "https://...",
      "isPrivate": false,
      "posts": [
        {
          "id": "ABC123",
          "shortcode": "ABC123",
          "url": "https://www.instagram.com/p/ABC123/",
          "type": "video",
          "caption": "Post caption...",
          "timestamp": "2025-07-25T15:30:00Z",
          "likesCount": 500,
          "commentsCount": 25,
          "videoUrl": "https://...",
          "displayUrl": "https://..."
        }
      ]
    }
  ],
  "timestamp": "2025-07-25T15:30:00Z"
}
```

#### 2. Instagram Reel Scraper
**Endpoint:** `POST /api/apify/instagram/reel`

**Purpose:** Extract reel data from Instagram usernames (URLs not supported by this actor)

**Request Body:**
```json
{
  "username": "apifyoffice",
  "resultsLimit": 20,
  "downloadVideo": false
}
```

### TikTok Endpoints

#### 1. TikTok Profile Scraper
**Endpoint:** `POST /api/apify/tiktok/profile`

**Purpose:** Extract TikTok user profile data and videos

**Request Body:**
```json
{
  "username": "therock",
  "includeVideos": true,
  "resultsLimit": 50,
  "downloadVideos": false
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "username": "therock",
      "displayName": "The Rock",
      "bio": "CEO of #RockTok",
      "followersCount": 80200000,
      "followingCount": 377,
      "likesCount": 645900000,
      "videosCount": 439,
      "isVerified": true,
      "avatarUrl": "https://...",
      "isPrivate": false,
      "videos": [
        {
          "id": "7530978492717190455",
          "url": "https://www.tiktok.com/@therock/video/7530978492717190455",
          "videoUrl": "https://...",
          "thumbnailUrl": "https://...",
          "description": "Video description...",
          "timestamp": "2025-07-25T11:23:11.000Z",
          "likesCount": 261500,
          "commentsCount": 2541,
          "sharesCount": 8355,
          "viewsCount": 1500000,
          "duration": 75,
          "username": "therock"
        }
      ]
    }
  ],
  "timestamp": "2025-07-25T15:30:00Z"
}
```

#### 2. TikTok General Scraper ⭐ **FULLY WORKING**
**Endpoint:** `POST /api/apify/tiktok/scraper`

**Purpose:** Comprehensive TikTok scraping with support for all input types

**Supported Input Types:**
- ✅ **Profiles**: Username-based scraping
- ✅ **Hashtags**: Hashtag trend scraping  
- ✅ **Video URLs**: Individual video scraping (uses `postURLs` parameter)
- ✅ **Search Queries**: Content search

**Request Body:**
```json
{
  "profiles": ["therock", "apifytech"],
  "hashtags": ["funny", "viral"],
  "videoUrls": [
    "https://www.tiktok.com/@stephengpope/video/7386725148239482154",
    "https://www.tiktok.com/t/ZT6hPRjNV/"
  ],
  "searchQueries": ["cats", "cooking tutorials"],
  "resultsPerPage": 10
}
```

**Key Features:**
- **Multiple URL Formats**: Supports both full URLs and short URLs
- **Parameter Mapping**: `videoUrls` → `postURLs` for proper actor compatibility
- **Rich Metadata**: Returns complete video data with engagement metrics
- **Flexible Input**: Use any combination of the 4 input types

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "7386725148239482154",
      "text": "Video description...",
      "textLanguage": "en",
      "createTime": 1719856786,
      "createTimeISO": "2024-07-01T17:59:46.000Z",
      "isAd": false,
      "authorMeta": {
        "id": "6746381030971933701",
        "name": "stephengpope",
        "nickName": "Stephen | AI Automation",
        "verified": false,
        "signature": "Learn AI automation and make $10k+/month 👇",
        "avatar": "https://...",
        "fans": 177600,
        "heart": 593300,
        "video": 1687
      },
      "webVideoUrl": "https://www.tiktok.com/@stephengpope/video/7386725148239482154",
      "videoMeta": {
        "height": 1024,
        "width": 576,
        "duration": 1359,
        "coverUrl": "https://...",
        "definition": "540p",
        "format": "mp4"
      },
      "diggCount": 48800,
      "shareCount": 10200,
      "playCount": 1000000,
      "collectCount": 53085,
      "commentCount": 374,
      "hashtags": [],
      "submittedVideoUrl": "https://www.tiktok.com/@stephengpope/video/7386725148239482154"
    }
  ],
  "timestamp": "2025-07-25T21:34:05.099Z",
  "debug": {
    "actorUsed": "clockworks~tiktok-scraper",
    "inputSent": {
      "videoUrls": ["https://www.tiktok.com/@stephengpope/video/7386725148239482154"]
    },
    "responseType": "object",
    "itemCount": 1
  }
}
```

### Orchestrator Endpoint

**Endpoint:** `POST /api/apify/orchestrator`

**Purpose:** Run multiple scraping operations in parallel

**Request Body:**
```json
{
  "instagram": {
    "profiles": ["user1", "user2"],
    "includeDetails": true,
    "reels": ["username1", "username2"],
    "downloadVideos": false
  },
  "tiktok": {
    "profiles": ["tikuser1", "tikuser2"],
    "includeVideos": true,
    "downloadVideos": false
  },
  "resultsLimit": 50
}
```

## Instagram Integration

### Supported URL Formats

The Instagram scrapers support these URL patterns:

- `https://www.instagram.com/reel/ABC123...`
- `https://www.instagram.com/reels/ABC123...`
- `https://www.instagram.com/p/ABC123...` (posts)
- `https://www.instagram.com/tv/ABC123...` (IGTV)
- `https://instagram.com/reel/ABC123...` (without www)
- `https://instagr.am/p/ABC123...` (short domain)

### Key Limitations

- **Instagram Reel Scraper**: Only accepts usernames, not URLs
- **Profile Scraper**: Optimized for user profile data extraction

## TikTok Integration

### Fully Supported Features ✅

The TikTok integration now supports all major use cases:

1. **Profile Scraping**: User profiles and their videos
2. **Hashtag Scraping**: Trending content by hashtag
3. **Video URL Scraping**: Individual videos (both full and short URLs)
4. **Search Queries**: Content discovery through search

### TikTok URL Support

**Full URLs:**
```
https://www.tiktok.com/@username/video/1234567890
```

**Short URLs:**
```
https://www.tiktok.com/t/AbC123DeF/
```

**Parameter Mapping:**
- Internal API: `videoUrls` → Actor Parameter: `postURLs`

## Background Processing

### Simple Video Queue System

The background processing system provides:

- **In-memory job queue** with automatic processing
- **Real-time status updates** via polling endpoint
- **Progress tracking** with detailed messages
- **Error handling** with retry logic
- **Job lifecycle management**

### Processing Status Endpoint

**Endpoint:** `GET /api/video/processing-status`

**Response:**
```json
{
  "success": true,
  "activeJobs": [
    {
      "id": "job_1234567890",
      "status": "processing",
      "progress": 75,
      "message": "Extracting video metadata...",
      "videoUrl": "https://www.tiktok.com/@user/video/123",
      "startTime": "2025-07-25T15:30:00Z"
    }
  ],
  "stats": {
    "total": 15,
    "pending": 2,
    "processing": 1,
    "completed": 10,
    "failed": 2
  }
}
```

## Testing Interface

### Apify Test Console

**Location:** `/apify-test`

The comprehensive testing interface provides:

1. **Instagram Profile Tab**: Test profile scraping
2. **Instagram Reel Tab**: Test reel extraction
3. **TikTok Profile Tab**: Test TikTok profiles
4. **TikTok Scraper Tab**: Test all TikTok scraping types
5. **Orchestrator Tab**: Test batch operations

### Features:

- **Real-time Response Display**: Live JSON responses
- **Parameter Configuration**: Adjustable limits and options
- **Success/Failure Indicators**: Clear status badges
- **Response Analytics**: Item counts and processing times
- **Debug Information**: Actor details and input verification

### Test Examples:

**TikTok Video URL Test:**
```json
{
  "videoUrls": [
    "https://www.tiktok.com/@stephengpope/video/7386725148239482154",
    "https://www.tiktok.com/t/ZT6hPRjNV/"
  ],
  "resultsPerPage": 2
}
```

**Instagram Profile Test:**
```json
{
  "username": "apifyoffice",
  "includeDetails": true,
  "resultsLimit": 10
}
```

## Error Handling

### Common Error Scenarios

1. **Invalid Actor Name Format**
   ```json
   {
     "success": false,
     "error": "Apify API error: 404 - Actor not found"
   }
   ```

2. **Parameter Mismatch**
   ```json
   {
     "success": false,
     "error": "Actor run did not succeed (status: FAILED)"
   }
   ```

3. **Rate Limiting**
   ```json
   {
     "success": false,
     "error": "Apify API error: 429 - Rate limit exceeded"
   }
   ```

4. **Invalid Input Data**
   ```json
   {
     "success": false,
     "error": "At least one of profiles, hashtags, videoUrls, or searchQueries is required"
   }
   ```

### Error Recovery Strategies

- **Comprehensive Logging**: All requests logged with timing and debug info
- **Parameter Validation**: Input validation before API calls
- **Graceful Failures**: Clear error messages with suggested fixes
- **Retry Logic**: Automatic retries for transient failures

## Usage Examples

### Basic TikTok Video Scraping

```typescript
// Scrape individual TikTok videos
const response = await fetch('/api/apify/tiktok/scraper', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoUrls: [
      'https://www.tiktok.com/@stephengpope/video/7386725148239482154',
      'https://www.tiktok.com/t/ZT6hPRjNV/'
    ],
    resultsPerPage: 5
  })
});

const result = await response.json();
console.log('Videos scraped:', result.data.length);
```

### Instagram Profile Analysis

```typescript
// Get Instagram profile with recent posts
const response = await fetch('/api/apify/instagram/profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'apifyoffice',
    includeDetails: true,
    resultsLimit: 20
  })
});

const result = await response.json();
const profile = result.data[0];
console.log(`${profile.username}: ${profile.followersCount} followers`);
```

### Multi-Platform Batch Processing

```typescript
// Use orchestrator for multiple platforms
const response = await fetch('/api/apify/orchestrator', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    instagram: {
      profiles: ['user1', 'user2'],
      includeDetails: true
    },
    tiktok: {
      profiles: ['tikuser1', 'tikuser2'],
      includeVideos: true
    },
    resultsLimit: 30
  })
});

const result = await response.json();
console.log('Multi-platform scraping completed');
```

### Hashtag Trend Analysis

```typescript
// Analyze TikTok hashtag trends
const response = await fetch('/api/apify/tiktok/scraper', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    hashtags: ['funny', 'viral', 'trending'],
    resultsPerPage: 20
  })
});

const result = await response.json();
result.data.forEach(video => {
  console.log(`${video.text} - ${video.diggCount} likes`);
});
```

## Configuration

### Environment Variables

```env
# Required
APIFY_TOKEN=apify_api_YOUR_TOKEN_HERE

# Optional - API Timeouts
APIFY_TIMEOUT_SYNC=60000        # 60 seconds
APIFY_TIMEOUT_ASYNC=600000      # 10 minutes

# Optional - Processing Configuration  
APIFY_MEMORY_MB=1024           # Memory allocation
APIFY_RETRY_ATTEMPTS=3         # Retry failed requests

# Optional - Rate Limiting
APIFY_MAX_REQUESTS_PER_MINUTE=100
```

### Rate Limits & Best Practices

**Platform Limits:**
- **Instagram**: ~30 requests/minute (sync), ~200/minute (async)
- **TikTok**: ~50 requests/minute per actor
- **Daily Limits**: Based on Apify subscription tier

**Best Practices:**
1. **Use appropriate actors** for your specific use case
2. **Batch requests** when possible using the orchestrator
3. **Implement proper error handling** for all API calls
4. **Monitor rate limits** to avoid throttling
5. **Cache results** when appropriate to reduce API usage
6. **Use the test interface** for development and debugging

### Actor Selection Guide

| Use Case | Recommended Actor | Input Type |
|----------|------------------|------------|
| Instagram user analysis | `instagram/profile` | Username |
| Instagram reel extraction | `instagram/reel` | Username |
| TikTok user analysis | `tiktok/profile` | Username |
| TikTok video analysis | `tiktok/scraper` | Video URLs |
| TikTok trend analysis | `tiktok/scraper` | Hashtags |
| TikTok content discovery | `tiktok/scraper` | Search queries |
| Multi-platform batch | `orchestrator` | Mixed inputs |

---

## Recent Updates

### ✅ TikTok Video URL Support (July 2025)
- **Fixed**: TikTok video URL scraping now fully functional
- **Parameter**: Uses `postURLs` parameter for `clockworks~tiktok-scraper`
- **Support**: Both full URLs and short URLs work correctly
- **Testing**: Comprehensive test interface with all input types

### ✅ Actor Name Standardization (July 2025)
- **Updated**: All actors use proper tilde (`~`) format
- **Fixed**: 404 errors resolved with correct actor naming
- **Verified**: All endpoints tested and working

### ✅ Comprehensive Logging (July 2025)  
- **Enhanced**: Detailed request/response logging for debugging
- **Added**: Timing analysis and performance metrics
- **Improved**: Error messages with actionable information

*This guide reflects the current working state of all Apify integrations as of July 2025.*