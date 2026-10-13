# Product Backlog

Points use Fibonacci (1, 2, 3, 5, 8). Status: `todo` · `in-progress` · `review` · `done`.

## Sprint 0 — Inception (Oct 12 – Oct 18)
| ID | Story | Pts | Status |
|---|---|---|---|
| FLZ-1 | As the team, we have a scaffolded Next.js + TS strict + Tailwind app with lint, format, commitlint and Husky so code is consistent from day one. | 3 | done |
| FLZ-2 | As the team, CI runs lint, typecheck, test and build on every PR so broken code can't merge. | 2 | done |
| FLZ-3 | As the team, we have zod-validated env, `.env.example`, security headers and a test setup (Vitest + Playwright). | 3 | review |
| FLZ-4 | As a user, I see a design system (tokens, type, base components) and wireframes for landing, feed, job detail, sources. | 3 | done |
| FLZ-5 | As the client, the Vercel project and Neon DB are linked and `main` auto-deploys. *(Ray: account steps)* | 1 | todo |

## Sprint 1 — Data foundation (Oct 19 – Oct 25)
| ID | Story | Pts |
|---|---|---|
| FLZ-10 | Spike: verify terms, endpoints, rate limits and payload shape for all 8 sources; record in `docs/sources.md`. | 2 |
| FLZ-11 | Drizzle schema + first migration for all tables; seed `sources`. | 5 |
| FLZ-12 | Adapter interface, normalize, scam-flag hook, dedupe hashing, HTML sanitizing. | 5 |
| FLZ-13 | Adapters: Freelancer.com, RemoteOK, Remotive (with fixtures + tests). | 5 |
| FLZ-14 | Cron route `/api/cron/ingest` with secret check, `allSettled`, per-source timeout, `ingest_runs`, 45-day cleanup, `vercel.json` cron. | 3 |

Acceptance notes:
- FLZ-12: Allowlist HTML sanitizer strips script/style/iframe/object/embed/form and all on* attributes, allows only http/https hrefs; XSS payload corpus in unit tests; dangerouslySetInnerHTML only on sanitizer output; description rendered in `<iframe sandbox srcdoc>` without allow-scripts (CSP script-src allows 'unsafe-inline').

## Sprint 2 — Auth + feed (Oct 26 – Nov 1)
| ID | Story | Pts |
|---|---|---|
| FLZ-20 | Auth.js GitHub + Google with Drizzle adapter; sign-in/out; `proxy` guards `/app`. | 5 |
| FLZ-21 | Ranking module (`src/lib/ranking`) with unit tests; base score at ingest. | 3 |
| FLZ-22 | Feed page: ranked, paginated, job cards with 4 states. | 5 |
| FLZ-23 | Job detail page with sanitized description and safe apply link. | 3 |
| FLZ-24 | Adapters: We Work Remotely, Himalayas, Jobicy, Arbeitnow, HN Who's Hiring. | 8 |

Acceptance notes:
- FLZ-23: Allowlist HTML sanitizer strips script/style/iframe/object/embed/form and all on* attributes, allows only http/https hrefs; XSS payload corpus in unit tests; dangerouslySetInnerHTML only on sanitizer output; description rendered in `<iframe sandbox srcdoc>` without allow-scripts (CSP script-src allows 'unsafe-inline').

## Sprint 3 — Interaction (Nov 2 – Nov 8)
| ID | Story | Pts |
|---|---|---|
| FLZ-30 | Filters + full-text search (URL-driven state). | 5 |
| FLZ-31 | Save / hide / mark applied; Saved and Applied views. | 5 |
| FLZ-32 | Sources page incl. browse-only platforms and sync status. | 3 |
| FLZ-33 | Scam heuristics in `src/lib/legitimacy` + flag badges with reasons. | 3 |
| FLZ-34 | Profile skills + skill-match boost. | 3 |

## Sprint 4 — Hardening + release (Nov 9 – Nov 15)
| ID | Story | Pts |
|---|---|---|
| FLZ-41 | Full security audit and fixes. | 3 |
| FLZ-42 | Refactor pass across codebase. | 3 |
| FLZ-43 | A11y + performance pass (Lighthouse ≥ 90). | 3 |
| FLZ-44 | Playwright e2e suite for core flows. | 3 |
| FLZ-45 | Saved searches *(if capacity)*. | 3 |
| FLZ-46 | Admin source-health view *(if capacity)*. | 2 |
| FLZ-47 | Release v1.0.0: CHANGELOG, tag, prod smoke test. | 1 |

## Icebox (post-MVP)
| ID | Story |
|---|---|
| FLZ-40 | Upwork official API adapter (needs approved API key). |
| FLZ-50 | Daily email digest (Resend). |
| FLZ-51 | Application tracker kanban. |

## Tech debt
| ID | Item | When |
|---|---|---|
| FLZ-48 | Split `src/env/schema.ts` into shared core + `client-schema.ts` + `server-schema.ts` so importing `@/env/client` doesn't ship server key names and zod (~107 KB) to the browser. QA finding on FLZ-3. | Before the first client component imports `@/env/client` |
