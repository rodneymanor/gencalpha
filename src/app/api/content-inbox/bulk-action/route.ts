// Content Inbox Bulk Actions API Route

import { NextRequest, NextResponse } from "next/server";

import { getAuth } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase-admin";

// POST - Perform bulk action on content items
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await getAuth(request);
    if (!auth.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids, action } = body;

    // Validate input
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "IDs are required" }, { status: 400 });
    }

    if (!action || !action.type) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    // Perform action based on type
    const batch = db.batch();
    let updateCount = 0;

    for (const id of ids) {
      const docRef = db.collection("users").doc(auth.uid).collection("contentInbox").doc(id);

      switch (action.type) {
        case "delete":
          batch.delete(docRef);
          break;

        case "categorize":
          if (action.payload?.category) {
            batch.update(docRef, {
              category: action.payload.category,
              updatedAt: new Date(),
            });
          }
          break;

        case "markUsed":
          batch.update(docRef, {
            usedAt: new Date(),
            updatedAt: new Date(),
          });
          break;

        case "addTags":
          if (action.payload?.tags && Array.isArray(action.payload.tags)) {
            // Get current tags and merge
            const doc = await docRef.get();
            if (doc.exists) {
              const currentTags = doc.data()?.tags || [];
              const newTags = [...new Set([...currentTags, ...action.payload.tags])];
              batch.update(docRef, {
                tags: newTags,
                updatedAt: new Date(),
              });
            }
          }
          break;

        case "removeTags":
          if (action.payload?.tags && Array.isArray(action.payload.tags)) {
            // Get current tags and remove specified ones
            const doc = await docRef.get();
            if (doc.exists) {
              const currentTags = doc.data()?.tags || [];
              const tagsToRemove = new Set(action.payload.tags);
              const newTags = currentTags.filter((tag) => !tagsToRemove.has(tag));
              batch.update(docRef, {
                tags: newTags,
                updatedAt: new Date(),
              });
            }
          }
          break;

        default:
          console.warn(`Unknown action type: ${action.type}`);
          continue;
      }

      updateCount++;
    }

    // Commit batch
    if (updateCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      updatedCount: updateCount,
      action: action.type,
    });
  } catch (error) {
    console.error("Error performing bulk action:", error);
    return NextResponse.json({ error: "Failed to perform bulk action" }, { status: 500 });
  }
}
