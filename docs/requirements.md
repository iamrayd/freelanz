# Freelanz — Software Requirements Specification

| | |
|---|---|
| Version | 1.0 (Sprint 0) |
| Date | 2026-10-12 |
| Client / Product Owner | Ray |
| Tech Lead | Claude |
| Target release | v1.0.0 on 2026-11-16 |

## 1. Purpose
Freelance developers waste time checking many job boards and dodging scams. Freelanz collects legit freelance and remote developer job posts from trusted sources once a day, ranks them, and shows them in one signed-in feed.

## 2. Scope
**In scope:** daily ingestion from allowlisted public APIs and RSS feeds, ranked feed, search and filters, per-user saved/hidden/applied state, source directory, OAuth login.

**Out of scope (v1):** scraping any site, hosting applications or payments, messaging clients, native mobile apps, email digests.

## 3. Users
- **Developer (primary):** signed-in user looking for work. Wants relevant, fresh, trustworthy posts with one click to apply.
- **Admin (Ray):** checks that ingestion runs and sources are healthy.

## 4. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | Users sign in with GitHub or Google (OAuth). No passwords are stored. | Must |
| FR-2 | All `/app` pages require a session. Signed-out users see the landing page and sign-in. | Must |
| FR-3 | A scheduled job runs once a day and fetches posts from every enabled source. | Must |
| FR-4 | Each post is validated, normalized to one schema, de-duplicated, and upserted. | Must |
| FR-5 | Each ingestion run is recorded per source: start, end, status, fetched/inserted/updated counts, error. | Must |
| FR-6 | Posts older than 45 days are deleted by the daily job. | Must |
| FR-7 | The feed lists posts sorted by ranking score (see §6), paginated. | Must |
| FR-8 | Users filter by keyword (full-text), tags, source, job type, remote/region, pay range, and posted date. | Must |
| FR-9 | A job detail view shows sanitized description, source, pay, tags, flags, and an "Apply on {source}" link opening the original post in a new tab. | Must |
| FR-10 | Users can save, hide, and mark a post as applied. Hidden posts leave their feed. | Must |
| FR-11 | A Sources page lists each source with user base, rating, fee notes, link, and last sync status. Non-crawlable platforms (Upwork, Fiverr, Toptal) are listed as "browse directly". | Must |
| FR-12 | Posts matching scam heuristics are flagged with the reason (payment request, Telegram/WhatsApp-only contact, crypto "test task", missing company). | Must |
| FR-13 | Users set skill tags on their profile; matching posts get a ranking boost. | Should |
| FR-14 | Users save a filter set as a named search. | Should |
| FR-15 | Admin sees source health (last runs and errors). | Should |
| FR-16 | Daily email digest of new matches. | Could |

## 5. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-1 Legal | Only sources whose terms permit reuse. Attribution and backlinks where the source requires them. Respect rate limits. |
| NFR-2 Security | OWASP Top 10 addressed. Cron endpoint protected by secret. Job HTML sanitized. Security headers and CSP. Secrets only in env. |
| NFR-3 Performance | Feed first load under 2.5 s LCP on 4G. Lighthouse ≥ 90 for performance, accessibility, best practices. |
| NFR-4 Accessibility | WCAG 2.2 AA. |
| NFR-5 Reliability | One failing source never fails the whole run. Per-source timeout. |
| NFR-6 Cost | Runs on Vercel Hobby and Neon free tier. |
| NFR-7 Quality | TypeScript strict. 80% unit coverage on `src/server` and `src/lib`. CI must pass before merge. |
| NFR-8 Responsive | Usable from 360 px wide upward, light and dark themes. |

## 6. Ranking
```
score = 0.35·sourceScore + 0.25·freshness + 0.20·clientRating + 0.10·budgetSignal + 0.10·skillMatch
```
- `sourceScore`: normalized log(monthly users) × normalized platform rating. Stored per source; reviewed each sprint review.
- `freshness`: exponential decay, half-life 3 days.
- `clientRating`: from the source API when available, otherwise 0.5.
- `budgetSignal`: normalized pay when stated, otherwise 0.5.
- `skillMatch`: share of the user's profile tags found on the post (0 if no profile tags).

All inputs are in [0, 1]. Weights live in `src/lib/ranking/weights.ts`.

## 7. Initial sources
Freelancer.com (projects API), RemoteOK (API), Remotive (API), We Work Remotely (RSS), Himalayas (API), Jobicy (API), Arbeitnow (API), Hacker News "Who is hiring" (Algolia API). Terms for each are verified in story FLZ-10 before its adapter is built. See ADR-0002.

## 8. Constraints and assumptions
- Stack: Next.js (App Router), TypeScript, Tailwind CSS, Postgres (Neon), Drizzle ORM, Auth.js. Hosted on Vercel.
- Vercel Hobby crons run at most once per day.
- Upwork, Fiverr, Toptal and LinkedIn are not crawled (terms prohibit it).
