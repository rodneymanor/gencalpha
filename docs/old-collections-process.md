
### **1. Frontend Entry Point**

**File:** `src/app/(main)/research/collections/_components/add-video-dialog.tsx`

- **Purpose:** Main UI component for adding videos to collections
- **Key Features:**
  - URL input validation (TikTok, Instagram, YouTube)
  - Optional video title input
  - Collection selection dropdown
  - Real-time processing status display
  - Error handling and success feedback

### **2. URL Validation & Processing**

**File:** `src/app/(main)/research/collections/_components/simple-video-processing.ts`

- **Purpose:** Client-side processing coordination
- **Key Functions:**
  - `validateUrl()` - Validates TikTok/Instagram/YouTube URLs
  - `detectPlatform()` - Identifies video platform from URL
  - `processAndAddVideo()` - Main processing function
  - `checkTranscriptionStatus()` - Real-time status checking

### **3. Main Processing API Route**

**File:** `src/app/api/video/process-and-add/route.ts`

- **Purpose:** Orchestrates the complete video processing workflow
- **Workflow Steps:**
  1. **Authentication** - Verifies user JWT token
  2. **Video Download** - Calls `/api/video/downloader`
  3. **CDN Streaming** - Uploads to Bunny CDN via `uploadToBunnyStream()`
  4. **Database Storage** - Adds video to Firestore collection
  5. **Background Transcription** - Starts async transcription process

### **4. Supporting API Routes**

#### **Video Downloader**

**File:** `src/app/api/video/downloader/route.ts`

- Downloads video from TikTok/Instagram
- Extracts metadata (author, description, hashtags)
- Returns video buffer and platform info

#### **Video Transcribe**

**File:** `src/app/api/video/transcribe/route.ts`

- Converts video to audio
- Performs speech-to-text transcription
- Returns transcript text

#### **Script Analysis**

**File:** `src/app/api/video/analyze-script/route.ts`

- Analyzes transcript for Hook/Bridge/Nugget/WTA components
- Uses AI to extract content structure

#### **Add Video to Collection (API Key)**

**File:** `src/app/api/add-video-to-collection/route.ts`

- Alternative endpoint for API key authentication
- Same processing workflow but with different auth method

### **5. Database Services**

#### **Collections Service**

**File:** `src/lib/collections.ts`

- **Purpose:** Core collection management
- **Key Methods:**
  - `createCollection()` - Creates new collections
  - `addVideoToCollection()` - Adds videos to collections
  - `getCollectionVideos()` - Retrieves videos from collections
  - `updateCollection()` - Updates collection metadata

#### **Collections RBAC Service**

**File:** `src/lib/collections-rbac.ts`

- **Purpose:** Role-based access control for collections
- **Key Features:**
  - Super admin access to all collections
  - Coach/creator access to assigned collections
  - User permission validation

### **6. Processing Status Management**

#### **Video Processing Status Component**

**File:** `src/app/(main)/research/collections/_components/video-processing-status.tsx`

- **Purpose:** Real-time status display
- **Status Types:**
  - `queued` - Waiting to start
  - `downloading` - Downloading video
  - `uploading` - Streaming to CDN
  - `transcribing` - Speech-to-text conversion
  - `analyzing` - Content analysis
  - `completed` - All processing done
  - `failed` - Processing failed

#### **Processing Queue Component**

**File:** `src/app/(main)/research/collections/_components/processing-queue.tsx`

- **Purpose:** Manages multiple video processing jobs
- **Features:**
  - Real-time job status updates
  - Retry failed jobs
  - Progress tracking

### **7. Supporting Utilities**

#### **Bunny Stream Service**

**File:** `src/lib/bunny-stream.ts`

- **Purpose:** CDN video streaming
- **Functions:**
  - `uploadToBunnyStream()` - Uploads video to CDN
  - `generateBunnyThumbnailUrl()` - Generates thumbnail URLs

#### **Collections Helpers**

**File:** `src/app/(main)/research/collections/_components/collections-helpers.ts`

- **Purpose:** Utility functions for collections
- **Functions:**
  - `verifyCollectionOwnership()` - Validates user permissions
  - `updateCollectionVideoCount()` - Updates collection counts
  - `formatTimestamp()` - Formats Firestore timestamps

### **8. Data Flow Summary**

```
User Input → AddVideoDialog → simple-video-processing.ts → process-and-add API
                                                              ↓
Download Video → Stream to CDN → Store in Database → Background Transcription
                                                              ↓
Real-time Status Updates → VideoProcessingStatus Component → UI Refresh
```