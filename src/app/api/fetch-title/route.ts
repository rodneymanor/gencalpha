import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    try {
      // Fetch the page with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(validUrl.toString(), {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; TitleFetcher/1.0)",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the HTML content
      const html = await response.text();

      // Extract title using regex
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);

      let title = titleMatch?.[1] ?? ogTitleMatch?.[1] ?? "";

      // Clean up the title
      title = title.replace(/\s+/g, " ").trim().substring(0, 200); // Limit length

      if (!title) {
        // Fallback to domain name
        title = validUrl.hostname.replace("www.", "");
        title = title.charAt(0).toUpperCase() + title.slice(1);
      }

      return NextResponse.json({ title });
    } catch (error) {
      console.error("Error fetching page:", error);

      // Fallback to domain name
      const fallbackTitle = validUrl.hostname.replace("www.", "");
      return NextResponse.json({
        title: fallbackTitle.charAt(0).toUpperCase() + fallbackTitle.slice(1),
        fallback: true,
      });
    }
  } catch (error) {
    console.error("Error in fetch-title API:", error);
    return NextResponse.json({ error: "Failed to fetch title" }, { status: 500 });
  }
}
