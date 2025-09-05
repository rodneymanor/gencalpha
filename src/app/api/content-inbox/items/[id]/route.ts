// Content Inbox Individual Item API Route

import { NextRequest, NextResponse } from "next/server";

import { getAdminAuth, adminDb } from "@/lib/firebase-admin";

// PATCH - Update content item
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate user
    const auth = await getAdminAuth();
    if (!auth.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Get the document reference
    const docRef = adminDb.collection("users").doc(auth.uid).collection("contentInbox").doc(id);

    // Check if document exists
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Update the document
    await docRef.update({
      ...body,
      updatedAt: new Date(),
    });

    // Get updated document
    const updatedDoc = await docRef.get();

    return NextResponse.json({
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });
  } catch (error) {
    console.error("Error updating content item:", error);
    return NextResponse.json({ error: "Failed to update content item" }, { status: 500 });
  }
}

// DELETE - Delete single content item
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate user
    const auth = await getAdminAuth();
    if (!auth.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Delete the document
    await adminDb.collection("users").doc(auth.uid).collection("contentInbox").doc(id).delete();

    return NextResponse.json({
      success: true,
      deletedId: id,
    });
  } catch (error) {
    console.error("Error deleting content item:", error);
    return NextResponse.json({ error: "Failed to delete content item" }, { status: 500 });
  }
}
