// Content Inbox Update Order API Route

import { NextRequest, NextResponse } from "next/server";

import { getAuth } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase-admin";

// POST - Update the order of content items (for drag and drop)
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await getAuth(request);
    if (!auth.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body;

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items are required" }, { status: 400 });
    }

    // Update order for each item
    const batch = db.batch();

    for (const item of items) {
      if (!item.id || typeof item.order !== "number") {
        console.warn(`Invalid item in order update:`, item);
        continue;
      }

      const docRef = db.collection("users").doc(auth.uid).collection("contentInbox").doc(item.id);

      batch.update(docRef, {
        order: item.order,
        updatedAt: new Date(),
      });
    }

    // Commit batch update
    await batch.commit();

    return NextResponse.json({
      success: true,
      updatedCount: items.length,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
