import { NextRequest, NextResponse } from 'next/server'
import { rssParser, type Category, RSS_FEEDS } from '@/lib/rss-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const category = params.category as Category
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Validate category
    if (!RSS_FEEDS[category]) {
      return NextResponse.json({
        success: false,
        error: `Invalid category: ${category}. Available categories: ${Object.keys(RSS_FEEDS).join(', ')}`
      }, { status: 400 })
    }

    const topics = await rssParser.getTrendingTopics(category, limit)

    return NextResponse.json({
      success: true,
      category,
      topics,
      count: topics.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('RSS trending error:', error)
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const category = params.category as Category

    // Validate category
    if (!RSS_FEEDS[category]) {
      return NextResponse.json({
        success: false,
        error: `Invalid category: ${category}`
      }, { status: 400 })
    }

    // Force refresh cache by fetching without cache
    const items = await rssParser.fetchCategoryFeeds(category)

    return NextResponse.json({
      success: true,
      message: 'Cache refreshed',
      category,
      itemCount: items.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('RSS refresh error:', error)
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}