# Apify API Integration Setup

This document provides a comprehensive guide for using the Apify API integration in your application.

## Overview

The Apify integration provides modular, maintainable APIs for scraping Instagram and TikTok data. It replaces Rapid API calls with a more robust and scalable solution.

## API Endpoints

### Instagram Profile Scraper
**Endpoint:** `/api/apify/instagram/profile`

**Methods:** `GET` | `POST`

**Parameters:**
- `username` (string): Single Instagram username
- `usernames` (string[]): Array of Instagram usernames
- `includeDetails` (boolean): Include detailed profile information
- `resultsLimit` (number): Maximum number of results (default: 50)

**Example Request:**
```bash
curl -X POST /api/apify/instagram/profile \
  -H "Content-Type: application/json" \
  -d '{
    "username": "apifyoffice",
    "includeDetails": true,
    "resultsLimit": 50
  }'
```

**Response:**
```json
{
  "success": true,
  "data": [{
    "username": "apifyoffice",
    "fullName": "Apify",
    "followersCount": 12345,
    "posts": [...]
  }],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Instagram Reel Scraper
**Endpoint:** `/api/apify/instagram/reel`

**Methods:** `GET` | `POST`

**Parameters:**
- `url` (string): Single Instagram reel URL
- `urls` (string[]): Array of Instagram reel URLs
- `username` (string): Username to scrape reels from
- `resultsLimit` (number): Maximum number of results
- `downloadVideo` (boolean): Download video files in background

**Example Request:**
```bash
curl -X POST /api/apify/instagram/reel \
  -H "Content-Type: application/json" \
  -d '{
    "urls": ["https://www.instagram.com/reel/ABC123/"],
    "downloadVideo": true
  }'
```

### TikTok Profile Scraper
**Endpoint:** `/api/apify/tiktok/profile`

**Methods:** `GET` | `POST`

**Parameters:**
- `username` (string): Single TikTok username
- `usernames` (string[]): Array of TikTok usernames
- `includeVideos` (boolean): Include user's videos
- `resultsLimit` (number): Maximum number of results
- `downloadVideos` (boolean): Download video files in background

**Example Request:**
```bash
curl -X POST /api/apify/tiktok/profile \
  -H "Content-Type: application/json" \
  -d '{
    "username": "tiktokuser",
    "includeVideos": true,
    "downloadVideos": false
  }'
```

### Orchestrator (Batch Operations)
**Endpoint:** `/api/apify/orchestrator`

**Method:** `POST`

**Description:** Run multiple scraping operations in parallel with graceful error handling.

**Parameters:**
```json
{
  "instagram": {
    "profiles": ["user1", "user2"],
    "reels": ["https://instagram.com/reel/1", "https://instagram.com/reel/2"],
    "includeDetails": true,
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

**Example Request:**
```bash
curl -X POST /api/apify/orchestrator \
  -H "Content-Type: application/json" \
  -d '{
    "instagram": {
      "profiles": ["apifyoffice"],
      "includeDetails": true
    },
    "tiktok": {
      "profiles": ["tiktokuser"],
      "includeVideos": true
    }
  }'
```

## Environment Configuration

Add to your `.env.local`:
```
APIFY_TOKEN=your_apify_token_here
```

## Key Features

### 🏗️ Microservice Architecture
- Each endpoint has a single responsibility
- Focused, composable services
- Clean separation of concerns

### 🚀 Parallel Processing
- Orchestrator runs multiple requests simultaneously
- Promise.allSettled() for independent operations
- Graceful fallbacks for failed operations

### 🔄 Background Processing
- Video downloads run asynchronously
- Non-blocking responses
- Comprehensive logging with emojis

### 🛡️ Error Handling
- Detailed error logging
- Consistent error response formats
- Graceful degradation

### 📊 TypeScript Support
- Fully typed interfaces
- Request/response validation
- IntelliSense support

## Usage Examples

### Basic Profile Scraping
```typescript
const response = await fetch('/api/apify/instagram/profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'targetuser',
    includeDetails: true
  })
});

const { data } = await response.json();
```

### Batch Operations
```typescript
const response = await fetch('/api/apify/orchestrator', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    instagram: {
      profiles: ['user1', 'user2'],
      includeDetails: true
    },
    tiktok: {
      profiles: ['tikuser1'],
      includeVideos: true
    }
  })
});

const { data, summary } = await response.json();
```

## Migration from Rapid API

Replace your existing Rapid API calls:

**Before:**
```javascript
// Old Rapid API approach
const rapidApiCall = await fetch('https://rapid-api-endpoint', {
  headers: {
    'X-RapidAPI-Key': rapidApiKey,
    'X-RapidAPI-Host': 'host'
  }
});
```

**After:**
```javascript
// New Apify integration
const apifyCall = await fetch('/api/apify/instagram/profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'target' })
});
```

## Best Practices

1. **Use the orchestrator** for batch operations
2. **Enable background downloads** for video content
3. **Set appropriate limits** to avoid rate limiting
4. **Handle errors gracefully** in your frontend
5. **Monitor API usage** through console logs
6. **Cache results** when appropriate

## Troubleshooting

### Common Issues
- **Invalid Apify Token**: Check your `.env.local` file
- **Rate Limiting**: Reduce `resultsLimit` parameter
- **Network Timeouts**: Retry failed requests
- **Invalid URLs**: Validate URLs before sending

### Debug Logging
All APIs include comprehensive emoji-based logging:
- 🚀 Starting operations
- 📸/📱 Platform-specific actions
- ✅ Successful completions
- ❌ Error conditions
- 📊 Data retrieval

Check your server console for detailed operation logs.