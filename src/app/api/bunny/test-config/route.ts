import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Test Bunny configuration
    const config = {
      libraryId: process.env.BUNNY_STREAM_LIBRARY_ID,
      apiKey: process.env.BUNNY_STREAM_API_KEY,
      hostname: process.env.BUNNY_CDN_HOSTNAME,
    };

    console.log("🔧 [BUNNY_TEST] Configuration:", {
      libraryId: config.libraryId,
      hasApiKey: !!config.apiKey,
      hostname: config.hostname,
    });

    // Test different URL formats
    const testGuid = "00000000-0000-0000-0000-000000000000";
    
    const urls = {
      iframe: `https://iframe.mediadelivery.net/embed/${config.libraryId}/${testGuid}`,
      directVideo: `https://iframe.mediadelivery.net/${config.libraryId}/${testGuid}/play_720p.mp4`,
      directCdn: `https://${config.hostname}/${testGuid}/play_720p.mp4`,
      thumbnail: `https://${config.hostname}/${testGuid}/thumbnail.jpg`,
      preview: `https://${config.hostname}/${testGuid}/preview.webp`,
    };

    console.log("🎯 [BUNNY_TEST] Generated URLs:", urls);

    // Test each URL
    const results = {};
    for (const [key, url] of Object.entries(urls)) {
      try {
        console.log(`🔍 [BUNNY_TEST] Testing ${key}: ${url}`);
        const response = await fetch(url, { 
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          }
        });
        
        results[key] = {
          url,
          status: response.status,
          ok: response.ok,
          headers: {
            contentType: response.headers.get('content-type'),
            contentLength: response.headers.get('content-length'),
          }
        };
      } catch (error) {
        results[key] = {
          url,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return NextResponse.json({
      success: true,
      config: {
        ...config,
        apiKey: config.apiKey ? '[PRESENT]' : '[MISSING]'
      },
      urls,
      results
    });

  } catch (error) {
    console.error("❌ [BUNNY_TEST] Error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
