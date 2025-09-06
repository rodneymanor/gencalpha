import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Only allow in development or with a specific debug key
  const debugKey = request.nextUrl.searchParams.get("key");
  const isProduction = process.env.NODE_ENV === "production";

  // Simple auth check - replace with your actual debug key
  if (isProduction && debugKey !== process.env.DEBUG_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const envCheck = {
    NODE_ENV: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    firebase: {
      hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      hasAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      hasStorageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      hasMessagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      hasAppId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      // Admin SDK
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
    },
    other: {
      hasPosthogKey: !!process.env.NEXT_PUBLIC_POSTHOG_KEY,
      hasDebugKey: !!process.env.DEBUG_KEY,
    },
  };

  return NextResponse.json(envCheck);
}
