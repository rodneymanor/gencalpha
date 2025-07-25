import { NextResponse } from "next/server";

export async function GET() {
  console.log("🔍 [APIFY-TOKEN-TEST] Checking Apify configuration...");

  // Check if token exists
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    return NextResponse.json({
      success: false,
      error: "APIFY_TOKEN environment variable not found",
      suggestions: [
        "Add APIFY_TOKEN to your .env.local file",
        "Get your token from https://console.apify.com/account/integrations",
        "Restart your development server after adding the token"
      ]
    });
  }

  // Basic token validation
  const tokenLength = token.length;
  const tokenPreview = tokenLength > 8 ? `${token.slice(0, 4)}...${token.slice(-4)}` : 'SHORT_TOKEN';
  
  console.log("🔑 [APIFY-TOKEN-TEST] Token found:", tokenPreview, `(${tokenLength} chars)`);

  // Test basic API connectivity
  try {
    const testResponse = await fetch(`https://api.apify.com/v2/users/me?token=${token}`, {
      method: "GET",
      headers: {
        "User-Agent": "Instagram-Scraper-Test/1.0"
      }
    });

    console.log("📡 [APIFY-TOKEN-TEST] API test response:", testResponse.status);

    if (testResponse.ok) {
      const userData = await testResponse.json();
      console.log("✅ [APIFY-TOKEN-TEST] Token is valid, user:", userData.username);
      
      return NextResponse.json({
        success: true,
        message: "Apify token is valid and API is accessible",
        data: {
          tokenLength,
          tokenPreview,
          userId: userData.id,
          username: userData.username,
          plan: userData.plan
        }
      });
    } else {
      const errorText = await testResponse.text();
      console.error("❌ [APIFY-TOKEN-TEST] API test failed:", testResponse.status, errorText);
      
      return NextResponse.json({
        success: false,
        error: `Apify API returned ${testResponse.status}`,
        details: errorText,
        suggestions: [
          "Check if your APIFY_TOKEN is correct",
          "Verify your Apify account is active",
          "Try regenerating your API token"
        ]
      });
    }
  } catch (error) {
    console.error("❌ [APIFY-TOKEN-TEST] Network error:", error);
    
    return NextResponse.json({
      success: false,
      error: "Failed to connect to Apify API",
      details: error instanceof Error ? error.message : "Unknown error",
      suggestions: [
        "Check your internet connection",
        "Verify Apify API is not blocked by firewall",
        "Try again in a few minutes"
      ]
    });
  }
}