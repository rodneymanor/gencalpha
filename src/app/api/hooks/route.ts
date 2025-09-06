import { NextRequest, NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/api-key-auth";
import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";

export interface Hook {
  id: string;
  userId: string;
  transcriptHash: string;
  hooks: Array<{
    text: string;
    rating: number;
    focus: "surprise" | "pain_point" | "benefit";
    rationale: string;
  }>;
  topHook: {
    text: string;
    rating: number;
  };
  createdAt: string;
}

export interface HooksResponse {
  success: boolean;
  hooks: Hook[];
  error?: string;
}

// GET: Fetch user's generated hooks
export async function GET(request: NextRequest): Promise<NextResponse<HooksResponse>> {
  try {
    console.log("📚 [Hooks API] GET request received");

    // Authenticate API key
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const userId = authResult.user.uid;
    console.log("👤 [Hooks API] Fetching hooks for user:", userId);

    // Check if admin is initialized
    if (!isAdminInitialized) {
      return NextResponse.json(
        {
          success: false,
          hooks: [],
          error: "Admin SDK not configured",
        },
        { status: 500 },
      );
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json(
        {
          success: false,
          hooks: [],
          error: "Database not available",
        },
        { status: 500 },
      );
    }

    // Fetch hooks from Firestore - remove orderBy to avoid index requirement
    const hooksSnapshot = await adminDb
      .collection("hook_generations")
      .where("userId", "==", userId)
      .limit(100) // Limit to last 100 hook generations
      .get();

    // Map documents and sort by createdAt in JavaScript since we can't use orderBy in Firestore
    const hooks: Hook[] = hooksSnapshot.docs
      .map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Hook,
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    console.log(`✅ [Hooks API] Found ${hooks.length} hook generations for user`);

    return NextResponse.json({
      success: true,
      hooks,
    });
  } catch (error) {
    console.error("❌ [Hooks API] GET error:", error);
    return NextResponse.json(
      {
        success: false,
        hooks: [],
        error: "Failed to fetch hooks",
      },
      { status: 500 },
    );
  }
}
