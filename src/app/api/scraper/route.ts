import { NextRequest, NextResponse } from "next/server";

import axios from "axios";
import * as cheerio from "cheerio";

// Enhanced SPA detection
function detectSPAContent($: cheerio.CheerioAPI, html: string): boolean {
  // Look for SPA indicators
  const hasReactProps = html.includes("__REACT_DEVTOOLS_GLOBAL_HOOK__");
  const hasNextData = html.includes("__NEXT_DATA__");
  const hasVueApp = html.includes("data-v-") || html.includes("v-");
  const hasAngular = html.includes("ng-version");

  // Check for JSON-LD structured data
  const jsonLdScripts = $('script[type="application/ld+json"]');
  if (jsonLdScripts.length > 0) {
    // Try extracting from structured data
    return true;
  }

  // Check for common SPA patterns
  const hasAppRoot = $("[data-reactroot], [data-ng-app], [data-vue-app]").length > 0;
  const hasClientRouting = html.includes("window.history") || html.includes("router");

  return hasReactProps || hasNextData || hasVueApp || hasAngular || hasAppRoot || hasClientRouting;
}

// Enhanced static scraping with better selectors
async function tryEnhancedStaticScraping(url: string): Promise<ScrapeResponse["data"] | null> {
  try {
    console.log("🔍 Attempting enhanced static scraping for:", url);

    const axiosConfig = {
      timeout: 30000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
      },
      maxRedirects: 5,
      validateStatus: (status: number) => status < 400,
    };

    const response = await axios.get(url, axiosConfig);
    const $ = cheerio.load(response.data);

    // Check if this is a SPA that needs special handling
    if (detectSPAContent($, response.data)) {
      console.log("🔄 Detected SPA content, will try AI fallback");
      return null; // Let AI handle SPA content
    }

    // Enhanced content extraction
    const title = $("title").text() || $("h1").first().text() || "No title found";

    // Extract headings with better filtering
    const headings: string[] = [];
    $("h1, h2, h3, h4, h5, h6").each((_, element) => {
      const text = $(element).text().trim();
      if (text && text.length > 0 && !text.includes("Skip to")) {
        headings.push(cleanText(text));
      }
    });

    // Extract paragraphs with better filtering
    const paragraphs: string[] = [];
    $("p").each((_, element) => {
      const text = $(element).text().trim();
      if (text && text.length > 20 && !text.includes("cookie") && !text.includes("privacy")) {
        paragraphs.push(cleanText(text));
      }
    });

    // Enhanced main content extraction
    const allText = extractEnhancedMainContent($);

    // Only return if we have substantial content
    if (allText.length > 500) {
      console.log("✅ Enhanced static scraping successful, content length:", allText.length);
      return {
        url,
        title: cleanText(title),
        headings,
        paragraphs,
        allText,
        extractedAt: new Date().toISOString(),
      };
    }

    console.log("⚠️ Enhanced static scraping found insufficient content:", allText.length);
    return null;
  } catch (error) {
    console.error("❌ Enhanced static scraping failed:", error);
    return null;
  }
}

// Enhanced main content extraction
function extractEnhancedMainContent($: cheerio.CheerioAPI): string {
  const contentSelectors = [
    "main",
    ".main-content",
    ".content",
    ".post-content",
    ".entry-content",
    ".article-content",
    "article",
    ".post-body",
    "#content",
    ".container",
    ".page-content",
    ".story-content",
    ".text-content",
    ".body-content",
  ];

  for (const selector of contentSelectors) {
    const content = $(selector).first();
    if (content.length > 0) {
      // Remove unwanted elements
      content
        .find("script, style, .ad, .advertisement, .ads, .social-share, .comments, nav, header, footer, .sidebar")
        .remove();
      const text = content.text();
      if (text.length > 200) {
        return cleanText(text);
      }
    }
  }

  // Fallback to body with better cleaning
  $("script, style, .ad, .advertisement, .ads, nav, header, footer, .sidebar, .social-share, .comments").remove();
  return cleanText($("body").text());
}

