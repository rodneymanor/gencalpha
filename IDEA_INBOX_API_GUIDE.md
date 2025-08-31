# Idea Inbox API Guide

## Important: Two Different Storage Systems

The app has two separate storage systems that don't communicate:

1. **Notes System** (`/api/notes` and `/api/chrome-extension/idea-inbox/*`)
   - Stores in Firebase `notes` collection
   - Your created notes go here but won't show in UI

2. **Content Inbox System** (`/api/content-inbox/*`)
   - Stores in Firebase `users/{userId}/contentInbox` subcollection
   - This is what the UI at `/idea-inbox` actually displays

## To See Items in the UI

Use the content-inbox endpoint, NOT the notes endpoint:

```bash
curl -X POST http://localhost:3000/api/content-inbox/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer gencbeta_6tvHfmn44drXsoIoav7FE0KQVAu7u1cX7t20JOWxiRM" \
  -d '{
    "url": "https://example.com/content",
    "title": "Your Title Here",
    "content": "Your content here",
    "platform": "genc"
  }'
```

## Platform Options
- `"youtube"`, `"tiktok"`, `"instagram"`, `"twitter"`, `"linkedin"`, `"genc"`, `"unknown"`

## Check What's in Each Collection

### Check Content Inbox (what UI shows):
```bash
curl -X GET "http://localhost:3000/api/content-inbox/items" \
  -H "Authorization: Bearer gencbeta_6tvHfmn44drXsoIoav7FE0KQVAu7u1cX7t20JOWxiRM"
```

### Check Notes (separate system):
```bash
curl -X GET "http://localhost:3000/api/notes" \
  -H "Authorization: Bearer gencbeta_6tvHfmn44drXsoIoav7FE0KQVAu7u1cX7t20JOWxiRM"
```