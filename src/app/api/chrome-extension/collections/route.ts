import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { buildInternalUrl } from "@/lib/utils/url";

/**
 * GET /api/chrome-extension/collections
 * Proxies to core collections GET, supporting API key or Firebase token.
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate first (dual auth: API key, then Firebase token)
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) return authResult;

    // Forward original auth headers to internal service
    const forwardedHeaders: HeadersInit = {};
    const apiKey = request.headers.get("x-api-key");
    const authHeader = request.headers.get("authorization");
    if (apiKey) forwardedHeaders["x-api-key"] = apiKey;
    if (authHeader) forwardedHeaders["authorization"] = authHeader;

    const res = await fetch(buildInternalUrl("/api/collections"), {
      method: "GET",
      headers: forwardedHeaders,
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("❌ [Chrome Collections] GET failed:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch collections" }, { status: 500 });
  }
}

/**
 * POST /api/chrome-extension/collections
 * Proxies to core collections POST, body: { title, description? }
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate first (dual auth: API key, then Firebase token)
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json().catch(() => ({}));
    const forwardedHeaders: HeadersInit = { "content-type": "application/json" };
    const apiKey = request.headers.get("x-api-key");
    const authHeader = request.headers.get("authorization");
    if (apiKey) forwardedHeaders["x-api-key"] = apiKey;
    if (authHeader) forwardedHeaders["authorization"] = authHeader;

    const res = await fetch(buildInternalUrl("/api/collections"), {
      method: "POST",
      headers: forwardedHeaders,
      body: JSON.stringify(body ?? {}),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("❌ [Chrome Collections] POST failed:", error);
    return NextResponse.json({ success: false, error: "Failed to create collection" }, { status: 500 });
  }
}
