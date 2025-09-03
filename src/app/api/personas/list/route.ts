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
    
    // Get user's personas - simplified query to avoid index requirement
    const personasRef = adminDb
      .collection("personas")
      .where("userId", "==", authResult.user.uid)
      .limit(50); // Get more initially, we'll filter in memory

    const snapshot = await personasRef.get();
    
    // Filter and sort in memory to avoid complex index requirements
    const personas = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((persona: any) => persona.status === "active")
      .sort((a: any, b: any) => {
        // Sort by lastUsedAt descending (most recent first)
        const aTime = a.lastUsedAt?.toDate?.() || a.lastUsedAt || new Date(0);
        const bTime = b.lastUsedAt?.toDate?.() || b.lastUsedAt || new Date(0);
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      })
      .slice(0, 20); // Limit to 20 after sorting

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