/**
 * Script to update existing personas with correct userId
 * Run this to associate orphaned personas with your user account
 * 
 * IMPORTANT: The userId field in personas should match the uid from Firebase Auth
 */

import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";

async function updatePersonaOwnership() {
  console.log("🔄 Starting persona ownership update...");

  // Check if Firebase Admin is initialized
  if (!isAdminInitialized) {
    console.error("❌ Firebase Admin SDK not initialized");
    console.log("Make sure your environment variables are set correctly");
    return;
  }

  const adminDb = getAdminDb();
  
  if (!adminDb) {
    console.error("❌ Failed to get Firebase Admin database");
    return;
  }

  // IMPORTANT: Replace this with your actual Firebase Auth UID
  // You can find this in Firebase Console > Authentication > Users
  // It looks like: "abc123def456..." (a long alphanumeric string)
  const YOUR_USER_UID = "test-user"; // <-- CHANGE THIS TO YOUR ACTUAL UID FROM FIREBASE AUTH
  
  try {
    // Option 1: Update ALL personas without a userId
    const orphanedPersonas = await adminDb
      .collection("personas")
      .where("userId", "==", null)
      .get();
    
    console.log(`Found ${orphanedPersonas.size} personas without userId`);
    
    // Option 2: Update personas by specific criteria (uncomment if needed)
    // const targetPersonas = await adminDb
    //   .collection("personas")
    //   .where("platform", "==", "tiktok")
    //   .get();
    
    // Option 3: Update ALL personas (be careful with this!)
    // const allPersonas = await adminDb.collection("personas").get();
    
    const batch = adminDb.batch();
    let updateCount = 0;
    
    orphanedPersonas.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
      const data = doc.data();
      
      // Only update if no userId exists
      if (!data.userId) {
        console.log(`Updating persona: ${data.name || doc.id}`);
        batch.update(doc.ref, {
          userId: YOUR_USER_UID,
          updatedAt: new Date().toISOString()
        });
        updateCount++;
      }
    });
    
    if (updateCount > 0) {
      await batch.commit();
      console.log(`✅ Successfully updated ${updateCount} personas`);
    } else {
      console.log("ℹ️ No personas needed updating");
    }
    
    // Verify the update
    const updatedPersonas = await adminDb
      .collection("personas")
      .where("userId", "==", "xfPvnnUdJCRIJEVrpJCmR7kXBOX2")
      .get();
    
    console.log(`\n📊 Final count: ${updatedPersonas.size} personas now belong to user ${YOUR_USER_UID}`);
    
    // List the personas
    console.log("\n📋 Your personas:");
    updatedPersonas.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
      const data = doc.data();
      console.log(`  - ${data.name} (${data.platform}, @${data.username})`);
    });
    
  } catch (error) {
    console.error("❌ Error updating personas:", error);
  }
}

// Run the update
updatePersonaOwnership().catch(console.error);