# ADR-0001: Tech stack

- Status: Accepted
- Date: 2026-10-12

## Context
Client requires Next.js, Tailwind CSS, TypeScript and Postgres, hosted on Vercel with login, at zero cost for a personal project.

## Decision
- **Next.js (App Router, latest stable)** with React Server Components and server actions. Note: this Next.js version has breaking changes; consult `node_modules/next/dist/docs/` (route protection uses `proxy`, not `middleware`).
- **TypeScript strict.**
- **Tailwind CSS v4** with theme tokens in `globals.css`.
- **Neon Postgres** via the Vercel Marketplace: serverless driver, free tier, DB branches per preview.
- **Drizzle ORM + drizzle-kit**: typed SQL close to the metal, small bundle, SQL migrations committed to git.
- **Auth.js v5** with GitHub and Google providers and the Drizzle adapter (database sessions).
- **zod** for env and external payload validation.
- **Vitest** (unit), **Playwright** (e2e), **GitHub Actions** (CI).

## Alternatives considered
- Prisma: heavier client and slower cold starts on serverless.
- Supabase: brings its own auth; overlaps with Auth.js and the requirement is plain Postgres.
- Clerk: hosted auth, adds vendor lock-in and paid tiers.

## Consequences
Two vendors (Vercel, Neon) both on free tiers. Migrations are plain SQL we own.
