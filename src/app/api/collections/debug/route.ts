import { NextRequest, NextResponse } from "next/server";

import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 [Debug API] Firebase Admin initialized:", isAdminInitialized);
    
    if (!isAdminInitialized) {
      return NextResponse.json({ 
        error: "Firebase Admin not initialized",
        isAdminInitialized: false 
      });
    }

    const db = getAdminDb();
    const collectionsRef = db.collection("collections");
    const snapshot = await collectionsRef.limit(5).get();
    
    const collections = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      isAdminInitialized,
      totalCollections: snapshot.size,
      sampleCollections: collections
    });
  } catch (error) {
    console.error("❌ [Debug API] Error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error",
      isAdminInitialized
    });
  }
}