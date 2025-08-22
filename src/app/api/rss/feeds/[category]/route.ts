import { NextRequest, NextResponse } from 'next/server'
import { rssParser, type Category, RSS_FEEDS } from '@/lib/rss-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const category = params.category as Category

    // Validate category
    if (!RSS_FEEDS[category]) {
      return NextResponse.json({
        success: false,
        error: `Invalid category: ${category}. Available categories: ${Object.keys(RSS_FEEDS).join(', ')}`
      }, { status: 400 })
    }

    const items = await rssParser.fetchCategoryFeeds(category)

    return NextResponse.json({
      success: true,
      category,
      items,
      count: items.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('RSS feeds error:', error)
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}