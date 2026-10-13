# Freelanz — Architecture

## System overview

```
                ┌──────────────────── Vercel ────────────────────┐
 Vercel Cron ──►│ GET /api/cron/ingest  (Bearer CRON_SECRET)     │
 (06:00 UTC)    │   runIngestion()                               │
                │    ├─ for each enabled source, in parallel:    │
                │    │    adapter.fetch()      (timeout 20 s)    │──► Source APIs / RSS
                │    │    zod validate                           │
                │    │    normalize → flag scams → dedupe hash   │
                │    │    upsert jobs, write ingest_runs row     │
                │    └─ delete jobs older than 45 days           │
                │                                                │
 Browser ──────►│ Next.js App Router (RSC + server actions)      │
                │   proxy: session check on /app/*               │
                │   Auth.js v5 (GitHub, Google)                  │
                │   src/server/* data layer (Drizzle)            │──► Neon Postgres
                └────────────────────────────────────────────────┘
```

## Layers

| Layer | Path | Rule |
|---|---|---|
| Routes / UI | `src/app/` | Server components by default. Client components only for interactivity. |
| UI kit | `src/components/` | Presentational. No data access. |
| Domain logic | `src/lib/` | Pure functions (ranking, scam heuristics, formatting). No I/O. Fully unit-tested. |
| Server | `src/server/` | DB, auth, ingestion. Every file imports `server-only`. |
| Env | `src/env/` | zod-validated environment. The only place `process.env` is read. Server code imports `@/env/server` (`server-only`, all keys); client code imports `@/env/client` (`NEXT_PUBLIC_*` only). Schemas live in `schema.ts`; `next.config.ts` validates at startup. |

## Ingestion

```ts
interface SourceAdapter {
  id: SourceId;                       // 'remoteok' | 'remotive' | ...
  fetch(signal: AbortSignal): Promise<RawJob[]>;
  normalize(raw: RawJob): NormalizedJob | null;  // null = skip invalid
}
```
- Adapters live in `src/server/ingest/adapters/<id>.ts`, are registered in `adapters/index.ts`, and are tested with recorded fixtures in `__fixtures__/`.
- `dedupe_hash = sha256(sourceId + canonicalUrl)`. Cross-source duplicates use a secondary `content_hash = sha256(lower(title) + lower(company))`; the higher-scored copy wins in the feed.
- Runs use `Promise.allSettled`. One failure becomes an `error` row, never a failed run.
- If the run exceeds the function duration limit, split into one cron per source (`/api/cron/ingest?source=<id>`).

## Data model (summary)

| Table | Key columns |
|---|---|
| `users`, `accounts`, `sessions`, `verification_tokens` | Auth.js Drizzle adapter schema |
| `sources` | `id`, `name`, `url`, `kind` (`api`/`rss`/`browse_only`), `monthly_users`, `rating`, `fee_notes`, `source_score`, `enabled` |
| `jobs` | `id`, `source_id`, `external_id`, `url`, `title`, `company`, `description_html` (sanitized), `tags[]`, `job_type`, `remote`, `region`, `pay_min`, `pay_max`, `pay_currency`, `pay_period`, `client_rating`, `posted_at`, `fetched_at`, `flags[]`, `dedupe_hash` (unique), `content_hash`, `base_score`, `search` (tsvector, GIN) |
| `user_job_state` | `user_id`, `job_id`, `saved`, `hidden`, `applied_at` (PK user+job) |
| `user_profiles` | `user_id`, `skills[]` |
| `saved_searches` | `id`, `user_id`, `name`, `filters` (jsonb) |
| `ingest_runs` | `id`, `source_id`, `started_at`, `finished_at`, `status`, `fetched`, `inserted`, `updated`, `error` |

`base_score` (everything except `skillMatch`) is stored at ingest and refreshed daily for freshness. `skillMatch` is added at query time.

## Security
- Cron: constant-time compare of `Authorization` header to `Bearer ${CRON_SECRET}`; 401 otherwise.
- Job descriptions sanitized server-side before storage; rendered only after sanitization.
- Apply links: must be `https:` and match the source's allowed hosts.
- Headers in `next.config.ts`: CSP, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `frame-ancestors 'none'`.
- All user-owned queries filter by the session `userId` on the server.

## Environments

| Env | Where | DB |
|---|---|---|
| Local | `next dev` | Neon dev branch (or local Postgres) via `.env.local` |
| Preview | Vercel preview per PR | Neon preview branch |
| Production | Vercel, `main` | Neon main branch |
