# Freelanz

Daily-ranked feed of legit freelance and remote developer jobs, pulled from official APIs and RSS feeds.

- Stack: Next.js · TypeScript · Tailwind CSS · Postgres (Neon) · Drizzle · Auth.js · Vercel
- Docs: [requirements](docs/requirements.md) · [architecture](docs/architecture.md) · [ADRs](docs/adr/) · [backlog](docs/backlog.md) · [Definition of Done](docs/definition-of-done.md)

## Workflow

- Branches: `feat/FLZ-<id>-<slug>`, `fix/…`, `chore/…`, `docs/…`
- Commits: [Conventional Commits](https://www.conventionalcommits.org/) (enforced by commitlint)
- Every change goes through a PR with CI green and is squash-merged into `main`.

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
| `npm test`                        | Placeholder until Vitest lands (FLZ-3)      |

Git hooks: `pre-commit` runs ESLint + Prettier on staged files (lint-staged); `commit-msg` runs commitlint.
