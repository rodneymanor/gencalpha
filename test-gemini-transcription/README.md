# Gemini Transcription Testing Guide

This guide provides JSON request files and cURL commands to test Gemini's transcription capabilities with different media file types.

## Prerequisites

- Ensure your `GEMINI_API_KEY` is set in your `.env.local` file
- Install `jq` for pretty JSON formatting (optional): `brew install jq`
- Make the shell scripts executable: `chmod +x *.sh`

## Test Files

### 1. MP4 Video Test

**JSON Request (`request-mp4.json`):**
```json
{
  "contents": [
    {
      "parts": [
        {
          "file_data": {
            "file_uri": "https://vz-8416c36e-556.b-cdn.net/80aaf797-5e72-4a28-893e-e1931e218158/play_720p.mp4?download=1",
            "mime_type": "video/mp4"
          }
        },
        {
          "text": "Transcribe the audio from this video."
        }
      ]
    }
  ]
}
```

**cURL Command:**
```bash
# Load environment variables
export $(grep -v '^#' .env.local | xargs)

# Test MP4 video transcription
curl -X POST \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @request-mp4.json \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent" \
  | jq '.' 2>/dev/null || cat
```

### 2. MP3 Audio Test

**JSON Request (`request-mp3.json`):**
```json
{
  "contents": [
    {
      "parts": [
        {
          "file_data": {
            "file_uri": "https://sample-music.netlify.app/sample.mp3",
            "mime_type": "audio/mp3"
          }
        },
        {
          "text": "Transcribe the audio from this MP3 file."
        }
      ]
    }
  ]
}
```

**cURL Command:**
```bash
curl -X POST \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @request-mp3.json \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent" \
  | jq '.' 2>/dev/null || cat
```

### 3. WAV Audio Test

**JSON Request (`request-wav.json`):**
```json
{
  "contents": [
    {
      "parts": [
        {
          "file_data": {
            "file_uri": "https://www.soundjay.com/misc/sounds-1/bell-ringing-05.wav",
            "mime_type": "audio/wav"
          }
        },
        {
          "text": "Transcribe the audio from this WAV file."
        }
      ]
    }
  ]
}
```

**cURL Command:**
```bash
curl -X POST \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @request-wav.json \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent" \
  | jq '.' 2>/dev/null || cat
```

### 4. WebM Video Test

**JSON Request (`request-webm.json`):**
```json
{
  "contents": [
    {
      "parts": [
        {
          "file_data": {
            "file_uri": "https://sample-videos.com/zip/10/webm/mp4/SampleVideo_1280x720_1mb.webm",
            "mime_type": "video/webm"
          }
        },
        {
          "text": "Transcribe the audio from this WebM video."
        }
      ]
    }
  ]
}
```

**cURL Command:**
```bash
curl -X POST \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @request-webm.json \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent" \
  | jq '.' 2>/dev/null || cat
```

### 5. M4A Audio Test

**JSON Request (`request-m4a.json`):**
```json
{
  "contents": [
    {
      "parts": [
        {
          "file_data": {
            "file_uri": "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.m4a",
            "mime_type": "audio/m4a"
          }
        },
        {
          "text": "Transcribe the audio from this M4A file."
        }
      ]
    }
  ]
}
```

**cURL Command:**
```bash
curl -X POST \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @request-m4a.json \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent" \
  | jq '.' 2>/dev/null || cat
```

## Shell Scripts

### Individual Test Scripts

Create these as separate `.sh` files and make them executable with `chmod +x *.sh`:

**`test-mp4.sh`:**
```bash
#!/bin/bash
echo "🎥 Testing MP4 video transcription..."
echo "File: https://vz-8416c36e-556.b-cdn.net/80aaf797-5e72-4a28-893e-e1931e218158/play_720p.mp4"
echo "----------------------------------------"

# Load environment variables from .env.local
if [ -f ../.env.local ]; then
    export $(grep -v '^#' ../.env.local | xargs)
fi

# Check if API key is set
if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ GEMINI_API_KEY not found in environment"
    echo "Make sure your .env.local file contains GEMINI_API_KEY=your_key_here"
    exit 1
fi

# Make the API call
curl -X POST \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @request-mp4.json \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent" \
  | jq '.' 2>/dev/null || cat

echo -e "\n✅ MP4 test completed"
```

**`test-all.sh` (Master Test Script):**
```bash
#!/bin/bash

echo "🧪 Starting Gemini Transcription Tests"
echo "======================================"

# Load environment variables
if [ -f ../.env.local ]; then
    export $(grep -v '^#' ../.env.local | xargs)
fi

# Check if API key is set
if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ GEMINI_API_KEY not found in environment"
    echo "Make sure your .env.local file contains GEMINI_API_KEY=your_key_here"
    exit 1
fi

# Test different file types
declare -a tests=(
    "MP4:request-mp4.json:🎥"
    "MP3:request-mp3.json:🎵"
    "WAV:request-wav.json:🔊" 
    "WebM:request-webm.json:📹"
    "M4A:request-m4a.json:🎶"
)

for test in "${tests[@]}"; do
    IFS=':' read -ra PARTS <<< "$test"
    format="${PARTS[0]}"
    file="${PARTS[1]}"
    emoji="${PARTS[2]}"
    
    echo -e "\n$emoji Testing $format format..."
    echo "----------------------------------------"
    
    if [ -f "$file" ]; then
        curl -X POST \
          -H "x-goog-api-key: $GEMINI_API_KEY" \
          -H "Content-Type: application/json" \
          -d @"$file" \
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent" \
          | jq '.candidates[0].content.parts[0].text // .error.message // .' 2>/dev/null || cat
        
        echo "✅ $format test completed"
    else
        echo "❌ $file not found - skipping $format test"
    fi
    
    sleep 2  # Rate limiting
done

echo -e "\n🎉 All tests completed!"
```

## Usage Instructions

1. **Setup:**
   ```bash
   cd test-gemini-transcription
   # Create the JSON files using the content above
   # Create the shell scripts using the content above
   chmod +x *.sh
   ```

2. **Run Individual Tests:**
   ```bash
   ./test-mp4.sh
   ```

3. **Run All Tests:**
   ```bash
   ./test-all.sh
   ```

4. **Manual cURL Testing:**
   ```bash
   # Load environment
   export $(grep -v '^#' ../.env.local | xargs)
   
   # Test specific file
   curl -X POST \
     -H "x-goog-api-key: $GEMINI_API_KEY" \
     -H "Content-Type: application/json" \
     -d @request-mp4.json \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent"
   ```

## Supported File Types

Based on Gemini's documentation, the following audio/video formats should be supported:
- MP4 (video/mp4)
- MP3 (audio/mp3)
- WAV (audio/wav)
- WebM (video/webm)
- M4A (audio/m4a)
- AAC (audio/aac)
- FLAC (audio/flac)
- OGG (audio/ogg)

## Troubleshooting

1. **API Key Issues:**
   - Ensure `GEMINI_API_KEY` is in your `.env.local` file
   - Check that the key has the correct permissions

2. **File Access Issues:**
   - Ensure the file URLs are publicly accessible
   - Check that the MIME type matches the actual file format

3. **Rate Limiting:**
   - Add delays between requests if testing multiple files
   - Monitor your API usage quotas

4. **Response Format:**
   - Successful transcriptions will be in `candidates[0].content.parts[0].text`
   - Errors will be in the `error` object

## Next Steps

After testing, you can integrate successful patterns into your application's transcription service at `src/app/api/internal/video/transcribe/route.ts`.