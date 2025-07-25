import { NextRequest, NextResponse } from "next/server";

import { videoQueue } from "@/lib/simple-video-queue";

export async function GET() {
  try {
    // In a real app, you'd get the userId from auth
    // For now, we'll return all active jobs (you can filter by user later)
    const activeJobs = videoQueue.getActiveJobs();
    const stats = videoQueue.getStats();

    return NextResponse.json({
      success: true,
      activeJobs,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ [PROCESSING-STATUS] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get processing status",
        activeJobs: [],
        stats: {
          total: 0,
          pending: 0,
          processing: 0,
          completed: 0,
          failed: 0,
        },
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json({ success: false, error: "Job ID required" }, { status: 400 });
    }

    const job = videoQueue.getJob(jobId);

    if (!job) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      job,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ [PROCESSING-STATUS] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get job status",
      },
      { status: 500 },
    );
  }
}
