import { NextRequest, NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-key-auth";
import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  console.log("📋 [List Personas API] Request received");

  try {
    // Authenticate the request
    const authResult = await authenticateApiKey(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    if (!isAdminInitialized) {
      return NextResponse.json(
        { error: "Firebase Admin not initialized" },
        { status: 500 }
      );
    }

    const adminDb = getAdminDb();
    
    // Query personas for the authenticated user
    const personasSnapshot = await adminDb
      .collection("personas")
      .where("userId", "==", authResult.user.uid)
      .orderBy("createdAt", "desc")
      .get();

    const personas = personasSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`✅ [List Personas API] Found ${personas.length} personas for user ${authResult.user.uid}`);

    return NextResponse.json({
      success: true,
      personas,
      count: personas.length
    });

  } catch (error) {
    console.error("❌ [List Personas API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch personas",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}