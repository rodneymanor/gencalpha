// Cron endpoint for scheduled RSS updates
// This should be called by Vercel Cron or external scheduler
import { NextRequest, NextResponse } from "next/server";
import { scheduledRSSUpdate } from "@/lib/scheduled/rss-updater";

// Verify cron secret to prevent unauthorized calls
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  try {
    // Verify authorization for cron job
    const authHeader = request.headers.get("authorization");

    // Allow calls from Vercel Cron (they include a special header)
    const isVercelCron = request.headers.get("x-vercel-cron") === "1";

    // Check for cron secret in authorization header
    const hasValidSecret = CRON_SECRET && authHeader === `Bearer ${CRON_SECRET}`;

    if (!isVercelCron && !hasValidSecret) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    // Run the RSS update job
    const result = await scheduledRSSUpdate();

    return NextResponse.json({
      success: result.success,
      message: result.message,
      updated: result.updated,
      categories: result.categories,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron RSS update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

// Manual trigger endpoint (for testing/admin use)
export async function POST(request: NextRequest) {
  try {
    // This endpoint requires admin authentication
    const authHeader = request.headers.get("authorization");

    // For now, use the cron secret for admin access
    // In production, this should check for admin role
    if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin authorization required",
        },
        { status: 401 },
      );
    }

    // Run the RSS update job
    const result = await scheduledRSSUpdate();

    return NextResponse.json({
      success: result.success,
      message: `Manual update: ${result.message}`,
      updated: result.updated,
      categories: result.categories,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Manual RSS update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
