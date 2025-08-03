import { NextRequest, NextResponse } from "next/server";

import axios from "axios";
import * as cheerio from "cheerio";

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

    // Rotate between multiple realistic user agents
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
    ];

    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

    const axiosConfig = {
      timeout: 30000,
      headers: {
        "User-Agent": randomUserAgent,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
        // Add browser-specific headers
        "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
      },
      maxRedirects: 5,
      validateStatus: (status: number) => status < 400,
    };

    // Add random delay to avoid detection
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000 + 1000));

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

// BrowserQL with Cloudflare bypass
async function tryBrowserQL(url: string): Promise<ScrapeResponse["data"] | null> {
  try {
    console.log("🚀 Trying BrowserQL with Cloudflare bypass for:", url);

    const browserQLToken = process.env.BROWSERLESS_API_KEY;
    if (!browserQLToken) {
      console.log("⚠️ No BrowserQL token configured");
      return null;
    }

    const browserQLQuery = {
      query: `mutation ExtractPageTextWithCloudflareBypass($url: String!) {
        goto(url: $url, waitUntil: networkIdle) {
          status
        }
        checkForChallenge: waitForSelector(
          selector: "[data-cf-beacon], .cf-turnstile, a[href*=\\"cloudflare.com\\"], body:contains(\\"Verifying you are human\\"), body:contains(\\"Just a moment\\")"
          timeout: 5000
        ) {
          time
        }
        solveChallenge: if(
          selector: "[data-cf-beacon], .cf-turnstile, a[href*=\\"cloudflare.com\\"], body:contains(\\"Verifying you are human\\"), body:contains(\\"Just a moment\\")"
        ) {
          verify(type: cloudflare, timeout: 45000) {
            found
            solved
            time
          }
        }
        waitAfterSolve: waitForSelector(selector: "body", timeout: 10000) {
          time
        }
        extractText: text(visible: true) {
          text
        }
        extractStructured: mapSelector(
          selector: "p, h1, h2, h3, h4, h5, h6, article, section, div[class*=\\"content\\"], div[class*=\\"text\\"], span[class*=\\"text\\"]"
        ) {
          content: innerText
          htmlContent: innerHTML
          elementId: id
          cssClasses: class
        }
      }`,
      variables: { url },
    };

    const response = await axios.post("https://production-sfo.browserless.io/chrome/bql", browserQLQuery, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${browserQLToken}`,
      },
      params: {
        token: browserQLToken,
      },
      timeout: 90000, // 90 seconds timeout for Cloudflare solving
    });

    if (response.data?.data) {
      const { extractText, extractStructured, goto, solveChallenge } = response.data.data;

      // Log Cloudflare challenge results
      if (solveChallenge?.verify) {
        console.log("🔐 Cloudflare challenge:", {
          found: solveChallenge.verify.found,
          solved: solveChallenge.verify.solved,
          time: solveChallenge.verify.time,
        });
      }

      // Check if we got substantial content
      if (extractText?.text && extractText.text.length > 500) {
        // Extract headings and paragraphs from structured data
        const headings: string[] = [];
        const paragraphs: string[] = [];

        extractStructured?.forEach((element: any) => {
          const content = element.content?.trim();
          if (content && content.length > 0) {
            // Determine if it's likely a heading based on CSS classes or content length
            const hasHeadingClass = element.cssClasses?.some(
              (cls: string) =>
                cls.includes("heading") || cls.includes("title") || cls.includes("h1") || cls.includes("h2"),
            );
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            const isHeading = (hasHeadingClass ?? false) || content.length < 100;

            if (isHeading && content.length < 200) {
              headings.push(cleanText(content));
            } else if (content.length > 20) {
              paragraphs.push(cleanText(content));
            }
          }
        });

        const title = headings[0] || "Content extracted via BrowserQL";
        const allText = cleanText(extractText.text);

        console.log("✅ BrowserQL successful:", {
          status: goto.status,
          contentLength: allText.length,
          headingsCount: headings.length,
          paragraphsCount: paragraphs.length,
        });

        return {
          url,
          title,
          headings,
          paragraphs,
          allText,
          extractedAt: new Date().toISOString(),
        };
      } else {
        console.log("❌ BrowserQL returned insufficient content");
        return null;
      }
    }

    console.log("❌ BrowserQL returned empty response");
    return null;
  } catch (error: any) {
    console.error("💥 BrowserQL error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    return null;
  }
}

// Steel browser with anti-detection
async function trySteel(url: string): Promise<ScrapeResponse["data"] | null> {
  try {
    console.log("🚀 Trying Steel browser for:", url);

    const steelApiKey = process.env.STEEL_API_KEY;
    if (!steelApiKey) {
      console.log("⚠️ No Steel API key configured");
      return null;
    }

    // Create a new session with anti-detection
    const sessionResponse = await axios.post(
      "https://api.steel.dev/v1/sessions",
      {
        solve_captcha: true,
        user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        proxy_country: "US",
        stealth: true,
      },
      {
        headers: {
          Authorization: `Bearer ${steelApiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    const sessionId = sessionResponse.data.id;

    // Navigate to the page with full rendering
    await axios.post(
      `https://api.steel.dev/v1/sessions/${sessionId}/navigate`,
      {
        url: url,
        wait_for: "networkidle",
      },
      {
        headers: { Authorization: `Bearer ${steelApiKey}` },
      },
    );

    // Extract content as markdown (optimized for AI processing)
    const contentResponse = await axios.get(`https://api.steel.dev/v1/sessions/${sessionId}/content`, {
      headers: { Authorization: `Bearer ${steelApiKey}` },
      params: { format: "markdown" },
    });

    const content = contentResponse.data.content;

    if (content && content.length > 500) {
      console.log("✅ Steel successful, content length:", content.length);

      return {
        url,
        title: "Content extracted via Steel",
        headings: [],
        paragraphs: content.split("\n").filter((p: string) => p.trim().length > 20),
        allText: content,
        extractedAt: new Date().toISOString(),
      };
    }

    return null;
  } catch (error: any) {
    console.error("💥 Steel error:", error.response?.data ?? error.message);
    return null;
  }
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
        // Add stealth mode options
        options: {
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--disable-gpu",
            "--disable-blink-features=AutomationControlled",
            "--disable-features=VizDisplayCompositor",
          ],
        },
        setExtraHTTPHeaders: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          DNT: "1",
          "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${browserlessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 60000, // Increased timeout
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
    } else {
      console.log("❌ Browserless returned empty content");
      return null;
    }

    console.log("❌ Browserless service failed or insufficient content");
    return null;
  } catch (error: any) {
    console.error("💥 Browserless service error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    return null;
  }
}

