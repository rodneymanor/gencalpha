import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { adminDb, isAdminInitialized } from '@/lib/firebase-admin'
import { rssParser, type Category, type TrendingTopic } from '@/lib/rss-service'

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

    const userId = decodedToken.uid

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') ?? '8')

    // Get user brand settings to determine their preferred categories
    let userCategories: Category[] = []
    
    try {
      const settingsDoc = await adminDb.collection('userBrandSettings').doc(userId).get()
      if (settingsDoc.exists) {
        const settings = settingsDoc.data()
        userCategories = settings?.selectedCategories ?? []
      }
    } catch (error) {
      console.error('Error fetching user brand settings:', error)
    }

    // Fallback to default categories if user has none selected
    if (userCategories.length === 0) {
      userCategories = ['ai', 'business']
    }

    // Fetch trending topics from all user's selected categories
    const allTopics: TrendingTopic[] = []
    
    for (const category of userCategories) {
      try {
        const topics = await rssParser.getTrendingTopics(category, 5)
        allTopics.push(...topics)
      } catch (error) {
        console.error(`Error fetching trending topics for ${category}:`, error)
      }
    }

    // Sort by relevance score and limit results
    const sortedTopics = allTopics
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)

    return NextResponse.json({
      success: true,
      topics: sortedTopics,
      categories: userCategories,
      count: sortedTopics.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('User trending topics error:', error)
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}