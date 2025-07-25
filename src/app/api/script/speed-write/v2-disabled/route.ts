/**
 * V2 Script Generation API - TEMPORARILY DISABLED FOR BUILD
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: "V2 Script Generation is temporarily disabled during development",
    },
    { status: 503 },
  );
}