// Fallback using Gemini API for protected URLs
async function tryGeminiFallback(url: string): Promise<string | null> {
  try {
    console.log("🤖 Trying Gemini fallback for:", url);

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.log("⚠️ No Gemini API key configured");
      return null;
    }

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": geminiApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Please visit this webpage and extract the main article content: ${url}. Focus on the article title, main text content, and key points. If you cannot access the page, please explain why.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
          },
        }),
      },
    );

    if (!geminiResponse.ok) {
      console.error(`Gemini API error: ${geminiResponse.status} ${geminiResponse.statusText}`);
      return null;
    }

    const data = await geminiResponse.json();

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      const geminiText = data.candidates[0].content.parts[0].text;

      // More sophisticated success detection
      const failureIndicators = [
        "unable to access",
        "cannot access",
        "403 forbidden",
        "access denied",
        "blocked",
        "not available",
        "error accessing",
      ];

      const hasFailure = failureIndicators.some((indicator) => geminiText.toLowerCase().includes(indicator));

      if (!hasFailure && geminiText.length > 100) {
        console.log("✨ Gemini fallback successful for:", url);
        return geminiText;
      } else {
        console.log("❌ Gemini couldn't access content:", geminiText.substring(0, 200));
        return null;
      }
    }

    console.log("❌ Gemini returned empty response");
    return null;
  } catch (error) {
    console.error("💥 Gemini fallback error:", error);
    return null;
  }
}

// Enhanced hybrid approach
async function intelligentScraping(url: string): Promise<ScrapeResponse> {
  console.log("🚀 Starting intelligent scraping for:", url);

  // 1. Try BrowserQL first (best for Cloudflare protected sites)
  const browserQLResult = await tryBrowserQL(url);
  if (browserQLResult && browserQLResult.allText.length > 500) {
    console.log("✅ BrowserQL scraping successful");
    return { success: true, data: browserQLResult };
  }

  // 2. Try Steel browser (excellent for anti-bot detection and captcha solving)
  const steelResult = await trySteel(url);
  if (steelResult && steelResult.allText.length > 500) {
    console.log("✅ Steel scraping successful");
    return { success: true, data: steelResult };
  }

  // 3. Try enhanced static scraping with better selectors
  const staticResult = await tryEnhancedStaticScraping(url);
  if (staticResult && staticResult.allText.length > 500) {
    console.log("✅ Static scraping successful");
    return { success: true, data: staticResult };
  }

  // 4. Try AI fallback
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

  // 5. Try external browser service as final fallback
  console.log("🌐 Trying browserless service...");
  const browserlessResult = await tryBrowserlessService(url);
  if (browserlessResult) {
    console.log("✅ Browserless service successful");
    return { success: true, data: browserlessResult };
  }

  console.log("❌ All methods failed");
  return { success: false, error: "All scraping methods failed" };
}

// Helper function to clean text content
function cleanText(text: string): string {
  return text.replace(/\s+/g, " ").replace(/\n+/g, " ").trim();
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
