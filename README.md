# Freelanz

![CI](https://github.com/iamrayd/freelanz/actions/workflows/ci.yml/badge.svg)

Daily-ranked feed of legit freelance and remote developer jobs, pulled from official APIs and RSS feeds.

- Stack: Next.js · TypeScript · Tailwind CSS · Postgres (Neon) · Drizzle · Auth.js · Vercel
- Docs: [requirements](docs/requirements.md) · [architecture](docs/architecture.md) · [ADRs](docs/adr/) · [backlog](docs/backlog.md) · [Definition of Done](docs/definition-of-done.md)

## Workflow

- Branches: `feat/FLZ-<id>-<slug>`, `fix/…`, `chore/…`, `docs/…`
- Commits: [Conventional Commits](https://www.conventionalcommits.org/) (enforced by commitlint)
- Every change goes through a PR with CI green and is squash-merged into `main`.
- CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs lint, typecheck, format check, test and build on every PR to `main` and every push to `main`.

### Branch protection

The repo owner configures this once in GitHub settings:

1. **Settings → Branches → Add branch ruleset** (or classic protection rule) for `main`: require a pull request before merging and require the `verify` status check to pass.
2. **Settings → General → Pull Requests**: keep **Allow squash merging** ticked; untick **Allow merge commits** and **Allow rebase merging**.

## Getting started

Requires Node.js 22+.

```bash
npm install      # also installs the Husky git hooks
npm run dev      # http://localhost:3000
```

| Script                            | What it does                                |
| --------------------------------- | ------------------------------------------- |
| `npm run dev`                     | Start the dev server                        |
| `npm run build`                   | Production build                            |
| `npm start`                       | Serve the production build                  |
| `npm run lint` / `lint:fix`       | ESLint (flat config, Prettier-compatible)   |
| `npm run format` / `format:check` | Prettier write / check                      |
| `npm run typecheck`               | Generate route types and run `tsc --noEmit` |
| `npm test`                        | Unit tests (Vitest, single run)             |
| `npm run test:watch`              | Unit tests in watch mode                    |
| `npm run test:coverage`           | Unit tests with v8 coverage (80% gate)      |
| `npm run test:e2e`                | Playwright e2e against a production build   |

First e2e run: `npx playwright install chromium`.

Tailwind CSS v4 runs through the `@tailwindcss/turbopack` loader configured in `next.config.ts` (there is no `postcss.config`).

Git hooks: `pre-commit` runs ESLint + Prettier on staged files (lint-staged); `commit-msg` runs commitlint.

## Environment

Copy [`.env.example`](.env.example) to `.env.local` and fill in what you need; each key has a comment on where to get it. Variables are validated with zod in `src/env/` at startup and the app fails fast with a list of invalid keys. `SKIP_ENV_VALIDATION=1` allows missing keys for builds without secrets (CI only; defaults still apply, present values are still validated, and it is refused when `VERCEL_ENV=production`).
