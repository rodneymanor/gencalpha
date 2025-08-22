import { NextRequest, NextResponse } from 'next/server'

// RSS feed configuration by category
export const RSS_FEEDS = {
  ai: [
    'https://techcrunch.com/category/artificial-intelligence/feed/',
    'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',
    'https://venturebeat.com/ai/feed/',
    'https://www.artificialintelligence-news.com/feed/',
    'https://www.marktechpost.com/feed/',
    'https://thegradient.pub/rss/',
    'https://openai.com/blog/rss.xml',
    'https://www.anthropic.com/rss.xml',
    'https://deepmind.google/blog/rss.xml',
    'https://huggingface.co/blog/feed.xml',
    'https://stability.ai/blog/rss.xml'
  ],
  fitness: [
    'https://www.menshealth.com/rss/all.xml/',
    'https://www.womenshealthmag.com/rss/all.xml/',
    'https://www.bodybuilding.com/rss/articles',
    'https://www.t-nation.com/feed/',
    'https://www.strongerbyscience.com/feed/',
    'https://www.nerdfitness.com/blog/feed/',
    'https://breakingmuscle.com/feed/',
    'https://www.muscleandfitness.com/feed/',
    'https://www.runnersworld.com/rss/all.xml/',
    'https://www.bicycling.com/rss/all.xml/'
  ],
  celebrities: [
    'https://www.tmz.com/rss.xml',
    'https://pagesix.com/feed/',
    'https://www.eonline.com/syndication/feeds/rssfeeds/topstories.xml',
    'https://hollywoodlife.com/feed/',
    'https://www.usmagazine.com/feed/',
    'https://people.com/feed/',
    'https://www.vanityfair.com/feed/rss',
    'https://www.rollingstone.com/music/feed/'
  ],
  business: [
    'https://feeds.bloomberg.com/markets/news.rss',
    'https://www.forbes.com/real-time/feed2/',
    'https://www.businessinsider.com/rss',
    'https://techcrunch.com/feed/',
    'https://www.wsj.com/xml/rss/3_7085.xml',
    'https://www.ft.com/rss/home'
  ],
  gaming: [
    'https://www.polygon.com/rss/index.xml',
    'https://www.ign.com/rss/articles',
    'https://www.gamespot.com/feeds/news/',
    'https://kotaku.com/rss',
    'https://www.pcgamer.com/rss/',
    'https://www.rockpapershotgun.com/feed'
  ]
} as const

// Keywords for relevance scoring
export const CATEGORY_KEYWORDS = {
  ai: [
    'artificial intelligence', 'machine learning', 'neural network', 'gpt', 
    'llm', 'chatbot', 'deep learning', 'ai model', 'openai', 'anthropic',
    'google ai', 'meta ai', 'generative ai', 'ai tools', 'prompt engineering',
    'ai safety', 'agi', 'computer vision', 'nlp', 'transformer'
  ],
  fitness: [
    'workout', 'exercise', 'training', 'muscle', 'cardio', 'strength',
    'nutrition', 'protein', 'gym', 'fitness', 'health', 'wellness',
    'weight loss', 'bodybuilding', 'crossfit', 'yoga', 'running',
    'diet', 'supplements', 'recovery', 'hiit', 'lifting'
  ],
  celebrities: [
    'celebrity', 'star', 'actor', 'actress', 'singer', 'musician',
    'hollywood', 'red carpet', 'premiere', 'awards', 'scandal',
    'dating', 'breakup', 'marriage', 'divorce', 'exclusive'
  ],
  business: [
    'startup', 'funding', 'ipo', 'merger', 'acquisition', 'revenue',
    'profit', 'stock', 'market', 'economy', 'ceo', 'entrepreneur',
    'venture capital', 'investment', 'unicorn', 'earnings'
  ],
  gaming: [
    'game', 'gaming', 'console', 'pc gaming', 'playstation', 'xbox',
    'nintendo', 'steam', 'esports', 'multiplayer', 'rpg', 'fps',
    'indie game', 'game review', 'gameplay', 'release date'
  ]
} as const

export type Category = keyof typeof RSS_FEEDS

export interface RSSItem {
  id: string
  title: string
  description: string
  link: string
  pubDate: string
  source: string
  category: Category
  relevanceScore: number
  image?: string | null
}

export interface TrendingTopic {
  id: string
  title: string
  description: string
  source: string
  pubDate: string
  relevanceScore: number
}

// Simple in-memory cache (in production, use Redis or similar)
const cache = new Map<string, { data: any; expiry: number }>()
const CACHE_TTL = 2 * 60 * 60 * 1000 // 2 hours

export function getCachedData(key: string) {
  const cached = cache.get(key)
  if (cached && cached.expiry > Date.now()) {
    return cached.data
  }
  cache.delete(key)
  return null
}

export function setCachedData(key: string, data: any) {
  cache.set(key, {
    data,
    expiry: Date.now() + CACHE_TTL
  })
}

