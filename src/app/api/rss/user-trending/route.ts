import { NextRequest, NextResponse } from 'next/server'
import { buildAuthHeaders } from '@/lib/http/auth-headers'
import { adminDb } from '@/lib/firebase-admin'
import { rssParser, type Category, type TrendingTopic } from '@/lib/rss-service'

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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '8')

    // Get user brand settings to determine their preferred categories
    let userCategories: Category[] = []
    
    try {
      const settingsDoc = await adminDb.collection('userBrandSettings').doc(userId).get()
      if (settingsDoc.exists) {
        const settings = settingsDoc.data()
        userCategories = settings?.selectedCategories || []
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