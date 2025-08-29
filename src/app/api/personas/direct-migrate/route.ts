import { NextRequest, NextResponse } from "next/server";

import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";

/**
 * Direct migration endpoint for development
 * Bypasses authentication to directly update persona ownership
 */
export async function POST(request: NextRequest) {
  console.log("🔄 [Direct Migrate API] Request received");

  try {
    if (!isAdminInitialized) {
      return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Admin database not available" }, { status: 500 });
    }

    const body = await request.json();
    const { targetUid = "xfPvnnUdJCRIJEVrpJCmR7kXBOX2", mode = "all" } = body;

    console.log(`🔄 [Direct Migrate API] Migrating personas to uid: ${targetUid}`);

    // Get all personas
    let personasToUpdate;

    if (mode === "orphaned") {
      // Only get personas without a userId
      personasToUpdate = await adminDb.collection("personas").where("userId", "==", null).get();
    } else {
      // Get ALL personas
      personasToUpdate = await adminDb.collection("personas").get();
    }

    console.log(`📊 Found ${personasToUpdate.size} personas to migrate`);

    if (personasToUpdate.empty) {
      return NextResponse.json({
        success: true,
        message: "No personas found to migrate",
        updatedCount: 0,
        totalPersonasForUser: 0,
      });
    }

    const batch = adminDb.batch();
    let updateCount = 0;
    const updatedPersonas: any[] = [];

    personasToUpdate.forEach((doc) => {
      const data = doc.data();

      console.log(`📝 Updating persona: ${data.name ?? doc.id}`);

      // Update with the target UID
      batch.update(doc.ref, {
        userId: targetUid,
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

    // Commit the batch update
    await batch.commit();
    console.log(`✅ Successfully updated ${updateCount} personas`);

    // Get final count for this user
    const finalCount = await adminDb.collection("personas").where("userId", "==", targetUid).get();

    return NextResponse.json({
      success: true,
      message: `Updated ${updateCount} personas`,
      updatedCount: updateCount,
      updatedPersonas,
      totalPersonasForUser: finalCount.size,
    });
  } catch (error) {
    console.error("❌ [Direct Migrate API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to migrate personas",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
