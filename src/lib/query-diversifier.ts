export class QueryDiversifier {
  private patterns: string[];
  private temporalModifiers: { current: string[]; seasonal: string[] };

  constructor() {
    this.patterns = [
      "{keyword} tutorial",
      "how to {keyword}",
      "best {keyword} tips",
      "{keyword} hack",
      "{keyword} challenge",
      "{keyword} transformation",
      "ultimate {keyword} guide",
    ];

    this.temporalModifiers = {
      current: ["2024", "2025", "latest", "trending"],
      seasonal: this.getSeasonalModifiers(),
    };
  }

  async generateDiverseQueries(primaryKeyword: string, targetCount = 20): Promise<string[]> {
    const queries = new Set<string>();

    const normalized = primaryKeyword.trim();
    if (!normalized) return [];

    // Pattern-based expansion
    this.patterns.forEach((pattern) => {
      queries.add(pattern.replace("{keyword}", normalized));
    });

    // Semantic expansion (fallback if no model is available)
    const semanticVariants = await this.getSemanticVariants(normalized);
    semanticVariants.forEach((variant) => {
      this.patterns.slice(0, 3).forEach((pattern) => {
        queries.add(pattern.replace("{keyword}", variant));
      });
    });

    // Temporal variations
    this.temporalModifiers.current.forEach((modifier) => {
      queries.add(`${normalized} ${modifier}`);
      queries.add(`${modifier} ${normalized}`);
    });

    // Seasonal (lighter weight)
    this.temporalModifiers.seasonal.forEach((modifier) => {
      queries.add(`${normalized} ${modifier}`);
    });

    return Array.from(queries).slice(0, targetCount);
  }

  private async getSemanticVariants(keyword: string): Promise<string[]> {
    // Attempt to use a local model if present in the future.
    // For now, provide a deterministic, dependency-free fallback with curated variants
    // and a couple of heuristic transforms.

    const k = keyword.toLowerCase();

    const curated: Record<string, string[]> = {
      "artificial intelligence": [
        "ai",
        "machine intelligence",
        "intelligent systems",
        "ai technology",
        "ai tools",
        "ai applications",
        "deep learning",
        "machine learning",
        "neural networks",
      ],
      ai: ["artificial intelligence", "machine intelligence", "ai tools", "ai technology", "machine learning"],
    };

    const variants = new Set<string>();

    // Curated list when we recognize the concept
    if (curated[k]) {
      curated[k].forEach((v) => variants.add(v));
    }

    // Heuristic transforms
    // - Remove hyphens
    if (k.includes("-")) variants.add(k.replace(/-/g, " "));
    // - Common abbreviations
    if (k === "artificial intelligence") variants.add("ai");
    // - Title case variant
    variants.add(this.toTitleCase(k));

    // Filter out exact duplicates and the original keyword
    variants.delete(keyword);
    variants.delete(k);

    return Array.from(variants);
  }

  private getSeasonalModifiers(): string[] {
    const month = new Date().getMonth();
    const seasonalMap: Record<string, number[]> = {
      winter: [11, 0, 1],
      spring: [2, 3, 4],
      summer: [5, 6, 7],
      fall: [8, 9, 10],
    };

    for (const [season, months] of Object.entries(seasonalMap)) {
      if (months.includes(month)) {
        return [`${season}`, `${season} 2025`, `${season} vibes`];
      }
    }
    return [];
  }

  private toTitleCase(s: string): string {
    return s
      .split(" ")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ");
  }
}
