import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Fallback using Gemini API for protected URLs
async function tryGeminiFallback(url: string): Promise<string | null> {
  try {
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'x-goog-api-key': process.env.GEMINI_API_KEY || 'AIzaSyDoGxioO33UxmUeQywDnd9Omt6IrbtzwqY',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Extract and summarize the main content from this web page: ${url}`
          }]
        }],
        tools: [{
          url_context: {}
        }]
      })
    });

    const data = await geminiResponse.json();
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      const geminiText = data.candidates[0].content.parts[0].text;
      
      // Check if Gemini successfully retrieved content
      if (!geminiText.includes('unable to access') && !geminiText.includes('cannot access')) {
        console.log('✨ Gemini fallback successful for:', url);
        return geminiText;
      }
    }
    
    console.log('❌ Gemini fallback also failed for:', url);
    return null;
  } catch (error) {
    console.error('💥 Gemini fallback error:', error);
    return null;
  }
}

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

    // Configure axios with more realistic browser headers
    const axiosConfig = {
      timeout: 30000, // 30 seconds
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
      },
      maxRedirects: 5,
      validateStatus: (status: number) => status < 400,
    };

    // Fetch the webpage with retry logic
    let response;
    let lastError;
    
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxRetries} for: ${body.url}`);
        response = await axios.get(body.url, axiosConfig);
        break; // Success, exit retry loop
      } catch (error: any) {
        lastError = error;
        console.error(`❌ Attempt ${attempt} failed:`, error.message);
        
        // Don't retry for certain errors
        if (error.response?.status === 404 || error.response?.status === 403) {
          break;
        }
        
        // Wait before retrying (except on last attempt)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    // Handle final error if all retries failed
    if (!response && lastError) {
      console.error('❌ All retry attempts failed:', lastError.message);
      
      if (lastError.code === 'ENOTFOUND') {
        return NextResponse.json(
          {
            success: false,
            error: 'Website not found',
            details: 'Could not resolve the domain name'
          },
          { status: 404 }
        );
      }
      
      if (lastError.code === 'ETIMEDOUT') {
        return NextResponse.json(
          {
            success: false,
            error: 'Request timeout',
            details: 'The website took too long to respond'
          },
          { status: 408 }
        );
      }

      // Try Gemini fallback for 403 errors
      if (lastError.response?.status === 403) {
        console.log('🤖 Trying Gemini fallback for blocked URL:', body.url);
        const geminiContent = await tryGeminiFallback(body.url);
        
        if (geminiContent) {
          const result: ScrapeResponse = {
            success: true,
            data: {
              url: body.url,
              title: 'Content extracted via AI',
              headings: [],
              paragraphs: geminiContent.split('\n').filter(p => p.trim().length > 20),
              allText: geminiContent,
              extractedAt: new Date().toISOString(),
            }
          };

          console.log('🎉 Gemini fallback successful:', {
            url: body.url,
            contentLength: geminiContent.length
          });

          return NextResponse.json(result);
        }

        return NextResponse.json(
          {
            success: false,
            error: 'Access forbidden',
            details: 'The website blocked our request and AI fallback also failed. Try a different URL or check if the site has anti-bot protection.'
          },
          { status: 403 }
        );
      }

      if (lastError.response?.status === 404) {
        return NextResponse.json(
          {
            success: false,
            error: 'Page not found',
            details: 'The requested page does not exist. Please check the URL.'
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch webpage',
          details: lastError.message
        },
        { status: 500 }
      );
    }

    if (!response) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch webpage',
          details: 'No response received from the server'
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