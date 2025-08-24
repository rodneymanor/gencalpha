// Admin endpoint to manually trigger RSS updates
import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { adminDb, isAdminInitialized } from '@/lib/firebase-admin'
import { scheduledRSSUpdate } from '@/lib/scheduled/rss-updater'
import { getCategoriesNeedingUpdate } from '@/lib/db/rss-cache'

// Check if user is admin
async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const userDoc = await adminDb.collection('users').doc(userId).get()
    if (userDoc.exists) {
      const userData = userDoc.data()
      return userData?.role === 'admin' || userData?.isAdmin === true
    }
    return false
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

// GET: Check RSS update status
export async function GET(request: NextRequest) {
  try {
    // Extract Firebase ID token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Authorization header required'
      }, { status: 401 })
    }

    const idToken = authHeader.substring(7)

    if (!isAdminInitialized) {
      return NextResponse.json({
        success: false,
        error: 'Firebase Admin SDK not configured'
      }, { status: 500 })
    }

    // Verify Firebase ID token
    const auth = getAuth()
    let decodedToken
    try {
      decodedToken = await auth.verifyIdToken(idToken)
    } catch (error) {
      console.error('Token verification failed:', error)
      return NextResponse.json({
        success: false,
        error: 'Invalid Firebase token'
      }, { status: 401 })
    }

    // Check if user is admin
    const isAdmin = await isUserAdmin(decodedToken.uid)
    if (!isAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Admin access required'
      }, { status: 403 })
    }

    // Get categories needing update
    const categoriesNeedingUpdate = await getCategoriesNeedingUpdate()
    
    // Get last update times for all categories
    const categories = ['ai', 'fitness', 'celebrities', 'business', 'gaming']
    const categoryStatus = await Promise.all(
      categories.map(async (category) => {
        const doc = await adminDb.collection('rssCache').doc(category).get()
        const data = doc.exists ? doc.data() : null
        return {
          category,
          lastUpdated: data?.lastUpdated || null,
          nextUpdate: data?.nextUpdate || null,
          itemCount: data?.items?.length || 0,
          needsUpdate: categoriesNeedingUpdate.includes(category as any)
        }
      })
    )

    return NextResponse.json({
      success: true,
      status: {
        categoriesNeedingUpdate: categoriesNeedingUpdate.length,
        categories: categoryStatus,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('RSS status check error:', error)
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}

// POST: Manually trigger RSS update
export async function POST(request: NextRequest) {
  try {
    // Extract Firebase ID token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Authorization header required'
      }, { status: 401 })
    }

    const idToken = authHeader.substring(7)

    if (!isAdminInitialized) {
      return NextResponse.json({
        success: false,
        error: 'Firebase Admin SDK not configured'
      }, { status: 500 })
    }

    // Verify Firebase ID token
    const auth = getAuth()
    let decodedToken
    try {
      decodedToken = await auth.verifyIdToken(idToken)
    } catch (error) {
      console.error('Token verification failed:', error)
      return NextResponse.json({
        success: false,
        error: 'Invalid Firebase token'
      }, { status: 401 })
    }

    // Check if user is admin
    const isAdmin = await isUserAdmin(decodedToken.uid)
    if (!isAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Admin access required'
      }, { status: 403 })
    }

    // Run the RSS update job
    const result = await scheduledRSSUpdate()

    return NextResponse.json({
      success: result.success,
      message: `Manual update: ${result.message}`,
      updated: result.updated,
      categories: result.categories,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Manual RSS update error:', error)
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}