export class RSSFeedParser {
  // Calculate relevance score based on keywords
  calculateRelevanceScore(item: any, category: Category): number {
    const keywords = CATEGORY_KEYWORDS[category] || []
    const text = `${item.title} ${item.contentSnippet || ''}`.toLowerCase()
    
    let score = 0
    keywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        score += 2
      }
    })
    
    // Boost score for recent items
    const hoursSincePublished = (Date.now() - new Date(item.pubDate).getTime()) / (1000 * 60 * 60)
    if (hoursSincePublished < 24) score += 3
    else if (hoursSincePublished < 72) score += 1
    
    return score
  }

  // Clean and format content
  cleanContent(text: string): string {
    if (!text) return ''
    // Remove HTML tags
    text = text.replace(/<[^>]*>/g, '')
    // Remove extra whitespace
    text = text.replace(/\s+/g, ' ').trim()
    // Limit length
    return text.length > 300 ? text.substring(0, 297) + '...' : text
  }

  // Parse a single RSS feed using a lightweight XML parser
  async parseFeed(feedUrl: string, category: Category): Promise<RSSItem[]> {
    try {
      console.log(`Fetching feed: ${feedUrl}`)
      
      const response = await fetch(feedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader Bot)',
          'Accept': 'application/rss+xml, application/xml, text/xml'
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const xmlText = await response.text()
      
      // Simple XML parsing for RSS items
      const items = this.parseXMLToItems(xmlText, category, feedUrl)
      
      return items.slice(0, 10) // Limit to 10 items per feed
    } catch (error) {
      console.error(`Error parsing feed ${feedUrl}:`, (error as Error).message)
      return []
    }
  }

  // Simple XML parser for RSS items
  parseXMLToItems(xmlText: string, category: Category, feedUrl: string): RSSItem[] {
    const items: RSSItem[] = []
    
    // Extract channel title for source
    const channelTitleMatch = xmlText.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/)
    const channelTitle = channelTitleMatch?.[1] || channelTitleMatch?.[2] || new URL(feedUrl).hostname
    
    // Match all item tags
    const itemMatches = xmlText.match(/<item[^>]*>[\s\S]*?<\/item>/gi)
    
    if (!itemMatches) return items
    
    itemMatches.forEach((itemXml, index) => {
      try {
        // Extract title
        const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i)
        const title = titleMatch?.[1] || titleMatch?.[2] || 'Untitled'
        
        // Extract description
        const descMatch = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/i)
        const description = this.cleanContent(descMatch?.[1] || descMatch?.[2] || '')
        
        // Extract link
        const linkMatch = itemXml.match(/<link><!\[CDATA\[(.*?)\]\]><\/link>|<link>(.*?)<\/link>/i)
        const link = linkMatch?.[1] || linkMatch?.[2] || ''
        
        // Extract pubDate
        const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/i)
        const pubDate = pubDateMatch?.[1] || new Date().toISOString()
        
        if (title && link) {
          const item = {
            title,
            description,
            link,
            pubDate,
            contentSnippet: description
          }
          
          items.push({
            id: Buffer.from(link).toString('base64').substring(0, 10),
            title,
            description,
            link,
            pubDate,
            source: channelTitle,
            category,
            relevanceScore: this.calculateRelevanceScore(item, category),
            image: null
          })
        }
      } catch (error) {
        console.error('Error parsing individual item:', error)
      }
    })
    
    return items
  }

  // Fetch all feeds for a category
  async fetchCategoryFeeds(category: Category): Promise<RSSItem[]> {
    const cacheKey = `feeds_${category}`
    
    // Check cache first
    const cached = getCachedData(cacheKey)
    if (cached) {
      console.log(`Serving ${category} from cache`)
      return cached
    }

    const feeds = RSS_FEEDS[category] || []
    if (feeds.length === 0) {
      throw new Error(`No feeds configured for category: ${category}`)
    }

    console.log(`Fetching ${feeds.length} feeds for ${category}`)
    
    // Fetch all feeds in parallel
    const promises = feeds.map(feedUrl => this.parseFeed(feedUrl, category))
    const results = await Promise.all(promises)
    
    // Flatten and combine all items
    let allItems = results.flat()
    
    // Remove duplicates based on title similarity
    allItems = this.removeDuplicates(allItems)
    
    // Sort by relevance and recency
    allItems.sort((a, b) => {
      // First sort by relevance score
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore
      }
      // Then by date
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    })
    
    // Limit to top 30 items
    const topItems = allItems.slice(0, 30)
    
    // Cache the results
    setCachedData(cacheKey, topItems)
    
    return topItems
  }

  // Remove duplicate articles based on title similarity
  removeDuplicates(items: RSSItem[]): RSSItem[] {
    const seen = new Set<string>()
    return items.filter(item => {
      // Create a simplified version of the title for comparison
      const simplified = item.title.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 50)
      
      if (seen.has(simplified)) {
        return false
      }
      seen.add(simplified)
      return true
    })
  }

  // Get trending topics (titles only for dropdown)
  async getTrendingTopics(category: Category, limit = 10): Promise<TrendingTopic[]> {
    const items = await this.fetchCategoryFeeds(category)
    
    return items.slice(0, limit).map(item => ({
      id: item.id,
      title: item.title,
      description: item.description.substring(0, 100) + '...',
      source: item.source,
      pubDate: item.pubDate,
      relevanceScore: item.relevanceScore
    }))
  }
}

export const rssParser = new RSSFeedParser()