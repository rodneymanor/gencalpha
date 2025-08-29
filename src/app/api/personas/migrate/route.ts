import { NextRequest, NextResponse } from "next/server";

import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";
import { authenticateWithFirebaseToken } from "@/lib/firebase-auth-helpers";

/**
 * Migration endpoint to update existing personas with correct userId
 * Call this endpoint to claim orphaned personas for your user account
 */
export async function POST(request: NextRequest) {
  console.log("🔄 [Migrate Personas API] Request received");

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
    const userId = authResult.user.uid;

    console.log(`🔄 [Migrate Personas API] Migrating personas for user: ${userId}`);

    // Get request body for optional filters
    const body = await request.json().catch(() => ({}));
    const { mode = "orphaned" } = body; // orphaned, all, or byUsername

    let personasToUpdate;

    if (mode === "orphaned") {
      // Only update personas without a userId
      personasToUpdate = await adminDb.collection("personas").where("userId", "==", null).get();
    } else if (mode === "all") {
      // Update ALL personas (use with caution!)
      personasToUpdate = await adminDb.collection("personas").get();
    } else if (mode === "byUsername" && body.username) {
      // Update personas by username
      personasToUpdate = await adminDb.collection("personas").where("username", "==", body.username).get();
    } else {
      // Default to orphaned
      personasToUpdate = await adminDb.collection("personas").where("userId", "==", null).get();
    }

    console.log(`📊 Found ${personasToUpdate.size} personas to potentially update`);

    const batch = adminDb.batch();
    let updateCount = 0;
    const updatedPersonas: any[] = [];

    personasToUpdate.forEach((doc) => {
      const data = doc.data();

      // Skip if already owned by another user (unless mode is "all")
      if (mode !== "all" && data.userId && data.userId !== userId) {
        console.log(`⚠️ Skipping persona "${data.name}" - owned by another user`);
        return;
      }

      console.log(`📝 Updating persona: ${data.name ?? doc.id}`);
      batch.update(doc.ref, {
        userId: userId,
        updatedAt: new Date().toISOString(),
      });

      updatedPersonas.push({
        id: doc.id,
        name: data.name,
        platform: data.platform,
        username: data.username,
      });
      updateCount++;
    });

    if (updateCount > 0) {
      await batch.commit();
      console.log(`✅ Successfully updated ${updateCount} personas`);
    } else {
      console.log("ℹ️ No personas needed updating");
    }

    // Get final count
    const finalCount = await adminDb.collection("personas").where("userId", "==", userId).count().get();

    return NextResponse.json({
      success: true,
      message: `Updated ${updateCount} personas`,
      updatedCount: updateCount,
      updatedPersonas,
      totalPersonasForUser: finalCount.data().count,
    });
  } catch (error) {
    console.error("❌ [Migrate Personas API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to migrate personas",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
