import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface ScrapeRequest {
  url: string;
  selectors?: Record<string, string>;
}

interface ScrapeResponse {
  success: boolean;
  data?: {
    url: string;
    title: string;
    headings: string[];
    paragraphs: string[];
    allText: string;
    extractedAt: string;
    customSelectors?: Record<string, string[]>;
  };
  error?: string;
  details?: string;
}

// Helper function to clean text content
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim();
}

// Helper function to extract main content with fallback selectors
function extractMainContent($: cheerio.CheerioAPI): string {
  const contentSelectors = [
    'main',
    '.main-content',
    '.content',
    '.post-content',
    '.entry-content',
    '.article-content',
    'article',
    '.post-body',
    '#content',
    '.container'
  ];

  for (const selector of contentSelectors) {
    const content = $(selector).first();
    if (content.length > 0) {
      // Remove scripts, styles, and ads
      content.find('script, style, .ad, .advertisement, .ads').remove();
      const text = content.text();
      if (text.length > 100) {
        return cleanText(text);
      }
    }
  }

  // Fallback to body if no main content found
  $('script, style, .ad, .advertisement, .ads, nav, header, footer').remove();
  return cleanText($('body').text());
}

export async function POST(request: NextRequest) {
  try {
    const body: ScrapeRequest = await request.json();
    
    if (!body.url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(body.url);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    console.log('🌐 Starting scrape for:', body.url);

    // Configure axios with proper headers and timeout
    const axiosConfig = {
      timeout: 30000, // 30 seconds
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      maxRedirects: 5,
      validateStatus: (status: number) => status < 400,
    };

    // Fetch the webpage
    let response;
    try {
      response = await axios.get(body.url, axiosConfig);
    } catch (error: any) {
      console.error('❌ Axios error:', error.message);
      
      if (error.code === 'ENOTFOUND') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Website not found',
            details: 'Could not resolve the domain name'
          },
          { status: 404 }
        );
      }
      
      if (error.code === 'ETIMEDOUT') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Request timeout',
            details: 'The website took too long to respond'
          },
          { status: 408 }
        );
      }

      if (error.response?.status === 403) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Access forbidden',
            details: 'The website blocked our request'
          },
          { status: 403 }
        );
      }

      if (error.response?.status === 404) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Page not found',
            details: 'The requested page does not exist'
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch webpage',
          details: error.message
        },
        { status: 500 }
      );
    }

    console.log('✅ Successfully fetched:', body.url);
    
    // Parse HTML with Cheerio
    const $ = cheerio.load(response.data);
    
    // Extract basic content
    const title = $('title').text() || $('h1').first().text() || 'No title found';
    
    // Extract headings
    const headings: string[] = [];
    $('h1, h2, h3, h4, h5, h6').each((_, element) => {
      const text = $(element).text().trim();
      if (text && text.length > 0) {
        headings.push(cleanText(text));
      }
    });

    // Extract paragraphs
    const paragraphs: string[] = [];
    $('p').each((_, element) => {
      const text = $(element).text().trim();
      if (text && text.length > 20) { // Filter out very short paragraphs
        paragraphs.push(cleanText(text));
      }
    });

    // Extract all text content
    const allText = extractMainContent($);

    // Handle custom selectors if provided
    let customSelectors: Record<string, string[]> | undefined;
    if (body.selectors && Object.keys(body.selectors).length > 0) {
      customSelectors = {};
      
      for (const [name, selector] of Object.entries(body.selectors)) {
        const elements: string[] = [];
        
        try {
          $(selector).each((_, element) => {
            const text = $(element).text().trim();
            if (text) {
              elements.push(cleanText(text));
            }
          });
          
          customSelectors[name] = elements;
        } catch (error) {
          console.warn(`⚠️ Invalid selector "${selector}" for "${name}":`, error);
          customSelectors[name] = [];
        }
      }
    }

    const result: ScrapeResponse = {
      success: true,
      data: {
        url: body.url,
        title: cleanText(title),
        headings,
        paragraphs,
        allText,
        extractedAt: new Date().toISOString(),
        ...(customSelectors && { customSelectors })
      }
    };

    console.log('🎉 Scrape completed successfully:', {
      url: body.url,
      titleLength: result.data!.title.length,
      headingsCount: result.data!.headings.length,
      paragraphsCount: result.data!.paragraphs.length,
      textLength: result.data!.allText.length,
      customSelectorsCount: customSelectors ? Object.keys(customSelectors).length : 0
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('💥 Unexpected error in scraper:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}