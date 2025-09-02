import { NextRequest, NextResponse } from "next/server";
import { authenticateWithFirebaseToken } from "@/lib/firebase-auth-helpers";
import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    // Authenticate with Firebase token
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized - No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const authResult = await authenticateWithFirebaseToken(token);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    if (!isAdminInitialized) {
      return NextResponse.json({ success: false, error: "Firebase Admin not initialized" }, { status: 500 });
    }

    const adminDb = getAdminDb();
    
    // Get user's personas
    const personasRef = adminDb
      .collection("personas")
      .where("userId", "==", authResult.user.uid)
      .where("status", "==", "active")
      .orderBy("lastUsedAt", "desc")
      .limit(20);

    const snapshot = await personasRef.get();
    
    const personas = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`📋 [List Personas API] Retrieved ${personas.length} personas for user`);

    return NextResponse.json({
      success: true,
      personas,
    });

  } catch (error) {
    console.error("❌ [List Personas API] Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to load personas" 
      },
      { status: 500 }
    );
  }
}