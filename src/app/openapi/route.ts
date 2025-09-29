import { promises as fs } from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";

const specPath = path.join(process.cwd(), "openapi", "openapi.yaml");

export async function GET() {
  try {
    const spec = await fs.readFile(specPath, "utf8");
    return new NextResponse(spec, {
      headers: {
        "content-type": "text/yaml; charset=utf-8",
        "cache-control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error("[openapi] failed to read spec:", error);
    return NextResponse.json({ success: false, error: "Failed to load OpenAPI spec" }, { status: 500 });
  }
}
