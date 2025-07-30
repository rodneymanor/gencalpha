#!/usr/bin/env node

/**
 * Test Gemini transcription using the same approach as your working implementation
 * This mimics your transcribeVideoFromUrl function
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: '../.env.local' });

// Import Gemini SDK (same as your implementation)
let GoogleGenerativeAI, GoogleAIFileManager;
try {
  const googleAI = require('@google/generative-ai');
  const googleAIServer = require('@google/generative-ai/server');
  GoogleGenerativeAI = googleAI.GoogleGenerativeAI;
  GoogleAIFileManager = googleAIServer.GoogleAIFileManager;
} catch (error) {
  console.error('❌ Gemini SDK not installed. Run: npm install @google/generative-ai');
  process.exit(1);
}

async function transcribeVideoFromUrl(url) {
  let tempFilePath = null;
  let uploadedFile = null;

  try {
    console.log('🌐 [TEST_SDK] Starting video transcription from URL:', url.substring(0, 80) + '...');

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ [TEST_SDK] GEMINI_API_KEY not configured in environment variables');
      return null;
    }

    // Step 1: Download video from URL (same as your implementation)
    console.log('⬇️ [TEST_SDK] Downloading video from CDN...');
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status} ${response.statusText}`);
    }

    const videoBuffer = await response.arrayBuffer();
    console.log(`📦 [TEST_SDK] Video downloaded: ${videoBuffer.byteLength} bytes`);

    // Step 2: Save to temporary file (same as your implementation)
    const tempDir = '/tmp';
    const fileName = `video_${Date.now()}_${Math.random().toString(36).substring(2, 11)}.mp4`;
    tempFilePath = path.join(tempDir, fileName);

    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    fs.writeFileSync(tempFilePath, Buffer.from(videoBuffer));
    console.log(`💾 [TEST_SDK] Video saved to temp file: ${tempFilePath}`);

    // Step 3: Upload to Gemini Files API (same as your implementation)
    console.log('📤 [TEST_SDK] Uploading video to Gemini Files API...');
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

    const uploadResult = await fileManager.uploadFile(tempFilePath, {
      mimeType: 'video/mp4',
      displayName: `test-video-${Date.now()}`
    });

    uploadedFile = uploadResult.file;
    console.log(`✅ [TEST_SDK] Video uploaded successfully: ${uploadedFile.uri}`);
    console.log(`🔍 [TEST_SDK] File state: ${uploadedFile.state}, MIME: ${uploadedFile.mimeType}, Size: ${uploadedFile.sizeBytes} bytes`);

    // Step 4: Wait for processing if needed (same as your implementation)
    let file = uploadedFile;
    while (file.state === 'PROCESSING') {
      console.log('⏳ [TEST_SDK] Waiting for video processing...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      file = await fileManager.getFile(file.name);
    }

    if (file.state === 'FAILED') {
      throw new Error('Video processing failed on Gemini side');
    }

    console.log('🎬 [TEST_SDK] Video processing completed, starting transcription...');

    // Step 5: Transcribe using the uploaded file (same as your implementation)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Please analyze this video and provide:
1. A complete word-for-word transcription of all spoken content
2. Identify the following components in the script:
   - Hook: The opening line/statement that grabs attention
   - Bridge: The transition from hook to main content
   - Nugget: The main value/content/teaching point
   - WTA (What To Action): The call to action at the end

Return the response in this exact JSON format:
{
  "transcript": "full transcript here",
  "components": {
    "hook": "identified hook text",
    "bridge": "identified bridge text", 
    "nugget": "identified nugget text",
    "wta": "identified call to action"
  },
  "contentMetadata": {
    "author": "speaker name if identifiable",
    "description": "brief content description",
    "hashtags": ["relevant", "hashtags"]
  },
  "visualContext": "brief description of visual elements"
}`;

    const result = await model.generateContent([
      {
        fileData: {
          fileUri: file.uri, // Use the Google-hosted URI
          mimeType: file.mimeType
        }
      },
      { text: prompt }
    ]);

    const responseText = result.response.text();
    console.log('📄 [TEST_SDK] Received transcription response');

    // Parse the JSON response (same as your implementation)
    let parsedResponse;
    try {
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || responseText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
      parsedResponse = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('❌ [TEST_SDK] Failed to parse JSON response:', parseError);
      console.log('📄 [TEST_SDK] Raw response:', responseText.substring(0, 500) + '...');
      
      // Return basic transcription
      return {
        success: true,
        transcript: responseText,
        components: { hook: '', bridge: '', nugget: '', wta: '' },
        method: 'sdk_fallback'
      };
    }

    console.log('✅ [TEST_SDK] Transcription completed successfully');

    return {
      success: true,
      transcript: parsedResponse.transcript || '',
      components: parsedResponse.components || { hook: '', bridge: '', nugget: '', wta: '' },
      contentMetadata: parsedResponse.contentMetadata || {},
      visualContext: parsedResponse.visualContext || '',
      method: 'sdk_success'
    };

  } catch (error) {
    console.error('❌ [TEST_SDK] Video transcription failed:', error);
    return { success: false, error: error.message };
  } finally {
    // Cleanup: Delete temporary file (same as your implementation)
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log('🗑️ [TEST_SDK] Temporary file cleaned up');
      } catch (cleanupError) {
        console.error('⚠️ [TEST_SDK] Failed to cleanup temp file:', cleanupError);
      }
    }

    // Cleanup: Delete uploaded file from Gemini (same as your implementation)
    if (uploadedFile) {
      try {
        const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
        await fileManager.deleteFile(uploadedFile.name);
        console.log('🗑️ [TEST_SDK] Uploaded file cleaned up from Gemini');
      } catch (cleanupError) {
        console.error('⚠️ [TEST_SDK] Failed to cleanup uploaded file:', cleanupError);
      }
    }
  }
}

// Main execution
async function main() {
  console.log('🎯 Testing Gemini transcription with your working SDK approach...');
  console.log('========================================');

  const videoUrl = 'https://vz-8416c36e-556.b-cdn.net/80aaf797-5e72-4a28-893e-e1931e218158/play_720p.mp4?download=1';
  
  const result = await transcribeVideoFromUrl(videoUrl);
  
  if (result && result.success) {
    console.log('\n🎉 TRANSCRIPTION SUCCESS!');
    console.log('=========================');
    console.log('Transcript:', result.transcript.substring(0, 200) + '...');
    
    if (result.components) {
      console.log('\n📝 Components:');
      console.log('Hook:', result.components.hook || 'Not identified');
      console.log('Bridge:', result.components.bridge || 'Not identified');
      console.log('Nugget:', result.components.nugget?.substring(0, 100) + '...' || 'Not identified');
      console.log('WTA:', result.components.wta || 'Not identified');
    }
    
    console.log('\n✨ Method:', result.method);
  } else {
    console.log('\n❌ TRANSCRIPTION FAILED');
    console.log('Error:', result?.error || 'Unknown error');
  }
  
  console.log('\n✅ SDK test completed');
}

main().catch(console.error);