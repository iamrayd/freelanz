# ADR-0002: Job sources policy — official APIs and RSS only

- Status: Accepted
- Date: 2026-10-12

## Context
The client wants daily posts from "legit, high-rated, high-demand" sites. The most popular freelance marketplaces (Upwork, Fiverr, Toptal, LinkedIn) prohibit scraping in their Terms of Service. Upwork retired its RSS feeds in 2024 and its API requires an approved application.

## Decision
1. Ingest only from sources that publish a public API or RSS feed and whose terms permit reuse with attribution.
2. Initial allowlist: Freelancer.com, RemoteOK, Remotive, We Work Remotely, Himalayas, Jobicy, Arbeitnow, Hacker News "Who is hiring". Each is verified in story FLZ-10 before its adapter ships; any source that disallows reuse is dropped.
3. Upwork, Fiverr, Toptal, Arc.dev, Contra, Lemon.io are shown on the Sources page as `browse_only` with their rating and a direct link. They are never crawled.
4. Adapters identify themselves with a descriptive `User-Agent`, respect documented rate limits, fetch once per day, and keep backlinks to the original post.
5. Upwork's official API may be added later if the client's application is approved (backlog FLZ-40).

## Consequences
Lower volume of pure freelance gigs than Upwork, offset by stable, legal, free feeds. Ranking uses `sourceScore` so larger, better-rated platforms rise first.
