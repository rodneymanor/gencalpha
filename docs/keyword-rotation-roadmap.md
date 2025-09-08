# Keyword Rotation Roadmap

This document outlines suggested future improvements for the keyword pool and daily rotation system.

## Near Term
- Cron scheduling: Run nightly tasks to auto-seed from `keyword_queries` and rotate the next day's picks (e.g., Vercel Cron).
- Admin UI: Simple view to see pool, lastUsed, timesUsed, and today's picks; allow manual overrides.
- Pool hygiene: De-duplication, trimming whitespace/case, and optional stopword filtering.
- Error telemetry: Log rotation/seeding results and failures for observability.

## Performance & Scale
- Indexes: Add a composite index if we ever sort by multiple fields server-side (currently avoided via client-side tie-breaker).
- Pagination: Support listing pool with paging and filters (unused, used today, most used).

## Advanced Features
- Weighted rotation: Adjust selection probability by `performanceScore` or recent engagement.
- Cooldown windows: Ensure a minimum number of days before a keyword can be reused.
- Buckets: Group keywords by topic and ensure daily diversity across buckets.
- Auto-curation: Periodically import top-performing `primaryKeyword`s from analytics and prune stale ones.

## Automation Examples
- Nightly workflow:
  1) GET `/api/keywords/pool/auto-seed?limit=50`
  2) GET `/api/keywords/rotate?count=3&force=true`

## Security & Ops
- Tighten AuthZ: Restrict seed/rotate endpoints to trusted actors (service tokens or Admin-only checks).
- Backups: Export `keyword_pool` and `keyword_rotation_days` regularly.

## Testing
- Deterministic tests using fixed dates and seeded datasets.
- E2E test to confirm no repetition until all pool items are exhausted.