// Browserless service fallback
async function tryBrowserlessService(url: string): Promise<ScrapeResponse["data"] | null> {
  try {
    console.log("🌐 Trying browserless service for:", url);

    const browserlessUrl = process.env.BROWSERLESS_URL ?? "https://chrome.browserless.io/content";
    const browserlessToken = process.env.BROWSERLESS_API_KEY;

    if (!browserlessToken) {
      console.log("⚠️ No browserless token configured");
      return null;
    }

    const response = await axios.post(
      browserlessUrl,
      {
        url: url,
        gotoOptions: {
          waitUntil: "networkidle0",
          timeout: 30000,
        },
        setExtraHTTPHeaders: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${browserlessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 45000,
      },
    );

    if (response.data && response.data.content) {
      const $ = cheerio.load(response.data.content);
      const title = $("title").text() || $("h1").first().text() || "No title found";
      const allText = extractEnhancedMainContent($);

      if (allText.length > 500) {
        console.log("✅ Browserless service successful, content length:", allText.length);
        return {
          url,
          title: cleanText(title),
          headings: [],
          paragraphs: allText.split("\n").filter((p) => p.trim().length > 20),
          allText,
          extractedAt: new Date().toISOString(),
        };
      }
    }

    console.log("❌ Browserless service failed or insufficient content");
    return null;
  } catch (error) {
    console.error("💥 Browserless service error:", error);
    return null;
  }
}

// Fallback using Gemini API for protected URLs
async function tryGeminiFallback(url: string): Promise<string | null> {
  try {
    console.log("🤖 Trying Gemini fallback for:", url);

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": process.env.GEMINI_API_KEY ?? "AIzaSyDoGxioO33UxmUeQywDnd9Omt6IrbtzwqY",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Extract and summarize the main content from this web page: ${url}`,
                },
              ],
            },
          ],
          tools: [
            {
              url_context: {},
            },
          ],
        }),
      },
    );

    const data = await geminiResponse.json();
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      const geminiText = data.candidates[0].content.parts[0].text;

      // Check if Gemini successfully retrieved content
      if (!geminiText.includes("unable to access") && !geminiText.includes("cannot access")) {
        console.log("✨ Gemini fallback successful for:", url);
        return geminiText;
      }
    }

    console.log("❌ Gemini fallback also failed for:", url);
    return null;
  } catch (error) {
    console.error("💥 Gemini fallback error:", error);
    return null;
  }
}

// Enhanced hybrid approach
async function intelligentScraping(url: string): Promise<ScrapeResponse> {
  console.log("🚀 Starting intelligent scraping for:", url);

  // 1. Try enhanced static scraping with better selectors
  const staticResult = await tryEnhancedStaticScraping(url);
  if (staticResult && staticResult.allText.length > 500) {
    console.log("✅ Static scraping successful");
    return { success: true, data: staticResult };
  }

  // 2. Skip Playwright entirely - go straight to AI
  console.log("🤖 Trying AI fallback...");
  const aiResult = await tryGeminiFallback(url);
  if (aiResult) {
    console.log("✅ AI fallback successful");
    return {
      success: true,
      data: {
        url,
        title: "Content extracted via AI",
        headings: [],
        paragraphs: aiResult.split("\n").filter((p) => p.trim().length > 20),
        allText: aiResult,
        extractedAt: new Date().toISOString(),
      },
    };
  }

  // 3. Try external browser service as final fallback
  console.log("🌐 Trying browserless service...");
  const browserlessResult = await tryBrowserlessService(url);
  if (browserlessResult) {
    console.log("✅ Browserless service successful");
    return { success: true, data: browserlessResult };
  }

  console.log("❌ All methods failed");
  return { success: false, error: "All scraping methods failed" };
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
  return text.replace(/\s+/g, " ").replace(/\n+/g, " ").trim();
}

// Helper function to extract main content with fallback selectors
function extractMainContent($: cheerio.CheerioAPI): string {
  const contentSelectors = [
    "main",
    ".main-content",
    ".content",
    ".post-content",
    ".entry-content",
    ".article-content",
    "article",
    ".post-body",
    "#content",
    ".container",
  ];

  for (const selector of contentSelectors) {
    const content = $(selector).first();
    if (content.length > 0) {
      // Remove scripts, styles, and ads
      content.find("script, style, .ad, .advertisement, .ads").remove();
      const text = content.text();
      if (text.length > 100) {
        return cleanText(text);
      }
    }
  }

  // Fallback to body if no main content found
  $("script, style, .ad, .advertisement, .ads, nav, header, footer").remove();
  return cleanText($("body").text());
}

export async function POST(request: NextRequest) {
  try {
    const body: ScrapeRequest = await request.json();

    if (!body.url) {
      return NextResponse.json({ success: false, error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(body.url);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid URL format" }, { status: 400 });
    }

    console.log("🌐 Starting intelligent scrape for:", body.url);

    // Use the new intelligent scraping approach
    const result = await intelligentScraping(body.url);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to scrape content",
          details: result.error ?? "All scraping methods failed",
        },
        { status: 500 },
      );
    }

    // Handle custom selectors if provided
    if (body.selectors && Object.keys(body.selectors).length > 0 && result.data) {
      try {
        // Re-fetch the page for custom selectors if needed
        const response = await axios.get(body.url, {
          timeout: 30000,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });

        const $ = cheerio.load(response.data);
        const customSelectors: Record<string, string[]> = {};

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

        result.data.customSelectors = customSelectors;
      } catch (error) {
        console.warn("⚠️ Failed to extract custom selectors:", error);
      }
    }

    console.log("🎉 Intelligent scrape completed successfully:", {
      url: body.url,
      titleLength: result.data!.title.length,
      headingsCount: result.data!.headings.length,
      paragraphsCount: result.data!.paragraphs.length,
      textLength: result.data!.allText.length,
      customSelectorsCount: result.data!.customSelectors ? Object.keys(result.data!.customSelectors).length : 0,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("💥 Unexpected error in scraper:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
