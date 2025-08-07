import { NextRequest, NextResponse } from "next/server";

interface InstagramUserIdResponse {
  UserID: number;
  UserName: string;
}

interface ApiResponse {
  success: boolean;
  user_id: number;
  username: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

/**
 * GET /api/instagram/user-id
 *
 * Fetches Instagram user ID by username using RapidAPI Instagram scraper.
 *
 * @param username - Instagram username (without @)
 * @returns User ID and username or error message
 */
export async function GET(request: NextRequest) {
  try {
    console.log("📥 Instagram User ID API - Request received");

    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    // Validation
    if (!username) {
      console.log("❌ Username parameter is missing");
      return NextResponse.json({ error: "Username parameter is required" } as ErrorResponse, { status: 400 });
    }

    if (username.length < 1 || username.length > 30) {
      console.log("❌ Invalid username length");
      return NextResponse.json({ error: "Username must be between 1 and 30 characters" } as ErrorResponse, {
        status: 400,
      });
    }

    // Clean username (remove @ if present)
    const cleanUsername = username.replace("@", "");

    console.log(`🔍 Fetching user ID for username: ${cleanUsername}`);

    // Make request to Instagram API
    const response = await fetch(
      `https://instagram-api-fast-reliable-data-scraper.p.rapidapi.com/user_id_by_username?username=${encodeURIComponent(cleanUsername)}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": "instagram-api-fast-reliable-data-scraper.p.rapidapi.com",
          "x-rapidapi-key": process.env.RAPIDAPI_KEY ?? "7d8697833dmsh0919d85dc19515ap1175f7jsn0f8bb6dae84e",
        },
      },
    );

    if (!response.ok) {
      console.log(`❌ Instagram API error: ${response.status} ${response.statusText}`);

      if (response.status === 404) {
        return NextResponse.json(
          { error: "User not found", details: "The specified username does not exist on Instagram" } as ErrorResponse,
          { status: 404 },
        );
      }

      if (response.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded", details: "Too many requests. Please try again later." } as ErrorResponse,
          { status: 429 },
        );
      }

      return NextResponse.json({ error: "Instagram API error", details: `HTTP ${response.status}` } as ErrorResponse, {
        status: response.status,
      });
    }

    const data: InstagramUserIdResponse = await response.json();

    console.log("✅ Successfully fetched user ID:", data);

    // Validate response structure
    if (!data.UserID) {
      console.log("❌ Invalid response structure from Instagram API");
      return NextResponse.json({ error: "Invalid response from Instagram API" } as ErrorResponse, { status: 502 });
    }

    const result: ApiResponse = {
      success: true,
      user_id: data.UserID,
      username: data.UserName || cleanUsername,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("❌ Instagram User ID API Error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      } as ErrorResponse,
      { status: 500 },
    );
  }
}
