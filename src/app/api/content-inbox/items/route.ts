// Content Inbox Items API Route

import { NextRequest, NextResponse } from "next/server";

import { getAuth } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase-admin";

// GET - Fetch content items with pagination and filters
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await getAuth(request);
    if (!auth.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "20");
    const filters = JSON.parse(searchParams.get("filters") || "{}");
    const sort = JSON.parse(searchParams.get("sort") || '{"field":"savedAt","direction":"desc"}');

    // Build query
    let query = db.collection("users").doc(auth.uid).collection("contentInbox");

    // Apply filters
    if (filters.platforms && filters.platforms.length > 0) {
      query = query.where("platform", "in", filters.platforms);
    }

    if (filters.categories && filters.categories.length > 0) {
      query = query.where("category", "in", filters.categories);
    }

    if (filters.transcriptionStatus && filters.transcriptionStatus.length > 0) {
      query = query.where("transcription.status", "in", filters.transcriptionStatus);
    }

    if (filters.dateRange) {
      query = query
        .where("savedAt", ">=", new Date(filters.dateRange.from))
        .where("savedAt", "<=", new Date(filters.dateRange.to));
    }

    // Apply sorting
    const sortField = sort.field === "custom" ? "order" : sort.field;
    query = query.orderBy(sortField, sort.direction);

    // Apply pagination
    const startAt = page * limit;
    query = query.limit(limit + 1); // Get one extra to check if there are more

    // Execute query
    const snapshot = await query.get();
    const items = [];
    let hasMore = false;

    snapshot.forEach((doc, index) => {
      if (index < limit) {
        items.push({
          id: doc.id,
          ...doc.data(),
        });
      } else {
        hasMore = true;
      }
    });

    // Apply text search if needed (client-side for now)
    let filteredItems = items;
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      filteredItems = items.filter(
        (item) =>
          item.title?.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower) ||
          item.transcription?.text?.toLowerCase().includes(searchLower) ||
          item.creator?.name?.toLowerCase().includes(searchLower) ||
          item.tags?.some((tag) => tag.toLowerCase().includes(searchLower)),
      );
    }

    return NextResponse.json({
      items: filteredItems,
      hasMore,
      page,
      total: filteredItems.length,
    });
  } catch (error) {
    console.error("Error fetching content items:", error);
    return NextResponse.json({ error: "Failed to fetch content items" }, { status: 500 });
  }
}

// POST - Add new content item
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await getAuth(request);
    if (!auth.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url, platform, category, tags } = body;

    // Validate required fields
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Create content item
    const contentItem = {
      url,
      platform: platform || "unknown",
      category: category || "inspiration",
      tags: tags || [],
      savedAt: new Date(),
      transcription: {
        status: "pending",
      },
      userId: auth.uid,
    };

    // Save to database
    const docRef = await db.collection("users").doc(auth.uid).collection("contentInbox").add(contentItem);

    // Trigger transcription job (async)
    // This would typically trigger a background job to fetch and transcribe the content
    triggerTranscription(docRef.id, url, auth.uid);

    return NextResponse.json({
      id: docRef.id,
      ...contentItem,
    });
  } catch (error) {
    console.error("Error adding content item:", error);
    return NextResponse.json({ error: "Failed to add content item" }, { status: 500 });
  }
}

// DELETE - Delete content items
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await getAuth(request);
    if (!auth.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "IDs are required" }, { status: 400 });
    }

    // Delete items
    const batch = db.batch();
    for (const id of ids) {
      const docRef = db.collection("users").doc(auth.uid).collection("contentInbox").doc(id);

      batch.delete(docRef);
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      deletedCount: ids.length,
    });
  } catch (error) {
    console.error("Error deleting content items:", error);
    return NextResponse.json({ error: "Failed to delete content items" }, { status: 500 });
  }
}

// Helper function to trigger transcription
async function triggerTranscription(itemId: string, url: string, userId: string) {
  try {
    // This would typically call your transcription service
    // For now, we'll just update the status after a delay
    setTimeout(async () => {
      await db.collection("users").doc(userId).collection("contentInbox").doc(itemId).update({
        "transcription.status": "processing",
        "transcription.progress": 0,
      });

      // Simulate processing
      setTimeout(async () => {
        await db.collection("users").doc(userId).collection("contentInbox").doc(itemId).update({
          "transcription.status": "complete",
          "transcription.progress": 100,
          "transcription.text": "This is a sample transcription of the content.",
        });
      }, 5000);
    }, 1000);
  } catch (error) {
    console.error("Error triggering transcription:", error);
  }
}
