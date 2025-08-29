import { NextRequest, NextResponse } from "next/server";

import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";
import { authenticateWithFirebaseToken } from "@/lib/firebase-auth-helpers";

export async function GET(request: NextRequest) {
  console.log("📋 [List Personas API] Request received");

  try {
    // Authenticate with Firebase token like other pages
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const authResult = await authenticateWithFirebaseToken(token);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    if (!isAdminInitialized) {
      return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });
    }

    const adminDb = getAdminDb();

    // Query personas for the authenticated user
    // Note: Removing orderBy to avoid index requirement
    const personasSnapshot = await adminDb.collection("personas").where("userId", "==", authResult.user.uid).get();

    // Sort in memory instead
    const sortedDocs = personasSnapshot.docs.sort((a: any, b: any) => {
      const aDate = a.data().createdAt ?? "";
      const bDate = b.data().createdAt ?? "";
      return bDate.localeCompare(aDate);
    });

    const personas = sortedDocs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`✅ [List Personas API] Found ${personas.length} personas for user ${authResult.user.uid}`);

    return NextResponse.json({
      success: true,
      personas,
      count: personas.length,
    });
  } catch (error) {
    console.error("❌ [List Personas API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch personas",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
