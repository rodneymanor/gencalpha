import { NextRequest, NextResponse } from 'next/server'
import { buildAuthHeaders } from '@/lib/http/auth-headers'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    const headers = await buildAuthHeaders()
    const userId = headers['x-user-id']

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    // Get user brand settings from Firestore
    const settingsDoc = await adminDb.collection('userBrandSettings').doc(userId).get()
    
    if (!settingsDoc.exists) {
      return NextResponse.json({
        success: true,
        settings: null,
        message: 'No brand settings found'
      })
    }

    const settings = settingsDoc.data()

    return NextResponse.json({
      success: true,
      settings: {
        userId,
        selectedCategories: settings?.selectedCategories || [],
        customKeywords: settings?.customKeywords || [],
        updatedAt: settings?.updatedAt || new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching brand settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch brand settings'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const headers = await buildAuthHeaders()
    const userId = headers['x-user-id']

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    const body = await request.json()
    const { selectedCategories, customKeywords } = body

    // Validate input
    if (!Array.isArray(selectedCategories)) {
      return NextResponse.json({
        success: false,
        error: 'selectedCategories must be an array'
      }, { status: 400 })
    }

    const settings = {
      userId,
      selectedCategories,
      customKeywords: customKeywords || [],
      updatedAt: new Date().toISOString()
    }

    // Save to Firestore
    await adminDb.collection('userBrandSettings').doc(userId).set(settings, { merge: true })

    return NextResponse.json({
      success: true,
      settings,
      message: 'Brand settings saved successfully'
    })
  } catch (error) {
    console.error('Error saving brand settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to save brand settings'
    }, { status: 500 })
  }
}