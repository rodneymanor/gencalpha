/**
 * Voice Profile Processing API - TEMPORARILY DISABLED FOR BUILD
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: "Voice profile processing is temporarily disabled during development",
    },
    { status: 503 },
  );
}
