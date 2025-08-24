// RSS Feed Cache Database Operations
import { adminDb } from '@/lib/firebase-admin'
import type { RSSItem, TrendingTopic, Category } from '@/lib/rss-service'

export interface CachedRSSData {
  category: Category
  items: RSSItem[]
  topics: TrendingTopic[]
  lastUpdated: string
  nextUpdate: string
}

export interface UserTrendingCache {
  userId: string
  topics: TrendingTopic[]
  categories: Category[]
  lastUpdated: string
  nextUpdate: string
}

// Store RSS feed data in Firestore
export async function storeCachedRSSData(category: Category, items: RSSItem[], topics: TrendingTopic[]) {
  const now = new Date()
  const nextUpdate = new Date(now)
  
  // Set next update to 12 hours from now
  nextUpdate.setHours(nextUpdate.getHours() + 12)
  
  const cacheData: CachedRSSData = {
    category,
    items,
    topics,
    lastUpdated: now.toISOString(),
    nextUpdate: nextUpdate.toISOString()
  }
  
  await adminDb
    .collection('rssCache')
    .doc(category)
    .set(cacheData)
  
  return cacheData
}

// Get cached RSS data from Firestore
export async function getCachedRSSData(category: Category): Promise<CachedRSSData | null> {
  try {
    const doc = await adminDb
      .collection('rssCache')
      .doc(category)
      .get()
    
    if (!doc.exists) {
      return null
    }
    
    return doc.data() as CachedRSSData
  } catch (error) {
    console.error('Error getting cached RSS data:', error)
    return null
  }
}

// Store user-specific trending topics cache
export async function storeUserTrendingCache(userId: string, topics: TrendingTopic[], categories: Category[]) {
  const now = new Date()
  const nextUpdate = new Date(now)
  
  // Set next update to 12 hours from now
  nextUpdate.setHours(nextUpdate.getHours() + 12)
  
  const cacheData: UserTrendingCache = {
    userId,
    topics,
    categories,
    lastUpdated: now.toISOString(),
    nextUpdate: nextUpdate.toISOString()
  }
  
  await adminDb
    .collection('userTrendingCache')
    .doc(userId)
    .set(cacheData)
  
  return cacheData
}

// Get user-specific trending cache
export async function getUserTrendingCache(userId: string): Promise<UserTrendingCache | null> {
  try {
    const doc = await adminDb
      .collection('userTrendingCache')
      .doc(userId)
      .get()
    
    if (!doc.exists) {
      return null
    }
    
    const data = doc.data() as UserTrendingCache
    
    // Check if cache is still valid
    if (new Date(data.nextUpdate) > new Date()) {
      return data
    }
    
    return null // Cache expired
  } catch (error) {
    console.error('Error getting user trending cache:', error)
    return null
  }
}

// Bulk update all category caches
export async function bulkUpdateRSSCache(updates: Map<Category, { items: RSSItem[], topics: TrendingTopic[] }>) {
  const batch = adminDb.batch()
  const now = new Date()
  const nextUpdate = new Date(now)
  nextUpdate.setHours(nextUpdate.getHours() + 12)
  
  updates.forEach((data, category) => {
    const cacheData: CachedRSSData = {
      category,
      items: data.items,
      topics: data.topics,
      lastUpdated: now.toISOString(),
      nextUpdate: nextUpdate.toISOString()
    }
    
    const docRef = adminDb.collection('rssCache').doc(category)
    batch.set(docRef, cacheData)
  })
  
  await batch.commit()
  console.log(`Updated RSS cache for ${updates.size} categories`)
}

// Check if any category needs updating
export async function getCategoriesNeedingUpdate(): Promise<Category[]> {
  const categories: Category[] = ['ai', 'fitness', 'celebrities', 'business', 'gaming']
  const needsUpdate: Category[] = []
  
  for (const category of categories) {
    const cache = await getCachedRSSData(category)
    
    if (!cache || new Date(cache.nextUpdate) <= new Date()) {
      needsUpdate.push(category)
    }
  }
  
  return needsUpdate
}