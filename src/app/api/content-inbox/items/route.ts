// Content Inbox Items API Route

import { NextRequest, NextResponse } from "next/server";

import { getAdminDb, isAdminInitialized } from "@/lib/firebase-admin";
import { authenticateWithFirebaseToken } from "@/lib/firebase-auth-helpers";
import { authenticateApiKey } from "@/lib/api-key-auth";

// GET - Fetch content items with pagination and filters
export async function GET(request: NextRequest) {
  try {
    // Authenticate with Firebase token or API key
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    
    // Check if it's an API key
    let authResult;
    if (token.startsWith("gencbeta_")) {
      authResult = await authenticateApiKey(request);
    } else {
      authResult = await authenticateWithFirebaseToken(token);
    }
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    if (!isAdminInitialized) {
      return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });
    }
    
    const adminDb = getAdminDb();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "20");
    const filters = JSON.parse(searchParams.get("filters") || "{}");
    const sort = JSON.parse(searchParams.get("sort") || '{"field":"savedAt","direction":"desc"}');

    // Build query
    let query = adminDb.collection("users").doc(authResult.user.uid).collection("contentInbox");

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

    // Simplified query - just get all docs and sort in memory to avoid index requirement
    // We'll handle sorting and pagination in memory for now
    const snapshot = await query.get();
    
    // Convert to array and add IDs
    const allItems = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Ensure dates are serializable
      savedAt: doc.data().savedAt?.toDate?.() || doc.data().savedAt,
      viewedAt: doc.data().viewedAt?.toDate?.() || doc.data().viewedAt,
      usedAt: doc.data().usedAt?.toDate?.() || doc.data().usedAt,
    }));

    // Sort in memory
    allItems.sort((a, b) => {
      // First, prioritize pinned items
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Then sort by the requested field
      const sortField = sort.field === "custom" ? "order" : sort.field;
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      
      // Handle date comparison
      if (sortField === "savedAt" || sortField === "viewedAt" || sortField === "usedAt") {
        const aTime = new Date(aValue).getTime();
        const bTime = new Date(bValue).getTime();
        return sort.direction === "asc" ? aTime - bTime : bTime - aTime;
      }
      
      // Handle numeric comparison
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sort.direction === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      // Handle string comparison
      const comparison = String(aValue).localeCompare(String(bValue));
      return sort.direction === "asc" ? comparison : -comparison;
    });

    // Apply pagination in memory
    const startAt = page * limit;
    const endAt = startAt + limit;
    const items = allItems.slice(startAt, endAt);
    const hasMore = allItems.length > endAt;

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
    // Authenticate with Firebase token or API key
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    
    // Check if it's an API key
    let authResult;
    if (token.startsWith("gencbeta_")) {
      authResult = await authenticateApiKey(request);
    } else {
      authResult = await authenticateWithFirebaseToken(token);
    }
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    if (!isAdminInitialized) {
      return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });
    }
    
    const adminDb = getAdminDb();

    const body = await request.json();
    const { url, platform, category, tags, title, content, description } = body;

    // Validate required fields
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Create content item
    const contentItem = {
      url,
      title: title || null,
      content: content || null,
      description: description || null,
      platform: platform || "unknown",
      category: category || "inspiration",
      tags: tags || [],
      savedAt: new Date(),
      transcription: {
        status: "pending",
      },
      userId: authResult.user.uid,
    };

    // Save to database
    const docRef = await adminDb.collection("users").doc(authResult.user.uid).collection("contentInbox").add(contentItem);

    // Trigger transcription job (async)
    // This would typically trigger a background job to fetch and transcribe the content
    triggerTranscription(docRef.id, url, authResult.user.uid, adminDb);

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
    // Authenticate with Firebase token
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

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "IDs are required" }, { status: 400 });
    }

    // Delete items
    const batch = adminDb.batch();
    for (const id of ids) {
      const docRef = adminDb.collection("users").doc(authResult.user.uid).collection("contentInbox").doc(id);

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
async function triggerTranscription(itemId: string, url: string, userId: string, adminDb: any) {
  try {
    // This would typically call your transcription service
    // For now, we'll just update the status after a delay
    setTimeout(async () => {
      await adminDb.collection("users").doc(userId).collection("contentInbox").doc(itemId).update({
        "transcription.status": "processing",
        "transcription.progress": 0,
      });

      // Simulate processing
      setTimeout(async () => {
        await adminDb.collection("users").doc(userId).collection("contentInbox").doc(itemId).update({
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
